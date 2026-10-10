import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { ArrowRight, Compass, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

export const metadata: Metadata = {
  title: 'Our Story & Brand Manifesto | SUPERSNAKE',
  description:
    'SuperSnake is built around a simple idea: clothing should have character. Five distinct chapters united by one unmistakable identity. Wear your instinct.',
  alternates: {
    canonical: 'https://supersnake.in/about',
  },
  openGraph: {
    title: 'Our Story & Brand Manifesto | SUPERSNAKE',
    description:
      'SuperSnake is built around a simple idea: clothing should have character. Five distinct chapters united by one unmistakable identity.',
    url: 'https://supersnake.in/about',
    siteName: 'SUPERSNAKE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Story & Brand Manifesto | SUPERSNAKE',
    description:
      'SuperSnake is built around a simple idea: clothing should have character. Five distinct chapters united by one unmistakable identity.',
  },
};

const CHAPTERS_SHOWCASE = [
  {
    name: 'THE BLACK PANTHER',
    badge: 'CHAPTER 01 // AUTOMOTIVE DIVISION',
    tagline: 'The raw appeal of automobiles.',
    description: 'High-octane motorsport engineering, track-spec aerodynamics, and supercar velocity tailored for the street.',
    image: '/collection-black-panther-card.jpg',
    href: '/collections/the-black-panther',
  },
  {
    name: 'THE ROYALS',
    badge: 'CHAPTER 02 // IMPERIAL ARCHIVE',
    tagline: 'Understated luxury and refined simplicity.',
    description: 'Dynastic heritage, sovereign prestige, and subtle heraldic crests commanding respect through quiet restraint.',
    image: '/collection-the-royals-card.jpg',
    href: '/collections/the-royals',
  },
  {
    name: 'THE SERPENT',
    badge: 'CHAPTER 03 // PRIMAL IDENTITY',
    tagline: 'Art without restraint.',
    description: 'Hypnotic poise, raw instinct, and foundational serpent scale iconography that defines our visual core.',
    image: '/collection-the-serpent-card.jpg',
    href: '/collections/the-serpent',
  },
  {
    name: 'THE AURA',
    badge: 'CHAPTER 04 // QUIET LUXURY',
    tagline: 'Minimalism with meaning.',
    description: 'Radical simplicity, organic earth tones, and clean silhouettes designed to be felt before they are seen.',
    image: '/collection-the-aura-card.jpg',
    href: '/collections/the-aura',
  },
  {
    name: 'THE SIGNATURE',
    badge: 'CHAPTER 05 // CORE FOUNDATION',
    tagline: 'The unmistakable SuperSnake identity.',
    description: 'The permanent cornerstone featuring the master brand symbol, engineered for presence in everyday wear.',
    image: '/hero-object-supersnake-tee.png',
    href: '/collections/the-signature',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-black text-white min-h-screen pt-28 sm:pt-36 pb-24 px-4 sm:px-6 md:px-12 font-sans selection:bg-snake-green selection:text-black">
      <div className="max-w-6xl mx-auto space-y-20 sm:space-y-28 md:space-y-36">
        
        {/* ============================================================
            01 — HERO BRAND MANIFESTO
            ============================================================ */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-snake-green/30 bg-snake-green/5 text-[10px] sm:text-xs font-mono tracking-[0.25em] text-snake-green uppercase">
            <Sparkles size={12} />
            <span>BRAND MANIFESTO</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-medium uppercase tracking-tight text-white leading-none">
            WEAR YOUR <span className="text-snake-green">INSTINCT.</span>
          </h1>

          <div className="space-y-4 pt-2">
            <p className="text-base sm:text-xl font-display uppercase tracking-wider text-neutral-200">
              SuperSnake is built around a simple idea: clothing should have character.
            </p>
            <p className="text-xs sm:text-sm font-mono text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              Not every design needs to make a statement in the same way. Some are inspired by the raw presence of automobiles. Others draw their strength from understated elegance, expressive artwork, thoughtful minimalism, or the identity of the brand itself.
            </p>
            <p className="text-xs sm:text-sm font-mono text-neutral-300 font-semibold leading-relaxed">
              We bring these different perspectives together through a distinct design language, built around one unmistakable identity.
            </p>
          </div>
        </div>

        {/* ============================================================
            02 — THE THREE PILLARS (DESIGN, CHARACTER, EXPERIENCE)
            ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Pillar 01 */}
          <div className="bg-[#0a0a0a] border border-white/10 hover:border-snake-green/40 transition-colors p-6 sm:p-8 rounded-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono text-snake-green tracking-widest font-semibold">
                01 / DESIGN
              </span>
              <h3 className="text-lg sm:text-xl font-display font-medium text-white uppercase tracking-tight">
                EVERY DETAIL HAS A PURPOSE
              </h3>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                From clean silhouettes to expressive graphics, every design begins with a visual direction. We explore different aesthetics, compositions, and ideas to create pieces that reflect individuality rather than follow a single definition of style.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              <span>VISUAL PURPOSE</span>
            </div>
          </div>

          {/* Pillar 02 */}
          <div className="bg-[#0a0a0a] border border-white/10 hover:border-snake-green/40 transition-colors p-6 sm:p-8 rounded-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono text-snake-green tracking-widest font-semibold">
                02 / CHARACTER
              </span>
              <h3 className="text-lg sm:text-xl font-display font-medium text-white uppercase tracking-tight">
                FIVE CHAPTERS. ONE IDENTITY.
              </h3>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                SuperSnake Chapters brings together five distinct expressions of the brand: Black Panther, Royals, Serpent, Aura, and Signature. Each has its own character, visual language, and perspective.
              </p>
              <p className="text-xs font-mono text-snake-green font-semibold pt-1">
                Different moods. Different expressions. One SuperSnake.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              <span>DIVERSE PERSPECTIVES</span>
            </div>
          </div>

          {/* Pillar 03 */}
          <div className="bg-[#0a0a0a] border border-white/10 hover:border-snake-green/40 transition-colors p-6 sm:p-8 rounded-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono text-snake-green tracking-widest font-semibold">
                03 / THE EXPERIENCE
              </span>
              <h3 className="text-lg sm:text-xl font-display font-medium text-white uppercase tracking-tight">
                MADE TO BE YOURS
              </h3>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                We bring our designs to life through a curated online clothing experience, working with third-party production and fulfilment partners to print and deliver customer orders.
              </p>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                Our focus is on distinctive design, clear product information, and making it easy to find pieces that reflect your style.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              <span>CURATED DELIVERY</span>
            </div>
          </div>
        </div>

        {/* ============================================================
            03 — THE FIVE CHAPTERS (EDITORIAL UNIVERSE)
            ============================================================ */}
        <div className="space-y-8 sm:space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-mono tracking-[0.25em] text-snake-green uppercase font-semibold">
                THE UNIVERSE
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
                THE SUPERSNAKE CHAPTERS
              </h2>
            </div>
            <p className="text-xs font-mono text-neutral-400 max-w-md">
              Five distinct aesthetic philosophies. Find the expression that matches your instinct.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {CHAPTERS_SHOWCASE.map((ch, idx) => (
              <Link
                key={ch.name}
                href={ch.href}
                className="group relative bg-[#0a0a0a] border border-white/10 hover:border-snake-green/50 transition-all duration-300 rounded overflow-hidden flex flex-col p-5 hover:bg-[#101010]"
              >
                <div className="relative aspect-[16/10] w-full rounded overflow-hidden bg-neutral-900 mb-4">
                  <Image
                    src={ch.image}
                    alt={ch.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 text-[10px] font-mono font-bold tracking-widest text-snake-green uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {ch.badge}
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <h4 className="text-base sm:text-lg font-display font-medium uppercase tracking-tight text-white group-hover:text-snake-green transition-colors">
                    {ch.name}
                  </h4>
                  <p className="text-xs font-mono text-neutral-300 font-semibold">
                    {ch.tagline}
                  </p>
                  <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
                    {ch.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-snake-green group-hover:translate-x-1 transition-transform">
                  <span className="font-semibold tracking-wider">EXPLORE CHAPTER</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}

            {/* Final Exploration Card */}
            <Link
              href="/collections"
              className="group relative bg-gradient-to-br from-neutral-950 to-neutral-900 border border-snake-green/30 hover:border-snake-green transition-all duration-300 rounded overflow-hidden flex flex-col justify-between p-6 sm:p-8"
            >
              <div className="space-y-4">
                <SuperSnakeLogo size="sm" showText={false} withLink={false} />
                <span className="text-xs font-mono tracking-widest text-snake-green uppercase block font-semibold">
                  COMPLETE ARCHIVE
                </span>
                <h4 className="text-xl sm:text-2xl font-display font-medium uppercase tracking-tight text-white group-hover:text-snake-green transition-colors">
                  EXPLORE ALL FIVE CHAPTERS
                </h4>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  Compare palettes, fabric drapes, and graphic signatures side-by-side in our collection directory.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-snake-green group-hover:translate-x-1 transition-transform">
                <span className="font-semibold tracking-wider">BROWSE DIRECTORY</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>

        {/* ============================================================
            04 — GARMENT ARCHITECTURE & VERIFIED BENCHMARKS
            ============================================================ */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-10 rounded-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
            <h3 className="text-sm sm:text-base font-display font-medium text-white uppercase tracking-wider">
              GARMENT ARCHITECTURE &amp; STANDARDS
            </h3>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              PRODUCT-SPECIFIC BENCHMARKS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs font-mono sm:divide-x sm:divide-white/5">
            <div className="space-y-1.5">
              <span className="text-neutral-500 uppercase tracking-widest text-[10px]">FABRIC WEIGHT</span>
              <p className="text-white font-medium text-sm">200–290 GSM</p>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Heavyweight combed cotton &amp; French Terry calibrated per piece.
              </p>
            </div>
            <div className="sm:pl-6 space-y-1.5">
              <span className="text-neutral-500 uppercase tracking-widest text-[10px]">COLLAR INTEGRITY</span>
              <p className="text-white font-medium text-sm">1-Inch Reinforced Rib</p>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Dense ribbing engineered to prevent distortion and bacon-neck.
              </p>
            </div>
            <div className="sm:pl-6 space-y-1.5">
              <span className="text-neutral-500 uppercase tracking-widest text-[10px]">SILHOUETTE</span>
              <p className="text-white font-medium text-sm">Boxy &amp; Structured</p>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Dropped shoulders and tailored drapes built for clean presence.
              </p>
            </div>
            <div className="sm:pl-6 space-y-1.5">
              <span className="text-neutral-500 uppercase tracking-widest text-[10px]">PRODUCTION</span>
              <p className="text-white font-medium text-sm">Curated &amp; Direct</p>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                High-precision DTG &amp; screen printing with dedicated QA checks.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================
            05 — THE CREED & CLOSING CALL TO ACTION
            ============================================================ */}
        <div className="border-t border-white/10 pt-16 sm:pt-24 text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
              YOUR STYLE. YOUR INSTINCT.
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-medium text-white uppercase tracking-tight">
              YOU DON&apos;T HAVE TO FIT ONE AESTHETIC.
            </h2>
            <p className="text-xs sm:text-base font-mono text-neutral-400 max-w-xl mx-auto leading-relaxed pt-2">
              You don&apos;t have to follow one definition of style. Find your chapter. Make it your own.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/collections"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors group"
            >
              <span>EXPLORE THE CHAPTERS</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-widest transition-colors"
            >
              <span>BROWSE ALL PIECES</span>
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-3 text-xs font-mono text-neutral-500">
            <SuperSnakeLogo size="sm" showText={false} withLink={false} />
            <span className="tracking-widest uppercase">SUPERSNAKE // WEAR YOUR INSTINCT.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
