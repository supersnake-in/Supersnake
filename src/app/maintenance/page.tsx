'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, RefreshCw, Shield, ArrowRight, Lock } from 'lucide-react';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';
import { useStore } from '@/lib/store';
import { MaintenanceConfig } from '@/lib/types';

export default function MaintenancePage() {
  const router = useRouter();
  const { maintenanceConfig: storeConfig } = useStore();
  const [config, setConfig] = useState<MaintenanceConfig>(storeConfig);
  const [isChecking, setIsChecking] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  // Sync with store config if it changes
  useEffect(() => {
    if (storeConfig) {
      setConfig(storeConfig);
    }
  }, [storeConfig]);

  // Fetch freshest maintenance config on mount
  const checkStatus = useCallback(async (isManual: boolean = false) => {
    if (isManual) setIsChecking(true);
    try {
      const res = await fetch('/api/maintenance', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const latest = data.config || data;
        if (latest && typeof latest.maintenanceMode === 'boolean') {
          setConfig(latest);
          if (!latest.maintenanceMode) {
            if (isManual) setStatusFeedback('Atelier restored! Redirecting to storefront...');
            setTimeout(() => {
              window.location.href = '/';
            }, 800);
            return;
          }
        }
      }
      if (isManual) {
        setStatusFeedback('Atelier remains under private curation.');
        setTimeout(() => setStatusFeedback(null), 3500);
      }
    } catch {
      if (isManual) {
        setStatusFeedback('Unable to connect to atelier server. Retrying...');
        setTimeout(() => setStatusFeedback(null), 3500);
      }
    } finally {
      if (isManual) setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus(false);
    // Periodically poll every 15 seconds to auto-restore customers when admin toggles OFF
    const pollInterval = setInterval(() => {
      checkStatus(false);
    }, 15000);
    return () => clearInterval(pollInterval);
  }, [checkStatus]);

  // Live countdown ticker if estimatedRestoreTime is present
  useEffect(() => {
    if (!config.estimatedRestoreTime) {
      setTimeLeft(null);
      return;
    }

    const updateCountdown = () => {
      const targetTime = new Date(config.estimatedRestoreTime!).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [config.estimatedRestoreTime]);

  const displayMessage =
    config.maintenanceMessage ||
    'We are currently enhancing our digital atelier to elevate your experience. SuperSnake will return shortly.';

  return (
    <div className="relative bg-black text-white min-h-screen px-6 py-20 flex flex-col items-center justify-between font-sans selection:bg-snake-green selection:text-black overflow-hidden">
      {/* Subtle atmospheric ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-snake-green/5 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header Row */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between border-b border-white/[0.06] pb-6">
        <div className="flex items-center gap-3">
          <SuperSnakeLogo size="sm" showText={false} withLink={false} />
          <span className="font-mono text-[10px] tracking-[0.25em] text-neutral-400 uppercase">
            SUPERSNAKE // ATELIER
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900/80 border border-white/10 rounded text-[10px] font-mono tracking-widest text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>CURATION IN PROGRESS</span>
        </div>
      </div>

      {/* Center Main Stage */}
      <div className="relative z-10 max-w-xl w-full my-auto text-center space-y-8 py-12">
        {/* Brand Monogram */}
        <div className="flex justify-center">
          <SuperSnakeLogo size="lg" showText={false} withGlow={true} />
        </div>

        {/* Eyebrow Directive */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-[0.35em] text-snake-green uppercase block">
            PRIVATE DIGITAL ATELIER
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-medium uppercase tracking-tight text-white leading-tight">
            UNDER CURATION
          </h1>
        </div>

        {/* Dynamic Maintenance Message */}
        <p className="text-xs sm:text-sm font-mono text-neutral-400 leading-relaxed max-w-lg mx-auto">
          {displayMessage}
        </p>

        {/* Dynamic Countdown / Time Window */}
        {timeLeft && (timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) ? (
          <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-3">
            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase">
              <Clock size={13} className="text-snake-green" />
              <span>ESTIMATED RETURN COUNTDOWN</span>
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              <div className="bg-black/80 border border-white/5 p-3 rounded text-center">
                <span className="block text-2xl sm:text-3xl font-display font-bold text-white font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                  HOURS
                </span>
              </div>
              <div className="bg-black/80 border border-white/5 p-3 rounded text-center">
                <span className="block text-2xl sm:text-3xl font-display font-bold text-white font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                  MINUTES
                </span>
              </div>
              <div className="bg-black/80 border border-white/5 p-3 rounded text-center">
                <span className="block text-2xl sm:text-3xl font-display font-bold text-snake-green font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                  SECONDS
                </span>
              </div>
            </div>
            {config.estimatedRestoreTime && (
              <span className="text-[10px] font-mono text-neutral-500 block pt-1">
                TARGET: {new Date(config.estimatedRestoreTime).toLocaleString('en-IN', { timeZoneName: 'short' })}
              </span>
            )}
          </div>
        ) : (
          <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm max-w-md mx-auto flex items-center justify-center gap-3 text-xs font-mono text-neutral-400">
            <Clock size={15} className="text-snake-green flex-shrink-0" />
            <span className="tracking-wider uppercase">
              TEMPORARY RESTORATION WINDOW IN EFFECT
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            onClick={() => checkStatus(true)}
            disabled={isChecking}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
            <span>{isChecking ? 'CHECKING ATELIER...' : 'CHECK STATUS'}</span>
          </button>

          {statusFeedback && (
            <p className="text-xs font-mono text-snake-green tracking-wide animate-in fade-in duration-300">
              {statusFeedback}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Footer Row */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-[10px] font-mono text-neutral-500 tracking-wider">
        <div className="flex items-center gap-2">
          <Shield size={12} className="text-snake-green" />
          <span>© 2026 SUPERSNAKE APPARELS // PRIVATE CURATION</span>
        </div>

        {/* Understated Admin Access Link */}
        <Link
          href="/login?admin=1"
          className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-white transition-colors uppercase tracking-widest"
        >
          <Lock size={11} className="text-neutral-600" />
          <span>PERSONNEL LOGIN</span>
          <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  );
}
