'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  theme?: string;
  created_at?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  loginWithGoogle: () => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  startDemoMode: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const refreshUser = async () => {
    const hasDemoCookie = typeof document !== 'undefined' && document.cookie.split('; ').find(row => row.startsWith('lifeos_demo_mode='))?.split('=')[1] === 'true';
    if (!isSupabaseConfigured || hasDemoCookie) {
      const demoUserRaw = localStorage.getItem('lifeos_demo_user');
      if (demoUserRaw) {
        setUser(JSON.parse(demoUserRaw));
      }
      return;
    }

    if (!supabase) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        const refreshedUser: UserProfile = {
          id: session.user.id,
          name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || '',
          theme: profile?.theme || 'light',
          created_at: session.user.created_at
        };
        setUser(refreshedUser);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Error refreshing user:', e);
    }
  };

  useEffect(() => {
    // Check if we are in demo mode from cookies or localStorage
    const checkAuth = async () => {
      setLoading(true);
      
      const hasDemoCookie = document.cookie.split('; ').find(row => row.startsWith('lifeos_demo_mode='))?.split('=')[1] === 'true';
      
      let session = null;
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          session = data?.session || null;
        } catch (e) {
          console.error('Error fetching session:', e);
        }
      }

      if (!isSupabaseConfigured || (hasDemoCookie && !session)) {
        // Fallback to Demo / LocalStorage mode
        const demoUserRaw = localStorage.getItem('lifeos_demo_user');
        if (demoUserRaw) {
          setUser(JSON.parse(demoUserRaw));
        } else if (hasDemoCookie) {
          // Create a mock user
          const mockUser: UserProfile = {
            id: 'demo-user-id',
            name: 'Alex Mercer',
            email: 'alex@lifeos.ai',
            avatar_url: '',
            theme: 'light',
            created_at: new Date().toISOString()
          };
          localStorage.setItem('lifeos_demo_user', JSON.stringify(mockUser));
          setUser(mockUser);
        }
        setIsDemo(true);
        setLoading(false);
        return;
      }

      if (supabase) {
        const client = supabase;
        // If there's a session or we're not in demo mode, clear any remaining demo state
        if (hasDemoCookie) {
          document.cookie = 'lifeos_demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          localStorage.removeItem('lifeos_demo_user');
        }
        setIsDemo(false);

        if (session?.user) {
          // Fetch profile details
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || '',
            theme: profile?.theme || 'light',
            created_at: session.user.created_at
          });
        } else {
          setUser(null);
        }

        // Subscribe to auth state updates
        const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            // Also clear demo mode if auth state changes to signed-in
            document.cookie = 'lifeos_demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            localStorage.removeItem('lifeos_demo_user');
            setIsDemo(false);

            const { data: profile } = await client
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || '',
              theme: profile?.theme || 'light',
              created_at: session.user.created_at
            });
          } else {
            setUser(null);
            setIsDemo(false);
          }
          setLoading(false);
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Mock login for demo mode
      const mockUser: UserProfile = {
        id: 'demo-user-id',
        name: 'Alex Mercer',
        email: email,
        avatar_url: '',
        theme: 'light',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('lifeos_demo_user', JSON.stringify(mockUser));
      document.cookie = 'lifeos_demo_mode=true; path=/; max-age=31536000';
      setUser(mockUser);
      setIsDemo(true);
      router.push('/dashboard');
      return { error: null };
    }

    try {
      // Clear demo details on real sign-in
      document.cookie = 'lifeos_demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      localStorage.removeItem('lifeos_demo_user');
      setIsDemo(false);

      const { data: { session }, error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      // Fetch user profile after successful sign‑in
      if (session?.user) {
        const { data: profile } = await supabase!
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        const loggedInUser: UserProfile = {
          id: session.user.id,
          name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || '',
          theme: profile?.theme || 'light',
          created_at: session.user.created_at
        };
        setUser(loggedInUser);
      } else {
        setUser(null);
      }

      // Refresh user data to ensure latest profile is loaded
      try {
        await refreshUser();
      } catch (e) {
        console.error('Failed to refresh after login', e);
      }
      router.push('/dashboard');
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during sign in' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
      // Mock sign up for demo mode
      const mockUser: UserProfile = {
        id: 'demo-user-id',
        name: name,
        email: email,
        avatar_url: '',
        theme: 'light',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('lifeos_demo_user', JSON.stringify(mockUser));
      document.cookie = 'lifeos_demo_mode=true; path=/; max-age=31536000';
      setUser(mockUser);
      setIsDemo(true);
      // Refresh user data after sign‑up
      try {
        await refreshUser();
      } catch (e) {
        console.error('Failed to refresh after sign‑up', e);
      }
      router.push('/dashboard');
      return { error: null };
    }

    try {
      // Clear demo details on real sign-up
      document.cookie = 'lifeos_demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      localStorage.removeItem('lifeos_demo_user');
      setIsDemo(false);

      const { data: { session }, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      if (error) return { error: error.message };

      // Fetch profile after successful sign‑up
      if (session?.user) {
        const { data: profile } = await supabase!
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        const newUser: UserProfile = {
          id: session.user.id,
          name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || '',
          theme: profile?.theme || 'light',
          created_at: session.user.created_at
        };
        setUser(newUser);
      }

      router.push('/dashboard');
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during registration' };
    }
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      startDemoMode();
      return { error: null };
    }

    try {
      const { error } = await supabase!.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred with Google login' };
    }
  };

  const logout = async () => {
    if (isDemo || !isSupabaseConfigured) {
      localStorage.removeItem('lifeos_demo_user');
      document.cookie = 'lifeos_demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      setUser(null);
      setIsDemo(false);
      router.push('/');
      return;
    }

    await supabase!.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const startDemoMode = () => {
    const mockUser: UserProfile = {
      id: 'demo-user-id',
      name: 'Alex Mercer',
      email: 'alex@lifeos.ai',
      avatar_url: '',
      theme: 'light',
      created_at: new Date().toISOString()
    };
    localStorage.setItem('lifeos_demo_user', JSON.stringify(mockUser));
    document.cookie = 'lifeos_demo_mode=true; path=/; max-age=31536000';
    setUser(mockUser);
    setIsDemo(true);
    router.push('/dashboard');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, login, signUp, loginWithGoogle, logout, startDemoMode, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
