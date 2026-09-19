'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';
import { Size } from '@/lib/types';

export function QuickViewModal() {
  const { quickViewProduct, closeQuickView, addToCart } = useStore();
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size>('L');

  // Reset or set defaults when product changes
  React.useEffect(() => {
    if (quickViewProduct) {
      setSelectedColor(quickViewProduct.colors[0] || null);
      setSelectedSize(quickViewProduct.sizes[2] || quickViewProduct.sizes[0] || 'L');
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const handleAddToCart = () => {
    if (!selectedColor) return;
    addToCart(quickViewProduct, selectedSize, selectedColor, 1);
    closeQuickView();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeQuickView}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-lg overflow-hidden shadow-2xl text-neutral-100 flex flex-col md:flex-row"
        >
          {/* Close button */}
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-white bg-black/40 backdrop-blur-sm rounded-full transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Left: Product Image */}
          <div className="relative w-full md:w-1/2 aspect-[4/5] bg-neutral-950 overflow-hidden">
            <Image
              src={quickViewProduct.images[0]?.url || ''}
              alt={quickViewProduct.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized={Boolean(quickViewProduct.images[0]?.url?.startsWith('data:') || quickViewProduct.images[0]?.url?.startsWith('blob:'))}
              className="object-cover"
              priority
            />
            <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[9px] font-mono tracking-widest text-neutral-300 border border-white/10 uppercase max-w-[85%] truncate">
              {quickViewProduct.tagline || `${quickViewProduct.gsm} GSM • ${quickViewProduct.fit.toUpperCase()}`}
            </div>
          </div>

          {/* Right: Rapid Purchase Form */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-mono tracking-widest text-snake-green uppercase mb-1">
                  QUICK VIEW
                </p>
                <h3 className="text-lg md:text-xl font-mono font-semibold tracking-wider text-white uppercase">
                  {quickViewProduct.name}
                </h3>
                {quickViewProduct.tagline && (
                  <p className="text-[11px] font-mono text-neutral-400 mt-1 uppercase">
                    {quickViewProduct.tagline}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="font-mono text-base text-white font-medium">
                    {formatPrice(quickViewProduct.price)}
                  </span>
                  <span className="font-mono text-xs text-neutral-500 line-through">
                    {formatPrice(quickViewProduct.mrp)}
                  </span>
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase flex justify-between">
                  <span>COLOR</span>
                  <span className="text-white">{selectedColor?.name}</span>
                </label>
                <div className="flex gap-2.5">
                  {quickViewProduct.colors.map((c) => {
                    const isSelected = selectedColor?.name === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        title={c.name}
                        className={`w-7 h-7 rounded-full border transition-all p-0.5 flex items-center justify-center ${
                          isSelected
                            ? 'border-snake-green scale-110'
                            : 'border-white/20 hover:border-white/60'
                        }`}
                      >
                        <span
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                  <span>SIZE</span>
                  <span className="text-snake-green">IN STOCK</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {quickViewProduct.sizes.map((s) => {
                    const isSelected = selectedSize === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`py-2 text-[11px] font-mono border rounded transition-all ${
                          isSelected
                            ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                            : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-6">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-snake-green text-black font-mono text-xs tracking-widest font-bold hover:bg-white transition-colors uppercase flex items-center justify-center gap-2"
              >
                ADD TO BAG
              </button>

              <Link
                href={`/product/${quickViewProduct.slug}`}
                onClick={closeQuickView}
                className="w-full py-2.5 border border-white/10 text-neutral-300 font-mono text-xs tracking-widest text-center hover:border-white/30 hover:text-white transition-colors uppercase flex items-center justify-center gap-1.5"
              >
                VIEW FULL DETAILS <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
