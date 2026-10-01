'use client';

import { supabase } from './supabase/client';

export interface PasskeyMetadata {
  id: string;
  name: string;
  created_at: string;
  last_used_at?: string;
}

/**
 * Check if the current browser and platform support WebAuthn / Passkeys
 */
export async function isPasskeySupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const hasWebAuthn = Boolean(
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential === 'function' &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    );

    if (!hasWebAuthn) return false;

    const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (err) {
    console.warn('WebAuthn capability check failed:', err);
    return false;
  }
}

/**
 * Cleanly translate WebAuthn / Passkey exceptions into user-friendly notices
 */
export function formatPasskeyError(err: any): string {
  if (!err) return 'Passkey operation failed.';

  const message = typeof err === 'string' ? err : err.message || '';
  const name = err.name || '';

  if (name === 'NotAllowedError' || message.includes('cancelled') || message.includes('NotAllowedError')) {
    return 'Passkey verification was cancelled or timed out.';
  }
  if (name === 'InvalidStateError' || message.includes('InvalidStateError')) {
    return 'This passkey is already registered or not recognized on this device.';
  }
  if (name === 'NotSupportedError' || message.includes('NotSupportedError')) {
    return 'Passkey authentication is not supported on this browser.';
  }
  if (message.includes('No credentials') || message.includes('no credential')) {
    return 'No registered passkey found for this device. Please sign in with Google or email.';
  }
  if (message.includes('Fetch') || message.includes('network') || message.includes('Failed to fetch')) {
    return 'Network connection issue during passkey verification.';
  }

  return message || 'Passkey authentication encountered an error.';
}

/**
 * Execute Passkey Sign In ceremony via Supabase Auth
 */
export async function signInWithPasskey(): Promise<{
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
}> {
  try {
    const supported = await isPasskeySupported();
    if (!supported) {
      return {
        success: false,
        error: "Passkey sign-in isn't available on this device. Please use Google or your email instead.",
      };
    }

    // supabase.auth.signInWithPasskey handles the full WebAuthn ceremony
    const { data, error } = await supabase.auth.signInWithPasskey();

    if (error) {
      return {
        success: false,
        error: formatPasskeyError(error),
      };
    }

    if (data?.session) {
      // Touch session server-side to record authoritative last_login_at
      try {
        await fetch('/api/auth/session/touch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method: 'passkey' }),
        });
      } catch (touchErr) {}
    }

    return {
      success: true,
      user: data?.user,
      session: data?.session,
    };
  } catch (err: any) {
    return {
      success: false,
      error: formatPasskeyError(err),
    };
  }
}

/**
 * Execute Passkey Registration ceremony for the authenticated patron
 */
export async function registerPasskey(friendlyName?: string): Promise<{
  success: boolean;
  passkey?: any;
  error?: string;
}> {
  try {
    const supported = await isPasskeySupported();
    if (!supported) {
      return {
        success: false,
        error: "Passkey registration isn't supported on this device or browser.",
      };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return {
        success: false,
        error: 'You must be signed in to configure a passkey.',
      };
    }

    const defaultName = friendlyName?.trim() || `${getDevicePlatform()} Passkey`;

    // Supabase handles the full WebAuthn ceremony
    const { data, error } = await supabase.auth.registerPasskey();

    if (error) {
      return {
        success: false,
        error: formatPasskeyError(error),
      };
    }

    // Optionally update friendly name in Supabase auth provider
    if (data?.id && defaultName) {
      try {
        await supabase.auth.passkey.update({
          passkeyId: data.id,
          friendlyName: defaultName,
        });
      } catch (e) {}
    }

    // Store non-sensitive UI metadata in public.user_passkeys for display
    try {
      if (data && sessionData.session.user.id) {
        await supabase.from('user_passkeys').insert({
          user_id: sessionData.session.user.id,
          credential_id: (data as any)?.id || 'cred_' + Date.now(),
          friendly_name: defaultName,
          created_at: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      // Metadata insert is non-blocking
      console.warn('Passkey UI metadata sync notice:', dbErr);
    }

    return {
      success: true,
      passkey: data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: formatPasskeyError(err),
    };
  }
}

/**
 * List registered passkeys for the current patron
 */
export async function listPatronPasskeys(): Promise<PasskeyMetadata[]> {
  try {
    // 1. Try Supabase passkey list API
    if (supabase.auth.passkey?.list) {
      const { data, error } = await supabase.auth.passkey.list();
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((pk: any) => ({
          id: pk.id,
          name: pk.friendly_name || 'Device Passkey',
          created_at: pk.created_at || new Date().toISOString(),
          last_used_at: pk.last_used_at,
        }));
      }
    }

    // 2. Query user_passkeys metadata table as fallback
    const { data: metaList, error: metaErr } = await supabase
      .from('user_passkeys')
      .select('*')
      .order('created_at', { ascending: false });

    if (!metaErr && Array.isArray(metaList)) {
      return metaList.map((row: any) => ({
        id: row.id,
        name: row.friendly_name || 'Device Passkey',
        created_at: row.created_at,
        last_used_at: row.last_used_at,
      }));
    }

    return [];
  } catch (err) {
    console.warn('Failed to list patron passkeys:', err);
    return [];
  }
}

/**
 * Delete a registered passkey
 */
export async function deletePatronPasskey(passkeyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Delete from Supabase Auth provider
    if (supabase.auth.passkey?.delete) {
      try {
        await supabase.auth.passkey.delete({ passkeyId });
      } catch (e) {}
    }

    // 2. Remove UI metadata row
    try {
      await supabase.from('user_passkeys').delete().eq('id', passkeyId);
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to remove passkey' };
  }
}

/**
 * Helper to identify platform name for friendly default naming
 */
function getDevicePlatform(): string {
  if (typeof navigator === 'undefined') return 'Personal';
  const ua = navigator.userAgent;
  if (/Macintosh|Mac OS X/.test(ua)) return 'Mac / Touch ID';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS / Face ID';
  if (/Android/.test(ua)) return 'Android / Biometrics';
  if (/Windows/.test(ua)) return 'Windows Hello';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Personal Device';
}
