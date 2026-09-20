'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || searchParams.get('redirect') || '/account';
  const { user, signUp, signInWithGoogle, checkEmailExists, sendEmailOtp, verifyEmailOtp, authenticateWithOtp, isLoading } = useAuth();
  
  // Step: 'form' | 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wantPassword, setWantPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP Cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    const res = await signInWithGoogle(next);
    if (res.error) {
      setError(res.error);
      setIsGoogleSubmitting(false);
    }
  };

  useEffect(() => {
    if (user && !isLoading) {
      router.push(next);
    }
  }, [user, isLoading, router, next]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['WEAK', 'FAIR', 'STRONG', 'INVULNERABLE'];
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-snake-green'];

  // Validate form and send OTP
  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Email format
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    // 2. Optional Password criteria if chosen
    if (wantPassword && password) {
      if (password.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
        setError('Password must be at least 8 characters and contain both letters and numbers.');
        return;
      }
    }

    if (!agreeTerms) {
      setError('Please accept the SuperSnake Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send Email OTP
      const otpRes = await sendEmailOtp(cleanEmail);
      setIsSubmitting(false);

      if (!otpRes.success) {
        setError(otpRes.error || 'Failed to dispatch verification code. Please try again.');
        return;
      }

      setSuccessMessage(`A 6-digit verification code has been dispatched to ${cleanEmail}`);
      setStep('otp');
      setResendCooldown(60);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Encountered an error while verifying email.');
    }
  };

  // Verify OTP and complete account creation
  const handleVerifyAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Authenticate with OTP (creates account or signs in)
      const verifyRes = await authenticateWithOtp(cleanEmail, cleanOtp, fullName.trim() || undefined);
      if (!verifyRes.success) {
        setIsSubmitting(false);
        setError(verifyRes.error || 'Invalid or expired verification code.');
        return;
      }

      // 2. If password was optionally entered, update password
      if (wantPassword && password) {
        try {
          const { supabase } = await import('@/lib/supabase/client');
          await supabase.auth.updateUser({ password });
        } catch (e) {}
      }

      setIsSubmitting(false);
      router.push(next);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setSuccessMessage(null);
    const cleanEmail = email.trim().toLowerCase();

    const otpRes = await sendEmailOtp(cleanEmail);
    if (!otpRes.success) {
      setError(otpRes.error || 'Failed to resend verification code.');
      return;
    }

    setSuccessMessage(`New verification code dispatched to ${cleanEmail}`);
    setResendCooldown(60);
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
            PATRON ENROLLMENT
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white">
            JOIN THE PIT
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            Create your profile to access limited runs and private atelier archives.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm shadow-2xl relative">
          {error && (
            <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-start gap-2">
              <Check size={16} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 'form' ? (
            <>
              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
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
                    <span>SIGN UP WITH GOOGLE</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono">
                  <span className="bg-[#0a0a0a] px-3 text-neutral-500">OR REGISTER WITH EMAIL</span>
                </div>
              </div>

              <form onSubmit={handleInitiateSignup} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditya Sharma"
                    className="w-full bg-[#121212] border border-white/15 px-4 py-3 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="patron@supersnake.in"
                    className="w-full bg-[#121212] border border-white/15 px-4 py-3 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
                  />
                </div>

                {/* Optional Password Toggle */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-400 hover:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={wantPassword}
                      onChange={(e) => setWantPassword(e.target.checked)}
                      className="rounded bg-[#121212] border-white/20 text-snake-green focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-[11px]">Set a password now (Optional — passwordless OTP available)</span>
                  </label>
                </div>

                {wantPassword && (
                  <div className="space-y-2 pt-1 animate-fadeIn">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                      Password (Min 8 Characters, Letters & Numbers)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters with letters and numbers"
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

                    {/* Password strength meter */}
                    {password.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex gap-1.5 h-1">
                          {[0, 1, 2, 3].map((idx) => (
                            <div
                              key={idx}
                              className={`h-full flex-1 rounded-sm transition-all duration-300 ${
                                idx < strength ? strengthColors[strength - 1] : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[9px] font-mono uppercase text-neutral-500">
                          <span>SECURITY RATING</span>
                          <span className="font-semibold text-white">
                            {strength > 0 ? strengthLabels[strength - 1] : 'TOO SHORT'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Terms checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded-none bg-[#121212] border-white/20 text-snake-green focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-neutral-400 leading-relaxed group-hover:text-neutral-300">
                      I accept the SuperSnake{' '}
                      <Link href="/terms" className="text-white hover:text-snake-green underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-white hover:text-snake-green underline">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <span>CONTINUE WITH EMAIL</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Step OTP */
            <form onSubmit={handleVerifyAndCreate} className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-2 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-snake-green">
                  ENTER VERIFICATION CODE
                </span>
                <p className="text-xs font-mono text-neutral-300">
                  Please enter the 6-digit code sent to <strong className="text-white">{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                  6-DIGIT VERIFICATION CODE *
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

              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-neutral-400 hover:text-white underline text-[11px]"
                >
                  ← Edit Details
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
                className="w-full bg-snake-green hover:bg-white text-black font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>VERIFY & ENTER ATELIER</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#0a0a0a] px-3 text-neutral-500">ALREADY A PATRON?</span>
            </div>
          </div>

          <div className="text-center">
            <Link
              href={next !== '/account' ? `/login?next=${encodeURIComponent(next)}` : '/login'}
              className="inline-block w-full border border-white/20 hover:border-snake-green hover:text-snake-green text-white font-mono text-xs uppercase tracking-widest py-3 transition-colors"
            >
              SIGN IN HERE
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-600">
          <ShieldCheck size={14} className="text-snake-green" />
          <span>ZERO SPAM. STRICTLY CURATED COMMUNICATIONS.</span>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs text-neutral-500">JOINING ATELIER...</div>}>
      <SignupContent />
    </Suspense>
  );
}
