'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

export default function MaintenancePage() {
  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center font-sans text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center mb-2">
          <SuperSnakeLogo size="lg" showText={false} />
        </div>

        <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase block">
          SCHEDULED CURATION
        </span>

        <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white leading-tight">
          ATELIER UNDER CURATION
        </h1>

        <p className="text-xs md:text-sm font-mono text-neutral-400 leading-relaxed">
          We are calibrating the atelier for our next heavyweight drop. The portal will resume normal operations shortly.
        </p>

        <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm text-xs font-mono text-neutral-400 flex items-center justify-center gap-2">
          <Clock size={15} className="text-snake-green" />
          <span>ESTIMATED DURATION: 15 MINUTES</span>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            <span>CHECK STATUS</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
