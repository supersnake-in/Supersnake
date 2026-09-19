'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Package,
  Heart,
  MapPin,
  Shield,
  Clock,
  Truck,
  CheckCircle2,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';
import { OrderStatus } from '@/lib/types';

export default function AccountPage() {
  const { orders, wishlist, removeFromWishlist, addToCart } = useStore();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'wishlist' | 'addresses' | 'profile' | 'security'
  >('orders');

  const statusSteps: OrderStatus[] = [
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const getStepIndex = (status: OrderStatus) => {
    return statusSteps.indexOf(status);
  };

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Account Header */}
        <div className="border-b border-white/10 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-mega text-snake-green uppercase">
              CLIENT PORTAL
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
              MY ACCOUNT
            </h1>
            <p className="text-xs font-mono text-neutral-400">
              Aditya Sharma • aditya.sharma@example.com
            </p>
          </div>

          <Link
            href="/shop"
            className="text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors uppercase flex items-center gap-1"
          >
            CONTINUE SHOPPING <ArrowRight size={13} />
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 pb-2 border-b border-white/10 text-xs font-mono">
          {[
            { id: 'overview', label: 'OVERVIEW', icon: User },
            { id: 'orders', label: `ORDERS (${orders.length})`, icon: Package },
            { id: 'wishlist', label: `WISHLIST (${wishlist.length})`, icon: Heart },
            { id: 'addresses', label: 'ADDRESSES', icon: MapPin },
            { id: 'profile', label: 'PROFILE', icon: User },
            { id: 'security', label: 'SECURITY', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-neutral-900 text-snake-green border border-snake-green/40 font-bold'
                    : 'text-neutral-400 hover:text-white border border-transparent'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Views */}
        <div className="pt-4">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-8">
              {orders.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <p className="font-display text-xl text-white">NO RECENT ACQUISITIONS</p>
                  <p className="text-xs font-mono text-neutral-500">
                    Your order history will appear here once you acquire a SuperSnake garment.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block mt-4 px-6 py-3 bg-snake-green text-black font-mono text-xs font-bold uppercase tracking-widest"
                  >
                    SHOP COLLECTION
                  </Link>
                </div>
              ) : (
                orders.map((order) => {
                  const currentStepIdx = getStepIndex(order.status);
                  return (
                    <div
                      key={order.id}
                      className="bg-[#0c0c0c] border border-white/10 rounded-lg p-6 sm:p-8 space-y-6 text-xs font-mono"
                    >
                      {/* Order Title & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-white font-bold text-sm tracking-wider">
                              {order.orderNumber}
                            </span>
                            <span className="px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 rounded text-[10px] font-bold uppercase">
                              {order.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 mt-1 block">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-neutral-400 text-[11px]">TOTAL AMOUNT</span>
                          <span className="block text-white font-bold text-sm">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>

                      {/* Visual Timeline Tracking */}
                      <div className="py-2 space-y-3">
                        <div className="flex justify-between items-center text-[10px] text-neutral-400 uppercase tracking-widest">
                          <span>LOGISTICS TIMELINE</span>
                          <span className="text-snake-green">
                            EST. ARRIVAL: {order.tracking?.estimatedDelivery || 'In 2–4 Days'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="grid grid-cols-6 gap-1 pt-2">
                          {statusSteps.map((step, idx) => {
                            const isCompleted = idx <= (currentStepIdx >= 0 ? currentStepIdx : 1);
                            const isCurrent = idx === currentStepIdx;
                            return (
                              <div key={step} className="space-y-1.5 text-center">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    isCompleted ? 'bg-snake-green' : 'bg-neutral-800'
                                  } ${isCurrent ? 'shadow-[0_0_8px_rgba(4,252,33,0.8)]' : ''}`}
                                />
                                <span
                                  className={`text-[9px] uppercase tracking-tighter block truncate ${
                                    isCompleted ? 'text-neutral-200' : 'text-neutral-600'
                                  }`}
                                >
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items in Order */}
                      <div className="divide-y divide-white/5 border-t border-white/10 pt-4 space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="pt-3 first:pt-0 flex gap-4 items-center">
                            <div className="relative w-14 h-16 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-white/5">
                              <Image
                                src={item.imageUrl}
                                alt={item.productName}
                                fill
                                sizes="60px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-white uppercase">{item.productName}</p>
                              <p className="text-[11px] text-neutral-400">
                                {item.color} • Size {item.size} • Qty {item.quantity}
                              </p>
                            </div>
                            <span className="font-mono text-xs text-white">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Address & Tracking footer */}
                      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between text-[11px] text-neutral-400 gap-4">
                        <div>
                          <span className="text-white font-semibold block uppercase">SHIPPING ADDRESS:</span>
                          <p>
                            {order.shippingAddress.fullName}, {order.shippingAddress.street},{' '}
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                          </p>
                        </div>
                        <div>
                          <span className="text-white font-semibold block uppercase">COURIER PARTNER:</span>
                          <p>
                            {order.tracking?.carrier || 'Blue Dart Express'} (AWB: {order.tracking?.trackingNumber || 'SS-EXP-2819'})
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              {wishlist.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <p className="font-display text-xl text-white">YOUR WISHLIST IS EMPTY</p>
                  <p className="text-xs font-mono text-neutral-500">Save items while browsing to view them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {wishlist.map(({ product }) => (
                    <div key={product.id} className="bg-[#0c0c0c] border border-white/10 rounded p-4 space-y-3">
                      <div className="relative aspect-[4/5] bg-neutral-900 rounded overflow-hidden">
                        <Image
                          src={product.images[0]?.url || ''}
                          alt={product.name}
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-mono text-xs font-bold uppercase truncate">{product.name}</h4>
                        <p className="font-mono text-xs text-snake-green">{formatPrice(product.price)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            addToCart(product, product.sizes[2] || 'L', product.colors[0]);
                            removeFromWishlist(product.id);
                          }}
                          className="flex-1 py-2 bg-snake-green text-black font-mono text-[10px] font-bold uppercase"
                        >
                          ADD TO BAG
                        </button>
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="px-2 py-2 border border-white/20 text-neutral-400 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* OVERVIEW / PROFILE / ADDRESSES / SECURITY */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
              <div className="p-6 bg-[#0c0c0c] border border-white/10 rounded space-y-3">
                <span className="text-[10px] tracking-widest text-snake-green uppercase">TOTAL ORDERS</span>
                <p className="text-3xl font-bold font-mono text-white">{orders.length}</p>
                <p className="text-neutral-500">Lifetime purchases</p>
              </div>
              <div className="p-6 bg-[#0c0c0c] border border-white/10 rounded space-y-3">
                <span className="text-[10px] tracking-widest text-snake-green uppercase">SAVED FOR LATER</span>
                <p className="text-3xl font-bold font-mono text-white">{wishlist.length}</p>
                <p className="text-neutral-500">Items in private archive</p>
              </div>
              <div className="p-6 bg-[#0c0c0c] border border-white/10 rounded space-y-3">
                <span className="text-[10px] tracking-widest text-snake-green uppercase">TIER STATUS</span>
                <p className="text-xl font-bold font-mono text-white">VIP INSTINCT MEMBER</p>
                <p className="text-neutral-500">Complimentary express shipping active</p>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-[#0c0c0c] border border-snake-green/40 rounded space-y-2 relative">
                  <span className="px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 text-[9px] uppercase font-bold">
                    DEFAULT ADDRESS
                  </span>
                  <h4 className="text-white font-bold text-sm pt-2">Aditya Sharma</h4>
                  <p className="text-neutral-400">
                    Flat 402, Signature Towers, Indiranagar 100ft Rd, Near Metro Station, Bengaluru, Karnataka - 560038
                  </p>
                  <p className="text-neutral-400">Phone: +91 98765 43210</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-xl bg-[#0c0c0c] border border-white/10 rounded p-6 sm:p-8 space-y-4 text-xs font-mono">
              <h3 className="text-sm font-bold uppercase text-white border-b border-white/10 pb-3">
                PERSONAL INFORMATION
              </h3>
              <div className="space-y-1">
                <label className="text-neutral-400 uppercase">FULL NAME</label>
                <input
                  type="text"
                  defaultValue="Aditya Sharma"
                  className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-400 uppercase">EMAIL ADDRESS</label>
                <input
                  type="email"
                  defaultValue="aditya.sharma@example.com"
                  className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-400 uppercase">PHONE NUMBER</label>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded"
                />
              </div>
              <button className="px-6 py-3 bg-snake-green text-black font-bold uppercase mt-2">
                UPDATE PROFILE
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-xl bg-[#0c0c0c] border border-white/10 rounded p-6 sm:p-8 space-y-4 text-xs font-mono">
              <h3 className="text-sm font-bold uppercase text-white border-b border-white/10 pb-3">
                SECURITY & CREDENTIALS
              </h3>
              <div className="space-y-1">
                <label className="text-neutral-400 uppercase">CURRENT PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-400 uppercase">NEW PASSWORD</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded"
                />
              </div>
              <button className="px-6 py-3 bg-snake-green text-black font-bold uppercase mt-2">
                CHANGE PASSWORD
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
