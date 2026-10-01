'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Check,
  AlertCircle,
  Fingerprint,
  Plus,
  Trash2,
  ShieldCheck,
  Info,
  Laptop,
  Smartphone,
  KeyRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import {
  isPasskeySupported,
  listPatronPasskeys,
  deletePatronPasskey,
  registerPasskey,
  PasskeyMetadata,
} from '@/lib/passkey';

export default function AccountSecurityPage() {
  const { user, isPasskeyAvailable } = useAuth();

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Passkey State
  const [passkeys, setPasskeys] = useState<PasskeyMetadata[]>([]);
  const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(true);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [passkeyNotice, setPasskeyNotice] = useState<string | null>(null);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  // Load passkeys on mount
  useEffect(() => {
    loadPasskeys();
  }, [user]);

  const loadPasskeys = async () => {
    setIsLoadingPasskeys(true);
    const list = await listPatronPasskeys();
    setPasskeys(list);
    setIsLoadingPasskeys(false);
  };

  const handleRegisterPasskey = async () => {
    setPasskeyError(null);
    setPasskeyNotice(null);
    setIsRegisteringPasskey(true);

    const res = await registerPasskey();
    setIsRegisteringPasskey(false);

    if (res.success) {
      setPasskeyNotice('Passkey registered successfully for this device.');
      loadPasskeys();
    } else {
      setPasskeyError(res.error || 'Failed to register passkey.');
    }
  };

  const handleDeletePasskey = async (id: string) => {
    if (!confirm('Are you sure you want to remove this passkey?')) return;
    setPasskeyError(null);
    setPasskeyNotice(null);

    const res = await deletePatronPasskey(id);
    if (res.success) {
      setPasskeyNotice('Passkey removed.');
      loadPasskeys();
    } else {
      setPasskeyError(res.error || 'Failed to remove passkey.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('Password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      setIsSubmittingPassword(false);

      if (updateError) {
        setPasswordError(updateError.message);
      } else {
        setPasswordSaved(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSaved(false), 3000);
      }
    } catch (err: any) {
      setIsSubmittingPassword(false);
      setPasswordError(err.message || 'Could not update password');
    }
  };

  // Determine identities
  const identities = (user as any)?.identities || [];
  const hasGoogleIdentity =
    (user as any)?.app_metadata?.provider === 'google' ||
    identities.some((i: any) => i.provider === 'google');
  const hasEmailIdentity =
    (user as any)?.app_metadata?.provider === 'email' ||
    identities.some((i: any) => i.provider === 'email') ||
    Boolean(user?.email);

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-white/10 pb-4">
        <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
          SECURITY PROTOCOLS
        </span>
        <h2 className="text-xl md:text-2xl font-display font-medium text-white">
          SECURITY & ACCESS
        </h2>
      </div>

      {/* 1. Authentication Identities Overview */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block mb-1">
            PATRON IDENTITY PROVIDERS
          </span>
          <h3 className="text-base font-display font-medium text-white">
            CONNECTED AUTHENTICATION METHODS
          </h3>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            SuperSnake enables low-friction single-click access while keeping multiple recovery paths open.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Google Identity */}
          <div className="p-4 bg-[#121212] border border-white/10 rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                <p className="text-xs font-mono font-medium text-white">Google Identity</p>
                <p className="text-[10px] font-mono text-neutral-500">
                  {hasGoogleIdentity ? 'Active Primary Login' : 'Available for one-click access'}
                </p>
              </div>
            </div>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 border uppercase tracking-wider rounded ${
                hasGoogleIdentity
                  ? 'bg-snake-green/10 text-snake-green border-snake-green/30'
                  : 'bg-white/5 text-neutral-400 border-white/10'
              }`}
            >
              {hasGoogleIdentity ? 'CONNECTED' : 'ENABLED'}
            </span>
          </div>

          {/* Email / Password Identity */}
          <div className="p-4 bg-[#121212] border border-white/10 rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KeyRound size={20} className="text-snake-green shrink-0" />
              <div>
                <p className="text-xs font-mono font-medium text-white">Email & Password</p>
                <p className="text-[10px] font-mono text-neutral-500">
                  {user?.email || 'patron@supersnake.in'}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 uppercase tracking-wider rounded">
              CONFIGURED
            </span>
          </div>
        </div>

        {/* Account Recovery Guarantee Box */}
        <div className="p-4 bg-snake-green/5 border border-snake-green/20 rounded flex items-start gap-3">
          <Info size={16} className="text-snake-green shrink-0 mt-0.5" />
          <div className="text-xs font-mono text-neutral-300 leading-relaxed space-y-1">
            <span className="font-semibold text-snake-green uppercase tracking-wider text-[11px] block">
              PATRON RECOVERY GUARANTEE
            </span>
            <p className="text-neutral-400 text-[11px]">
              If you lose or upgrade your physical device, you are never locked out. You can always sign in via your Google account or your registered email address to access your archive and configure new passkeys.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Passkeys (WebAuthn / Biometrics) */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Fingerprint size={22} className="text-snake-green shrink-0" />
            <div>
              <h3 className="text-base font-display font-medium text-white uppercase tracking-wider">
                BIOMETRIC PASSKEYS (FIDO2)
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Unlock with Touch ID, Face ID, or Windows Hello. Phishing-proof and instantaneous.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRegisterPasskey}
            disabled={isRegisteringPasskey || !isPasskeyAvailable}
            className="px-4 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {isRegisteringPasskey ? (
              <span className="inline-block animate-spin w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full" />
            ) : (
              <>
                <Plus size={14} />
                <span>ADD PASSKEY</span>
              </>
            )}
          </button>
        </div>

        {passkeyNotice && (
          <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
            <Check size={14} />
            <span>{passkeyNotice}</span>
          </div>
        )}

        {passkeyError && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{passkeyError}</span>
          </div>
        )}

        {/* Passkeys List */}
        <div className="space-y-3">
          {isLoadingPasskeys ? (
            <div className="p-6 text-center text-xs font-mono text-neutral-500">
              Loading registered passkeys...
            </div>
          ) : passkeys.length === 0 ? (
            <div className="p-6 border border-dashed border-white/10 text-center space-y-2 rounded">
              <Fingerprint size={28} className="mx-auto text-neutral-600" />
              <p className="text-xs font-mono text-neutral-400">
                No passkeys configured on this account yet.
              </p>
              <p className="text-[10px] font-mono text-neutral-500">
                Register this device to sign in in less than a second without passwords.
              </p>
            </div>
          ) : (
            passkeys.map((pk) => (
              <div
                key={pk.id}
                className="p-4 bg-[#121212] border border-white/10 rounded flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-300">
                    <Laptop size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-medium text-white">{pk.name}</p>
                    <p className="text-[10px] font-mono text-neutral-500">
                      Added{' '}
                      {new Date(pk.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {pk.last_used_at && (
                        <span>
                          {' '}
                          · Last used{' '}
                          {new Date(pk.last_used_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePasskey(pk.id)}
                  className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                  title="Remove passkey"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Password Management */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-6">
        <div className="flex items-center gap-3">
          <Lock size={18} className="text-snake-green" />
          <div>
            <h3 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              UPDATE PASSWORD
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Ensure your credentials meet our 8+ character luxury encryption standards.
            </p>
          </div>
        </div>

        {passwordError && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSaved && (
          <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
            <Check size={15} />
            <span>Password successfully updated.</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingPassword}
            className="px-6 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmittingPassword ? 'SAVING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
}
