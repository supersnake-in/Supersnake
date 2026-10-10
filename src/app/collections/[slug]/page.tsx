'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  Layers,
  Info,
  Package,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/product/ProductCard';
import { PreBookingModal } from '@/components/pre-booking/PreBookingModal';
import { Product, Collection } from '@/lib/types';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';
import { COLLECTIONS_DATA } from '@/lib/data/collections';

export default function DedicatedCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';

  const { collections, products, storefrontConfig } = useStore();
  const [selectedProductForPreBooking, setSelectedProductForPreBooking] = useState<Product | null>(null);
  const [isPreBookingModalOpen, setIsPreBookingModalOpen] = useState(false);

  const isPreLaunch = storefrontConfig?.storefrontMode === 'PRE_LAUNCH';

  // Find authoritative collection from store or fallback to COLLECTIONS_DATA
  const collection: Collection | undefined = useMemo(() => {
    const fromStore = collections.find((c) => c.slug === slug || c.id === slug);
    if (fromStore) return fromStore;
    return COLLECTIONS_DATA.find((c) => c.slug === slug || c.id === slug);
  }, [collections, slug]);

  // Products belonging to this series
  const seriesProducts = useMemo(() => {
    if (!collection) return [];
    return products.filter(
      (p) =>
        p.collectionSlug === collection.slug ||
        p.collectionId === collection.id ||
        (collection.slug === 'the-signature' && p.isSignature) ||
        (collection.slug === 'the-serpent' && (p.slug === 'the-serpent-tee' || p.slug === 'the-venom-edition')) ||
        (collection.slug === 'the-nocturne' && (p.slug === 'the-monolith-oversized' || p.slug === 'the-shadow-raw-hem')) ||
        (collection.slug === 'the-aura' && (p.slug === 'the-chalk-minimalist' || p.slug === 'the-kinetic-silk-cotton')) ||
        (collection.slug === 'the-royals' && p.slug === 'the-meridian-cropped')
    );
  }, [products, collection]);

  // Sibling collections for navigation
  const otherCollections = useMemo(() => {
    return collections
      .filter((c) => c.isActive && c.slug !== slug)
      .slice(0, 4);
  }, [collections, slug]);

  const handleOpenPreBooking = (product: Product) => {
    setSelectedProductForPreBooking(product);
    setIsPreBookingModalOpen(true);
  };

  if (!collection) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <SuperSnakeLogo size="md" showText={false} withLink={false} />
          <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            CHAPTER NOT LOCATED
          </span>
          <h1 className="text-2xl font-display font-medium text-white uppercase">
            SERIES UNAVAILABLE
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            The collection series you are searching for is not currently active in the atelier.
          </p>
          <div className="pt-4">
            <Link
              href="/collections"
              className="px-6 py-3 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-bold transition-colors inline-block"
            >
              BROWSE ALL COLLECTIONS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const accent = collection.accentColor || '#04fc21';

  return (
    <div className="min-h-screen bg-black text-white selection:bg-snake-green selection:text-black">
      {/* ============================================================
          01 — CINEMATIC COLLECTION HERO
          ============================================================ */}
      <section className="relative min-h-[70vh] sm:min-h-[75vh] w-full flex flex-col justify-end pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 md:px-12 overflow-hidden border-b border-white/10">
        {/* Backdrop Image with Parallax & Heavy Vignette */}
        <div className="absolute inset-0 z-0 bg-black">
          <Image
            src={collection.heroImage || '/hero2.png'}
            alt={`${collection.name} Banner`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto w-full space-y-6">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
            <Link href="/" className="hover:text-white transition-colors">
              HOME
            </Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-white transition-colors">
              COLLECTIONS
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">{collection.name}</span>
          </div>

          {/* Series Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-200">
              {collection.badge || 'ATELIER SERIES'}
            </span>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-medium uppercase tracking-tight text-white leading-tight">
              {collection.name}
            </h1>
            <p className="text-sm sm:text-base font-mono text-neutral-300 max-w-2xl">
              {collection.tagline}
            </p>
          </div>

          {/* Story Narrative Paragraph */}
          <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-3xl leading-relaxed">
            {collection.description}
          </p>

          {/* Mood Palette Swatches Bar */}
          {collection.moodPalette && collection.moodPalette.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                SERIES PALETTE:
              </span>
              <div className="flex items-center gap-2">
                {collection.moodPalette.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/10 rounded-full text-[10px] font-mono text-neutral-300"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20"
                      style={{ backgroundColor: item.hex }}
                    />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications Dossier Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 max-w-3xl">
            {collection.fabricSpecs && (
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-sm space-y-1">
                <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase block">
                  FABRIC & STRUCTURE
                </span>
                <span className="text-xs font-mono text-white block">
                  {collection.fabricSpecs}
                </span>
              </div>
            )}
            {collection.artworkMood && (
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-sm space-y-1">
                <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase block">
                  ARTWORK & EMBROIDERY
                </span>
                <span className="text-xs font-mono text-white block">
                  {collection.artworkMood}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          02 — GARMENTS IN THIS SERIES
          ============================================================ */}
      <section className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6 md:px-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-snake-green block mb-1">
              THE GARMENT ROSTER
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-medium uppercase text-white tracking-tight">
              AVAILABLE IN {collection.name}
            </h2>
          </div>

          <span className="text-xs font-mono text-neutral-400">
            {seriesProducts.length} {seriesProducts.length === 1 ? 'PIECE ALLOCATED' : 'PIECES ALLOCATED'}
          </span>
        </div>

        {seriesProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {seriesProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isPreLaunch={isPreLaunch}
                onPreBook={handleOpenPreBooking}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 bg-[#090909] border border-white/10 text-center space-y-4 max-w-xl mx-auto rounded-sm">
            <Package size={32} className="mx-auto text-neutral-600" />
            <h3 className="text-base font-display font-medium text-white uppercase">
              NEXT DROP IN PRODUCTION
            </h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Garments for {collection.name} are currently undergoing precision weaving and sampling in the atelier.
              Explore our core signature pieces or pre-book early drops below.
            </p>
            <div className="pt-2">
              <Link
                href="/#pre-book-grid"
                className="px-6 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-bold transition-colors inline-block"
              >
                VIEW THE FIRST DROP
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================
          03 — EXPLORE OTHER CHAPTERS
          ============================================================ */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 md:px-12 border-t border-white/10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-1">
              DISCOVER MORE
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-medium uppercase text-white tracking-tight">
              EXPLORE OTHER CHAPTERS
            </h3>
          </div>

          <Link
            href="/collections"
            className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 tracking-widest uppercase transition-colors"
          >
            <span>ALL SERIES</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {otherCollections.map((other) => (
            <Link
              key={other.id}
              href={`/collections/${other.slug}`}
              className="group relative flex flex-col bg-[#080808] border border-white/10 rounded-sm overflow-hidden hover:border-white/30 transition-all duration-300"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                <Image
                  src={other.cardImage || other.heroImage || '/hero2.png'}
                  alt={other.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase block truncate">
                  {other.badge}
                </span>
                <h4 className="text-sm font-display font-medium text-white uppercase group-hover:text-snake-green transition-colors">
                  {other.name}
                </h4>
                <p className="text-[10px] font-mono text-neutral-400 line-clamp-1">
                  {other.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pre-Booking Modal for instant customer reservation */}
      {selectedProductForPreBooking && (
        <PreBookingModal
          isOpen={isPreBookingModalOpen}
          onClose={() => {
            setIsPreBookingModalOpen(false);
            setSelectedProductForPreBooking(null);
          }}
          product={selectedProductForPreBooking}
          selectedColor={selectedProductForPreBooking.colors[0] || { name: 'Obsidian Black', hex: '#0a0a0a' }}
          selectedSize={selectedProductForPreBooking.sizes[2] || selectedProductForPreBooking.sizes[0] || 'L'}
          quantity={1}
        />
      )}
    </div>
  );
}
