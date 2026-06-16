import { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

function toEmail(username: string) {
  return `${username.toLowerCase().trim()}@bubbly.app`;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  username: string;
  loading: boolean;
  error: string | null;
  signUp: (username: string, password: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (username: string, password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signUp({
      email: toEmail(username),
      password,
      options: { data: { username } },
    });
    if (err) setError(err.message);
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    });
    if (err) setError(err.message);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const username = (user?.user_metadata?.username as string | undefined) ?? '';

  return { session, user, username, loading, error, signUp, signIn, signOut, clearError };
}
