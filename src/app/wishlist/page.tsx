'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useStore();

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-mega text-snake-green uppercase">
              PRIVATE ARCHIVE
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight text-white">
              SAVED FOR LATER
            </h1>
            <p className="text-xs md:text-sm font-mono text-neutral-400">
              Curated items awaiting your instinct.
            </p>
          </div>

          <span className="text-xs font-mono text-neutral-500">
            {wishlist.length} {wishlist.length === 1 ? 'PIECE' : 'PIECES'} SAVED
          </span>
        </div>

        {/* Wishlist Grid or Empty State */}
        {wishlist.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-600">
              <Heart size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-2xl tracking-wider text-white">SAVED FOR LATER.</h3>
              <p className="text-xs font-mono text-neutral-500">
                Nothing here yet. Explore our heavyweight collection to save your favorites.
              </p>
            </div>
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white transition-colors flex items-center gap-2 mt-4"
            >
              EXPLORE T-SHIRTS <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map(({ product }) => (
              <div
                key={product.id}
                className="group flex flex-col bg-[#0c0c0c] border border-white/5 hover:border-white/20 transition-all rounded overflow-hidden"
              >
                {/* Image */}
                <Link
                  href={`/product/${product.slug}`}
                  className="relative aspect-[4/5] bg-neutral-900 overflow-hidden block"
                >
                  <Image
                    src={product.images[0]?.url || ''}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    unoptimized={Boolean(product.images[0]?.url?.startsWith('data:') || product.images[0]?.url?.startsWith('blob:'))}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-[9px] font-mono tracking-widest text-neutral-300 border border-white/10 uppercase max-w-[80%] truncate">
                    {product.tagline || `${product.gsm} GSM`}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-neutral-400 hover:text-red-400 backdrop-blur-sm border border-white/10 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={13} />
                  </button>
                </Link>

                {/* Info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-xs font-mono font-semibold tracking-wider text-white hover:text-snake-green transition-colors uppercase block truncate"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                      {product.fit} Fit • {formatPrice(product.price)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const color = product.colors[0];
                      const size = product.sizes[2] || product.sizes[0];
                      addToCart(product, size, color, 1);
                      removeFromWishlist(product.id);
                    }}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-snake-green hover:text-black text-neutral-200 border border-white/10 hover:border-snake-green font-mono text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={12} /> MOVE TO BAG
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
