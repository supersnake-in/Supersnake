'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await resetPassword(email);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSubmitted(true);
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
            CREDENTIAL RECOVERY
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white">
            RESET PASSWORD
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            Enter your registered email and we’ll dispatch a secure recovery link.
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

          {submitted ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-12 h-12 mx-auto rounded-full bg-snake-green/10 border border-snake-green/30 flex items-center justify-center text-snake-green">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-display text-white font-medium">RECOVERY DISPATCHED</h3>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                If an account exists under <span className="text-white">{email}</span>, you will receive password reset instructions within 2 minutes.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-mono text-snake-green hover:underline"
                >
                  <ArrowLeft size={14} />
                  <span>RETURN TO LOGIN</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
                  Registered Email
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
                    <span>SEND RECOVERY LINK</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={12} />
                  <span>BACK TO LOGIN</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
