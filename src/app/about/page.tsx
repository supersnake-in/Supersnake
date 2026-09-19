'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles, Feather, Flame } from 'lucide-react';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

export default function AboutPage() {
  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-24">
        {/* Hero Manifesto */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
            BRAND MANIFESTO
          </span>
          <h1 className="text-4xl md:text-7xl font-display font-medium uppercase tracking-tight text-white leading-none">
            WEAR YOUR INSTINCT.
          </h1>
          <p className="text-sm md:text-lg font-mono text-neutral-400 leading-relaxed">
            SuperSnake was founded on a singular obsession: the perfection of the T-shirt. Not 50 categories of seasonal clutter. Just one garment, executed with unrelenting architectural precision.
          </p>
        </div>

        {/* The Philosophy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm space-y-4">
            <span className="text-xs font-mono text-snake-green">01 / SUBSTANCE</span>
            <h3 className="text-xl font-display font-medium text-white">280–300 GSM ARCHITECTURE</h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Standard tees range from 140 to 180 GSM. Ours begin at 280 GSM. Pure, heavyweight Supima® and French Terry cotton that maintains its monolithic drape regardless of movement.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm space-y-4">
            <span className="text-xs font-mono text-snake-green">02 / ENDURANCE</span>
            <h3 className="text-xl font-display font-medium text-white">ZERO-SAG RIBBED COLLAR</h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Engineered with a dense 1x1 elastane-infused rib that resists bacon-neck, stretching, and distortion after dozens of cold wash cycles. A collar that stays razor-sharp.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm space-y-4">
            <span className="text-xs font-mono text-snake-green">03 / ETHICS</span>
            <h3 className="text-xl font-display font-medium text-white">RESPONSIBLE ATELIER</h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Knitted, dyed, and tailored in solar-powered partner mills in South India. GOTS certified organic pigments, zero harmful fixatives, and fair-wage craftsman ateliers.
            </p>
          </div>
        </div>

        {/* The Creed Quote */}
        <div className="border-y border-white/10 py-16 text-center space-y-6">
          <blockquote className="text-2xl md:text-4xl font-display font-medium text-white tracking-tight max-w-3xl mx-auto leading-snug">
            &ldquo;Most brands treat the T-shirt as an afterthought. To us, it is the most honest, difficult, and enduring canvas in modern fashion.&rdquo;
          </blockquote>
          <p className="text-xs font-mono text-snake-green uppercase tracking-widest">
            — THE SUPERSNAKE DESIGN COLLECTIVE, BENGALURU
          </p>
        </div>

        {/* Specifications Table */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm space-y-6">
          <h3 className="text-lg font-display font-medium text-white uppercase tracking-wider">
            ATELIER BENCHMARKS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-mono divide-x divide-white/5">
            <div className="space-y-1">
              <span className="text-neutral-500 uppercase">YARN COUNT</span>
              <p className="text-white font-medium text-sm">24s / 100% Combed</p>
            </div>
            <div className="pl-4 space-y-1">
              <span className="text-neutral-500 uppercase">PRE-SHRUNK</span>
              <p className="text-white font-medium text-sm">&lt; 1.5% Shrinkage</p>
            </div>
            <div className="pl-4 space-y-1">
              <span className="text-neutral-500 uppercase">COLORFASTNESS</span>
              <p className="text-white font-medium text-sm">Grade 4.5 Reactive</p>
            </div>
            <div className="pl-4 space-y-1">
              <span className="text-neutral-500 uppercase">SEAM INTEGRITY</span>
              <p className="text-white font-medium text-sm">Twin-Needle Bound</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 pt-6">
          <h3 className="text-2xl md:text-3xl font-display font-medium text-white">
            EXPERIENCE THE WEIGHT.
          </h3>
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors group"
            >
              <span>EXPLORE THE COLLECTION</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
