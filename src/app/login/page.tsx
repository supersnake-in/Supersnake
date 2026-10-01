'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Mail, KeyRound, Fingerprint, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || searchParams.get('redirect') || '/account';
  const { user, signIn, signInWithGoogle, signInWithPasskey, isPasskeyAvailable, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isPasskeySubmitting, setIsPasskeySubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push(next);
    }
  }, [user, isLoading, router, next]);

  // Google Sign In (Primary low-friction identity)
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    const res = await signInWithGoogle(next);
    if (res.error) {
      setError(res.error);
      setIsGoogleSubmitting(false);
    }
  };

  // Passkey Sign In (Fast returning-patron biometric identity)
  const handlePasskeySignIn = async () => {
    setError(null);
    setIsPasskeySubmitting(true);
    const res = await signInWithPasskey();
    setIsPasskeySubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push(next);
    }
  };

  // Email + Password Sign In (Reliable fallback)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await signIn(cleanEmail, password);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push(next);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex justify-center mb-2">
            <SuperSnakeLogo size="md" showText={false} />
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
            PATRON ACCESS
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white">
            WELCOME BACK
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            Sign in to track orders, access archives, and view private drops.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm shadow-2xl relative space-y-6">
          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary 1: Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isPasskeySubmitting || isSubmitting}
            className="w-full bg-[#141414] hover:bg-white hover:text-black border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50"
          >
            {isGoogleSubmitting ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>CONTINUE WITH GOOGLE</span>
              </>
            )}
          </button>

          {/* Primary 2: Sign in with Passkey */}
          {isPasskeyAvailable && (
            <button
              type="button"
              onClick={handlePasskeySignIn}
              disabled={isPasskeySubmitting || isGoogleSubmitting || isSubmitting}
              className="w-full bg-[#121212] hover:bg-[#1a1a1a] border border-white/20 hover:border-snake-green/50 text-white font-mono text-xs uppercase tracking-widest py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-50 group"
            >
              {isPasskeySubmitting ? (
                <span className="inline-block animate-spin w-4 h-4 border-2 border-snake-green border-t-transparent rounded-full" />
              ) : (
                <>
                  <Fingerprint size={16} className="text-snake-green group-hover:scale-110 transition-transform" />
                  <span>SIGN IN WITH PASSKEY</span>
                </>
              )}
            </button>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#0a0a0a] px-3 text-neutral-500">OR WITH EMAIL</span>
            </div>
          </div>

          {/* Fallback Form: Email + Password */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="patron@supersnake.in"
                  className="w-full bg-[#121212] border border-white/15 px-4 py-3 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-mono text-neutral-400 hover:text-snake-green transition-colors uppercase tracking-wider"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#121212] border border-white/15 px-4 py-3 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting || isPasskeySubmitting}
              className="w-full bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-2 text-center border-t border-white/10">
            <p className="text-xs font-mono text-neutral-400">
              New to SuperSnake?{' '}
              <Link
                href={`/signup${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`}
                className="text-white hover:text-snake-green font-semibold underline underline-offset-4 transition-colors"
              >
                Create patron account
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-neutral-600 text-[10px] font-mono tracking-wider uppercase">
          <ShieldCheck size={13} className="text-neutral-500" />
          <span>FIDO2 / WebAuthn & 256-Bit SSL Protection</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-snake-green border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
