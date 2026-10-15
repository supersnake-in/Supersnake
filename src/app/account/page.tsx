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
  Shield,
  ShoppingBag,
  Crown,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/design-tokens';

export default function AccountOverviewPage() {
  const { orders, wishlist } = useStore();
  const { profile, user, isAdmin, isSuperAdmin, isCoAdmin } = useAuth();

  const recentOrder = orders[0];
  const activeOrders = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Refunded'
  );

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Patron';

  return (
    <div className="space-y-8">
      {/* Co-Admin Clearance Banner */}
      {isCoAdmin && (
        <div className="bg-gradient-to-r from-amber-500/15 via-[#0d0d0d] to-[#0a0a0a] border-2 border-amber-500/40 p-6 md:p-8 rounded-sm relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold rounded uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>CO-ADMIN ATELIER ACCESS GRANTED</span>
              </div>
              <h3 className="text-xl md:text-2xl font-display font-medium text-white tracking-tight">
                CATALOG & ORDERS MANAGEMENT CLEARANCE
              </h3>
              <p className="text-xs font-mono text-neutral-300 max-w-xl leading-relaxed">
                You have active Co-Admin privileges. You can create & edit products, manage inventory stock levels, curate collections, and fulfill customer orders.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-neutral-300 rounded border border-white/10">
                  ✓ Products
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-neutral-300 rounded border border-white/10">
                  ✓ Collections
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-neutral-300 rounded border border-white/10">
                  ✓ Inventory
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-neutral-300 rounded border border-white/10">
                  ✓ Orders
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
              <Link
                href="/admin/products"
                className="px-6 py-3.5 bg-amber-400 hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                <span>OPEN CO-ADMIN ATELIER</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/admin/orders"
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 text-center"
              >
                <ShoppingBag size={13} />
                <span>VIEW ATELIER ORDERS</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Superadmin / Executive Admin Access Banner */}
      {isAdmin && !isCoAdmin && (
        <div className="bg-gradient-to-r from-snake-green/15 via-[#0d0d0d] to-[#0a0a0a] border border-snake-green/40 p-5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(4,252,33,0.1)]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-snake-green tracking-widest uppercase">
              <Crown size={13} />
              <span>{isSuperAdmin ? 'SUPERADMIN EXECUTIVE CLEARANCE' : 'ADMIN ATELIER CLEARANCE'}</span>
            </div>
            <h3 className="text-base font-display font-medium text-white">
              MASTER ATELIER ADMINISTRATION SYSTEM
            </h3>
          </div>
          <Link
            href={isSuperAdmin ? '/admin/superadmin' : '/admin'}
            className="px-5 py-2.5 bg-snake-green hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2"
          >
            <span>ENTER ATELIER ADMIN</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

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
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="block text-neutral-500">ORDER NO.</span>
                <p className="text-white font-medium">{recentOrder.orderNumber}</p>
              </div>
              <div className="space-y-1">
                <span className="block text-neutral-500">PLACED ON</span>
                <p className="text-white">
                  {new Date(recentOrder.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <span className="block text-neutral-500">TOTAL</span>
                <p className="text-snake-green font-semibold">
                  {formatPrice(recentOrder.total)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="block text-neutral-500">STATUS</span>
                <div className="pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-snake-green/10 text-snake-green border border-snake-green/30 text-[10px] uppercase font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-snake-green animate-pulse" />
                    <span>{recentOrder.status}</span>
                  </span>
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
                  href={`/track-order?ref=${encodeURIComponent(recentOrder.orderNumber)}`}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          href="/track-order"
          className="p-5 bg-[#0a0a0a] border border-snake-green/30 hover:border-snake-green transition-colors group space-y-2 rounded-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-snake-green/5 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-snake-green uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <Truck size={12} />
              <span>LIVE TRACKING</span>
            </span>
            <ArrowRight size={14} className="text-snake-green group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-sm font-display font-medium text-white">TRACK SHIPMENT</h4>
          <p className="text-[11px] font-mono text-neutral-400">
            Real-time courier telemetry, waypoint timeline, and dispatch scheduling.
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
