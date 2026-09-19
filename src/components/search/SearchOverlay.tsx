'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';
import { Product } from '@/lib/types';

export function SearchOverlay() {
  const { products, isSearchOpen, openSearch, closeSearch } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const curatedSuggestions = [
    'BLACK T-SHIRTS',
    'OVERSIZED T-SHIRTS',
    'WHITE T-SHIRTS',
    'NEW DROPS',
    'MEN',
    'WOMEN',
    '280 GSM',
  ];

  // Hotkey listener for Cmd+K and /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch, openSearch]);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  // Live search filtering
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fit.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q) ||
        p.colors.some((c) => c.name.toLowerCase().includes(q)) ||
        `${p.gsm} gsm`.toLowerCase().includes(q)
      );
    });

    setResults(filtered);
  }, [query, products]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col p-6 md:p-12 overflow-y-auto text-neutral-100"
        >
          {/* Top Bar with Close Button */}
          <div className="flex justify-between items-center max-w-5xl mx-auto w-full mb-10">
            <span className="text-[11px] font-mono tracking-widest text-neutral-500 uppercase">
              SEARCH THE COLLECTION
            </span>
            <button
              onClick={closeSearch}
              className="p-2 text-neutral-400 hover:text-white transition-colors focus:outline-none flex items-center gap-2 text-xs font-mono tracking-widest"
              aria-label="Close Search"
            >
              <span>ESC</span>
              <X size={20} />
            </button>
          </div>

          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            {/* Headline */}
            <h2 className="text-2xl md:text-5xl font-display font-medium tracking-tight text-white mb-8">
              WHAT ARE YOU LOOKING FOR?
            </h2>

            {/* Input field */}
            <div className="relative border-b border-white/20 pb-4 mb-8 focus-within:border-snake-green transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search fit, fabric, color, or style..."
                className="w-full bg-transparent text-xl md:text-3xl font-sans tracking-wide text-white placeholder:text-neutral-600 focus:outline-none"
              />
              <SearchIcon
                size={28}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-500"
              />
            </div>

            {/* Suggestions (when no query) */}
            {query.trim() === '' && (
              <div className="space-y-4">
                <p className="text-[11px] font-mono tracking-widest text-neutral-500 uppercase">
                  POPULAR SEARCHES
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {curatedSuggestions.map((item) => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="px-4 py-2 border border-white/10 rounded-full text-xs font-mono tracking-wider text-neutral-300 hover:border-snake-green hover:text-white transition-all bg-white/[0.02]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Grid */}
            {query.trim() !== '' && (
              <div className="space-y-6 flex-1">
                <div className="flex justify-between items-center text-xs font-mono tracking-widest text-neutral-400 border-b border-white/10 pb-3">
                  <span>RESULTS ({results.length})</span>
                  <span>PREVIEW</span>
                </div>

                {results.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <p className="font-display text-2xl tracking-wider text-white">NOTHING FOUND.</p>
                    <p className="text-xs font-mono text-neutral-500">
                      Try searching with broader terms like &quot;oversized&quot;, &quot;black&quot;, or &quot;280 gsm&quot;.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={closeSearch}
                        className="group flex flex-col bg-[#0d0d0d] border border-white/5 hover:border-white/20 transition-all rounded overflow-hidden"
                      >
                        <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden">
                          <Image
                            src={product.images[0]?.url || ''}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-[9px] font-mono tracking-widest text-white border border-white/10">
                            {product.gsm} GSM
                          </div>
                        </div>
                        <div className="p-4 space-y-1">
                          <h4 className="text-xs font-mono font-semibold tracking-wider text-white group-hover:text-snake-green transition-colors uppercase">
                            {product.name}
                          </h4>
                          <p className="text-[11px] font-mono text-neutral-400">{product.fit} Fit</p>
                          <div className="flex justify-between items-center pt-2">
                            <span className="font-mono text-xs text-white font-medium">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-[10px] font-mono text-snake-green flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              VIEW <ArrowRight size={11} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
