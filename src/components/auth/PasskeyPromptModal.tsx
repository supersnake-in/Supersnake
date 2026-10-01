'use client';

import React, { useState, useEffect } from 'react';
import { Fingerprint, X, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function PasskeyPromptModal() {
  const { user, isPasskeyAvailable, registerPasskey } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only prompt authenticated patrons on devices supporting WebAuthn
    if (!user || !isPasskeyAvailable) return;

    // Check if user has already dismissed or registered passkey on this device
    const alreadyPrompted = localStorage.getItem('supersnake_passkey_prompted');
    if (alreadyPrompted) return;

    // Only prompt after brief initial session stabilization (1.5 seconds)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, isPasskeyAvailable]);

  const handleDismiss = () => {
    try {
      localStorage.setItem('supersnake_passkey_prompted', 'dismissed');
    } catch (e) {}
    setIsOpen(false);
  };

  const handleSetupPasskey = async () => {
    setError(null);
    setIsRegistering(true);

    const res = await registerPasskey();
    setIsRegistering(false);

    if (res.success) {
      setSuccess(true);
      try {
        localStorage.setItem('supersnake_passkey_prompted', 'registered');
      } catch (e) {}
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } else {
      setError(res.error || 'Failed to setup passkey on this device.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/15 p-6 md:p-8 rounded-sm shadow-2xl text-white">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-snake-green/10 border border-snake-green/30 flex items-center justify-center text-snake-green">
            <Fingerprint size={22} />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase block">
              INSTANT ACCESS
            </span>
            <h3 className="text-base font-display font-medium text-white">
              SET UP A PASSKEY
            </h3>
          </div>
        </div>

        <p className="text-xs font-mono text-neutral-400 mb-6 leading-relaxed">
          Make your next visit effortless. Sign in instantly using your Touch ID, Face ID, or device screen lock without entering passwords.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
            <Check size={16} />
            <span>Passkey created successfully for this device!</span>
          </div>
        )}

        <div className="space-y-2.5">
          <button
            onClick={handleSetupPasskey}
            disabled={isRegistering || success}
            className="w-full bg-snake-green hover:bg-white text-black font-mono text-xs uppercase tracking-widest py-3 px-4 font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRegistering ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
            ) : success ? (
              <span>PASSKEY ACTIVATED</span>
            ) : (
              <>
                <span>SET UP PASSKEY</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

          <button
            onClick={handleDismiss}
            disabled={isRegistering}
            className="w-full py-2.5 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Maybe Later
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-neutral-500 text-[10px] font-mono">
          <ShieldCheck size={12} className="text-neutral-400" />
          <span>FIDO2 Standard: Private keys never leave your secure enclave.</span>
        </div>
      </div>
    </div>
  );
}
