'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ArrowUpDown, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { Product, FitType, Size, Gender } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { useStore } from '@/lib/store';

interface ShopCatalogProps {
  initialGender?: Gender | 'all';
  initialIsNew?: boolean;
  initialIsBestseller?: boolean;
  initialFit?: FitType | 'all';
  initialSeries?: string | 'all';
  pageTitle?: string;
  pageSubtitle?: string;
  showSeriesQuickBar?: boolean;
}

const ALL_CATALOG_SIZES: (Size | 'all')[] = ['all', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL'];

function ShopCatalogContent({
  initialGender = 'all',
  initialIsNew = false,
  initialIsBestseller = false,
  initialFit = 'all',
  initialSeries = 'all',
  pageTitle = 'SHOP T-SHIRTS',
  pageSubtitle = 'The hero product. Engineered from 240–300 GSM long-staple cotton.',
  showSeriesQuickBar = false,
}: ShopCatalogProps) {
  const searchParams = useSearchParams();
  const seriesFromUrl = searchParams.get('series') || initialSeries;

  const { products, collections } = useStore();
  const [selectedGender, setSelectedGender] = useState<Gender | 'all'>(initialGender);
  const [selectedFit, setSelectedFit] = useState<FitType | 'all'>(initialFit);
  const [selectedSeries, setSelectedSeries] = useState<string | 'all'>(seriesFromUrl);
  const [selectedSize, setSelectedSize] = useState<Size | 'all'>('all');
  const [selectedColor, setSelectedColor] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [onlyNew, setOnlyNew] = useState(initialIsNew);
  const [onlyBestsellers, setOnlyBestsellers] = useState(initialIsBestseller);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Sync if URL query changes
  useEffect(() => {
    const qSeries = searchParams.get('series');
    if (qSeries) {
      setSelectedSeries(qSeries);
    }
  }, [searchParams]);

  // Active series object if selected
  const matchedSeries = useMemo(() => {
    if (selectedSeries === 'all') return null;
    return collections.find((c) => c.slug === selectedSeries || c.id === selectedSeries);
  }, [collections, selectedSeries]);

  // Available unique colors
  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.colors.forEach((c) => set.add(c.name)));
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Gender filter
        if (selectedGender !== 'all') {
          if (p.gender !== selectedGender && p.gender !== 'unisex') return false;
        }
        // Series filter
        if (selectedSeries !== 'all') {
          const matchesColSlug = p.collectionSlug === selectedSeries;
          const matchesColId = p.collectionId === selectedSeries;
          if (!matchesColSlug && !matchesColId) return false;
        }
        // Fit filter
        if (selectedFit !== 'all' && p.fit !== selectedFit) return false;
        // Size filter
        if (selectedSize !== 'all' && !p.sizes.includes(selectedSize)) return false;
        // Color filter
        if (selectedColor !== 'all' && !p.colors.some((c) => c.name === selectedColor)) return false;
        // New filter
        if (onlyNew && !p.isNew) return false;
        // Bestseller filter
        if (onlyBestsellers && !p.isBestseller) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;

        // FEATURED (default):
        // 1. Products with custom admin displayOrder (1, 2, ... 12+) appear first, ordered ascending.
        // 2. Remaining products (or without displayOrder) follow, ordered by created_at descending (newest first).
        const orderA = a.displayOrder && a.displayOrder > 0 ? a.displayOrder : Infinity;
        const orderB = b.displayOrder && b.displayOrder > 0 ? b.displayOrder : Infinity;

        if (orderA !== Infinity && orderB !== Infinity) {
          if (orderA !== orderB) return orderA - orderB;
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        }

        if (orderA !== Infinity) return -1;
        if (orderB !== Infinity) return 1;

        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [products, selectedGender, selectedSeries, selectedFit, selectedSize, selectedColor, onlyNew, onlyBestsellers, sortBy]);

  const activeFilterCount =
    (selectedSeries !== 'all' ? 1 : 0) +
    (selectedFit !== 'all' ? 1 : 0) +
    (selectedSize !== 'all' ? 1 : 0) +
    (selectedColor !== 'all' ? 1 : 0) +
    (onlyNew ? 1 : 0) +
    (onlyBestsellers ? 1 : 0);

  const resetFilters = () => {
    setSelectedSeries('all');
    setSelectedFit('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setOnlyNew(false);
    setOnlyBestsellers(false);
  };

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Page Header */}
        <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
              SUPERSNAKE ATELIER
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold uppercase tracking-tight text-white">
              {pageTitle}
            </h1>
            <p className="text-xs md:text-sm font-mono text-neutral-400 max-w-lg">
              {pageSubtitle}
            </p>
          </div>

          {/* Quick Gender Filter Pills */}
          {initialGender !== 'unisex' && (
            <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-white/10 rounded-full self-start md:self-auto">
              {(['all', 'men', 'women'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all ${
                    selectedGender === g
                      ? 'bg-snake-green text-black font-bold shadow-[0_0_12px_rgba(4,252,33,0.3)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================
            COLLECTION SERIES // CREATIVE CHAPTERS QUICK BAR
            ============================================================ */}
        {showSeriesQuickBar && (
          <>
            <div className="space-y-3 bg-[#080808] border border-white/[0.08] p-4 sm:p-5 rounded-sm">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase">
                <span className="flex items-center gap-2 text-snake-green font-bold">
                  <Layers size={13} />
                  <span>COLLECTION SERIES // ART-DIRECTED CHAPTERS</span>
                </span>
                <Link
                  href="/collections"
                  className="text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>EXPLORE ALL {collections.length} CHAPTERS</span>
                  <ArrowRight size={11} className="text-snake-green" />
                </Link>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedSeries('all')}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap shrink-0 border ${
                    selectedSeries === 'all'
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-neutral-900 text-neutral-400 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  ALL CHAPTERS
                </button>
                {collections
                  .filter((c) => c.isActive)
                  .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                  .map((col) => {
                    const countInView = products.filter(
                      (p) =>
                        (p.collectionSlug === col.slug || p.collectionId === col.id) &&
                        (selectedGender === 'all' || p.gender === selectedGender || p.gender === 'unisex')
                    ).length;

                    return (
                      <button
                        key={col.id}
                        onClick={() => setSelectedSeries(col.slug)}
                        className={`px-3.5 py-1.5 rounded-sm text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap shrink-0 border flex items-center gap-2 ${
                          selectedSeries === col.slug
                            ? 'bg-snake-green text-black border-snake-green font-bold shadow-[0_0_15px_rgba(4,252,33,0.35)]'
                            : 'bg-neutral-900 text-neutral-400 border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <span>{col.name}</span>
                        <span className="text-[10px] opacity-70">({countInView})</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* SELECTED SERIES EDITORIAL HIGHLIGHT BANNER */}
            {selectedSeries !== 'all' && matchedSeries && (
              <div className="p-4 sm:p-6 bg-gradient-to-r from-neutral-950 via-[#0e0e0e] to-neutral-950 border border-snake-green/30 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-snake-green font-bold">
                      {matchedSeries.badge || 'ATELIER CHAPTER'}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase font-bold">
                      {selectedGender === 'men'
                        ? "MEN'S ATELIER EDITION"
                        : selectedGender === 'women'
                        ? "WOMEN'S ATELIER EDITION"
                        : 'UNIFIED GENDER ROSTER'}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-white tracking-wide">
                    {matchedSeries.name}
                  </h3>
                  <p className="text-xs font-mono text-neutral-300 max-w-2xl leading-relaxed">
                    {matchedSeries.tagline || matchedSeries.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/collections/${matchedSeries.slug}`}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-white/20 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 rounded-sm"
                  >
                    <span>CHAPTER STORY</span>
                    <ArrowRight size={13} className="text-snake-green" />
                  </Link>
                  <button
                    onClick={() => setSelectedSeries('all')}
                    className="text-xs font-mono text-neutral-400 hover:text-white underline uppercase tracking-wider"
                  >
                    SHOW ALL
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-white/15 hover:border-white/40 text-neutral-300 hover:text-white rounded transition-colors"
            >
              <SlidersHorizontal size={14} />
              <span>FILTERS</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-snake-green text-black text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-neutral-500 hover:text-snake-green transition-colors text-[11px] underline"
              >
                CLEAR ALL
              </button>
            )}

            <span className="text-neutral-500 hidden sm:inline-block">
              SHOWING {filteredProducts.length} STYLES
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 hidden sm:inline">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-900 border border-white/15 text-neutral-200 text-xs font-mono px-3 py-1.5 rounded focus:outline-none focus:border-snake-green cursor-pointer"
            >
              <option value="featured">FEATURED</option>
              <option value="price-asc">PRICE: LOW TO HIGH</option>
              <option value="price-desc">PRICE: HIGH TO LOW</option>
              <option value="rating">HIGHEST RATED</option>
            </select>
          </div>
        </div>

        {/* Expandable Filter Interface (Mobile Bottom Sheet + Desktop Inline Tray) */}
        {filterDrawerOpen && (
          <>
            {/* MOBILE BOTTOM SHEET (< md) */}
            <div className="fixed inset-0 z-50 flex items-end md:hidden">
              <div
                onClick={() => setFilterDrawerOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
              />

              <div className="relative z-10 w-full bg-[#0e0e0e] border-t border-white/15 rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto space-y-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] text-xs font-mono animate-in slide-in-from-bottom duration-300">
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-2" />

                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={14} className="text-snake-green" />
                    <span className="font-bold tracking-widest text-white uppercase">FILTERS & SORT</span>
                  </div>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="p-1 text-neutral-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Mobile Series Filter */}
                <div className="space-y-2">
                  <p className="text-neutral-400 font-semibold tracking-wider uppercase text-[11px]">
                    COLLECTION SERIES
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedSeries('all')}
                      className={`px-3 py-1.5 border rounded text-[11px] transition-all ${
                        selectedSeries === 'all'
                          ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                          : 'border-white/10 text-neutral-400'
                      }`}
                    >
                      ALL
                    </button>
                    {collections.filter(c => c.isActive).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedSeries(c.slug)}
                        className={`px-3 py-1.5 border rounded text-[11px] transition-all ${
                          selectedSeries === c.slug
                            ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                            : 'border-white/10 text-neutral-400'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Sort options */}
                <div className="space-y-2">
                  <p className="text-neutral-400 font-semibold tracking-wider uppercase text-[11px]">SORT BY</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'FEATURED', value: 'featured' },
                      { label: 'PRICE: LOW-HIGH', value: 'price-asc' },
                      { label: 'PRICE: HIGH-LOW', value: 'price-desc' },
                      { label: 'HIGHEST RATED', value: 'rating' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortBy(opt.value as any)}
                        className={`p-2 border rounded text-[10px] uppercase font-mono tracking-wider transition-all ${
                          sortBy === opt.value
                            ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                            : 'border-white/10 text-neutral-400 hover:border-white/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fit */}
                <div className="space-y-2">
                  <p className="text-neutral-400 font-semibold tracking-wider uppercase text-[11px]">FIT</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'Oversized', 'Boxy', 'Relaxed', 'Classic'] as const).map((fit) => (
                      <button
                        key={fit}
                        onClick={() => setSelectedFit(fit)}
                        className={`px-3 py-1.5 border rounded text-[11px] transition-all ${
                          selectedFit === fit
                            ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                            : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {fit.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <p className="text-neutral-400 font-semibold tracking-wider uppercase text-[11px]">SIZE</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_CATALOG_SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 border rounded text-[11px] transition-all ${
                          selectedSize === s
                            ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                            : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <p className="text-neutral-400 font-semibold tracking-wider uppercase text-[11px]">COLOR</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['all', ...allColors].map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 border rounded text-[11px] transition-all ${
                          selectedColor === col
                            ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                            : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {col.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editions */}
                <div className="space-y-2">
                  <p className="text-neutral-400 font-semibold tracking-wider uppercase text-[11px]">EDITIONS</p>
                  <div className="flex flex-col space-y-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300">
                      <input
                        type="checkbox"
                        checked={onlyNew}
                        onChange={(e) => setOnlyNew(e.target.checked)}
                        className="accent-snake-green rounded"
                      />
                      <span>NEW DROPS ONLY</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300">
                      <input
                        type="checkbox"
                        checked={onlyBestsellers}
                        onChange={(e) => setOnlyBestsellers(e.target.checked)}
                        className="accent-snake-green rounded"
                      />
                      <span>BESTSELLERS ONLY</span>
                    </label>
                  </div>
                </div>

                {/* Mobile Bottom Sheet Action Buttons */}
                <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3 sticky bottom-0 bg-[#0e0e0e] pb-1">
                  <button
                    onClick={resetFilters}
                    className="py-3 px-4 border border-white/20 text-center font-mono text-xs uppercase tracking-widest text-neutral-300 hover:text-white active:scale-95 transition-all"
                  >
                    CLEAR ALL
                  </button>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="py-3 px-4 bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-bold text-center active:scale-95 transition-all shadow-[0_0_15px_rgba(4,252,33,0.3)]"
                  >
                    APPLY ({filteredProducts.length})
                  </button>
                </div>
              </div>
            </div>

            {/* DESKTOP INLINE TRAY */}
            <div className="hidden md:block p-6 bg-[#0c0c0c] border border-white/10 rounded-sm space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {/* Series */}
                <div className="space-y-2.5">
                  <p className="text-neutral-400 font-semibold tracking-wider uppercase">SERIES</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedSeries('all')}
                      className={`px-3 py-1 border rounded text-[11px] transition-all ${
                        selectedSeries === 'all'
                          ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                          : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      ALL
                    </button>
                    {collections.filter(c => c.isActive).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedSeries(c.slug)}
                        className={`px-3 py-1 border rounded text-[11px] transition-all ${
                          selectedSeries === c.slug
                            ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                            : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fit */}
                <div className="space-y-2.5">
                  <p className="text-neutral-400 font-semibold tracking-wider uppercase">FIT</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'Oversized', 'Boxy', 'Relaxed', 'Classic'] as const).map((fit) => (
                      <button
                        key={fit}
                        onClick={() => setSelectedFit(fit)}
                        className={`px-3 py-1 border rounded text-[11px] transition-all ${
                          selectedFit === fit
                            ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                            : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {fit.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="space-y-2.5">
                  <p className="text-neutral-400 font-semibold tracking-wider uppercase">SIZE</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_CATALOG_SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1 border rounded text-[11px] transition-all ${
                          selectedSize === s
                            ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                            : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-2.5">
                  <p className="text-neutral-400 font-semibold tracking-wider uppercase">COLOR</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['all', ...allColors].map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1 border rounded text-[11px] transition-all ${
                          selectedColor === col
                            ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                            : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {col.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="aspect-[3/4] bg-neutral-950 border border-white/[0.06] animate-pulse rounded-sm"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-neutral-950 border border-white/10 rounded-sm p-8">
            <p className="font-display text-xl tracking-wider text-white">NO STYLES MATCH YOUR SELECTION.</p>
            <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto">
              There are no garments currently assigned with this combination of series, fit, and category.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 bg-neutral-900 border border-white/20 text-xs font-mono text-snake-green uppercase tracking-widest hover:border-snake-green transition-all rounded-sm"
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ShopCatalog(props: ShopCatalogProps) {
  return (
    <Suspense fallback={null}>
      <ShopCatalogContent {...props} />
    </Suspense>
  );
}
