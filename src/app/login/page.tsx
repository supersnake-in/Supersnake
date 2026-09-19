'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';
import { GoogleAuthModal } from '@/components/auth/GoogleAuthModal';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || searchParams.get('redirect') || '/account';
  const { user, signIn, signInWithOtp, sendEmailOtp, signInWithGoogle, isLoading } = useAuth();
  
  // Login mode: 'password' | 'otp'
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    const res = await signInWithGoogle(next);
    setIsGoogleSubmitting(false);

    if (res.unsupportedProvider) {
      setIsGoogleModalOpen(true);
    } else if (res.error) {
      setError(res.error);
    }
  };

  useEffect(() => {
    if (user && !isLoading) {
      router.push(next);
    }
  }, [user, isLoading, router, next]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide your email and password.');
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const res = await sendEmailOtp(cleanEmail);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to dispatch verification code.');
    } else {
      setSuccessMessage(`A 6-digit login code was sent to ${cleanEmail}`);
      setOtpStep('code');
      setResendCooldown(60);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit login code.');
      return;
    }

    setIsSubmitting(true);
    const res = await signInWithOtp(cleanEmail, cleanOtp);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push(next);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setSuccessMessage(null);
    const cleanEmail = email.trim().toLowerCase();

    const res = await sendEmailOtp(cleanEmail);
    if (!res.success) {
      setError(res.error || 'Failed to resend code.');
    } else {
      setSuccessMessage(`New code sent to ${cleanEmail}`);
      setResendCooldown(60);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="flex justify-center mb-2">
            <SuperSnakeLogo size="md" showText={false} />
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
            PATRON ACCESS
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white">
            ENTER THE ATELIER
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            Sign in to track orders, manage archives, and access private drops.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm shadow-2xl relative">
          {error && (
            <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono">
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full bg-[#121212] hover:bg-white hover:text-black border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-3 group active:scale-[0.99] disabled:opacity-50"
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
                <span>SIGN IN WITH GOOGLE</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#0a0a0a] px-3 text-neutral-500">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Tab Selector: Password vs Email OTP */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-[#121212] border border-white/10 rounded">
            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setError(null);
              }}
              className={`py-2 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                loginMode === 'password'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('otp');
                setError(null);
              }}
              className={`py-2 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                loginMode === 'otp'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Email OTP
            </button>
          </div>

          {/* Mode 1: Password Login */}
          {loginMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="patron@supersnake.in"
                    className="w-full bg-[#121212] border border-white/15 px-4 py-3 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
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
                    className="w-full bg-[#121212] border border-white/15 px-4 py-3 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>SIGN IN WITH PASSWORD</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 2: Email OTP Login */}
          {loginMode === 'otp' && (
            <div>
              {otpStep === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-5 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="patron@supersnake.in"
                        className="w-full bg-[#121212] border border-white/15 px-4 py-3 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
                      />
                      <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="inline-block animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <span>SEND LOGIN CODE</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fadeIn">
                  <div className="text-center space-y-1 pb-1">
                    <p className="text-xs font-mono text-neutral-300">
                      Code sent to <strong className="text-white">{email}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                      6-Digit Login Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      placeholder="123456"
                      maxLength={6}
                      autoFocus
                      className="w-full bg-[#121212] border border-white/20 text-center tracking-[0.5em] text-xl font-mono text-white placeholder:text-neutral-700 py-3.5 focus:outline-none focus:border-snake-green"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                    <button
                      type="button"
                      onClick={() => setOtpStep('email')}
                      className="text-neutral-400 hover:text-white underline text-[11px]"
                    >
                      ← Change Email
                    </button>

                    {resendCooldown > 0 ? (
                      <span className="text-[11px] text-neutral-500">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-snake-green hover:underline text-[11px] uppercase font-semibold"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otp.length !== 6}
                    className="w-full bg-snake-green hover:bg-white text-black font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="inline-block animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <span>VERIFY & SIGN IN</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#0a0a0a] px-3 text-neutral-500">OR REGISTER</span>
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-xs font-mono text-neutral-400">
              New to SuperSnake?
            </p>
            <Link
              href={next !== '/account' ? `/signup?next=${encodeURIComponent(next)}` : '/signup'}
              className="inline-block w-full border border-white/20 hover:border-snake-green hover:text-snake-green text-white font-mono text-xs uppercase tracking-widest py-3 transition-colors"
            >
              CREATE PATRON ACCOUNT
            </Link>
          </div>
        </div>

        <GoogleAuthModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          onSuccess={() => {
            setIsGoogleModalOpen(false);
            router.push(next);
          }}
          initialEmail={email}
          nextUrl={next}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs text-neutral-500">ENTERING ATELIER...</div>}>
      <LoginContent />
    </Suspense>
  );
}
