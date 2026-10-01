'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Check, Smartphone, User as UserIcon, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || searchParams.get('redirect') || '/account';
  const { user, signUp, signInWithGoogle, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push(next);
    }
  }, [user, isLoading, router, next]);

  // Google Sign Up (Primary friction-free onboarding)
  const handleGoogleSignUp = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    const res = await signInWithGoogle(next);
    if (res.error) {
      setError(res.error);
      setIsGoogleSubmitting(false);
    }
  };

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

  // Handle Form Submission (Zero mandatory OTP wall)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // 1. Email format
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    // 2. Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    // 3. Terms of Service
    if (!agreeTerms) {
      setError('Please accept the SuperSnake Terms of Service to create your account.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signUp(
        cleanEmail,
        password,
        fullName.trim() || undefined,
        cleanPhone || undefined
      );

      setIsSubmitting(false);

      if (res.error) {
        setError(res.error);
      } else if (res.requireVerification) {
        setInfoMessage(`Account created! A confirmation email was sent to ${cleanEmail}. Check your inbox to complete verification.`);
      } else {
        router.push(next);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'An unexpected error occurred during account creation.');
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
            PATRON ONBOARDING
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white">
            JOIN THE ATELIER
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            Create an account for early access, private drops, and expedited dispatch.
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

          {infoMessage && (
            <div className="p-3.5 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2.5">
              <Check size={16} className="shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Primary: Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleSubmitting || isSubmitting}
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#0a0a0a] px-3 text-neutral-500">OR REGISTER WITH EMAIL</span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                Full Name <span className="text-neutral-600">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alexander McQueen"
                  className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
                />
                <UserIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="patron@supersnake.in"
                  className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                Mobile Number <span className="text-neutral-500">(For delivery updates)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
                />
                <Smartphone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
              </div>
              <p className="text-[9px] font-mono text-neutral-500 mt-1">
                Optional contact coordinate. No phone verification required to sign up.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors pr-11"
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

              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                          strength >= level ? strengthColors[strength - 1] : 'bg-neutral-800'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500">
                    <span>SECURITY RATING</span>
                    <span className="uppercase font-semibold text-neutral-400">
                      {strength > 0 ? strengthLabels[strength - 1] : 'TOO SHORT'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                Confirm Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
              />
            </div>

            {/* Terms of Service */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded bg-[#121212] border-white/20 text-snake-green focus:ring-0 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-neutral-400 leading-tight">
                  I agree to the{' '}
                  <Link href="/terms" className="text-white hover:text-snake-green underline underline-offset-2">
                    Terms of Service
                  </Link>{' '}
                  and acknowledge the SuperSnake privacy protocol.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-3"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-2 text-center border-t border-white/10">
            <p className="text-xs font-mono text-neutral-400">
              Already enrolled?{' '}
              <Link
                href={`/login${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`}
                className="text-white hover:text-snake-green font-semibold underline underline-offset-4 transition-colors"
              >
                Sign in to your account
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-snake-green border-t-transparent rounded-full" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
