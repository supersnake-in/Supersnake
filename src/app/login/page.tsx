'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/account');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (useMagicLink) {
      const res = await signIn(email);
      setIsSubmitting(false);
      if (res.error) {
        setError(res.error);
      } else {
        setMagicLinkSent(true);
      }
    } else {
      if (!password) {
        setError('Please enter your password.');
        setIsSubmitting(false);
        return;
      }
      const res = await signIn(email, password);
      setIsSubmitting(false);
      if (res.error) {
        setError(res.error);
      } else {
        router.push('/account');
      }
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

          {magicLinkSent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-snake-green/10 border border-snake-green/30 flex items-center justify-center text-snake-green">
                <Mail size={22} />
              </div>
              <h3 className="text-lg font-display text-white font-medium">CHECK YOUR INBOX</h3>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                We sent a secure sign-in link to <span className="text-white">{email}</span>. Click the link to enter immediately.
              </p>
              <button
                onClick={() => setMagicLinkSent(false)}
                className="text-xs font-mono text-snake-green hover:underline pt-2"
              >
                Back to password sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              {!useMagicLink && (
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
                      required={!useMagicLink}
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
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>{useMagicLink ? 'SEND MAGIC LINK' : 'SIGN IN'}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseMagicLink(!useMagicLink);
                    setError(null);
                  }}
                  className="text-[11px] font-mono text-neutral-400 hover:text-white transition-colors"
                >
                  {useMagicLink ? 'Prefer password sign in?' : 'Prefer passwordless magic link?'}
                </button>
              </div>
            </form>
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
              href="/signup"
              className="inline-block w-full border border-white/20 hover:border-snake-green hover:text-snake-green text-white font-mono text-xs uppercase tracking-widest py-3 transition-colors"
            >
              CREATE PATRON ACCOUNT
            </Link>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-600">
          <ShieldCheck size={14} className="text-snake-green" />
          <span>256-BIT ENCRYPTED LUXURY PORTAL</span>
        </div>
      </div>
    </div>
  );
}
