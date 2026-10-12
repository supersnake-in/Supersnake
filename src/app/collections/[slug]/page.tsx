'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpDown, Package } from 'lucide-react';
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
  const [activeGender, setActiveGender] = useState<'ALL' | 'MEN' | 'WOMEN'>('ALL');
  const [sortBy, setSortBy] = useState<'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST'>('FEATURED');

  const isPreLaunch = storefrontConfig?.storefrontMode === 'PRE_LAUNCH';

  // Find authoritative collection from store or fallback to COLLECTIONS_DATA
  const collection: Collection | undefined = useMemo(() => {
    const fromStore = collections.find((c) => c.slug === slug || c.id === slug);
    if (fromStore) return fromStore;
    return COLLECTIONS_DATA.find((c) => c.slug === slug || c.id === slug);
  }, [collections, slug]);

  // Authoritative series products merged across master catalog and dynamic store
  const seriesProducts = useMemo(() => {
    if (!collection) return [];

    return products.filter((p) => {
      const pSlug = (p.collectionSlug || '').toLowerCase().trim();
      const cSlug = (collection.slug || '').toLowerCase().trim();
      const pName = (p.collectionName || '').toLowerCase().trim();
      const cName = (collection.name || '').toLowerCase().trim();
      const isDirectMatch =
        (pSlug && pSlug === cSlug) ||
        (pName && pName === cName) ||
        (p.collectionId && (p.collectionId === collection.id || p.collectionId === collection.slug));

      if (isDirectMatch) return true;

      // Legacy / fallback hardcoded slug matches
      return (
        (collection.slug === 'the-signature' &&
          (p.isSignature ||
            p.slug === 'the-signature-tee' ||
            p.slug === 'the-signature-womens-architectural-tee' ||
            p.slug === 'the-monolith-oversized' ||
            p.slug === 'the-shadow-raw-hem')) ||
        (collection.slug === 'the-serpent' &&
          (p.slug === 'the-serpent-tee' ||
            p.slug === 'the-venom-edition' ||
            p.slug === 'the-serpent-silk-cotton-crop')) ||
        (collection.slug === 'the-aura' &&
          (p.slug === 'the-chalk-minimalist' || p.slug === 'the-kinetic-silk-cotton')) ||
        (collection.slug === 'the-royals' &&
          (p.slug === 'the-meridian-cropped' || p.slug === 'the-royal-serpent-crest' || p.slug === 'the-royal-insignia')) ||
        (collection.slug === 'the-black-panther' &&
          (p.slug === 'the-panther-embossed-heavyweight' ||
            p.slug === 'the-panther-minimal-refined-tee'))
      );
    });
  }, [products, collection]);

  // Breakdown counts
  const menCount = useMemo(() => {
    return seriesProducts.filter((p) => p.gender === 'men' || p.gender === 'unisex').length;
  }, [seriesProducts]);

  const womenCount = useMemo(() => {
    return seriesProducts.filter((p) => p.gender === 'women' || p.gender === 'unisex').length;
  }, [seriesProducts]);

  // Filtered & Sorted products for direct display
  const displayedProducts = useMemo(() => {
    let list = seriesProducts;
    if (activeGender === 'MEN') {
      list = seriesProducts.filter((p) => p.gender === 'men' || p.gender === 'unisex');
    } else if (activeGender === 'WOMEN') {
      list = seriesProducts.filter((p) => p.gender === 'women' || p.gender === 'unisex');
    }

    const sorted = [...list];
    if (sortBy === 'PRICE_ASC') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_DESC') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'NEWEST') {
      sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
    return sorted;
  }, [seriesProducts, activeGender, sortBy]);

  // Sibling collections for quick navigation
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
          01 — STREAMLINED EDITORIAL CATEGORY HEADER
          ============================================================ */}
      <section className="relative w-full pt-28 sm:pt-32 pb-8 sm:pb-10 px-4 sm:px-6 md:px-12 border-b border-white/10 overflow-hidden bg-neutral-950">
        {/* Subtle Ambient Background Backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <Image
            src={collection.heroImage || '/hero2.png'}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-4">
          {/* Breadcrumb */}
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

          {/* Badge & Title */}
          <div className="space-y-2">
            <div className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-snake-green font-bold">
              {collection.badge || 'ATELIER SERIES'}
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-5xl font-display font-medium uppercase tracking-tight text-white leading-tight">
                  {collection.name}
                </h1>
                {collection.tagline && (
                  <p className="text-xs sm:text-sm font-mono text-neutral-400 mt-1 max-w-2xl">
                    {collection.tagline}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          02 — STORE CONTROLS & PRODUCT CATALOG GRID
          ============================================================ */}
      <section className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 md:px-12 space-y-8">
        {/* Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          {/* Department Selection Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/10 rounded-sm overflow-x-auto">
            <button
              onClick={() => setActiveGender('ALL')}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-all whitespace-nowrap ${
                activeGender === 'ALL'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              ALL PIECES
            </button>
            <button
              onClick={() => setActiveGender('MEN')}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-all whitespace-nowrap ${
                activeGender === 'MEN'
                  ? 'bg-snake-green text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              MEN
            </button>
            <button
              onClick={() => setActiveGender('WOMEN')}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-all whitespace-nowrap ${
                activeGender === 'WOMEN'
                  ? 'bg-snake-green text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              WOMEN
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest hidden sm:inline">
              SORT:
            </span>
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-900 border border-white/15 text-white font-mono text-xs uppercase px-3 py-1.5 pr-8 rounded-sm appearance-none focus:outline-none focus:border-snake-green cursor-pointer"
              >
                <option value="FEATURED">FEATURED</option>
                <option value="NEWEST">NEWEST DROPS</option>
                <option value="PRICE_ASC">PRICE: LOW TO HIGH</option>
                <option value="PRICE_DESC">PRICE: HIGH TO LOW</option>
              </select>
              <ArrowUpDown size={12} className="absolute right-2.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* The Product Grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isPreLaunch={isPreLaunch}
                onPreBook={handleOpenPreBooking}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <Package size={36} className="mx-auto text-neutral-600" />
            <h3 className="text-base font-display font-medium text-white uppercase">
              NO PIECES IN THIS CATEGORY
            </h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              No garments are currently active for this specific department filter.
            </p>
            <button
              onClick={() => setActiveGender('ALL')}
              className="mt-2 px-6 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-bold transition-colors inline-block rounded-sm"
            >
              VIEW ALL PIECES
            </button>
          </div>
        )}
      </section>

      {/* ============================================================
          03 — COMPACT OTHER CHAPTERS DIRECTORY
          ============================================================ */}
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:px-12 border-t border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase block">
              MORE CHAPTERS
            </span>
            <h3 className="text-lg sm:text-xl font-display font-medium uppercase text-white tracking-tight">
              EXPLORE OTHER SERIES
            </h3>
          </div>

          <Link
            href="/collections"
            className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 tracking-widest uppercase transition-colors"
          >
            <span>VIEW ALL</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {otherCollections.map((other) => (
            <Link
              key={other.id}
              href={`/collections/${other.slug}`}
              className="group relative flex flex-col bg-[#080808] border border-white/10 rounded-sm overflow-hidden hover:border-snake-green/50 transition-all duration-300"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                <Image
                  src={other.cardImage || other.heroImage || '/hero2.png'}
                  alt={other.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                    other.heroImage && other.heroImage !== other.cardImage
                      ? 'opacity-100 group-hover:opacity-0'
                      : 'opacity-100'
                  }`}
                />
                {other.heroImage && other.heroImage !== other.cardImage && (
                  <Image
                    src={other.heroImage}
                    alt={`${other.name} alternate view`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>
              <div className="p-3 space-y-1">
                <span className="text-[9px] font-mono tracking-widest text-snake-green font-bold uppercase block truncate">
                  {other.badge}
                </span>
                <h4 className="text-xs font-display font-bold uppercase text-white group-hover:text-snake-green transition-colors truncate">
                  {other.name}
                </h4>
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
