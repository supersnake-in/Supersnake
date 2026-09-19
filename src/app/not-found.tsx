'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

export default function NotFound() {
  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center font-sans text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center mb-2">
          <SuperSnakeLogo size="lg" showText={false} />
        </div>

        <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase block">
          404 // VOID ENCOUNTERED
        </span>

        <h1 className="text-4xl md:text-6xl font-display font-medium uppercase tracking-tight text-white leading-none">
          THE TRAIL ENDS HERE.
        </h1>

        <p className="text-xs md:text-sm font-mono text-neutral-400 leading-relaxed">
          The page you are looking for has disappeared into the dark or never existed. Return to the light of the atelier.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>RETURN TO ATELIER</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <span>SHOP COLLECTION</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
