'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Check,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  ShieldAlert,
  ArrowRight,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AccountProfilePage() {
  const { user, profile, updateProfile, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification Modal State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await updateProfile({ fullName, phone });
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleOpenVerifyModal = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number before verifying.');
      return;
    }

    setOtpError(null);
    setOtpNotice(null);
    setIsVerifyModalOpen(true);
    setIsSendingOtp(true);

    const res = await sendPhoneOtp(cleanPhone);
    setIsSendingOtp(false);

    if (!res.success) {
      setOtpError(res.error || 'Failed to dispatch verification code.');
      if (res.cooldown) setCooldown(res.cooldown);
    } else {
      setOtpNotice(`Verification code sent to ${cleanPhone}`);
      setCooldown(res.cooldown || 60);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setOtpError(null);
    setOtpNotice(null);
    setIsSendingOtp(true);

    const res = await sendPhoneOtp(phone.trim());
    setIsSendingOtp(false);

    if (!res.success) {
      setOtpError(res.error || 'Failed to dispatch verification code.');
      if (res.cooldown) setCooldown(res.cooldown);
    } else {
      setOtpNotice('A fresh verification code has been dispatched.');
      setCooldown(res.cooldown || 60);
    }
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (otpCode.trim().length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    const res = await verifyPhoneOtp(otpCode.trim(), phone.trim());
    setIsVerifyingOtp(false);

    if (!res.success) {
      setOtpError(res.error || 'Verification failed. Please check the code.');
    } else {
      setOtpNotice('Phone number successfully verified!');
      setTimeout(() => {
        setIsVerifyModalOpen(false);
        setOtpCode('');
      }, 1200);
    }
  };

  const email = profile?.email || user?.email || 'patron@supersnake.in';
  const initial = (fullName || email).charAt(0).toUpperCase();
  const isPhoneVerified = Boolean(profile?.phoneVerified && profile?.phone === phone);

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-white/10 pb-4">
        <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
          PATRON RECORD
        </span>
        <h2 className="text-xl md:text-2xl font-display font-medium text-white">
          PROFILE INFORMATION
        </h2>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-8">
        {/* Avatar Monogram */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#161616] border border-white/20 flex items-center justify-center font-display text-2xl font-bold text-snake-green">
            {initial}
          </div>
          <div>
            <h3 className="text-base font-display font-medium text-white">
              {fullName || 'Patron'}
            </h3>
            <p className="text-xs font-mono text-neutral-400">{email}</p>
            <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 uppercase tracking-widest rounded">
              ATELIER PATRON
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
            <Check size={15} />
            <span>Patron record updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
              Full Legal Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
              Email Address (Account Identifier)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-[#161616] border border-white/10 px-4 py-2.5 text-xs font-mono text-neutral-400 cursor-not-allowed"
            />
            <span className="text-[10px] font-mono text-neutral-600 block mt-1">
              Primary authentication coordinate. Contact concierge to update.
            </span>
          </div>

          {/* Phone Number with Honest Verification Status */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Mobile Number (Delivery & SMS Updates)
              </label>

              {/* Status Badge */}
              {isPhoneVerified ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 uppercase tracking-widest rounded">
                  <Check size={10} />
                  <span>VERIFIED</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-widest rounded">
                  <ShieldAlert size={10} />
                  <span>UNVERIFIED</span>
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="flex-1 bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
              />

              {!isPhoneVerified && phone && (
                <button
                  type="button"
                  onClick={handleOpenVerifyModal}
                  className="px-3 py-2 bg-snake-green/10 hover:bg-snake-green hover:text-black text-snake-green border border-snake-green/30 text-[10px] font-mono uppercase tracking-wider font-semibold transition-all shrink-0"
                >
                  Verify Number
                </button>
              )}
            </div>

            <p className="text-[10px] font-mono text-neutral-500 mt-1.5 leading-relaxed">
              {isPhoneVerified
                ? 'Your number is verified. Standard orders proceed without OTP interruptions.'
                : 'Unverified numbers still allow checkout on standard orders. Modifying your phone resets verification.'}
            </p>
          </div>

          <div>
            <span className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
              Patron Enrolled Date
            </span>
            <p className="text-xs font-mono text-neutral-300">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Current Season (2026)'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'UPDATING RECORD...' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>

      {/* Phone Verification Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/15 p-6 md:p-8 rounded-sm shadow-2xl text-white">
            <button
              onClick={() => setIsVerifyModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-snake-green/10 border border-snake-green/30 flex items-center justify-center text-snake-green">
                <Smartphone size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase block">
                  DELIVERY SECURITY
                </span>
                <h3 className="text-base font-display font-medium text-white">
                  VERIFY MOBILE NUMBER
                </h3>
              </div>
            </div>

            <p className="text-xs font-mono text-neutral-400 mb-6 leading-relaxed">
              Enter the 6-digit verification code sent to <strong className="text-white">{phone}</strong>.
            </p>

            {otpError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono">
                {otpError}
              </div>
            )}

            {otpNotice && (
              <div className="mb-4 p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono">
                {otpNotice}
              </div>
            )}

            <form onSubmit={handleConfirmOtp} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full bg-[#121212] border border-white/20 px-4 py-3 text-lg font-mono tracking-[0.4em] text-center text-white focus:outline-none focus:border-snake-green"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp || otpCode.length !== 6}
                className="w-full bg-snake-green hover:bg-white text-black font-mono text-xs uppercase tracking-widest py-3.5 px-4 font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifyingOtp ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>CONFIRM & VERIFY</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-neutral-400">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || isSendingOtp}
                  className="text-snake-green hover:underline disabled:text-neutral-600 disabled:no-underline flex items-center gap-1"
                >
                  <RefreshCw size={11} className={isSendingOtp ? 'animate-spin' : ''} />
                  <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
