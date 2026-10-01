'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { isAuthorizedAdmin } from './security';
import { FitType } from './types';
import {
  isPasskeySupported,
  signInWithPasskey as doPasskeySignIn,
  registerPasskey as doPasskeyRegister,
} from './passkey';

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
  isEmailVerified?: boolean;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string;
  phoneVerificationMethod?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isPasskeyAvailable: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, fullName?: string, phone?: string) => Promise<{ error?: string; requireVerification?: boolean }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error?: string }>;
  signInWithPasskey: () => Promise<{ error?: string }>;
  registerPasskey: (friendlyName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  sendPhoneOtp: (targetPhone?: string) => Promise<{ success: boolean; cooldown?: number; error?: string }>;
  verifyPhoneOtp: (code: string, targetPhone?: string) => Promise<{ success: boolean; error?: string }>;
  checkEmailExists: (email: string) => Promise<{ exists: boolean; error?: string }>;
  sendEmailOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  authenticateWithOtp: (email: string, token: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOtp: (email: string, token: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasskeyAvailable, setIsPasskeyAvailable] = useState(false);

  // Check hardware/browser WebAuthn support on mount
  useEffect(() => {
    isPasskeySupported().then((supported) => {
      setIsPasskeyAvailable(supported);
    });
  }, []);

  // Record login timestamp authoritatively server-side
  const touchSession = async (userId?: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      await fetch('/api/auth/session/touch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: userId || sessionData?.session?.user?.id }),
      });
    } catch (e) {
      // Non-blocking
    }
  };

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadUserProfile(newSession.user);
        if (event === 'SIGNED_IN') {
          touchSession(newSession.user.id);
        }
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
    const isEmailVerified = Boolean(
      currentUser.email_confirmed_at ||
      (currentUser as any).confirmed_at ||
      meta.email_verified ||
      meta.is_email_verified
    );
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
      isEmailVerified,
      phoneVerified: Boolean(meta.phone_verified),
    };

    setProfile(loadedProfile);
    try {
      localStorage.setItem('supersnake_user_profile', JSON.stringify(loadedProfile));
      localStorage.setItem(
        'supersnake_customer_contact',
        JSON.stringify({
          email: loadedProfile.email,
          name: loadedProfile.fullName,
          phone: loadedProfile.phone,
          userId: loadedProfile.id,
        })
      );
      window.dispatchEvent(new Event('supersnake_customer_identified'));
    } catch (e) {}

    // Asynchronously verify against public.profiles database
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
          avatarUrl: dbProfile.avatar_url || loadedProfile.avatarUrl,
          phoneVerified: dbProfile.phone_verified !== undefined ? Boolean(dbProfile.phone_verified) : loadedProfile.phoneVerified,
          phoneVerifiedAt: dbProfile.phone_verified_at,
          phoneVerificationMethod: dbProfile.phone_verification_method,
          lastLoginAt: dbProfile.last_login_at,
          isEmailVerified: dbProfile.is_email_verified !== undefined ? dbProfile.is_email_verified : loadedProfile.isEmailVerified,
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
          touchSession(data.user.id);
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

  const signInWithPasskey = async (): Promise<{ error?: string }> => {
    const res = await doPasskeySignIn();
    if (!res.success) {
      return { error: res.error };
    }
    if (res.user) {
      setUser(res.user);
      setSession(res.session);
      await loadUserProfile(res.user);
      touchSession(res.user.id);
    }
    return {};
  };

  const registerPasskey = async (friendlyName?: string): Promise<{ success: boolean; error?: string }> => {
    return await doPasskeyRegister(friendlyName);
  };

  const signUp = async (
    email: string,
    password?: string,
    fullName?: string,
    phone?: string
  ): Promise<{ error?: string; requireVerification?: boolean }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      // If password provided, perform standard Supabase sign up
      if (password) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
              phone_verified: false,
            },
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
          },
        });

        if (error) {
          // Graceful local fallback for local development if network fails
          if (error.message.includes('Fetch') || error.message.includes('network') || error.message.includes('placeholder')) {
            const fallbackUser: any = {
              id: 'local-patron-' + Date.now(),
              email: cleanEmail,
              user_metadata: { full_name: fullName || cleanEmail.split('@')[0], phone, phone_verified: false },
              created_at: new Date().toISOString(),
            };
            setUser(fallbackUser);
            loadUserProfile(fallbackUser);
            return {};
          }
          return { error: error.message };
        }

        if (data.user && !data.session) {
          // Email confirmation is enabled on Supabase project
          return { requireVerification: true };
        }

        if (data.user) {
          setUser(data.user);
          loadUserProfile(data.user);
          touchSession(data.user.id);
        }

        return {};
      } else {
        // Passwordless sign up / sign in via OTP
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
            data: {
              full_name: fullName,
              phone,
              phone_verified: false,
            },
          },
        });
        if (error) return { error: error.message };
        return { requireVerification: true };
      }
    } catch (err: any) {
      return { error: err.message || 'Registration failed' };
    }
  };

  const signInWithGoogle = async (next?: string): Promise<{ error?: string }> => {
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
          const fallbackUser: any = {
            id: 'google-patron-' + Date.now(),
            email: 'google.patron@supersnake.in',
            user_metadata: { full_name: 'Google Patron', name: 'Google Patron' },
            created_at: new Date().toISOString(),
          };
          setUser(fallbackUser);
          loadUserProfile(fallbackUser);
          return {};
        }
        return { error: error.message };
      }

      if (data?.url) {
        window.location.assign(data.url);
        return {};
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Google authentication encountered an error' };
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
      const isPhoneChanged = updates.phone !== undefined && updates.phone !== profile?.phone;

      const newProfile = {
        ...profile,
        ...updates,
        // Immediately reset verification if phone number was modified
        ...(isPhoneChanged
          ? {
              phoneVerified: false,
              phoneVerifiedAt: undefined,
              phoneVerificationMethod: undefined,
            }
          : {}),
      } as UserProfile;

      setProfile(newProfile);
      localStorage.setItem('supersnake_user_profile', JSON.stringify(newProfile));

      if (user) {
        await supabase.auth.updateUser({
          data: {
            full_name: updates.fullName,
            phone: updates.phone,
            ...(isPhoneChanged ? { phone_verified: false } : {}),
            preferred_fit: updates.preferredFit,
            preferred_size: updates.preferredSize,
            gender_interest: updates.genderInterest,
          },
        });

        // Also update public.profiles table
        try {
          const dbUpdates: any = {
            full_name: updates.fullName,
            phone: updates.phone,
            updated_at: new Date().toISOString(),
          };

          if (isPhoneChanged) {
            dbUpdates.phone_verified = false;
            dbUpdates.phone_verified_at = null;
            dbUpdates.phone_verification_method = null;
          }

          await supabase
            .from('profiles')
            .update(dbUpdates)
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

  const sendPhoneOtp = async (
    targetPhone?: string
  ): Promise<{ success: boolean; cooldown?: number; error?: string }> => {
    try {
      const phoneToSend = targetPhone || profile?.phone;
      if (!phoneToSend) {
        return { success: false, error: 'Mobile number is required for verification.' };
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch('/api/auth/phone/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone: phoneToSend,
          userId: user?.id || profile?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          cooldown: data.cooldown,
          error: data.error || 'Failed to dispatch verification code.',
        };
      }

      return { success: true, cooldown: data.cooldown || 60 };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification service unreachable.' };
    }
  };

  const verifyPhoneOtp = async (
    code: string,
    targetPhone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const phoneToVerify = targetPhone || profile?.phone;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch('/api/auth/phone/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: code.trim(),
          phone: phoneToVerify,
          userId: user?.id || profile?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid verification code.' };
      }

      // Update local profile state with legitimate verified status
      if (profile) {
        const updated: UserProfile = {
          ...profile,
          phone: data.phone || profile.phone,
          phoneVerified: true,
          phoneVerifiedAt: data.phoneVerifiedAt || new Date().toISOString(),
          phoneVerificationMethod: 'sms_otp',
        };
        setProfile(updated);
        try {
          localStorage.setItem('supersnake_user_profile', JSON.stringify(updated));
        } catch (e) {}
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed.' };
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
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });
      if (!error && data?.user) {
        setSession(data.session);
        setUser(data.user);
        loadUserProfile(data.user);
        touchSession(data.user.id);
        return { success: true };
      }

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

  const authenticateWithOtp = async (
    email: string,
    token: string,
    fullName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });
      if (!error && data?.user) {
        setSession(data.session);
        setUser(data.user);
        if (fullName) {
          data.user.user_metadata = {
            ...data.user.user_metadata,
            full_name: fullName,
            name: fullName,
          };
        }
        await loadUserProfile(data.user);
        touchSession(data.user.id);
        return { success: true };
      }

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, token: cleanToken }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const verifiedUser: any = resData.user || {
          id: 'patron-' + Date.now(),
          email: cleanEmail,
          user_metadata: {
            full_name: fullName || cleanEmail.split('@')[0],
            name: fullName || cleanEmail.split('@')[0],
            email_verified: true,
          },
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        setUser(verifiedUser);
        await loadUserProfile(verifiedUser);
        touchSession(verifiedUser.id);
        return { success: true };
      }

      return {
        success: false,
        error: resData.error || error?.message || 'Invalid or expired verification code.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed.' };
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
        isPasskeyAvailable,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithPasskey,
        registerPasskey,
        signOut,
        resetPassword,
        updateProfile,
        sendPhoneOtp,
        verifyPhoneOtp,
        checkEmailExists,
        sendEmailOtp,
        verifyEmailOtp,
        authenticateWithOtp,
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
