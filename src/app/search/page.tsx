'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/product/ProductCard';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { products, collections } = useStore();

  const [query, setQuery] = useState(initialQuery);
  const [selectedGender, setSelectedGender] = useState<'all' | 'men' | 'women' | 'unisex'>('all');

  const popularSearches = [
    'The Black Panther',
    'The Royals',
    'The Serpent',
    'The Aura',
    'The Signature',
    '280 GSM Heavyweight',
    'Oversized Black',
    'Chalk White',
    'Boxy Cut',
    'Supima Cotton',
  ];

  const matchingCollections = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    return (collections || []).filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchSlug = c.slug.toLowerCase().includes(q) || c.slug.replace(/-/g, ' ').includes(q);
      const matchBadge = c.badge?.toLowerCase().includes(q);
      const matchTagline = c.tagline?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      const matchSpecs = c.fabricSpecs?.toLowerCase().includes(q);
      const matchMood = c.artworkMood?.toLowerCase().includes(q);
      return matchName || matchSlug || matchBadge || matchTagline || matchDesc || matchSpecs || matchMood;
    });
  }, [collections, query]);

  const matchingColSlugs = useMemo(() => {
    return new Set(matchingCollections.map((c) => c.slug));
  }, [matchingCollections]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    return products.filter((p) => {
      if (selectedGender !== 'all') {
        if (p.gender !== selectedGender && p.gender !== 'unisex') return false;
      }
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchFit = p.fit?.toLowerCase().includes(q);
      const matchColor = p.colors?.some((c) => c.name.toLowerCase().includes(q));
      const matchFabric = p.fabric?.toLowerCase().includes(q);
      const matchCollectionSlug =
        p.collectionSlug?.toLowerCase().includes(q) ||
        (p.collectionSlug && p.collectionSlug.replace(/-/g, ' ').toLowerCase().includes(q));
      const matchCollectionName = p.collectionName?.toLowerCase().includes(q);
      const matchLinkedCollection = p.collectionSlug ? matchingColSlugs.has(p.collectionSlug) : false;
      const matchGsm = `${p.gsm} gsm`.toLowerCase().includes(q);

      return (
        matchName ||
        matchDesc ||
        matchFit ||
        matchColor ||
        matchFabric ||
        matchCollectionSlug ||
        matchCollectionName ||
        matchLinkedCollection ||
        matchGsm
      );
    });
  }, [products, query, selectedGender, matchingColSlugs]);

  const totalCount = matchingCollections.length + searchResults.length;

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Search Header */}
        <div className="border-b border-white/10 pb-8 space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
            CATALOG DISCOVERY
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            SEARCH THE ATELIER
          </h1>

          {/* Search Input Bar */}
          <div className="relative max-w-2xl pt-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collections, garments, weights (280 GSM), colors, cuts..."
              autoFocus
              className="w-full bg-[#0a0a0a] border border-white/20 px-5 py-4 pl-12 text-sm md:text-base font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                aria-label="Clear query"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Popular Search Suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono">
            <span className="text-neutral-500 text-[11px] uppercase tracking-wider">POPULAR:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded text-[11px] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Gender Filter Pills & Results Count */}
        {query && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-400">
                {totalCount} {totalCount === 1 ? 'RESULT' : 'RESULTS'} FOR &quot;{query}&quot;
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#0a0a0a] border border-white/10 p-1 rounded text-xs font-mono">
              {(['all', 'men', 'women'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`px-3 py-1 rounded uppercase transition-colors ${
                    selectedGender === g
                      ? 'bg-neutral-800 text-snake-green font-semibold'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Display */}
        {query ? (
          totalCount > 0 ? (
            <div className="space-y-12">
              {/* Collection Chapters Section */}
              {matchingCollections.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono tracking-widest text-snake-green uppercase font-semibold">
                        COLLECTION CHAPTERS
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        ({matchingCollections.length})
                      </span>
                    </div>
                    <Link
                      href="/collections"
                      className="text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors flex items-center gap-1.5"
                    >
                      VIEW ALL COLLECTIONS <ArrowRight size={12} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {matchingCollections.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.slug}`}
                        className="group relative bg-[#0a0a0a] border border-white/10 hover:border-snake-green/50 transition-all rounded p-5 flex flex-col hover:bg-[#111]"
                      >
                        <div className="relative aspect-[16/9] w-full rounded overflow-hidden bg-neutral-900 mb-4">
                          <Image
                            src={col.cardImage || col.heroImage || '/placeholder.png'}
                            alt={col.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </div>

                        <span className="text-xs font-mono tracking-[0.2em] font-bold text-snake-green uppercase mb-1">
                          {col.badge || 'SERIES'}
                        </span>

                        <h3 className="text-lg md:text-xl font-display font-medium uppercase tracking-tight text-white group-hover:text-snake-green transition-colors">
                          {col.name}
                        </h3>

                        <p className="text-xs font-sans text-neutral-400 line-clamp-2 mt-1.5 flex-1">
                          {col.tagline}
                        </p>

                        <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-snake-green group-hover:translate-x-1 transition-transform">
                          <span className="font-semibold tracking-wider">EXPLORE SERIES</span>
                          <ArrowRight size={14} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Garments Section */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  {matchingCollections.length > 0 && (
                    <div className="border-b border-white/10 pb-3">
                      <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
                        GARMENTS ({searchResults.length})
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {searchResults.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 bg-[#0a0a0a] border border-white/10 p-8 rounded-sm">
              <p className="text-xl font-display font-medium text-white">NO PIECES OR COLLECTIONS MATCHED YOUR QUERY</p>
              <p className="text-xs font-mono text-neutral-500 max-w-sm mx-auto">
                Try searching for broader keywords like &quot;Black Panther&quot;, &quot;Royals&quot;, &quot;Heavyweight&quot;, or &quot;Oversized&quot;.
              </p>
            </div>
          )
        ) : (
          <div className="py-16 text-center space-y-4">
            <p className="text-sm font-mono text-neutral-500 uppercase tracking-widest">
              ENTER A QUERY ABOVE TO SEARCH OUR CURATED ARCHIVE
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SearchPageContent />
    </Suspense>
  );
}
