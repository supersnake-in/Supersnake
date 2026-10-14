'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';
import { Collection } from '@/lib/types';

export default function CollectionsOverviewPage() {
  const { collections, products, storefrontConfig } = useStore();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FEATURED' | 'CORE'>('ALL');

  const isPreLaunch = storefrontConfig?.storefrontMode === 'PRE_LAUNCH';

  // Filter and sort active collections
  const displayCollections = useMemo(() => {
    let list = collections.filter((c) => c.isActive);

    if (activeFilter === 'FEATURED') {
      list = list.filter((c) => c.isFeatured);
    } else if (activeFilter === 'CORE') {
      list = list.filter((c) => c.slug === 'the-serpent' || c.slug === 'the-royals');
    }

    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [collections, activeFilter]);

  return (
    <div className="min-h-screen bg-black text-white pt-24 sm:pt-28 pb-24 px-4 sm:px-6 md:px-12 selection:bg-snake-green selection:text-black">
      {/* ============================================================
          01 — EDITORIAL HERO
          ============================================================ */}
      <section className="max-w-7xl mx-auto mb-16 sm:mb-20">
        <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto pt-6 sm:pt-10">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-medium tracking-tight text-white uppercase leading-[1.08]">
            THE <span className="text-snake-green">SUPER SNAKE</span> SERIES
          </h1>

          <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-2xl leading-relaxed">
            Every garment belongs to a distinct art-directed series with its own theme, mood, color palette,
            and personality—connected by the immortal SUPER SNAKE identity. Explore the chapters, find your style, and collect your signature.
          </p>

          {/* Filter Tabs */}
          <div className="pt-6 flex items-center justify-center gap-2">
            {[
              { id: 'ALL', label: 'ALL CHAPTERS' },
              { id: 'FEATURED', label: 'FEATURED DROPS' },
              { id: 'CORE', label: 'CORE ARCHIVES' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-1.5 text-[10px] font-mono tracking-widest uppercase transition-all duration-300 rounded-sm border ${
                  activeFilter === tab.id
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-transparent text-neutral-400 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          02 — IMAGE-LED COLLECTION CARDS GRID
          ============================================================ */}
      <section className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayCollections.map((col, index) => {
            return (
              <motion.article
                key={col.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group relative flex flex-col bg-[#080808] border border-white/10 rounded-sm overflow-hidden hover:border-white/30 transition-all duration-500 shadow-xl"
              >
                {/* Visual Card Image Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={col.cardImage || col.heroImage || '/hero2.png'}
                    alt={`${col.name} — SUPER SNAKE Collection Series`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 ${
                      col.heroImage && col.heroImage !== col.cardImage
                        ? 'opacity-100 group-hover:opacity-0'
                        : 'opacity-100'
                    }`}
                  />
                  {col.heroImage && col.heroImage !== col.cardImage && (
                    <Image
                      src={col.heroImage}
                      alt={`${col.name} alternate view`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                  )}
                  {/* Subtle Dark Vignette & Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />

                  {/* Series Badge Overlay */}
                  <div className="absolute top-3 left-3 z-10 text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-snake-green font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {col.badge || `CHAPTER 0${index + 1}`}
                  </div>

                  {/* Gender Department Pill */}
                  <div className="absolute bottom-3 left-3 z-10 px-2 py-0.5 bg-black/60 backdrop-blur-md text-[8px] font-mono tracking-widest uppercase text-neutral-300 border border-white/10 rounded-sm">
                    MEN & WOMEN ATELIER
                  </div>
                </div>

                {/* Card Content & Story */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-display font-medium uppercase tracking-tight text-white group-hover:text-snake-green transition-colors">
                        {col.name}
                      </h2>
                      <p className="text-[11px] font-mono text-neutral-400 tracking-wide line-clamp-1">
                        {col.tagline}
                      </p>
                    </div>

                    <p className="text-xs font-mono text-neutral-400 line-clamp-3 leading-relaxed">
                      {col.description}
                    </p>
                  </div>

                  {/* Mood Palette Swatches & Action */}
                  <div className="pt-4 border-t border-white/[0.06] space-y-4">
                    {/* Palette Dots */}
                    {col.moodPalette && col.moodPalette.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-400">
                          MOOD PALETTE:
                        </span>
                        <div className="flex items-center gap-1.5">
                          {col.moodPalette.map((clr, cIdx) => (
                            <span
                              key={cIdx}
                              title={clr.name}
                              className="w-3.5 h-3.5 rounded-full border border-white/20 transition-transform group-hover:scale-110"
                              style={{ backgroundColor: clr.hex }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explore CTA */}
                    <Link
                      href={`/collections/${col.slug}`}
                      className="w-full py-3 px-5 bg-snake-green hover:bg-white text-black font-mono text-xs uppercase tracking-[0.2em] font-extrabold transition-all duration-300 flex items-center justify-center gap-2 rounded-sm shadow-[0_0_20px_rgba(4,252,33,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-[0.98]"
                    >
                      <span>EXPLORE SERIES</span>
                      <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          03 — MASTER BRAND STORYTELLING FOOTER BANNER
          ============================================================ */}
      <section className="max-w-7xl mx-auto mt-20 pt-16 border-t border-white/10">
        <div className="bg-[#090909] border border-white/10 rounded-sm p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <SuperSnakeLogo size="sm" showText={false} withLink={false} />
              <span className="text-[10px] font-mono tracking-[0.25em] text-snake-green uppercase">
                THE SUPER SNAKE DESIGN PHILOSOPHY
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-medium text-white uppercase tracking-tight">
              A UNIVERSE OF COLLECTIBLE CHAPTERS
            </h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              We reject generic T-shirts with printed graphics. Every SuperSnake series is crafted around considered fits,
              dense 240–300 GSM Supima® cotton, and production-grade embroidery. The original serpent logo remains the sacred master symbol connecting every collection.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href={isPreLaunch ? '/#pre-book-grid' : '/shop'}
              className="px-6 py-3.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-bold text-center transition-colors shadow-lg"
            >
              {isPreLaunch ? 'THE FIRST DROP PRE-BOOKING' : 'SHOP ALL PIECES'}
            </Link>
            <Link
              href="/about"
              className="px-6 py-3.5 border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-widest text-center transition-colors"
            >
              ATELIER ARCHIVE
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
