import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { fullName?: string; email?: string }) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

// No real Supabase project is connected yet (see src/lib/supabase.ts) --
// without this, signUp/signIn silently fail against the placeholder client
// and pages like /profile stay stuck behind the "please sign in" screen
// forever, even after "signing up". While that's the case we fall back to a
// local, in-memory mock account so sign up/sign in still work for UI/design
// work. The moment real VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars
// are set, this fallback is skipped entirely and everything talks to the
// real Supabase project as normal.
export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

const buildMockSession = (email: string, fullName: string): Session => {
  const now = new Date().toISOString();
  const mockUser: User = {
    id: 'local-preview-user',
    aud: 'authenticated',
    role: 'authenticated',
    email,
    phone: '',
    email_confirmed_at: now,
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: {},
    user_metadata: { full_name: fullName },
    identities: [],
    created_at: now,
    updated_at: now,
  } as unknown as User;

  return {
    access_token: 'local-preview-token',
    refresh_token: 'local-preview-refresh',
    expires_in: 60 * 60 * 24 * 365,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    token_type: 'bearer',
    user: mockUser,
  } as unknown as Session;
};

const MOCK_SESSION_STORAGE_KEY = 'sayway_local_preview_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Local preview mode: restore a previously "signed up" mock session
      // (if any) so refreshing the page doesn't kick you back out.
      try {
        const stored = localStorage.getItem(MOCK_SESSION_STORAGE_KEY);
        if (stored) setSession(JSON.parse(stored));
      } catch {
        // ignore corrupt storage
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const setMockSession = (next: Session | null) => {
    setSession(next);
    try {
      if (next) localStorage.setItem(MOCK_SESSION_STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(MOCK_SESSION_STORAGE_KEY);
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      setMockSession(buildMockSession(email, fullName));
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error ? error.message : null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setMockSession(buildMockSession(email, email.split('@')[0] || 'Mehmon'));
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      setMockSession(buildMockSession('preview@local.dev', 'Mehmon'));
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/profile` },
    });
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setMockSession(null);
      return;
    }
    await supabase.auth.signOut();
  };

  // Used by the Settings screen -- persists a name/email change to the
  // actual Supabase Auth user (previously the Settings form only updated
  // its own local input state and never saved anything).
  const updateProfile = async (updates: { fullName?: string; email?: string }) => {
    if (!isSupabaseConfigured) {
      if (!session) return { error: 'Not signed in' };
      const nextUser: User = {
        ...session.user,
        email: updates.email?.trim() || session.user.email,
        user_metadata: {
          ...session.user.user_metadata,
          full_name: updates.fullName ?? session.user.user_metadata?.full_name,
        },
      };
      setMockSession({ ...session, user: nextUser });
      return { error: null };
    }

    const payload: { data?: Record<string, unknown>; email?: string } = {};
    if (updates.fullName !== undefined) payload.data = { full_name: updates.fullName };
    if (updates.email !== undefined && updates.email.trim()) payload.email = updates.email.trim();

    const { data, error } = await supabase.auth.updateUser(payload);
    if (error) return { error: error.message };

    // Keep the `profiles` table (used elsewhere, e.g. Admin's Customers
    // list) in sync with the auth user too.
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: (data.user.user_metadata?.full_name as string) ?? null,
        email: data.user.email ?? null,
      });
    }
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, session, loading, signUp, signIn, signInWithGoogle, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
