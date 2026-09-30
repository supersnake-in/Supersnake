'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Calendar,
  Lock,
  Package,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/product/ProductCard';
import { PreBookingModal } from '@/components/pre-booking/PreBookingModal';
import { Product } from '@/lib/types';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

export default function PreLaunchPage() {
  const { products, storefrontConfig } = useStore();

  const [selectedProductForPreBooking, setSelectedProductForPreBooking] = useState<Product | null>(null);
  const [isPreBookingModalOpen, setIsPreBookingModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  const launchDateStr = storefrontConfig?.launchDate || '2026-10-14';
  const launchTimeStr = storefrontConfig?.launchTime || '10:00';
  const launchTimezoneStr = storefrontConfig?.launchTimezone || 'IST';

  // Format display string e.g. "14 OCTOBER 2026 // 10:00 AM IST"
  const formattedLaunchDate = useMemo(() => {
    try {
      const d = new Date(`${launchDateStr}T${launchTimeStr || '00:00'}:00+05:30`);
      if (!isNaN(d.getTime())) {
        const datePart = d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).toUpperCase();
        return `${datePart} • ${launchTimeStr} ${launchTimezoneStr}`;
      }
    } catch (e) {}
    return `14 OCTOBER 2026 • 10:00 AM IST`;
  }, [launchDateStr, launchTimeStr, launchTimezoneStr]);

  // Live countdown ticker
  useEffect(() => {
    const calculateCountdown = () => {
      try {
        const targetMs = new Date(`${launchDateStr}T${launchTimeStr || '00:00'}:00+05:30`).getTime();
        const diff = targetMs - Date.now();

        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      } catch (e) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [launchDateStr, launchTimeStr]);

  // Products eligible for pre-launch
  const preLaunchProducts = useMemo(() => {
    return products.filter((p) => Boolean(p.preLaunchEnabled));
  }, [products]);

  const handlePreBookClick = (product: Product) => {
    setSelectedProductForPreBooking(product);
    setIsPreBookingModalOpen(true);
  };

  return (
    <div className="bg-black text-white selection:bg-snake-green selection:text-black min-h-screen">
      {/* ============================================================
          01 — PRE-LAUNCH HERO SECTION
          ============================================================ */}
      <section className="relative min-h-[92vh] sm:min-h-screen w-full overflow-hidden flex flex-col justify-end pt-32 pb-16 px-4 sm:px-6 md:px-12">
        {/* Background Visual Layer */}
        <div className="absolute inset-0 z-0 bg-black overflow-hidden pointer-events-none">
          <Image
            src="/hero2.png"
            alt="SuperSnake First Drop Pre-Launch Campaign"
            fill
            priority
            className="object-cover object-[center_35%] lg:object-center brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
        </div>

        {/* Ambient rim light */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-snake-green/[0.04] blur-[150px] pointer-events-none" />

        {/* Hero Content Stage */}
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center space-y-8">
          {/* Monumental Headline */}
          <div className="space-y-3">
            <span className="text-xs sm:text-sm font-mono tracking-[0.4em] text-snake-green uppercase block">
              SUPERSNAKE ATELIER
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-medium uppercase tracking-tight text-white leading-[1.02]">
              THE FIRST DROP<br />IS ALMOST HERE.
            </h1>
            <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-xl mx-auto leading-relaxed pt-2">
              Architecturally sculpted silhouettes engineered with uncompromising precision and commanding presence. Secure your private allocation before the public release.
            </p>
          </div>

          {/* Official Launch Date Banner */}
          <div className="py-2">
            <div className="inline-block p-4 sm:px-8 bg-black/70 backdrop-blur-md border border-white/10 rounded-sm">
              <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase block mb-1">
                OFFICIAL LAUNCH DATE
              </span>
              <span className="text-sm sm:text-lg font-display font-bold tracking-wider text-white uppercase font-mono">
                {formattedLaunchDate}
              </span>
            </div>
          </div>

          {/* Live Countdown Ticker */}
          <div className="pt-2">
            <div className="text-[10px] font-mono text-neutral-500 tracking-[0.25em] uppercase mb-3">
              THE DROP GOES LIVE IN
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
              <div className="p-3 sm:p-4 bg-black/80 backdrop-blur-md border border-white/10 rounded text-center">
                <span className="block text-2xl sm:text-4xl font-display font-bold text-white font-mono">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  DAYS
                </span>
              </div>
              <div className="p-3 sm:p-4 bg-black/80 backdrop-blur-md border border-white/10 rounded text-center">
                <span className="block text-2xl sm:text-4xl font-display font-bold text-white font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  HOURS
                </span>
              </div>
              <div className="p-3 sm:p-4 bg-black/80 backdrop-blur-md border border-white/10 rounded text-center">
                <span className="block text-2xl sm:text-4xl font-display font-bold text-white font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  MINUTES
                </span>
              </div>
              <div className="p-3 sm:p-4 bg-black/80 backdrop-blur-md border border-white/10 rounded text-center">
                <span className="block text-2xl sm:text-4xl font-display font-bold text-snake-green font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  SECONDS
                </span>
              </div>
            </div>
          </div>

          {/* Quick Jump CTA */}
          <div className="pt-4">
            <a
              href="#pre-book-grid"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-snake-green hover:bg-white text-black font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 shadow-[0_0_25px_rgba(4,252,33,0.35)]"
            >
              <span>PRE-BOOK THE FIRST DROP</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          02 — PRE-LAUNCH PRODUCT SHOWCASE SECTION
          ============================================================ */}
      <section id="pre-book-grid" className="py-20 sm:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto scroll-mt-24">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
            <Sparkles size={12} className="text-snake-green" />
            <span>LIMITED ALLOCATION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-medium uppercase tracking-tight text-white">
            PRE-BOOK THE FIRST DROP
          </h2>
          <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-xl mx-auto leading-relaxed">
            A limited selection from the first SuperSnake drop is now available for pre-booking. Guaranteed allocation. Dispatched upon official release.
          </p>
        </div>

        {/* Products Grid */}
        {preLaunchProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {preLaunchProducts.map((prod, idx) => (
              <div key={prod.id} className="relative flex flex-col justify-between">
                <ProductCard
                  product={prod}
                  priority={idx < 4}
                  isPreLaunch={true}
                  onPreBook={() => handlePreBookClick(prod)}
                />
                <button
                  type="button"
                  onClick={() => handlePreBookClick(prod)}
                  className="mt-3 w-full py-2.5 px-3 bg-black hover:bg-snake-green text-white hover:text-black border border-white/20 hover:border-snake-green font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                >
                  <span>PRE-BOOK NOW</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Pre-Launch State (Section 37) */
          <div className="p-12 sm:p-16 border border-white/10 rounded-sm bg-[#0a0a0a] text-center max-w-xl mx-auto space-y-4">
            <Package size={32} className="text-snake-green mx-auto" />
            <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-white tracking-tight">
              THE FIRST DROP IS COMING.
            </h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Pre-booking allocations are currently being curated by the atelier. The portal will open momentarily for reservations.
            </p>
            <div className="pt-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                LAUNCH DATE: {formattedLaunchDate}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================
          03 — THE SUPERSNAKE ATELIER MANIFESTO
          ============================================================ */}
      <section className="py-20 sm:py-28 border-t border-white/[0.08] bg-[#030303] relative overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-snake-green/[0.03] blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          {/* Section Header with Brand Logo */}
          <div className="flex flex-col items-center text-center mb-14 sm:mb-20 space-y-4">
            <div className="mb-2">
              <SuperSnakeLogo size="md" showText={false} withLink={false} withGlow={true} />
            </div>
            <span className="text-[10px] sm:text-xs font-mono tracking-[0.35em] text-snake-green uppercase block">
              THE SUPERSNAKE STANDARD
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-medium uppercase tracking-tight text-white max-w-2xl">
              AN ELITE LUXURY HOUSE DEFINED BY DISCIPLINE
            </h2>
            <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Operating beyond temporary fashion cycles. SuperSnake embodies architectural presence, strictly finite allocations, and white-glove patron care.
            </p>
            <div className="w-12 h-px bg-white/20 pt-1" />
          </div>

          {/* 3 Brand Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pillar 01 */}
            <div className="relative group p-8 border border-white/10 bg-neutral-950/60 backdrop-blur-sm rounded-sm hover:border-snake-green/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-snake-green uppercase">
                    01 // ARCHITECTURAL PURITY
                  </span>
                  <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                    <SuperSnakeLogo size="sm" showText={false} withLink={false} />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold uppercase text-white mb-3 tracking-wide">
                  MONOLITHIC ESSENCE
                </h3>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  Conceived through sculptural geometry, deliberate proportion, and relentless aesthetic restraint. Every silhouette is built to command presence without ever asking for attention.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                <span>PERMANENT SILHOUETTE</span>
                <span className="text-snake-green">01</span>
              </div>
            </div>

            {/* Pillar 02 */}
            <div className="relative group p-8 border border-white/10 bg-neutral-950/60 backdrop-blur-sm rounded-sm hover:border-snake-green/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-snake-green uppercase">
                    02 // SERIALIZED EXCLUSIVITY
                  </span>
                  <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                    <SuperSnakeLogo size="sm" showText={false} withLink={false} />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold uppercase text-white mb-3 tracking-wide">
                  STRICT ATELIER ARCHIVE
                </h3>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  We reject mass commercial overproduction. Every drop is capped to strictly finite allocations. Once an edition concludes, the design archive is sealed to preserve permanent rarity.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                <span>LIMITED RUNS ONLY</span>
                <span className="text-snake-green">02</span>
              </div>
            </div>

            {/* Pillar 03 */}
            <div className="relative group p-8 border border-white/10 bg-neutral-950/60 backdrop-blur-sm rounded-sm hover:border-snake-green/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-snake-green uppercase">
                    03 // PATRON PRIVILEGE
                  </span>
                  <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                    <SuperSnakeLogo size="sm" showText={false} withLink={false} />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold uppercase text-white mb-3 tracking-wide">
                  WHITE-GLOVE CONCIERGE
                </h3>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  Securing a pre-booking reserves your private standing in our circle. Patrons receive serialized delivery tracking, personal client support, and priority access to all forthcoming drops.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                <span>CONCIERGE ALLOCATION</span>
                <span className="text-snake-green">03</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Pre-Booking Modal */}
      {selectedProductForPreBooking && (
        <PreBookingModal
          product={selectedProductForPreBooking}
          selectedColor={selectedProductForPreBooking.colors[0] || { name: 'Obsidian Black', hex: '#0a0a0a' }}
          selectedSize={selectedProductForPreBooking.sizes[2] || selectedProductForPreBooking.sizes[0] || 'L'}
          quantity={1}
          isOpen={isPreBookingModalOpen}
          onClose={() => {
            setIsPreBookingModalOpen(false);
            setSelectedProductForPreBooking(null);
          }}
        />
      )}
    </div>
  );
}
