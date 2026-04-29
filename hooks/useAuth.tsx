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

    // Set up the auth state listener FIRST, before checking session.
    // This ensures we don't miss any auth events (like SIGNED_IN after OAuth redirect).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth event:", event, currentSession?.user?.email);
        
        if (!mounted) return;

        if (currentSession) {
          // Use the session data directly from the event.
          // Do NOT call getUser() inside onAuthStateChange — it can cause deadlocks.
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking initial session...");
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check error:", sessionError);
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (existingSession) {
          // Validate with getUser() for security
          const { data: { user: validatedUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error("User validation error:", userError);
            if (mounted) {
              setSession(null);
              setUser(null);
              setIsLoading(false);
            }
            return;
          }

          if (mounted) {
            setSession(existingSession);
            setUser(validatedUser);
            console.log("Session found for:", validatedUser?.email);
          }
        } else {
          console.log("No existing session found.");
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

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("OAuth sign-in error:", error);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
    }
    setUser(null);
    setSession(null);
  }, [supabase]);

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
