'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, Plus } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/design-tokens';
import { useStore } from '@/lib/store';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isInWishlist, toggleWishlist, openQuickView, addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFavorited = mounted ? isInWishlist(product.id) : false;

  const primaryImage = product.images[0]?.url || '';
  const alternateImage = product.images[1]?.url || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultColor = product.colors[0];
    const defaultSize = product.sizes[2] || product.sizes[0];
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <div
      className="group relative flex flex-col bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-cursor="view"
    >
      {/* Image Showcase Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0c0c0c] border border-white/[0.04] transition-colors group-hover:border-white/20">
        {/* Clickable Image Link */}
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-0 block w-full h-full"
          aria-label={`View ${product.name}`}
        >
          {/* Primary Image */}
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            unoptimized={Boolean(primaryImage.startsWith('data:') || primaryImage.startsWith('blob:'))}
            className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isHovered && alternateImage !== primaryImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
          />

          {/* Alternate Image on Hover */}
          {alternateImage !== primaryImage && (
            <Image
              src={alternateImage}
              alt={`${product.name} alternate`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized={Boolean(alternateImage.startsWith('data:') || alternateImage.startsWith('blob:'))}
              className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            />
          )}
        </Link>

        {/* Tagline / Subtitle badge */}
        <div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-black/60 backdrop-blur-md text-[9px] font-mono tracking-widest text-neutral-300 border border-white/10 uppercase max-w-[70%] truncate pointer-events-none">
          {product.tagline || `${product.gsm} GSM`}
        </div>

        {/* Wishlist Button - 44px min tap target */}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-2.5 sm:p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 active:scale-90 ${
            isFavorited
              ? 'bg-red-600 text-white scale-100'
              : 'bg-black/50 text-white hover:text-red-400 border border-white/10'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart size={14} className={isFavorited ? 'fill-white' : ''} />
        </button>

        {/* Mobile Quick Add Floating Button (touch-friendly, unobtrusive) */}
        <button
          type="button"
          onClick={handleQuickAdd}
          className="lg:hidden absolute bottom-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 active:bg-snake-green active:text-black transition-all shadow-md"
          aria-label="Quick Add to Bag"
        >
          <Plus size={14} />
        </button>

        {/* Desktop Floating Actions on Hover (LOCKED & UNTOUCHED FOR lg: AND ABOVE) */}
        <div className="hidden lg:flex absolute bottom-3 inset-x-3 z-10 gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex-1 py-2 px-3 bg-black/80 hover:bg-snake-green hover:text-black text-white backdrop-blur-md border border-white/20 hover:border-snake-green font-mono text-[10px] tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg active:scale-98"
          >
            <Plus size={13} /> QUICK ADD
          </button>
          <button
            type="button"
            onClick={handleQuickView}
            className="p-2 bg-black/80 hover:bg-white hover:text-black text-white backdrop-blur-md border border-white/20 font-mono text-[10px] uppercase transition-all duration-200 flex items-center justify-center shadow-lg active:scale-98"
            aria-label="Quick View"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Product Metadata */}
      <div className="pt-2.5 sm:pt-3.5 pb-2 flex flex-col space-y-1">
        <div className="flex justify-between items-baseline gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="text-xs font-mono font-semibold tracking-wider text-neutral-200 group-hover:text-white uppercase truncate"
          >
            {product.name}
          </Link>
          <span className="font-mono text-xs text-white font-medium whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>

        {product.tagline && (
          <p className="text-[10px] font-mono text-neutral-400 truncate">
            {product.tagline}
          </p>
        )}

        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-neutral-500">
          <span>{product.fit} Fit • {product.gender.toUpperCase()}</span>
          <span className="line-through text-neutral-600">{formatPrice(product.mrp)}</span>
        </div>

        {/* Color Swatch Dots */}
        <div className="flex items-center gap-1.5 pt-1">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border border-white/20"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
