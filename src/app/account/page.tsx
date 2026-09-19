'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Heart,
  MapPin,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/design-tokens';

export default function AccountOverviewPage() {
  const { orders, wishlist } = useStore();
  const { profile, user } = useAuth();

  const recentOrder = orders[0];
  const activeOrders = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Refunded'
  );

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Patron';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-snake-green/5 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] font-mono text-snake-green rounded">
            <Sparkles size={12} />
            <span>ATELIER STATUS: ACTIVE</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
            WELCOME BACK, {displayName.toUpperCase()}.
          </h2>
          <p className="text-xs font-mono text-neutral-400 max-w-xl leading-relaxed">
            Manage your acquisitions, track live dispatches, and curate your private wishlist for upcoming heavyweight drops.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono uppercase tracking-widest">TOTAL ACQUISITIONS</span>
            <Package size={16} className="text-neutral-400" />
          </div>
          <p className="text-2xl md:text-3xl font-display font-medium text-white">
            {orders.length}
          </p>
          <p className="text-[10px] font-mono text-neutral-500">
            {activeOrders.length} active in transit
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono uppercase tracking-widest">SAVED PIECES</span>
            <Heart size={16} className="text-neutral-400" />
          </div>
          <p className="text-2xl md:text-3xl font-display font-medium text-white">
            {wishlist.length}
          </p>
          <Link
            href="/account/wishlist"
            className="text-[10px] font-mono text-snake-green hover:underline flex items-center gap-1"
          >
            <span>View wishlist</span>
            <ArrowRight size={10} />
          </Link>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono uppercase tracking-widest">PREFERRED FIT</span>
            <Sparkles size={16} className="text-neutral-400" />
          </div>
          <p className="text-2xl md:text-3xl font-display font-medium text-white">
            {profile?.preferredFit || 'CLASSIC'}
          </p>
          <p className="text-[10px] font-mono text-neutral-500">
            Size: {profile?.preferredSize || 'M'}
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-mono uppercase tracking-widest">TIER ACCESS</span>
            <MapPin size={16} className="text-neutral-400" />
          </div>
          <p className="text-2xl md:text-3xl font-display font-medium text-snake-green">
            {orders.length > 0 ? 'ATELIER' : 'GUEST'}
          </p>
          <p className="text-[10px] font-mono text-neutral-500">
            Complimentary express
          </p>
        </div>
      </div>

      {/* Recent Order Snapshot */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
              LATEST DISPATCH
            </span>
            <h3 className="text-lg font-display font-medium text-white">
              RECENT ACQUISITION
            </h3>
          </div>
          {recentOrder && (
            <Link
              href={`/account/orders/${recentOrder.id}`}
              className="text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors flex items-center gap-1"
            >
              <span>FULL DETAILS</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {recentOrder ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-neutral-500">ORDER NO.</span>
                <p className="text-white font-medium">{recentOrder.orderNumber}</p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-500">PLACED ON</span>
                <p className="text-white">
                  {new Date(recentOrder.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-500">TOTAL</span>
                <p className="text-snake-green font-semibold">
                  {formatPrice(recentOrder.total)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-500">STATUS</span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-snake-green/10 text-snake-green border border-snake-green/30 text-[10px] uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-snake-green animate-pulse" />
                  <span>{recentOrder.status}</span>
                </div>
              </div>
            </div>

            {/* Items snippet */}
            <div className="divide-y divide-white/5">
              {recentOrder.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-14 bg-neutral-900 overflow-hidden shrink-0 border border-white/10">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-display font-medium text-white">
                        {item.productName}
                      </p>
                      <p className="text-[10px] font-mono text-neutral-500">
                        {item.color} • SIZE {item.size} • QTY {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Tracking Status */}
            {recentOrder.tracking && (
              <div className="p-4 bg-[#121212] border border-white/5 rounded-sm flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <Truck size={16} className="text-snake-green" />
                  <div>
                    <span className="text-white">CARRIER: {recentOrder.tracking.carrier}</span>
                    <p className="text-[10px] text-neutral-500">
                      Tracking #{recentOrder.tracking.trackingNumber} • Est. Arrival {recentOrder.tracking.estimatedDelivery}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/account/orders/${recentOrder.id}`}
                  className="text-[11px] text-snake-green hover:underline uppercase"
                >
                  TRACK LIVE →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center space-y-4">
            <p className="text-base font-display text-white">NO ORDERS ON RECORD</p>
            <p className="text-xs font-mono text-neutral-500 max-w-sm mx-auto">
              Your acquired garments will be archived here with real-time tracking from our Bengaluru atelier.
            </p>
            <Link
              href="/shop"
              className="inline-block mt-2 px-6 py-3 bg-white hover:bg-snake-green text-black font-mono text-xs font-semibold uppercase tracking-widest transition-colors"
            >
              EXPLORE THE COLLECTION
            </Link>
          </div>
        )}
      </div>

      {/* Fast Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="p-5 bg-[#0a0a0a] border border-white/10 hover:border-snake-green/50 transition-colors group space-y-2 rounded-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-snake-green uppercase tracking-widest">
              HISTORY
            </span>
            <ArrowRight size={14} className="text-neutral-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-sm font-display font-medium text-white">ALL ORDERS</h4>
          <p className="text-[11px] font-mono text-neutral-500">
            View full order archives, download tax invoices, or initiate returns.
          </p>
        </Link>

        <Link
          href="/account/addresses"
          className="p-5 bg-[#0a0a0a] border border-white/10 hover:border-snake-green/50 transition-colors group space-y-2 rounded-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-snake-green uppercase tracking-widest">
              LOGISTICS
            </span>
            <ArrowRight size={14} className="text-neutral-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-sm font-display font-medium text-white">ADDRESS BOOK</h4>
          <p className="text-[11px] font-mono text-neutral-500">
            Save delivery addresses for one-click express dispatch.
          </p>
        </Link>

        <Link
          href="/account/preferences"
          className="p-5 bg-[#0a0a0a] border border-white/10 hover:border-snake-green/50 transition-colors group space-y-2 rounded-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-snake-green uppercase tracking-widest">
              CUSTOMIZATION
            </span>
            <ArrowRight size={14} className="text-neutral-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-sm font-display font-medium text-white">FIT PREFERENCES</h4>
          <p className="text-[11px] font-mono text-neutral-500">
            Set your preferred silhouette and size for tailored recommendations.
          </p>
        </Link>
      </div>
    </div>
  );
}
