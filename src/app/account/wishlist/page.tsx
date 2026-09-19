'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';
import { Size } from '@/lib/types';

export default function AccountWishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useStore();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, Size>>({});

  const handleSizeChange = (productId: string, size: Size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleMoveToBag = (item: any) => {
    const product = item.product;
    const size = selectedSizes[product.id] || product.sizes[0] || 'L';
    const color = product.colors[0] || { name: 'Obsidian Black', hex: '#111111' };
    addToCart(product, size, color, 1);
    removeFromWishlist(product.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
            CURATED PIECES
          </span>
          <h2 className="text-xl md:text-2xl font-display font-medium text-white">
            SAVED FOR LATER ({wishlist.length})
          </h2>
        </div>

        {wishlist.length > 0 && (
          <Link
            href="/shop"
            className="text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors uppercase flex items-center gap-1"
          >
            <span>ADD MORE</span>
            <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/10 p-12 text-center space-y-4 rounded-sm">
          <Heart size={32} className="mx-auto text-neutral-600" />
          <h3 className="text-base font-display text-white font-medium">YOUR WISHLIST IS EMPTY</h3>
          <p className="text-xs font-mono text-neutral-500 max-w-sm mx-auto">
            Save heavyweight cuts, oversized silhouettes, and upcoming limited releases here.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-2 px-6 py-3 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            EXPLORE THE ATELIER
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlist.map((item) => {
            const product = item.product;
            const chosenSize = selectedSizes[product.id] || product.sizes[0] || 'L';

            return (
              <div
                key={item.id}
                className="bg-[#0a0a0a] border border-white/10 p-4 rounded-sm flex flex-col justify-between space-y-4 hover:border-white/20 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="relative w-24 h-32 bg-neutral-900 border border-white/10 shrink-0 overflow-hidden">
                    <Image
                      src={product.images[0]?.url || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-display font-medium text-white truncate">
                        {product.name}
                      </h4>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <p className="text-[10px] font-mono text-neutral-400">
                      {product.gsm} GSM • {product.fit.toUpperCase()} FIT
                    </p>

                    <p className="text-sm font-mono text-snake-green font-semibold">
                      {formatPrice(product.price)}
                    </p>

                    {/* Size Selector */}
                    <div className="pt-2">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase block mb-1">
                        SELECT SIZE:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleSizeChange(product.id, s)}
                            className={`px-2 py-1 text-[10px] font-mono border rounded transition-colors ${
                              chosenSize === s
                                ? 'border-snake-green bg-snake-green/10 text-snake-green font-bold'
                                : 'border-white/10 text-neutral-400 hover:border-white/30'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleMoveToBag(item)}
                  className="w-full py-2.5 bg-white/5 hover:bg-snake-green hover:text-black border border-white/10 text-white font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={14} />
                  <span>MOVE TO BAG</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
