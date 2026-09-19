'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, RotateCcw, Truck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice, BRAND } from '@/lib/design-tokens';

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, cartTotal } = useStore();

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
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 flex flex-col shadow-2xl text-neutral-200"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs tracking-widest text-snake-green font-semibold uppercase">
                  ADDED TO BAG ✓
                </span>
                <span className="text-neutral-500 font-mono text-xs">({cart.length})</span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-neutral-400 hover:text-white transition-colors focus:outline-none active:scale-95"
                aria-label="Close Bag"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="px-6 py-3.5 bg-[#111111] border-b border-white/5">
              <div className="flex justify-between items-center text-[11px] font-mono tracking-wider mb-1.5">
                <span className="text-neutral-300">
                  {freeShippingLeft === 0 ? (
                    <span className="text-snake-green font-semibold">FREE EXPRESS SHIPPING UNLOCKED</span>
                  ) : (
                    <>Add <span className="text-white font-semibold">{formatPrice(freeShippingLeft)}</span> for complimentary delivery</>
                  )}
                </span>
              </div>
              <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-snake-green"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                  <div className="w-16 h-16 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-600">
                    <X size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-lg tracking-wider text-white">YOUR BAG IS WAITING.</p>
                    <p className="text-xs font-mono text-neutral-500">Find something worth wearing.</p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-snake-green hover:underline uppercase pt-2"
                  >
                    SHOP T-SHIRTS <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-6 border-b border-white/5 last:border-0 group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-24 bg-neutral-900 flex-shrink-0 overflow-hidden rounded border border-white/5">
                      <Image
                        src={item.product.images[0]?.url || ''}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
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
                ))
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
                    <RotateCcw size={14} className="text-snake-green" />
                    <span>7-DAY RETURNS</span>
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
