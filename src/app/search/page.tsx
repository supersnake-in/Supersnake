'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/product/ProductCard';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { products } = useStore();

  const [query, setQuery] = useState(initialQuery);
  const [selectedGender, setSelectedGender] = useState<'all' | 'men' | 'women'>('all');

  const popularSearches = [
    '280 GSM Heavyweight',
    'Oversized Black',
    'Chalk White',
    'Boxy Cut',
    'Supima Cotton',
    'Sage Green',
  ];

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    return products.filter((p) => {
      if (selectedGender !== 'all') {
        if (p.gender !== selectedGender && p.gender !== 'unisex') return false;
      }
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchFit = p.fit.toLowerCase().includes(q);
      const matchColor = p.colors.some((c) => c.name.toLowerCase().includes(q));
      const matchFabric = p.fabric.toLowerCase().includes(q);
      return matchName || matchDesc || matchFit || matchColor || matchFabric;
    });
  }, [products, query, selectedGender]);

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
              placeholder="Search garments, weights (280 GSM), colors, cuts..."
              autoFocus
              className="w-full bg-[#0a0a0a] border border-white/20 px-5 py-4 pl-12 text-sm md:text-base font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
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

        {/* Gender Filter Pills */}
        {query && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-400">
                {searchResults.length} {searchResults.length === 1 ? 'RESULT' : 'RESULTS'} FOR &quot;{query}&quot;
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

        {/* Search Results Grid */}
        {query ? (
          searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 bg-[#0a0a0a] border border-white/10 p-8 rounded-sm">
              <p className="text-xl font-display font-medium text-white">NO PIECES MATCHED YOUR QUERY</p>
              <p className="text-xs font-mono text-neutral-500 max-w-sm mx-auto">
                Try searching for broader keywords like &quot;Heavyweight&quot;, &quot;Oversized&quot;, or browse our complete collection.
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
