import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { ArrowRight, Sparkles, Truck, RotateCcw, ShieldCheck, Ruler } from 'lucide-react';
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

const CHAPTERS = [
  {
    name: 'THE BLACK PANTHER',
    badge: 'CHAPTER 01',
    tagline: 'The raw appeal of automobiles.',
    description: 'High-octane motorsport engineering, track-spec aerodynamics, and supercar velocity tailored for the street.',
    image: '/collection-black-panther-card.jpg',
    href: '/collections/the-black-panther',
  },
  {
    name: 'THE ROYALS',
    badge: 'CHAPTER 02',
    tagline: 'Understated luxury and refined simplicity.',
    description: 'Dynastic heritage, sovereign prestige, and subtle heraldic crests commanding respect through quiet restraint.',
    image: '/collection-the-royals-card.jpg',
    href: '/collections/the-royals',
  },
  {
    name: 'THE SERPENT',
    badge: 'CHAPTER 03',
    tagline: 'Art without restraint.',
    description: 'Hypnotic poise, raw instinct, and foundational serpent scale iconography that defines our visual core.',
    image: '/collection-the-serpent-card.jpg',
    href: '/collections/the-serpent',
  },
  {
    name: 'THE AURA',
    badge: 'CHAPTER 04',
    tagline: 'Minimalism with meaning.',
    description: 'Radical simplicity, organic earth tones, and clean silhouettes designed to be felt before they are seen.',
    image: '/collection-the-aura-card.jpg',
    href: '/collections/the-aura',
  },
  {
    name: 'THE SIGNATURE',
    badge: 'CHAPTER 05',
    tagline: 'The unmistakable SuperSnake identity.',
    description: 'The permanent cornerstone featuring the master brand symbol, engineered for presence in everyday wear.',
    image: '/hero-object-supersnake-tee.png',
    href: '/collections/the-signature',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-black text-white min-h-screen pt-28 sm:pt-36 pb-24 px-4 sm:px-6 md:px-12 font-sans selection:bg-snake-green selection:text-black">
      <div className="max-w-6xl mx-auto space-y-20 sm:space-y-28 md:space-y-32">
        
        {/* ============================================================
            01 — BRAND MANIFESTO
            ============================================================ */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
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
        </section>

        {/* ============================================================
            02 — CAMPAIGN VISUAL (THE SUPERSNAKE AESTHETIC)
            ============================================================ */}
        <section className="relative w-full overflow-hidden rounded border border-white/10 group">
          <div className="relative aspect-[16/10] w-full bg-neutral-950 overflow-hidden">
            <Image
              src="/about-campaign.jpg"
              alt="SuperSnake Lookbook Campaign — Ancient Architecture Meets Modern Streetwear"
              fill
              priority
              quality={100}
              unoptimized
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />
            {/* Dark luxury vignette overlay — clear center for maximum image sharpness */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 pointer-events-none" />
            
            {/* Cinematic editorial tags */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest text-snake-green uppercase bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10">
              <span>CAMPAIGN // 2026</span>
            </div>

            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-white pointer-events-none">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                  THE AESTHETIC
                </span>
                <p className="text-sm sm:text-lg font-display uppercase tracking-wider text-white">
                  HERITAGE ARCHITECTURE. CONTEMPORARY INSTINCT. BOLD PRESENCE.
                </p>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                BENGALURU // INDIA
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================
            03 — OUR PHILOSOPHY (DESIGN, CHARACTER, INDIVIDUALITY)
            ============================================================ */}
        <section className="space-y-8">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono tracking-[0.25em] text-snake-green uppercase font-semibold">
              03 // OUR PHILOSOPHY
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-medium uppercase tracking-tight text-white mt-1">
              DESIGN, CHARACTER &amp; INDIVIDUALITY
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pillar 01 */}
            <div className="bg-[#0a0a0a] border border-white/10 hover:border-snake-green/40 transition-colors p-6 sm:p-8 rounded-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-mono text-snake-green tracking-widest font-semibold">
                  01 / VISUAL IDENTITY
                </span>
                <h3 className="text-lg sm:text-xl font-display font-medium text-white uppercase tracking-tight">
                  EVERY DETAIL HAS A PURPOSE
                </h3>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  From clean silhouettes to expressive graphics, every design begins with a visual direction. We explore different aesthetics, compositions, and ideas to create pieces that reflect individuality rather than follow a single definition of style.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                PURPOSEFUL AESTHETICS
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
              <div className="pt-4 border-t border-white/5 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                DISTINCT PERSPECTIVES
              </div>
            </div>

            {/* Pillar 03 */}
            <div className="bg-[#0a0a0a] border border-white/10 hover:border-snake-green/40 transition-colors p-6 sm:p-8 rounded-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-mono text-snake-green tracking-widest font-semibold">
                  03 / FREEDOM
                </span>
                <h3 className="text-lg sm:text-xl font-display font-medium text-white uppercase tracking-tight">
                  NO SINGLE DEFINITION
                </h3>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  We reject the idea that clothing should force you into one rigid box. Whether you are drawn to high-velocity supercar art, heraldic crests, or radical unbranded minimalism—SuperSnake gives you the freedom to wear what resonates with your instinct.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                INDIVIDUAL EXPRESSION
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            04 — SUPERSNAKE CHAPTERS
            ============================================================ */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono tracking-[0.25em] text-snake-green uppercase font-semibold">
                04 // THE ARCHIVE
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-medium uppercase tracking-tight text-white mt-1">
                THE SUPERSNAKE CHAPTERS
              </h2>
            </div>
            <Link
              href="/collections"
              className="text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors flex items-center gap-1.5 uppercase"
            >
              <span>VIEW ALL COLLECTIONS</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {CHAPTERS.map((ch) => (
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

            {/* Complete Directory Link Card */}
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
                  Compare palettes, silhouettes, and aesthetic expressions side-by-side in our collection directory.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-snake-green group-hover:translate-x-1 transition-transform">
                <span className="font-semibold tracking-wider">BROWSE DIRECTORY</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </section>

        {/* ============================================================
            05 — PRODUCTION & EXPERIENCE (TRANSPARENT EXPECTATIONS)
            ============================================================ */}
        <section className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-10 rounded-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-mono text-snake-green tracking-widest uppercase font-semibold">
                05 // PRODUCTION &amp; EXPERIENCE
              </span>
              <h3 className="text-lg sm:text-xl font-display font-medium text-white uppercase tracking-tight mt-0.5">
                HOW ORDERS ARE MADE &amp; FULFILLED
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              TRANSPARENT EXPECTATIONS
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono text-neutral-400 leading-relaxed max-w-3xl">
            <p>
              We bring our designs to life through a curated direct-to-consumer experience. To ensure reliable quality and prompt dispatch, we work closely with specialized third-party production and fulfillment partners who print, quality-inspect, and package each garment on demand.
            </p>
            <p>
              Our focus is on distinctive design language, clear and honest product specifications, and setting accurate expectations every step of the way.
            </p>
          </div>

          {/* Policy & Trust Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
            <Link
              href="/shipping"
              className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 rounded text-xs font-mono transition-all group"
            >
              <div className="flex items-center gap-2 text-neutral-300 group-hover:text-white">
                <Truck size={14} className="text-snake-green shrink-0" />
                <span>SHIPPING &amp; DELIVERY</span>
              </div>
              <ArrowRight size={11} className="text-neutral-500 group-hover:text-snake-green transition-colors" />
            </Link>

            <Link
              href="/returns"
              className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 rounded text-xs font-mono transition-all group"
            >
              <div className="flex items-center gap-2 text-neutral-300 group-hover:text-white">
                <RotateCcw size={14} className="text-snake-green shrink-0" />
                <span>RETURNS &amp; DEFECTS</span>
              </div>
              <ArrowRight size={11} className="text-neutral-500 group-hover:text-snake-green transition-colors" />
            </Link>

            <Link
              href="/care-guide"
              className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 rounded text-xs font-mono transition-all group"
            >
              <div className="flex items-center gap-2 text-neutral-300 group-hover:text-white">
                <ShieldCheck size={14} className="text-snake-green shrink-0" />
                <span>CARE &amp; WASH GUIDE</span>
              </div>
              <ArrowRight size={11} className="text-neutral-500 group-hover:text-snake-green transition-colors" />
            </Link>

            <Link
              href="/size-guide"
              className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 rounded text-xs font-mono transition-all group"
            >
              <div className="flex items-center gap-2 text-neutral-300 group-hover:text-white">
                <Ruler size={14} className="text-snake-green shrink-0" />
                <span>SIZE &amp; FIT GUIDE</span>
              </div>
              <ArrowRight size={11} className="text-neutral-500 group-hover:text-snake-green transition-colors" />
            </Link>
          </div>
        </section>

        {/* ============================================================
            06 — POWERFUL CLOSING STATEMENT
            ============================================================ */}
        <section className="border-t border-white/10 pt-16 sm:pt-24 text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
              YOUR STYLE. YOUR INSTINCT.
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-medium text-white uppercase tracking-tight leading-tight">
              DIFFERENT EXPRESSIONS. ONE IDENTITY.
            </h2>
            <p className="text-sm sm:text-lg font-mono text-neutral-300 tracking-wider uppercase pt-2">
              WEAR YOUR INSTINCT.
            </p>
            <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-lg mx-auto leading-relaxed">
              You don&apos;t have to fit one aesthetic. You don&apos;t have to follow one definition of style. Find your chapter and make it your own.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors group shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(4,252,33,0.3)]"
            >
              <span>EXPLORE THE CHAPTERS</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-3 text-xs font-mono text-neutral-500">
            <SuperSnakeLogo size="sm" showText={false} withLink={false} />
            <span className="tracking-widest uppercase">SUPERSNAKE // WEAR YOUR INSTINCT.</span>
          </div>
        </section>

      </div>
    </div>
  );
}
