'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { ALLOWED_USERS } from '@/lib/constants';

interface PartnerInfo {
  email: string;
  name: string;
  avatar_url: string;
}

interface UsePartnerReturn {
  partner: PartnerInfo | null;
  myProfile: PartnerInfo | null;
  isLoading: boolean;
  getPartnerEmail: () => string | null;
}

export function usePartner(): UsePartnerReturn {
  const { user } = useAuth();
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [myProfile, setMyProfile] = useState<PartnerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  const getPartnerEmail = useCallback((): string | null => {
    if (!user?.email) return null;
    const myEmail = user.email.toLowerCase();
    const partnerEmail = ALLOWED_USERS
      .map((e) => e.toLowerCase())
      .find((e) => e !== myEmail);
    return partnerEmail || null;
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    const myEmail = user.email.toLowerCase();
    const partnerEmailFromList = ALLOWED_USERS
      .map((e) => e.toLowerCase())
      .find((e) => e !== myEmail);

    // Always set fallbacks from ALLOWED_USERS immediately
    // so the app works even without the profiles table
    setMyProfile({
      email: myEmail,
      name: user.user_metadata?.full_name || user.user_metadata?.name || myEmail.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    });

    if (partnerEmailFromList) {
      setPartner({
        email: partnerEmailFromList,
        name: partnerEmailFromList.split('@')[0],
        avatar_url: '',
      });
    }

    // Then try to enrich from the profiles table (optional, may not exist yet)
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('email', ALLOWED_USERS.map((e) => e.toLowerCase()));

        if (error) {
          // Table might not exist yet — that's OK, we already have fallbacks
          console.warn('Profiles table not available:', error.message);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const me = data.find((p) => p.email.toLowerCase() === myEmail);
          const them = data.find((p) => p.email.toLowerCase() !== myEmail);

          if (me) {
            setMyProfile({
              email: me.email,
              name: me.name || me.email.split('@')[0],
              avatar_url: me.avatar_url || '',
            });
          }

          if (them) {
            setPartner({
              email: them.email,
              name: them.name || them.email.split('@')[0],
              avatar_url: them.avatar_url || '',
            });
          }
        }
      } catch (err) {
        // Silently handle — fallbacks are already set
        console.warn('Could not fetch profiles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [user?.email, user?.user_metadata, supabase]);

  return { partner, myProfile, isLoading, getPartnerEmail };
}
