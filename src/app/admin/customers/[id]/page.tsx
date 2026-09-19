'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Package, CreditCard, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = decodeURIComponent((params?.id as string) || '');
  const { orders } = useStore();

  // Find customer by email or customer id
  const customerOrders = orders.filter(
    (o) =>
      o.customer.email.toLowerCase() === customerId.toLowerCase() ||
      o.customer.name.toLowerCase().replace(/\s+/g, '-') === customerId.toLowerCase()
  );

  const customer = customerOrders[0]?.customer || {
    name: customerId.replace('-', ' '),
    email: customerId.includes('@') ? customerId : `${customerId}@example.com`,
    phone: 'Not provided',
  };

  const totalSpent = customerOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const averageOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO PATRONS</span>
        </Link>
        <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
          CLIENT INTELLIGENCE
        </span>
      </div>

      {/* Patron Header */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-white/20 flex items-center justify-center text-xl font-display font-bold text-snake-green">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-display font-medium uppercase text-white">
                {customer.name}
              </h1>
              <p className="text-xs font-mono text-neutral-400 flex items-center gap-3">
                <span className="flex items-center gap-1"><Mail size={12} /> {customer.email}</span>
                {customer.phone && <span className="flex items-center gap-1"><Phone size={12} /> {customer.phone}</span>}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">LIFETIME VALUE (LTV)</span>
            <span className="text-2xl font-display font-medium text-snake-green">
              {formatPrice(totalSpent)}
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs font-mono">
          <div>
            <span className="text-neutral-500 uppercase text-[10px]">TOTAL ACQUISITIONS</span>
            <p className="text-white text-base font-semibold">{customerOrders.length}</p>
          </div>
          <div>
            <span className="text-neutral-500 uppercase text-[10px]">AVERAGE BASKET</span>
            <p className="text-white text-base font-semibold">{formatPrice(averageOrderValue)}</p>
          </div>
          <div>
            <span className="text-neutral-500 uppercase text-[10px]">PATRON CLASSIFICATION</span>
            <p className="text-snake-green text-base font-semibold">
              {totalSpent >= 5000 ? 'VIP TIER' : 'ATELIER PATRON'}
            </p>
          </div>
        </div>
      </div>

      {/* Orders Placed by this Customer */}
      <div className="space-y-4">
        <h3 className="text-sm font-display font-medium text-white uppercase tracking-wider">
          ACQUISITION ARCHIVE ({customerOrders.length})
        </h3>

        {customerOrders.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-8 text-center text-xs font-mono text-neutral-500">
            No orders found for this patron.
          </div>
        ) : (
          <div className="space-y-3">
            {customerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm flex items-center justify-between gap-4 text-xs font-mono hover:border-white/20 transition-colors"
              >
                <div>
                  <span className="text-white font-medium">{order.orderNumber}</span>
                  <p className="text-neutral-500 text-[11px]">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')} • {order.items.length} garments
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-snake-green font-semibold">
                    {formatPrice(order.total)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300 text-[10px] uppercase">
                    {order.status}
                  </span>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-neutral-400 hover:text-white"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
