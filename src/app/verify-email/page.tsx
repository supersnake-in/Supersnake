'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

function VerifyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, verifyEmailOtp, sendEmailOtp, verifyPhoneOtp, sendPhoneOtp } = useAuth();

  const queryEmail = searchParams.get('email') || profile?.email || user?.email || '';
  const queryPhone = searchParams.get('phone') || profile?.phone || user?.user_metadata?.phone || '';
  const next = searchParams.get('next') || '/account';

  const [email, setEmail] = useState(queryEmail);
  const [phone, setPhone] = useState(queryPhone);

  // Verification states
  const [emailVerified, setEmailVerified] = useState(
    Boolean(user?.email_confirmed_at || profile?.isEmailVerified)
  );
  const [phoneVerified, setPhoneVerified] = useState(
    Boolean(profile?.isPhoneVerified || user?.user_metadata?.phone_verified)
  );

  // OTP inputs
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');

  // Loading & error states
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Cooldowns
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [emailSentNotice, setEmailSentNotice] = useState(false);
  const [phoneSentNotice, setPhoneSentNotice] = useState(false);
  const [simulatedPhoneOtp, setSimulatedPhoneOtp] = useState<string | null>(null);

  // Initial phone OTP trigger if not yet sent
  useEffect(() => {
    if (phone && !phoneVerified && !simulatedPhoneOtp) {
      sendPhoneOtp(phone).then((res) => {
        if (res.simulatedOtp) {
          setSimulatedPhoneOtp(res.simulatedOtp);
        }
      });
    }
  }, [phone, phoneVerified, sendPhoneOtp, simulatedPhoneOtp]);

  // Sync state if user session changes
  useEffect(() => {
    if (user?.email_confirmed_at || profile?.isEmailVerified) {
      setEmailVerified(true);
    }
    if (profile?.isPhoneVerified || user?.user_metadata?.phone_verified) {
      setPhoneVerified(true);
    }
  }, [user, profile]);

  // Timers for resend cooldowns
  useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCooldown]);

  useEffect(() => {
    if (phoneCooldown > 0) {
      const timer = setTimeout(() => setPhoneCooldown(phoneCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCooldown]);

  // Auto-redirect once both are verified
  useEffect(() => {
    if (emailVerified && phoneVerified) {
      const timer = setTimeout(() => {
        router.push(next);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [emailVerified, phoneVerified, router, next]);

  // Handle Email Verification
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCode || emailCode.length < 6) {
      setEmailError('Please enter the 6-digit verification code.');
      return;
    }

    setEmailError(null);
    setIsVerifyingEmail(true);
    const res = await verifyEmailOtp(email, emailCode);
    setIsVerifyingEmail(false);

    if (res.error) {
      setEmailError(res.error);
    } else {
      setEmailVerified(true);
    }
  };

  // Handle Phone Verification
  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneCode || phoneCode.length < 6) {
      setPhoneError('Please enter the 6-digit verification code.');
      return;
    }

    setPhoneError(null);
    setIsVerifyingPhone(true);
    const res = await verifyPhoneOtp(phone, phoneCode);
    setIsVerifyingPhone(false);

    if (res.error) {
      setPhoneError(res.error);
    } else {
      setPhoneVerified(true);
    }
  };

  // Resend Email Code
  const handleResendEmail = async () => {
    if (emailCooldown > 0) return;
    setEmailError(null);
    setEmailSentNotice(false);

    const res = await sendEmailOtp(email);
    if (res.error) {
      setEmailError(res.error);
    } else {
      setEmailSentNotice(true);
      setEmailCooldown(60);
      setTimeout(() => setEmailSentNotice(false), 5000);
    }
  };

  // Resend Phone Code
  const handleResendPhone = async () => {
    if (phoneCooldown > 0) return;
    setPhoneError(null);
    setPhoneSentNotice(false);

    const res = await sendPhoneOtp(phone);
    if (res.error) {
      setPhoneError(res.error);
    } else {
      if (res.simulatedOtp) {
        setSimulatedPhoneOtp(res.simulatedOtp);
      }
      setPhoneSentNotice(true);
      setPhoneCooldown(60);
      setTimeout(() => setPhoneSentNotice(false), 5000);
    }
  };

  const bothVerified = emailVerified && phoneVerified;

  return (
    <div className="w-full max-w-xl">
      {/* Brand Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="flex justify-center mb-2">
          <SuperSnakeLogo size="md" showText={false} />
        </div>
        <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
          VERIFICATION PROTOCOL // DUAL AUTHENTICATION
        </span>
        <h1 className="text-2xl sm:text-4xl font-display font-medium tracking-tight text-white">
          AUTHENTICATE PATRON IDENTITY
        </h1>
        <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto">
          Dual verification is mandatory for email enrollments. Both your email and phone number must be verified to activate atelier checkout and private archives.
        </p>

        {/* Progress Pill */}
        <div className="pt-2 flex items-center justify-center gap-3 text-xs font-mono">
          <span
            className={`px-3 py-1 rounded-full border ${
              emailVerified
                ? 'bg-snake-green/10 border-snake-green text-snake-green font-bold'
                : 'bg-neutral-900 border-white/20 text-neutral-400'
            }`}
          >
            01 EMAIL {emailVerified ? '✓' : 'PENDING'}
          </span>
          <span className="text-neutral-600">•</span>
          <span
            className={`px-3 py-1 rounded-full border ${
              phoneVerified
                ? 'bg-snake-green/10 border-snake-green text-snake-green font-bold'
                : 'bg-neutral-900 border-white/20 text-neutral-400'
            }`}
          >
            02 PHONE {phoneVerified ? '✓' : 'PENDING'}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        {/* =========================================================================
            STEP 1: EMAIL VERIFICATION
            ========================================================================= */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-7 rounded-sm shadow-2xl relative space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  emailVerified
                    ? 'bg-snake-green/20 text-snake-green border border-snake-green/50'
                    : 'bg-white/5 text-neutral-300 border border-white/10'
                }`}
              >
                <Mail size={18} />
              </div>
              <div>
                <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
                  STEP 01
                </span>
                <h3 className="text-sm sm:text-base font-display font-medium text-white">
                  EMAIL VERIFICATION
                </h3>
                <p className="text-xs font-mono text-neutral-400 break-all">{email}</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded font-bold ${
                emailVerified
                  ? 'bg-snake-green text-black'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {emailVerified ? 'VERIFIED ✓' : 'PENDING'}
            </span>
          </div>

          {emailVerified ? (
            <div className="p-3.5 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2.5">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Email address verified. Atelier communications authenticated.</span>
            </div>
          ) : (
            <form onSubmit={handleVerifyEmail} className="space-y-3 pt-1">
              {emailError && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{emailError}</span>
                </div>
              )}

              {emailSentNotice && (
                <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>New verification email dispatched to your inbox.</span>
                </div>
              )}

              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                Enter the 6-digit confirmation code sent to your email, or click the verification link in your inbox.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  className="flex-1 bg-[#121212] border border-white/15 px-4 py-2.5 text-center font-mono text-base tracking-[0.4em] text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green uppercase"
                />
                <button
                  type="submit"
                  disabled={isVerifyingEmail || emailCode.length < 6}
                  className="px-6 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-all disabled:opacity-40 shrink-0"
                >
                  {isVerifyingEmail ? 'VERIFYING...' : 'VERIFY EMAIL'}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
                <span>Check spam if not in inbox</span>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={emailCooldown > 0}
                  className="text-neutral-400 hover:text-snake-green transition-colors disabled:opacity-40 underline"
                >
                  {emailCooldown > 0 ? `Resend code (${emailCooldown}s)` : 'Resend email code'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* =========================================================================
            STEP 2: PHONE NUMBER VERIFICATION
            ========================================================================= */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-7 rounded-sm shadow-2xl relative space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  phoneVerified
                    ? 'bg-snake-green/20 text-snake-green border border-snake-green/50'
                    : 'bg-white/5 text-neutral-300 border border-white/10'
                }`}
              >
                <Smartphone size={18} />
              </div>
              <div>
                <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
                  STEP 02
                </span>
                <h3 className="text-sm sm:text-base font-display font-medium text-white">
                  PHONE NUMBER VERIFICATION
                </h3>
                <p className="text-xs font-mono text-neutral-400">{phone || 'No phone number on record'}</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded font-bold ${
                phoneVerified
                  ? 'bg-snake-green text-black'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {phoneVerified ? 'VERIFIED ✓' : 'PENDING'}
            </span>
          </div>

          {phoneVerified ? (
            <div className="p-3.5 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2.5">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Phone number verified. Delivery SMS and courier OTPs activated.</span>
            </div>
          ) : (
            <form onSubmit={handleVerifyPhone} className="space-y-3 pt-1">
              {phoneError && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{phoneError}</span>
                </div>
              )}

              {phoneSentNotice && (
                <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>New SMS verification code dispatched.</span>
                </div>
              )}

              {/* Development/Testing Notice for Simulated SMS Gateway */}
              {simulatedPhoneOtp && (
                <div className="p-3 bg-neutral-900 border border-snake-green/40 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-snake-green">⚡</span>
                    <span className="text-neutral-300">
                      SMS Gateway Code: <strong className="text-snake-green tracking-widest">{simulatedPhoneOtp}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhoneCode(simulatedPhoneOtp)}
                    className="text-[10px] px-2 py-1 bg-snake-green/20 hover:bg-snake-green text-snake-green hover:text-black rounded uppercase font-bold transition-colors shrink-0"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              )}

              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                Enter the 6-digit SMS code dispatched to your registered mobile number for courier confirmation.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  className="flex-1 bg-[#121212] border border-white/15 px-4 py-2.5 text-center font-mono text-base tracking-[0.4em] text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green uppercase"
                />
                <button
                  type="submit"
                  disabled={isVerifyingPhone || phoneCode.length < 6}
                  className="px-6 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-all disabled:opacity-40 shrink-0"
                >
                  {isVerifyingPhone ? 'VERIFYING...' : 'VERIFY PHONE'}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
                <span>Standard SMS rates may apply</span>
                <button
                  type="button"
                  onClick={handleResendPhone}
                  disabled={phoneCooldown > 0}
                  className="text-neutral-400 hover:text-snake-green transition-colors disabled:opacity-40 underline"
                >
                  {phoneCooldown > 0 ? `Resend SMS (${phoneCooldown}s)` : 'Resend SMS code'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* =========================================================================
            FINAL ACTIVATION BANNER & BUTTON
            ========================================================================= */}
        {bothVerified ? (
          <div className="bg-snake-green/10 border border-snake-green/60 p-6 rounded-sm text-center space-y-4 shadow-[0_0_30px_rgba(4,252,33,0.15)] animate-in fade-in duration-500">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-snake-green text-black flex items-center justify-center font-bold">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-display font-medium text-white">
                PATRON IDENTITY CONFIRMED
              </h3>
              <p className="text-xs font-mono text-snake-green mt-1">
                All verification protocols passed. Your profile is fully activated.
              </p>
            </div>
            <Link
              href={next}
              className="inline-flex items-center justify-center gap-2 w-full bg-snake-green hover:bg-white text-black font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-bold transition-all shadow-[0_0_20px_rgba(4,252,33,0.4)]"
            >
              <span>PROCEED TO ATELIER</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="p-4 bg-neutral-950 border border-white/10 rounded text-center space-y-2 text-neutral-500 text-xs font-mono">
            <div className="flex items-center justify-center gap-2 text-neutral-400">
              <Lock size={14} />
              <span>DUAL VERIFICATION REQUIRED</span>
            </div>
            <p className="text-[11px]">
              Complete both Email and Phone verification steps above to unlock the SuperSnake storefront and checkout.
            </p>
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-600">
        <ShieldCheck size={14} className="text-snake-green" />
        <span>END-TO-END ENCRYPTED PATRON VERIFICATION PROTOCOL</span>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-4 sm:px-6 flex items-center justify-center font-sans">
      <Suspense
        fallback={
          <div className="text-xs font-mono text-neutral-500 flex items-center gap-2">
            <span className="inline-block animate-spin w-4 h-4 border-2 border-snake-green border-t-transparent rounded-full" />
            <span>INITIALIZING VERIFICATION PROTOCOL...</span>
          </div>
        }
      >
        <VerifyAccountContent />
      </Suspense>
    </div>
  );
}
