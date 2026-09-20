'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, RotateCcw, Truck, Tag } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice, BRAND } from '@/lib/design-tokens';

export default function BagPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, isLoaded, products } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'INSTINCT10') {
      const discount = Math.round(cartTotal * 0.1);
      setCouponDiscount(discount);
      setCouponMessage({ text: '10% INSTINCT DISCOUNT APPLIED', type: 'success' });
    } else if (code === 'SNAKE20') {
      const discount = Math.round(cartTotal * 0.2);
      setCouponDiscount(discount);
      setCouponMessage({ text: '20% VIP MEMBERSHIP DISCOUNT APPLIED', type: 'success' });
    } else {
      setCouponDiscount(0);
      setCouponMessage({ text: 'INVALID OR EXPIRED PROMO CODE', type: 'error' });
    }
  };

  const finalTotal = Math.max(0, cartTotal - couponDiscount);
  const freeShippingLeft = Math.max(0, BRAND.freeShippingThreshold - cartTotal);

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-b border-white/10 pb-8 flex justify-between items-end">
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-mega text-snake-green uppercase">
              SELECTED GARMENTS
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight text-white">
              YOUR BAG
            </h1>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </div>

        {!isLoaded ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className="w-8 h-8 border-2 border-snake-green border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-neutral-500">LOADING YOUR SELECTION...</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-600">
              <span className="text-2xl font-mono">0</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-2xl tracking-wider text-white">YOUR BAG IS WAITING.</h3>
              <p className="text-xs font-mono text-neutral-500">Find something worth wearing.</p>
            </div>
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white transition-colors flex items-center gap-2 mt-4"
            >
              SHOP T-SHIRTS <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Bag Items */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free shipping alert */}
              <div className="p-4 bg-neutral-950 border border-white/10 rounded flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-300">
                  {freeShippingLeft === 0 ? (
                    <span className="text-snake-green font-semibold">✓ FREE SHIPPING UNLOCKED</span>
                  ) : (
                    <>Add <span className="text-white font-bold">{formatPrice(freeShippingLeft)}</span> more for free shipping.</>
                  )}
                </span>
                <span className="text-neutral-500 hidden sm:inline">STANDARD: 2–4 DAYS</span>
              </div>

              {/* Items Table */}
              <div className="divide-y divide-white/10 border-y border-white/10">
                {cart.map((item) => {
                  const matched = products.find((p) => p.id === item.product?.id || p.slug === item.product?.slug);
                  const imgUrl = item.product?.images?.[0]?.url || matched?.images?.[0]?.url || '';
                  return (
                    <div key={item.id} className="py-6 flex gap-6 items-center">
                      {/* Image */}
                      <div className="relative w-24 h-28 sm:w-28 sm:h-32 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={item.product.name}
                            fill
                            sizes="120px"
                            unoptimized={Boolean(imgUrl.startsWith('data:') || imgUrl.startsWith('blob:'))}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-600 uppercase">NO IMAGE</span>
                        )}
                      </div>

                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="text-sm font-mono font-semibold tracking-wider text-white hover:text-snake-green uppercase"
                          >
                            {item.product.name}
                          </Link>
                          <div className="text-xs font-mono text-neutral-400 mt-1 flex items-center gap-3">
                            <span>COLOR: <strong className="text-white">{item.selectedColor.name}</strong></span>
                            <span>•</span>
                            <span>SIZE: <strong className="text-white">{item.selectedSize}</strong></span>
                            <span>•</span>
                            <span>{item.product.gsm} GSM</span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex justify-between items-center pt-3">
                        <div className="flex items-center border border-white/20 rounded bg-neutral-950">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-3 py-1.5 text-neutral-400 hover:text-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 font-mono text-xs text-white min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-3 py-1.5 text-neutral-400 hover:text-white transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-sm font-semibold text-white">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[10px] font-mono text-neutral-500">
                              ({formatPrice(item.price)} each)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 bg-[#0d0d0d] border border-white/10 rounded-lg p-6 sm:p-8 space-y-6 lg:sticky lg:top-28">
              <h3 className="text-sm font-mono tracking-widest font-semibold text-white uppercase border-b border-white/10 pb-4">
                ORDER SUMMARY
              </h3>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-1.5">
                  <Tag size={12} className="text-snake-green" />
                  <span>PROMO CODE / GIFT VOUCHER</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Try: INSTINCT10"
                    className="flex-1 bg-black border border-white/15 px-3 py-2 text-xs font-mono text-white uppercase focus:outline-none focus:border-snake-green"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-800 hover:bg-white hover:text-black text-white font-mono text-xs uppercase tracking-wider transition-colors"
                  >
                    APPLY
                  </button>
                </div>
                {couponMessage && (
                  <p
                    className={`text-[10px] font-mono ${
                      couponMessage.type === 'success' ? 'text-snake-green' : 'text-red-400'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </form>

              {/* Calculations */}
              <div className="space-y-3 pt-2 text-xs font-mono border-t border-white/10">
                <div className="flex justify-between text-neutral-400">
                  <span>SUBTOTAL</span>
                  <span className="text-white">{formatPrice(cartTotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-snake-green">
                    <span>PROMO DISCOUNT</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-400">
                  <span>SHIPPING</span>
                  <span className="text-white">
                    {freeShippingLeft === 0 ? 'FREE' : formatPrice(150)}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-semibold text-white pt-3 border-t border-white/10">
                  <span>ESTIMATED TOTAL</span>
                  <span className="text-base text-snake-green">
                    {formatPrice(finalTotal + (freeShippingLeft === 0 ? 0 : 150))}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold hover:bg-white transition-all duration-300 uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(4,252,33,0.3)]"
              >
                PROCEED TO CHECKOUT <ArrowRight size={14} />
              </Link>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-white/5 space-y-3 text-[11px] font-mono text-neutral-400">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-snake-green flex-shrink-0" />
                  <span>Encrypted 256-Bit SSL Checkout</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-snake-green flex-shrink-0" />
                  <span>Atelier Quality Check &amp; Defect Protection</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="text-snake-green flex-shrink-0" />
                  <span>Tracked delivery through our authorised courier partners</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
