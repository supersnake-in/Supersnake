'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDown, Sparkles, Instagram } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';
import { formatPrice } from '@/lib/design-tokens';
import { useStore } from '@/lib/store';

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { products, homepageConfig, socialConfig } = useStore();
  const spotlightProduct = products.find((p) => p.isSpotlight) || products[0];
  const newDrops = products.filter((p) => p.isNew);
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);

  // Hero Background Images & 3-second auto-scroll
  const heroImages =
    homepageConfig?.heroImages && homepageConfig.heroImages.length > 0
      ? homepageConfig.heroImages
      : [
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2400&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=2400&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2400&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=2400&auto=format&fit=crop',
        ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const intervalTime = (homepageConfig?.heroIntervalSeconds || 3) * 1000;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [heroImages.length, homepageConfig?.heroIntervalSeconds]);

  // Parallax / Scroll transforms
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroImageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="bg-black text-white selection:bg-snake-green selection:text-black">
      {/* ============================================================
          01 — HERO SECTION
          ============================================================ */}
      <section
        ref={heroRef}
        className="relative bg-black min-h-[100dvh] lg:min-h-screen w-full overflow-hidden flex flex-col justify-end pt-28 sm:pt-32 lg:pt-36 pb-8 sm:pb-12 md:pb-16 px-4 sm:px-6 md:px-12"
      >
        {/* Background Image Carousel with 3-second auto-scroll & smooth crossfade */}
        <motion.div
          style={{ scale: heroImageScale }}
          className="absolute inset-0 z-0 bg-black will-change-transform overflow-hidden"
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-0"
            >
              <Image
                src={heroImages[currentImageIndex] || heroImages[0]}
                alt={`SuperSnake Heavyweight Campaign ${currentImageIndex + 1}`}
                fill
                priority
                unoptimized={
                  heroImages[currentImageIndex]?.startsWith('data:') ||
                  !heroImages[currentImageIndex]?.includes('unsplash.com')
                }
                className="object-cover object-[center_35%] lg:object-center"
              />
              {/* Subtle black gradient & vignette overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto w-full flex flex-col justify-end"
        >
          <div className="max-w-3xl space-y-3 sm:space-y-4 lg:space-y-5">
            {/* Monumental Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl 2xl:text-9xl font-display font-black tracking-tighter leading-[0.88] uppercase text-white"
            >
              WEAR
              <br />
              YOUR
              <br />
              <span className="text-white drop-shadow-[0_0_35px_rgba(4,252,33,0.35)]">
                INSTINCT.
              </span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs sm:text-base md:text-lg font-mono text-neutral-300 max-w-md leading-relaxed"
            >
              {homepageConfig?.heroSupportingCopy || 'Premium T-shirts. Designed for your everyday. Engineered for presence.'}
            </motion.p>

            {/* Magnetic CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 w-full sm:w-auto"
            >
              <Link
                href="/men"
                className="group relative px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black font-mono text-xs tracking-widest font-bold uppercase transition-all duration-300 hover:bg-snake-green hover:shadow-[0_0_25px_rgba(4,252,33,0.5)] flex items-center justify-center gap-2 active:scale-98"
              >
                <span>SHOP MEN</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/women"
                className="group relative px-6 sm:px-8 py-3.5 sm:py-4 bg-black/60 text-white backdrop-blur-md border border-white/20 font-mono text-xs tracking-widest uppercase transition-all duration-300 hover:border-snake-green hover:text-snake-green flex items-center justify-center gap-2 active:scale-98"
              >
                <span>SHOP WOMEN</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Carousel slide indicators and scroll arrow (hidden on mobile, visible on sm and up) */}
        <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-6 md:right-12 z-20 hidden sm:flex items-center gap-4">
          {heroImages.length > 1 && (
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentImageIndex
                      ? 'w-6 bg-snake-green shadow-[0_0_8px_rgba(4,252,33,0.8)]'
                      : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
              <span className="text-[10px] font-mono text-neutral-400 ml-1 pl-1.5 border-l border-white/20">
                0{currentImageIndex + 1} / 0{heroImages.length}
              </span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] tracking-widest text-neutral-400 uppercase bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span>SCROLL</span>
            <ArrowDown size={12} className="animate-bounce text-snake-green" />
          </div>
        </div>
      </section>

      {/* ============================================================
          02 — NEW DROPS (4–6 CLEAN PRODUCT CARDS)
          ============================================================ */}
      <section className="py-20 md:py-36 px-4 sm:px-6 md:px-12 border-t border-white/[0.06] bg-[#080808]">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
                FRESH ATELIER RUNS
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
                NEW DROPS
              </h2>
            </div>
            <Link
              href="/new-drops"
              className="text-xs font-mono tracking-widest text-neutral-400 hover:text-white uppercase flex items-center gap-1.5"
            >
              VIEW ALL NEW DROPS <ArrowRight size={13} />
            </Link>
          </div>

          {newDrops.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-neutral-500">
              No new drops currently available. Check back soon for the next atelier run.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
              {newDrops.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 2} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          03 — THE TEE (MONUMENTAL EDITORIAL SECTION)
          ============================================================ */}
      <section className="py-20 md:py-40 px-4 sm:px-6 md:px-12 border-t border-white/[0.06] relative overflow-hidden bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-12 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-mega text-snake-green uppercase">
                THE HERO OBJECT
              </span>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold uppercase tracking-tight text-white">
                THE SUPERSNAKE TEE
              </h2>
            </div>
            <p className="text-xs sm:text-sm md:text-base font-mono text-neutral-400 max-w-md italic">
              &ldquo;Designed around the everyday. Built around you.&rdquo;
            </p>
          </div>

          {/* Monumental Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Macro Specs */}
            <div className="lg:col-span-4 space-y-8 lg:space-y-10 order-2 lg:order-1">
              <div className="space-y-2 border-l-2 border-snake-green pl-4">
                <span className="text-xs font-mono text-neutral-400">01 / WEIGHT & STABILITY</span>
                <h4 className="text-base sm:text-lg font-mono font-semibold text-white uppercase">280 GSM SUPIMA® COTTON</h4>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  Long-staple fibers combed to perfection. Substantial architectural drape that holds its form all day without feeling stiff.
                </p>
              </div>

              <div className="space-y-2 border-l-2 border-neutral-700 pl-4 hover:border-snake-green transition-colors">
                <span className="text-xs font-mono text-neutral-400">02 / STRUCTURAL INTEGRITY</span>
                <h4 className="text-base sm:text-lg font-mono font-semibold text-white uppercase">ZERO-SAG 1-INCH COLLAR</h4>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  Twin-needle reinforced collar band with internal cotton herringbone tape. Retains razor-sharp neck tension through 100+ washes.
                </p>
              </div>

              <div className="space-y-2 border-l-2 border-neutral-700 pl-4 hover:border-snake-green transition-colors">
                <span className="text-xs font-mono text-neutral-400">03 / ATELIER FINISH</span>
                <h4 className="text-base sm:text-lg font-mono font-semibold text-white uppercase">BLIND-STITCHED HEMS</h4>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  Seamless Japanese blind-hem technique for an uninterrupted silhouette. No curling, no puckering, zero exterior stitch noise.
                </p>
              </div>

              <div className="pt-2 sm:pt-4">
                <Link
                  href="/product/the-signature-tee"
                  className="inline-flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-3.5 bg-neutral-900 border border-white/20 text-white hover:border-snake-green hover:text-snake-green font-mono text-xs tracking-widest uppercase transition-all active:scale-98"
                >
                  DISCOVER THE SIGNATURE TEE <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right: Massive Hero Product Photography */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <div className="relative aspect-[4/5] sm:aspect-[16/11] w-full rounded overflow-hidden bg-neutral-950 border border-white/10 group">
                <Image
                  src={
                    homepageConfig?.supersnakeTeeImage ||
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1800&auto=format&fit=crop"
                  }
                  alt="The SuperSnake Tee - Sculpture"
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  unoptimized={
                    homepageConfig?.supersnakeTeeImage?.startsWith('data:') ||
                    (homepageConfig?.supersnakeTeeImage ? !homepageConfig.supersnakeTeeImage.includes('unsplash.com') : false)
                  }
                  className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-3 sm:p-4 bg-black/70 backdrop-blur-md border border-white/10 flex justify-between items-center text-xs font-mono">
                  <span className="text-neutral-300 tracking-wider">ARCHITECTURAL BOXY FIT</span>
                  <span className="text-snake-green font-bold">₹1,499</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          04 — MEN / WOMEN (EDITORIAL SPLIT SCREEN)
          ============================================================ */}
      <section className="relative w-full border-t border-white/[0.06] bg-black">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px] md:min-h-[800px]">
          {/* Men Editorial */}
          <Link
            href="/men"
            className="group relative overflow-hidden flex flex-col justify-end p-6 sm:p-8 md:p-16 border-b md:border-b-0 md:border-r border-white/10 min-h-[380px] sm:min-h-[450px] md:min-h-auto"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <Image
                src={homepageConfig?.menCollectionImage || "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1600&auto=format&fit=crop"}
                alt="SuperSnake Men Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={
                  homepageConfig?.menCollectionImage?.startsWith('data:') ||
                  (homepageConfig?.menCollectionImage ? !homepageConfig.menCollectionImage.includes('unsplash.com') : false)
                }
                className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </div>

            <div className="relative z-10 space-y-3 sm:space-y-4">
              <h3 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold uppercase tracking-tight text-white group-hover:text-snake-green transition-colors">
                MEN
              </h3>
              <p className="text-xs md:text-sm font-mono text-neutral-300 max-w-sm">
                Monolithic proportions, dropped shoulders, and uncompromising heavyweight fabrics.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-white uppercase group-hover:translate-x-2 transition-transform">
                  EXPLORE MEN <ArrowRight size={14} className="text-snake-green" />
                </span>
              </div>
            </div>
          </Link>

          {/* Women Editorial */}
          <Link
            href="/women"
            className="group relative overflow-hidden flex flex-col justify-end p-6 sm:p-8 md:p-16 min-h-[380px] sm:min-h-[450px] md:min-h-auto"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <Image
                src={homepageConfig?.womenCollectionImage || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop"}
                alt="SuperSnake Women Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={
                  homepageConfig?.womenCollectionImage?.startsWith('data:') ||
                  (homepageConfig?.womenCollectionImage ? !homepageConfig.womenCollectionImage.includes('unsplash.com') : false)
                }
                className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </div>

            <div className="relative z-10 space-y-3 sm:space-y-4">
              <h3 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold uppercase tracking-tight text-white group-hover:text-snake-green transition-colors">
                WOMEN
              </h3>
              <p className="text-xs md:text-sm font-mono text-neutral-300 max-w-sm">
                Engineered boxy crop hems, fluid Supima-silk blends, and architectural geometry.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-white uppercase group-hover:translate-x-2 transition-transform">
                  EXPLORE WOMEN <ArrowRight size={14} className="text-snake-green" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ============================================================
          05 — PRODUCT SPOTLIGHT (IMMERSIVE FULL-SCREEN PRESENTATION)
          ============================================================ */}
      {spotlightProduct && (
        <section className="relative min-h-[580px] sm:min-h-[750px] md:min-h-[900px] w-full border-t border-white/[0.06] overflow-hidden flex items-center px-4 sm:px-6 md:px-16 py-16 md:py-20 bg-black">
          <div className="absolute inset-0 z-0">
            <Image
              src={homepageConfig?.signatureTeeImage || spotlightProduct.images?.[0]?.url || ''}
              alt={spotlightProduct.name}
              fill
              sizes="100vw"
              unoptimized={
                homepageConfig?.signatureTeeImage?.startsWith('data:') ||
                (homepageConfig?.signatureTeeImage ? !homepageConfig.signatureTeeImage.includes('unsplash.com') : false)
              }
              className="object-cover object-[center_30%] md:object-center brightness-50 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-mega text-snake-green uppercase">
                SPOTLIGHT CAMPAIGN
              </span>
              <h2 className="text-3xl sm:text-5xl md:text-8xl font-display font-black tracking-tighter uppercase leading-[0.9] text-white">
                {spotlightProduct.name}
              </h2>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xl sm:text-2xl md:text-3xl text-white font-semibold">
                {formatPrice(spotlightProduct.price)}
              </span>
              <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-md leading-relaxed">
                {spotlightProduct.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2 sm:pt-4">
              <Link
                href={`/product/${spotlightProduct.slug}`}
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_rgba(4,252,33,0.5)] flex items-center justify-center gap-2 active:scale-98"
              >
                <span>SHOP NOW</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          06 — ALL CREATIONS (CONTINUOUS DISPLAY OF ALL PRODUCTS)
          ============================================================ */}
      <section className="py-20 md:py-36 border-t border-white/[0.06] bg-[#050505] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-8 sm:space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
                COMPLETE ATELIER ARCHIVE
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
                ALL CREATIONS
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-mono tracking-widest text-neutral-400 hover:text-white uppercase flex items-center gap-1.5"
            >
              VIEW FULL SHOP <ArrowRight size={13} />
            </Link>
          </div>

          {/* Continuous Auto-Scrolling Marquee Track */}
          {products.length > 0 && (
            <div className="relative w-full overflow-hidden py-4 -mx-4 sm:-mx-6 md:-mx-12 px-4 sm:px-6 md:px-12">
              <div className="flex gap-4 sm:gap-6 w-max animate-marquee hover:[animation-play-state:paused]">
                {[...products, ...products].map((product, idx) => (
                  <div key={`marquee-${product.id}-${idx}`} className="w-[220px] sm:w-[280px] shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Responsive Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8 pt-4">
            {products.map((product) => (
              <ProductCard key={`grid-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          07 — BESTSELLERS (THE ONES THEY KEEP COMING BACK FOR)
          ============================================================ */}
      <section className="py-20 md:py-36 px-4 sm:px-6 md:px-12 border-t border-white/[0.06] bg-black">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
                PERPETUAL DEMAND
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
                THE ONES THEY KEEP COMING BACK FOR.
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-mono tracking-widest text-neutral-400 hover:text-white uppercase flex items-center gap-1.5"
            >
              SHOP ALL BESTSELLERS <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          08 — BRAND STATEMENT (BLACK SCREEN, MONUMENTAL STATEMENT)
          ============================================================ */}
      <section className="py-24 sm:py-36 md:py-52 px-4 sm:px-6 md:px-12 border-t border-white/[0.06] bg-black flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Subtle Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <SuperSnakeLogo size="hero" showText={false} withLink={false} />
        </div>

        <div className="relative z-10 max-w-4xl space-y-6 sm:space-y-8">
          <span className="text-[10px] font-mono tracking-mega text-snake-green uppercase">
            SUPERSNAKE MANIFESTO
          </span>

          <h2 className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter uppercase leading-[0.88] text-white">
            NOT MADE
            <br />
            TO BLEND IN.
          </h2>

          <div className="pt-2 sm:pt-4 flex justify-center">
            <SuperSnakeLogo size="md" showText={false} withGlow={true} />
          </div>
        </div>
      </section>

      {/* ============================================================
          09 — SOCIAL EDITORIAL GRID (#SUPERSNAKE)
          ============================================================ */}
      <section className="py-24 px-6 md:px-12 border-t border-white/[0.06] bg-[#050505]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex justify-between items-end gap-3 sm:gap-4">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block">
                COMMUNITY & EDITORIAL
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-wider text-white">
                #SUPERSNAKE
              </h3>
            </div>
            <a
              href={socialConfig?.instagram || "https://instagram.com/supersnake.in"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono tracking-widest text-neutral-400 hover:text-snake-green transition-colors uppercase flex items-center gap-1.5 shrink-0 pb-0.5"
            >
              <Instagram size={15} className="text-snake-green shrink-0" />
              <span className="hidden sm:inline">FOLLOW ON INSTAGRAM</span>
              <span className="sm:hidden text-[10px] tracking-wider">FOLLOW</span>
              <ArrowRight size={12} className="shrink-0" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(socialConfig?.communityImages && socialConfig.communityImages.length > 0
              ? socialConfig.communityImages
              : [
                  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=600&auto=format&fit=crop',
                ]
            ).map((imgUrl, idx) => (
              <div key={`community-img-${idx}`} className="relative aspect-square bg-neutral-900 rounded overflow-hidden group">
                <Image
                  src={imgUrl}
                  alt={`#SUPERSNAKE 0${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized={
                    imgUrl.startsWith('data:') ||
                    !imgUrl.includes('unsplash.com')
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-90"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          10 — QUALITY & CRAFTSMANSHIP (MACRO PHOTOGRAPHY)
          ============================================================ */}
      <section className="py-20 md:py-36 px-4 sm:px-6 md:px-12 border-t border-white/[0.06] bg-[#050505]">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-16">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
              HONEST MATERIALS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
              THE THREE PILLARS
            </h2>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-5 sm:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-4 sm:-mx-6 md:mx-0 px-4 sm:px-6 md:px-0 no-scrollbar snap-x snap-mandatory">
            {/* Pillar 1 */}
            <div className="w-[82vw] sm:w-[340px] md:w-auto shrink-0 md:shrink space-y-3 sm:space-y-4 group snap-center">
              <div className="relative aspect-[4/5] rounded overflow-hidden bg-neutral-900 border border-white/10">
                <Image
                  src={
                    homepageConfig?.pillar1Image ||
                    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop"
                  }
                  alt="Premium Fabric Weave"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized={
                    homepageConfig?.pillar1Image?.startsWith('data:') ||
                    (homepageConfig?.pillar1Image ? !homepageConfig.pillar1Image.includes('unsplash.com') : false)
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 text-xs font-mono text-white/70">01 / PILLAR</div>
              </div>
              <h3 className="text-base sm:text-lg font-mono font-bold tracking-wider text-white uppercase group-hover:text-snake-green transition-colors">
                PREMIUM FABRIC
              </h3>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                280–300 GSM Supima® and French Terry. Spun from long-staple fibers that provide natural resilience, softness, and substantial drape without chemical softeners.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="w-[82vw] sm:w-[340px] md:w-auto shrink-0 md:shrink space-y-3 sm:space-y-4 group snap-center">
              <div className="relative aspect-[4/5] rounded overflow-hidden bg-neutral-900 border border-white/10">
                <Image
                  src={
                    homepageConfig?.pillar2Image ||
                    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop"
                  }
                  alt="Collar and Stitching"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized={
                    homepageConfig?.pillar2Image?.startsWith('data:') ||
                    (homepageConfig?.pillar2Image ? !homepageConfig.pillar2Image.includes('unsplash.com') : false)
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 text-xs font-mono text-white/70">02 / PILLAR</div>
              </div>
              <h3 className="text-base sm:text-lg font-mono font-bold tracking-wider text-white uppercase group-hover:text-snake-green transition-colors">
                BUILT FOR COMFORT
              </h3>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                Anatomical drop-shoulder patterning that contours naturally across the clavicle and chest. Free from itch labels, using soft silicone micro-prints.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="w-[82vw] sm:w-[340px] md:w-auto shrink-0 md:shrink space-y-3 sm:space-y-4 group snap-center">
              <div className="relative aspect-[4/5] rounded overflow-hidden bg-neutral-900 border border-white/10">
                <Image
                  src={
                    homepageConfig?.pillar3Image ||
                    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
                  }
                  alt="Drape and Geometry"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized={
                    homepageConfig?.pillar3Image?.startsWith('data:') ||
                    (homepageConfig?.pillar3Image ? !homepageConfig.pillar3Image.includes('unsplash.com') : false)
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 text-xs font-mono text-white/70">03 / PILLAR</div>
              </div>
              <h3 className="text-base sm:text-lg font-mono font-bold tracking-wider text-white uppercase group-hover:text-snake-green transition-colors">
                DESIGNED TO LAST
              </h3>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                Pre-shrunk geometry ensures that the length, chest width, and collar tension remain identical after repeated wash cycles. A garment for years, not seasons.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
