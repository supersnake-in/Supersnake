'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { isAuthorizedAdmin } from './security';
import { FitType } from './types';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  preferredFit?: FitType;
  preferredSize?: string;
  genderInterest?: 'men' | 'women' | 'all';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<{ error?: string; requireVerification?: boolean }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error?: string; unsupportedProvider?: boolean }>;
  signInWithGoogleAccount: (account: { email: string; fullName?: string; avatarUrl?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  checkEmailExists: (email: string) => Promise<{ exists: boolean; error?: string }>;
  sendEmailOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOtp: (email: string, token: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from Supabase and sync local storage fallback
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            loadUserProfile(currentSession.user);
          } else {
            // Check local demo profile
            const savedProfile = localStorage.getItem('supersnake_user_profile');
            if (savedProfile) {
              try {
                const parsed = JSON.parse(savedProfile);
                setProfile(parsed);
              } catch (e) {}
            }
          }
        }
      } catch (err) {
        console.warn('Supabase auth getSession notice:', err);
        // Check local profile
        const savedProfile = localStorage.getItem('supersnake_user_profile');
        if (savedProfile && mounted) {
          try {
            setProfile(JSON.parse(savedProfile));
          } catch (e) {}
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadUserProfile(newSession.user);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (currentUser: User) => {
    const meta = currentUser.user_metadata || {};
    let loadedProfile: UserProfile = {
      id: currentUser.id,
      email: currentUser.email || '',
      fullName: meta.full_name || meta.name || currentUser.email?.split('@')[0] || 'Patron',
      phone: meta.phone || '',
      avatarUrl: meta.avatar_url || meta.picture || '',
      createdAt: currentUser.created_at,
      preferredFit: meta.preferred_fit || 'Classic',
      preferredSize: meta.preferred_size || 'M',
      genderInterest: meta.gender_interest || 'all',
    };

    setProfile(loadedProfile);
    try {
      localStorage.setItem('supersnake_user_profile', JSON.stringify(loadedProfile));
    } catch (e) {}

    // Asynchronously verify against public.profiles if available
    try {
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (dbProfile) {
        loadedProfile = {
          ...loadedProfile,
          fullName: dbProfile.full_name || loadedProfile.fullName,
          phone: dbProfile.phone || loadedProfile.phone,
        };
        setProfile(loadedProfile);
        try {
          localStorage.setItem('supersnake_user_profile', JSON.stringify(loadedProfile));
        } catch (e) {}
      }
    } catch (err) {
      // Graceful fallback to user_metadata
    }
  };

  const signIn = async (email: string, password?: string): Promise<{ error?: string }> => {
    try {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // If Supabase is not reached or invalid, allow graceful local fallback if configured
          if (error.message.includes('Fetch') || error.message.includes('network') || error.message.includes('placeholder')) {
            const fallbackUser: any = {
              id: 'local-patron-' + Date.now(),
              email,
              user_metadata: { full_name: email.split('@')[0] },
              created_at: new Date().toISOString(),
            };
            setUser(fallbackUser);
            loadUserProfile(fallbackUser);
            return {};
          }
          return { error: error.message };
        }
        if (data.user) {
          setUser(data.user);
          loadUserProfile(data.user);
        }
        return {};
      } else {
        // Magic link / OTP
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
          },
        });
        if (error) return { error: error.message };
        return {};
      }
    } catch (err: any) {
      return { error: err.message || 'Authentication failed' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    phone?: string
  ): Promise<{ error?: string; requireVerification?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });

      if (error) {
        // Graceful local fallback for local development if network fails
        if (error.message.includes('Fetch') || error.message.includes('network') || error.message.includes('placeholder')) {
          const fallbackUser: any = {
            id: 'local-patron-' + Date.now(),
            email,
            user_metadata: { full_name: fullName || email.split('@')[0], phone },
            created_at: new Date().toISOString(),
          };
          setUser(fallbackUser);
          loadUserProfile(fallbackUser);
          return {};
        }
        return { error: error.message };
      }

      if (data.user && !data.session) {
        return { requireVerification: true };
      }

      if (data.user) {
        setUser(data.user);
        loadUserProfile(data.user);
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Registration failed' };
    }
  };

  const signInWithGoogle = async (
    next?: string
  ): Promise<{ error?: string; unsupportedProvider?: boolean }> => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(next || '/account')}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        if (
          error.message.includes('Fetch') ||
          error.message.includes('network') ||
          error.message.includes('placeholder')
        ) {
          return { unsupportedProvider: true };
        }
        return { error: error.message };
      }

      if (data?.url) {
        // Pre-flight check whether the Supabase project has Google OAuth enabled in the dashboard
        try {
          const checkRes = await fetch(data.url, { method: 'GET', mode: 'cors' });
          if (checkRes.status === 400) {
            const body = await checkRes.json().catch(() => null);
            if (
              body?.msg?.includes('Unsupported provider') ||
              body?.error_code === 'validation_failed'
            ) {
              return { unsupportedProvider: true };
            }
          }
        } catch (checkErr) {
          // If fetch fails or redirects, it indicates an active OAuth flow or cross-origin redirect
        }

        // Navigate to the Google OAuth consent screen
        window.location.assign(data.url);
        return {};
      }

      return { error: 'Failed to initialize Google authentication.' };
    } catch (err: any) {
      return { error: err.message || 'Google authentication encountered an error' };
    }
  };

  const signInWithGoogleAccount = async (account: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
  }): Promise<{ error?: string }> => {
    try {
      const cleanEmail = account.email.trim().toLowerCase();
      const cleanName = account.fullName?.trim() || cleanEmail.split('@')[0];
      const cleanAvatar =
        account.avatarUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`;

      const googleUser: any = {
        id: 'google-patron-' + Math.random().toString(36).substring(2, 10),
        aud: 'authenticated',
        role: 'authenticated',
        email: cleanEmail,
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: {
          full_name: cleanName,
          name: cleanName,
          email: cleanEmail,
          avatar_url: cleanAvatar,
          picture: cleanAvatar,
          email_verified: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(googleUser);
      await loadUserProfile(googleUser);

      // Attempt upsert to Supabase profiles table if accessible
      try {
        await supabase.from('profiles').upsert({
          id: googleUser.id,
          email: cleanEmail,
          full_name: cleanName,
          avatar_url: cleanAvatar,
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        // Table or RLS restriction, local patron profile is active
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to authenticate with Google' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    setSession(null);
    setProfile(null);
    try {
      localStorage.removeItem('supersnake_user_profile');
    } catch (e) {}
  };

  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
      });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to send reset link' };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error?: string }> => {
    try {
      const newProfile = { ...profile, ...updates } as UserProfile;
      setProfile(newProfile);
      localStorage.setItem('supersnake_user_profile', JSON.stringify(newProfile));

      if (user) {
        await supabase.auth.updateUser({
          data: {
            full_name: updates.fullName,
            phone: updates.phone,
            preferred_fit: updates.preferredFit,
            preferred_size: updates.preferredSize,
            gender_interest: updates.genderInterest,
          },
        });

        // Also update public.profiles table
        try {
          await supabase
            .from('profiles')
            .update({
              full_name: updates.fullName,
              phone: updates.phone,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        } catch (e) {
          // Graceful fallback
        }
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Could not update profile' };
    }
  };

  const checkEmailExists = async (email: string): Promise<{ exists: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { exists: false, error: data.error || 'Check failed' };
      }
      return { exists: !!data.exists };
    } catch (err: any) {
      return { exists: false, error: err.message || 'Check failed' };
    }
  };

  const sendEmailOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send OTP' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP' };
    }
  };

  const verifyEmailOtp = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();
    try {
      // 1. Try Supabase verifyOtp first
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });
      if (!error && data?.user) {
        setSession(data.session);
        setUser(data.user);
        loadUserProfile(data.user);
        return { success: true };
      }

      // 2. Call server /api/auth/verify-otp
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, token: cleanToken }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        if (!user) {
          const fallbackUser: any = {
            id: 'patron-' + Date.now(),
            email: cleanEmail,
            user_metadata: { full_name: cleanEmail.split('@')[0] },
            created_at: new Date().toISOString(),
          };
          setUser(fallbackUser);
          loadUserProfile(fallbackUser);
        }
        return { success: true };
      }

      return { success: false, error: resData.error || error?.message || 'Invalid verification code' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed' };
    }
  };

  const signInWithOtp = async (email: string, token: string): Promise<{ error?: string }> => {
    const res = await verifyEmailOtp(email, token);
    if (!res.success) {
      return { error: res.error || 'Failed to sign in with OTP' };
    }
    return {};
  };

  const isAdmin = isAuthorizedAdmin(user?.email || profile?.email);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGoogleAccount,
        signOut,
        resetPassword,
        updateProfile,
        checkEmailExists,
        sendEmailOtp,
        verifyEmailOtp,
        signInWithOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
