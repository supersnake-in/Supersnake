'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowRight, Search, FileText, ExternalLink } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';
import { OrderStatus } from '@/lib/types';

export default function AccountOrdersPage() {
  const { orders } = useStore();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'RETURNED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (filter === 'ACTIVE') {
      if (['Delivered', 'Cancelled', 'Returned', 'Refunded'].includes(order.status)) return false;
    } else if (filter === 'DELIVERED') {
      if (order.status !== 'Delivered') return false;
    } else if (filter === 'RETURNED') {
      if (!['Returned', 'Refunded'].includes(order.status)) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesNum = order.orderNumber.toLowerCase().includes(q);
      const matchesItem = order.items.some((i) => i.productName.toLowerCase().includes(q));
      return matchesNum || matchesItem;
    }

    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Cancelled':
      case 'Returned':
      case 'Refunded':
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-snake-green/10 text-snake-green border-snake-green/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
            ARCHIVE
          </span>
          <h2 className="text-xl md:text-2xl font-display font-medium text-white">
            ORDER HISTORY ({orders.length})
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-white/10 p-1 rounded text-[10px] font-mono">
          {(['ALL', 'ACTIVE', 'DELIVERED', 'RETURNED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded transition-colors ${
                filter === tab
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      {orders.length > 0 && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number (SS-2026-...) or garment name..."
            className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2.5 pl-10 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/10 p-12 text-center space-y-4 rounded-sm">
          <Package size={28} className="mx-auto text-neutral-600" />
          <h3 className="text-base font-display text-white font-medium">NO MATCHING ACQUISITIONS</h3>
          <p className="text-xs font-mono text-neutral-500 max-w-sm mx-auto">
            {orders.length === 0
              ? 'You have not placed any orders yet. Every SuperSnake piece is crafted in limited runs.'
              : 'No orders match your current filter criteria.'}
          </p>
          {orders.length === 0 && (
            <Link
              href="/shop"
              className="inline-block mt-2 px-6 py-3 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              BROWSE COLLECTION
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-[#0a0a0a] border border-white/10 p-5 md:p-6 rounded-sm space-y-5 hover:border-white/20 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-neutral-500">ORDER NUMBER</span>
                  <p className="text-white font-medium">{order.orderNumber}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500">DATE</span>
                  <p className="text-neutral-300">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500">AMOUNT</span>
                  <p className="text-white font-semibold">
                    {formatPrice(order.total)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500">STATUS</span>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] uppercase font-semibold ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{order.status}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 bg-neutral-900 border border-white/10 shrink-0 overflow-hidden">
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
                        <p className="text-[10px] font-mono text-neutral-400">
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

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <span className="text-neutral-500 text-[11px]">
                  {order.tracking ? `Carrier: ${order.tracking.carrier}` : 'Pre-dispatch processing'}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="px-4 py-2 bg-white/5 hover:bg-white hover:text-black border border-white/10 text-white rounded text-[11px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <span>VIEW ORDER</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
