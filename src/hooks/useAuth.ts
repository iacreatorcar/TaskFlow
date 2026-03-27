import { useState, useEffect, useCallback } from 'react';
import { supabase, auth } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, metadata?: { name?: string; role?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'gitlab') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carica sessione iniziale
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      
      setIsLoading(false);
    };

    loadSession();

    // Ascolta cambiamenti auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Recupera profilo utente
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }
    
    setProfile(data);
  };

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id]);

  // Registrazione
  const signUp = async (email: string, password: string, metadata?: { name?: string; role?: string }) => {
    const { error } = await auth.signUp(email, password, metadata);
    return { error };
  };

  // Login
  const signIn = async (email: string, password: string) => {
    const { error } = await auth.signIn(email, password);
    return { error };
  };

  // Login con OAuth
  const signInWithOAuth = async (provider: 'google' | 'github' | 'gitlab') => {
    const { error } = await auth.signInWithOAuth(provider);
    return { error };
  };

  // Logout
  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await auth.resetPassword(email);
    return { error };
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    const { error } = await auth.updatePassword(newPassword);
    return { error };
  };

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };
}
