'use client';

import React from 'react';
import Link from 'next/link';
import { Droplets, Wind, Sun, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CareGuidePage() {
  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
            GARMENT PRESERVATION
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            CARE & LONGEVITY GUIDE
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-400">
            How to care for your 280–300 GSM Supima® cotton pieces to ensure decades of shape and color retention.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-snake-green uppercase tracking-widest">01 / WASHING</span>
              <Droplets size={20} className="text-snake-green" />
            </div>
            <h3 className="text-xl font-display font-medium text-white">COLD WASH ONLY (30°C)</h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Always wash inside out in cold water (maximum 30°C or 86°F) using gentle detergent. Cold water preserves the organic cotton fibers, protects reactive dye depth, and prevents shrinkage.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-snake-green uppercase tracking-widest">02 / DRYING</span>
              <Wind size={20} className="text-snake-green" />
            </div>
            <h3 className="text-xl font-display font-medium text-white">FLAT DRY IN SHADE</h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Avoid machine tumble drying. High heat breaks down cotton elastane and warps collar ribbing. Lay your garment flat on a clean drying rack away from direct scorching sunlight.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-snake-green uppercase tracking-widest">03 / IRONING</span>
              <Sun size={20} className="text-snake-green" />
            </div>
            <h3 className="text-xl font-display font-medium text-white">COOL IRON INSIDE OUT</h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              If ironing is desired, iron inside out on a medium-low cotton setting. Never apply a hot iron directly to screen prints, heat transfers, or the external ribbed collar.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-snake-green uppercase tracking-widest">04 / COLLAR CARE</span>
              <ShieldCheck size={20} className="text-snake-green" />
            </div>
            <h3 className="text-xl font-display font-medium text-white">PRESERVE THE RIB</h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              When placing garments on hangers, insert the hanger from the bottom hem upwards. Never force a hanger through the neck opening to avoid stretching the collar ribbing.
            </p>
          </div>
        </div>

        {/* Prohibitions */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-red-400 text-xs font-mono uppercase tracking-wider">
            <AlertTriangle size={16} />
            <span>ATELIER PROHIBITIONS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-neutral-400">
            <div className="p-3 bg-[#121212] border border-white/5 rounded-sm">
              <span className="text-white font-medium block">NO CHLORINE BLEACH</span>
              <p className="text-[11px] text-neutral-500 mt-1">Bleach strips the reactive dyes and weakens cotton tensile strength.</p>
            </div>
            <div className="p-3 bg-[#121212] border border-white/5 rounded-sm">
              <span className="text-white font-medium block">NO DRY CLEANING</span>
              <p className="text-[11px] text-neutral-500 mt-1">Chemical solvents degrade the soft silicone wash finish.</p>
            </div>
            <div className="p-3 bg-[#121212] border border-white/5 rounded-sm">
              <span className="text-white font-medium block">NO HARD WRINGING</span>
              <p className="text-[11px] text-neutral-500 mt-1">Twisting wet heavyweight cotton stresses twin-needle seams.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            <span>DISCOVER THE PIECES</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
