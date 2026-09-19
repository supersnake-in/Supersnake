'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await supabase.auth.resend({
        type: 'signup',
        email,
      });
      setResent(true);
      setCooldown(60);
    } catch (e) {}
    setResending(false);
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="text-center mb-10 space-y-4">
        <div className="flex justify-center mb-2">
          <SuperSnakeLogo size="md" showText={false} />
        </div>
        <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
          VERIFICATION PROTOCOL
        </span>
        <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white">
          VERIFY YOUR INBOX
        </h1>
        <p className="text-xs font-mono text-neutral-400">
          We dispatched an authentication link to confirm your patron status.
        </p>
      </div>

      {/* Card */}
      <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm shadow-2xl relative text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-full bg-snake-green/10 border border-snake-green/30 flex items-center justify-center text-snake-green animate-pulse">
          <Mail size={26} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-mono text-white font-medium break-all">
            {email}
          </p>
          <p className="text-xs font-mono text-neutral-400 leading-relaxed">
            Please click the confirmation link in that email to activate your profile and unlock instant checkout.
          </p>
        </div>

        {resent && (
          <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center justify-center gap-2">
            <CheckCircle2 size={15} />
            <span>Verification email re-dispatched!</span>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="w-full border border-white/20 hover:border-snake-green hover:text-snake-green text-white font-mono text-xs uppercase tracking-widest py-3 px-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
            <span>
              {cooldown > 0 ? `RESEND IN ${cooldown}S` : 'RESEND VERIFICATION EMAIL'}
            </span>
          </button>

          <Link
            href="/login"
            className="w-full bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest py-3 px-4 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>PROCEED TO SIGN IN</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="text-[11px] font-mono text-neutral-500 pt-2">
          Didn't receive it? Check your spam or promotions folder.
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 flex items-center justify-center font-sans">
      <Suspense fallback={<div className="text-xs font-mono text-neutral-500">LOADING VERIFICATION...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
