'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Check, AlertCircle, Sparkles, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { normalizePhoneNumber, isValidPhoneNumber, formatPhoneDisplay, maskPhoneNumber } from '@/lib/phone-utils';

export default function AccountProfilePage() {
  const { user, profile, updateProfile, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone Change & Verification Flow
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpCooldown, setPhoneOtpCooldown] = useState(0);

  const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (phoneOtpCooldown <= 0) return;
    const timer = setInterval(() => setPhoneOtpCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [phoneOtpCooldown]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await updateProfile({ fullName });
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleStartChangePhone = () => {
    setIsChangingPhone(true);
    setNewPhone('');
    setPhoneOtp(['', '', '', '', '', '']);
    setPhoneOtpSent(false);
    setError(null);
  };

  const handleSendPhoneOtp = async () => {
    setError(null);
    const normalized = normalizePhoneNumber(newPhone);
    if (!normalized || !isValidPhoneNumber(normalized)) {
      setError('Please enter a valid phone number with country code (e.g. +91 98765 43210).');
      return;
    }

    setIsSendingPhoneOtp(true);
    const res = await sendPhoneOtp(normalized);
    setIsSendingPhoneOtp(false);

    if (res.error) {
      setError(res.error);
    } else {
      setPhoneOtpSent(true);
      setPhoneOtpCooldown(60);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const arr = [...phoneOtp];
    arr[idx] = digit;
    setPhoneOtp(arr);

    if (digit && idx < 5) {
      phoneInputRefs.current[idx + 1]?.focus();
    }
  };

  const handleVerifyNewPhone = async () => {
    const code = phoneOtp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError(null);
    setIsVerifyingPhoneOtp(true);
    const normalized = normalizePhoneNumber(newPhone);

    const res = await verifyPhoneOtp(normalized, code);
    setIsVerifyingPhoneOtp(false);

    if (res.error) {
      setError(res.error);
    } else {
      setPhone(normalized);
      setIsChangingPhone(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }
  };

  const email = profile?.email || user?.email || 'patron@supersnake.in';
  const initial = (fullName || email).charAt(0).toUpperCase();
  const isPhoneVerified = Boolean(profile?.phone_verified || profile?.isPhoneVerified);

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
          PATRON RECORD
        </span>
        <h2 className="text-xl md:text-2xl font-display font-medium text-white">
          PERSONAL INFORMATION
        </h2>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded space-y-8">
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
            <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 uppercase tracking-widest">
              ATELIER VERIFIED
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-center gap-2 rounded">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2 rounded">
            <Check size={15} />
            <span>Patron record updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
              Full Legal Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-[#121212] border border-white/15 px-4 py-3 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors rounded"
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
              className="w-full bg-[#161616] border border-white/10 px-4 py-3 text-xs font-mono text-neutral-400 cursor-not-allowed rounded"
            />
            <span className="text-[10px] font-mono text-neutral-600 block mt-1">
              Contact concierge to modify registered email.
            </span>
          </div>

          {/* Phone Number with Verified Status & Change Flow */}
          <div className="p-4 bg-[#111] border border-white/10 rounded space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Phone Number (For Delivery SMS &amp; Verification)
              </label>
              {isPhoneVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-snake-green font-semibold">
                  <Check size={12} /> VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400">
                  NOT VERIFIED
                </span>
              )}
            </div>

            {!isChangingPhone ? (
              <div className="flex items-center justify-between">
                <p className="text-sm font-mono text-white">
                  {formatPhoneDisplay(phone) || 'No phone registered'}
                </p>
                <button
                  type="button"
                  onClick={handleStartChangePhone}
                  className="text-xs font-mono text-snake-green hover:underline uppercase"
                >
                  CHANGE PHONE
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">NEW PHONE NUMBER</span>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="flex-1 bg-black border border-white/15 px-3 py-2 text-xs font-mono text-white rounded focus:outline-none focus:border-snake-green"
                    />
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      disabled={isSendingPhoneOtp || phoneOtpCooldown > 0}
                      className="px-4 py-2 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase font-semibold disabled:opacity-50 transition-colors rounded"
                    >
                      {isSendingPhoneOtp
                        ? 'SENDING...'
                        : phoneOtpCooldown > 0
                        ? `RESEND IN ${phoneOtpCooldown}S`
                        : 'SEND OTP'}
                    </button>
                  </div>
                </div>

                {phoneOtpSent && (
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                      ENTER 6-DIGIT SMS CODE SENT TO {maskPhoneNumber(newPhone)}
                    </span>
                    <div className="flex gap-2 justify-center py-1">
                      {phoneOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            phoneInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          className="w-9 h-11 bg-black border border-white/20 text-center font-mono text-base text-white focus:outline-none focus:border-snake-green rounded"
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleVerifyNewPhone}
                        disabled={isVerifyingPhoneOtp || phoneOtp.some((d) => !d)}
                        className="flex-1 py-2.5 bg-snake-green hover:bg-white text-black font-mono text-xs uppercase font-bold tracking-wider transition-colors disabled:opacity-50 rounded"
                      >
                        {isVerifyingPhoneOtp ? 'VERIFYING...' : 'VERIFY & SAVE PHONE'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChangingPhone(false)}
                        className="px-3 py-2.5 border border-white/20 text-neutral-400 hover:text-white font-mono text-xs uppercase rounded"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
              className="px-6 py-3 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 rounded"
            >
              {isSubmitting ? 'UPDATING RECORD...' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
