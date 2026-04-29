'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { ALLOWED_USERS } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAllowed: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAllowed: false,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  const isAllowed = user?.email
    ? ALLOWED_USERS.map((e) => e.toLowerCase()).includes(user.email.toLowerCase())
    : false;

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          // Strict validation
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;

          if (mounted) {
            setSession(session);
            setUser(user);
            console.log("Session found for user:", user?.email);
          }
        } else {
          if (mounted) {
            setSession(null);
            setUser(null);
            console.log("No session found in storage.");
          }
        }
      } catch (err) {
        console.error("Auth error during initial check:", err);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event triggered:", event);
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          if (mounted) {
            setSession(session);
            setUser(user);
            setIsLoading(false);
          }
        } else {
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Safely redirect to the current origin
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase.auth]);

  return (
    <AuthContext.Provider
      value={{ user, session, isAllowed, isLoading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
