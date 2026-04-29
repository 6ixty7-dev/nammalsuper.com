'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface PresenceState {
  isPartnerOnline: boolean;
  partnerLastSeen: string | null;
  partnerCurrentPage: string | null;
  onlineUsers: string[];
}

export function usePresence(currentPage?: string): PresenceState {
  const { user } = useAuth();
  const [state, setState] = useState<PresenceState>({
    isPartnerOnline: false,
    partnerLastSeen: null,
    partnerCurrentPage: null,
    onlineUsers: [],
  });
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!user?.email) return;

    const channel = supabase.channel('global-presence', {
      config: { presence: { key: user.email } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const onlineEmails: string[] = [];
        let partnerOnline = false;
        let partnerPage: string | null = null;
        let partnerSeen: string | null = null;

        Object.entries(presenceState).forEach(([email, presences]) => {
          onlineEmails.push(email);
          if (email !== user.email) {
            partnerOnline = true;
            // Get the most recent presence data
            const latest = (presences as Array<{ current_page?: string; online_at?: string }>)[0];
            if (latest) {
              partnerPage = latest.current_page || null;
              partnerSeen = latest.online_at || null;
            }
          }
        });

        setState({
          isPartnerOnline: partnerOnline,
          partnerLastSeen: partnerSeen,
          partnerCurrentPage: partnerPage,
          onlineUsers: onlineEmails,
        });
      })
      .on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
        if (key !== user.email) {
          setState((prev) => ({
            ...prev,
            isPartnerOnline: false,
            partnerLastSeen: new Date().toISOString(),
          }));
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            current_page: currentPage || '/',
          });
        }
      });

    // Update presence when page changes
    const updatePresence = async () => {
      // @ts-ignore - state exists on RealtimeChannel
      if (channel && channel.state === 'joined') {
        try {
          await channel.track({
            online_at: new Date().toISOString(),
            current_page: currentPage || '/',
          });
        } catch (e) {
          console.error('Presence track error:', e);
        }
      }
    };

    if (currentPage) {
      updatePresence();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email, currentPage, supabase]);

  return state;
}

export function formatLastSeen(isoString: string | null): string {
  if (!isoString) return 'Unknown';
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
