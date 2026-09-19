'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, X, ArrowRight } from 'lucide-react';

export function AuthHashNotice() {
  const [notice, setNotice] = useState<{
    code: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (hash && (hash.includes('error=') || hash.includes('error_code='))) {
      try {
        const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
        const params = new URLSearchParams(cleanHash);
        const errorCode = params.get('error_code') || params.get('error') || 'auth_error';
        const rawDescription = params.get('error_description') || 'Authentication link is invalid or has expired.';
        const cleanDescription = decodeURIComponent(rawDescription.replace(/\+/g, ' '));

        let userMessage = cleanDescription;
        if (errorCode === 'otp_expired' || cleanDescription.toLowerCase().includes('expired')) {
          userMessage = 'Your email verification link has expired or was already used. Please request a new code or sign in.';
        }

        setNotice({
          code: errorCode,
          description: userMessage,
        });

        // Clean up hash from browser address bar without reload
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (e) {
        console.warn('Error parsing auth hash:', e);
      }
    }
  }, []);

  if (!notice) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] bg-[#0d0d0d] border border-red-800/60 p-5 rounded shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 font-mono text-xs">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-bold tracking-wider uppercase text-white">AUTHENTICATION NOTICE</span>
        </div>
        <button
          onClick={() => setNotice(null)}
          className="text-neutral-500 hover:text-white transition-colors"
          aria-label="Dismiss notice"
        >
          <X size={15} />
        </button>
      </div>

      <p className="text-neutral-300 text-[11px] leading-relaxed mb-4">
        {notice.description}
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          onClick={() => setNotice(null)}
          className="flex-1 py-2 px-3 bg-white hover:bg-snake-green text-black font-semibold uppercase tracking-wider text-center text-[10px] transition-colors flex items-center justify-center gap-1.5"
        >
          <span>SIGN IN</span>
          <ArrowRight size={12} />
        </Link>
        <button
          onClick={() => setNotice(null)}
          className="py-2 px-3 border border-white/20 hover:border-white text-neutral-400 hover:text-white uppercase tracking-wider text-[10px] transition-colors"
        >
          DISMISS
        </button>
      </div>
    </div>
  );
}
