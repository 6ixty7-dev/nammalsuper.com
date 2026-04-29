'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  isPartnerOnline: boolean;
  partnerLastSeen: string | null;
  partnerCurrentPage: string | null;
  onlineUsers: string[];
}

const PresenceContext = createContext<PresenceState>({
  isPartnerOnline: false,
  partnerLastSeen: null,
  partnerCurrentPage: null,
  onlineUsers: [],
});

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [state, setState] = useState<PresenceState>({
    isPartnerOnline: false,
    partnerLastSeen: null,
    partnerCurrentPage: null,
    onlineUsers: [],
  });
  const [supabase] = useState(() => createClient());
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user?.email) return;

    // Check if channel already exists to prevent duplicate subscriptions
    const existingChannel = supabase.getChannels().find(c => c.topic === 'realtime:global-presence');
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const newChannel = supabase.channel('global-presence', {
      config: { presence: { key: user.email } },
    });

    newChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = newChannel.presenceState();
        const onlineEmails: string[] = [];
        let partnerOnline = false;
        let partnerPage: string | null = null;
        let partnerSeen: string | null = null;

        Object.entries(presenceState).forEach(([email, presences]) => {
          onlineEmails.push(email);
          if (email !== user.email) {
            partnerOnline = true;
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
          try {
            await newChannel.track({
              online_at: new Date().toISOString(),
              current_page: window.location.pathname || '/',
            });
          } catch (e) {
            console.error('Initial presence track error:', e);
          }
        }
      });

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [user?.email, supabase]);

  // Track page changes
  useEffect(() => {
    if (channel && user?.email) {
      // @ts-ignore
      if (channel.state === 'joined') {
        channel.track({
          online_at: new Date().toISOString(),
          current_page: pathname || '/',
        }).catch(e => console.error('Presence track error:', e));
      }
    }
  }, [pathname, channel, user?.email]);

  return (
    <PresenceContext.Provider value={state}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence(): PresenceState {
  return useContext(PresenceContext);
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
