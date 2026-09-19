'use client';

import React, { useState } from 'react';
import { X, Check, ArrowRight, User as UserIcon, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialEmail?: string;
  nextUrl?: string;
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialEmail,
  nextUrl,
}: GoogleAuthModalProps) {
  const { signInWithGoogleAccount } = useAuth();
  const [customMode, setCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (email: string, name?: string) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signInWithGoogleAccount({
        email,
        fullName: name || email.split('@')[0],
      });

      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else {
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please provide a valid Google / Gmail address.');
      return;
    }
    await handleSelectAccount(cleanEmail, customName.trim());
  };

  const cleanInitial = initialEmail?.trim().toLowerCase();
  const hasValidInitial = cleanInitial && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanInitial);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#0d0d0d] border border-white/20 rounded-sm shadow-2xl p-6 md:p-8 space-y-6 text-white z-10 font-sans">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors p-1"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Google Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
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
          </div>
          <h2 className="text-xl font-display font-medium text-white tracking-tight">
            Sign in with Google
          </h2>
          <p className="text-xs font-mono text-neutral-400">
            Choose an account to continue to <span className="text-white font-semibold">SuperSnake Atelier</span>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800/50 text-red-400 text-xs font-mono rounded">
            {error}
          </div>
        )}

        {/* Account Selector List */}
        {!customMode ? (
          <div className="space-y-3">
            {/* If initial email was provided in login input */}
            {hasValidInitial && (
              <button
                type="button"
                onClick={() => handleSelectAccount(cleanInitial)}
                disabled={isSubmitting}
                className="w-full text-left p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-sm transition-all flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    {cleanInitial[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white group-hover:text-snake-green transition-colors">
                      {cleanInitial.split('@')[0]}
                    </p>
                    <p className="text-[11px] font-mono text-neutral-400">{cleanInitial}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-snake-green uppercase tracking-wider px-2 py-0.5 bg-snake-green/10 border border-snake-green/30 rounded">
                  Entered
                </span>
              </button>
            )}

            {/* Default Google Patron Account */}
            <button
              type="button"
              onClick={() => handleSelectAccount('patron.access@supersnake.in', 'Patron VIP')}
              disabled={isSubmitting}
              className="w-full text-left p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-sm transition-all flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-snake-green/20 border border-snake-green/40 text-snake-green font-bold flex items-center justify-center text-sm">
                  P
                </div>
                <div>
                  <p className="text-xs font-medium text-white group-hover:text-snake-green transition-colors">
                    Google Patron (Instant Access)
                  </p>
                  <p className="text-[11px] font-mono text-neutral-400">patron.access@supersnake.in</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 group-hover:text-white uppercase tracking-wider">
                Select
              </span>
            </button>

            {/* Custom Account Toggle */}
            <button
              type="button"
              onClick={() => {
                setCustomMode(true);
                setError(null);
              }}
              disabled={isSubmitting}
              className="w-full p-3 bg-transparent hover:bg-white/5 border border-dashed border-white/20 text-neutral-400 hover:text-white text-xs font-mono rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <UserIcon size={14} />
              <span>Use another Google account</span>
            </button>
          </div>
        ) : (
          /* Custom Google Account Input Form */
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                Google Email Address *
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full bg-[#121212] border border-white/20 focus:border-snake-green text-white text-xs px-3.5 py-2.5 rounded-sm outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#121212] border border-white/20 focus:border-snake-green text-white text-xs px-3.5 py-2.5 rounded-sm outline-none transition-colors font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomMode(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 text-xs font-mono uppercase tracking-wider border border-white/20 hover:border-white text-neutral-300 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-2.5 bg-white hover:bg-neutral-200 text-black font-mono text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {isSubmitting && (
          <div className="text-center py-2 space-y-1">
            <span className="inline-block animate-spin w-4 h-4 border-2 border-snake-green border-t-transparent rounded-full" />
            <p className="text-[10px] font-mono text-snake-green uppercase tracking-widest">
              AUTHENTICATING PATRON...
            </p>
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-neutral-500 leading-relaxed text-center">
          To continue, Google will share your name, email address, and profile picture with SuperSnake Atelier.
        </div>
      </div>
    </div>
  );
}
