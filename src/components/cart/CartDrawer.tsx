'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, RotateCcw, Truck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice, BRAND } from '@/lib/design-tokens';

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, cartTotal, products } = useStore();

  const freeShippingLeft = Math.max(0, BRAND.freeShippingThreshold - cartTotal);
  const progressPercent = Math.min(100, (cartTotal / BRAND.freeShippingThreshold) * 100);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0c0c0c]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-mega text-snake-green uppercase">
                  ATELIER BAG
                </span>
                <h3 className="text-xl font-display font-bold uppercase tracking-tight text-white">
                  YOUR SELECTION ({cart.length})
                </h3>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="p-4 bg-neutral-950/80 border-b border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-300">
                  {freeShippingLeft === 0 ? (
                    <span className="text-snake-green font-semibold">✓ FREE SHIPPING UNLOCKED</span>
                  ) : (
                    <>Add <span className="text-white font-bold">{formatPrice(freeShippingLeft)}</span> for free shipping</>
                  )}
                </span>
                <span className="text-neutral-500">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-snake-green"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-16 h-16 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-600">
                    <span className="text-2xl font-mono">0</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-sm uppercase text-neutral-300">YOUR BAG IS EMPTY</p>
                    <p className="text-xs font-mono text-neutral-600">No garments currently reserved.</p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="px-6 py-3 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white transition-colors mt-2"
                  >
                    EXPLORE COLLECTION
                  </Link>
                </div>
              ) : (
                cart.map((item) => {
                  const matched = products.find((p) => p.id === item.product?.id || p.slug === item.product?.slug);
                  const imgUrl = item.product?.images?.[0]?.url || matched?.images?.[0]?.url || '';
                  return (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-6 border-b border-white/5 last:border-0 group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-24 bg-neutral-900 flex-shrink-0 overflow-hidden rounded border border-white/5 flex items-center justify-center">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          unoptimized={Boolean(imgUrl.startsWith('data:') || imgUrl.startsWith('blob:'))}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-[9px] font-mono text-neutral-600 uppercase">NO IMG</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-mono tracking-wider font-semibold text-white uppercase">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-neutral-400">
                          <span>{item.selectedColor.name}</span>
                          <span>/</span>
                          <span className="text-white font-medium">{item.selectedSize}</span>
                        </div>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center border border-white/10 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 py-1 text-neutral-400 hover:text-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 font-mono text-xs text-white min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 py-1 text-neutral-400 hover:text-white transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="font-mono text-xs text-white font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            </div>

            {/* Footer Summary & Checkout CTA */}
            {cart.length > 0 && (
              <div className="p-5 sm:p-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] bg-[#0c0c0c] border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center text-xs font-mono tracking-wider">
                  <span className="text-neutral-400">SUBTOTAL</span>
                  <span className="text-white font-semibold text-sm">{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500">
                  Taxes & shipping calculated at checkout
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/bag"
                    onClick={closeCart}
                    className="py-3.5 sm:py-3 px-4 border border-white/20 text-center font-mono text-xs tracking-widest text-neutral-200 hover:text-white hover:border-white active:scale-95 transition-all uppercase"
                  >
                    VIEW BAG
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="py-3.5 sm:py-3 px-4 bg-snake-green text-black text-center font-mono text-xs tracking-widest font-bold hover:bg-white active:scale-95 transition-all uppercase flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(4,252,33,0.3)]"
                  >
                    CHECKOUT <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center text-[9px] font-mono text-neutral-400">
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck size={14} className="text-snake-green" />
                    <span>SECURE CHECKOUT</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck size={14} className="text-snake-green" />
                    <span>QUALITY CHECK</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Truck size={14} className="text-snake-green" />
                    <span>EXPRESS DELIVERY</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
