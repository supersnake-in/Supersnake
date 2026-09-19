'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Truck, Package, Check, Printer, Clock, MapPin, Mail, Phone, CreditCard } from 'lucide-react';
import { useStore } from '@/lib/store';
import { OrderStatus } from '@/lib/types';
import { formatPrice } from '@/lib/design-tokens';

const STATUS_OPTIONS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
  'Refunded',
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const { orders } = useStore();

  const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  const [status, setStatus] = useState<OrderStatus>(order?.status || 'Confirmed');
  const [carrier, setCarrier] = useState(order?.tracking?.carrier || 'Blue Dart Air Express');
  const [waybill, setWaybill] = useState(order?.tracking?.trackingNumber || '');
  const [saved, setSaved] = useState(false);

  if (!order) {
    return (
      <div className="space-y-4 text-center py-20 font-sans">
        <h2 className="text-xl font-display font-medium text-white">ORDER NOT FOUND</h2>
        <p className="text-xs font-mono text-neutral-400">ID: {orderId}</p>
        <Link
          href="/admin/orders"
          className="inline-block px-6 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-wider font-semibold"
        >
          BACK TO ORDERS
        </Link>
      </div>
    );
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (order.tracking) {
      order.tracking.carrier = carrier;
      order.tracking.trackingNumber = waybill;
    }
    order.status = status;
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO ORDERS</span>
        </Link>

        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 bg-[#121212] hover:bg-white hover:text-black border border-white/10 text-white rounded text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
        >
          <Printer size={13} />
          <span>PRINT INVOICE</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
            FULFILLMENT RECORD
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-medium uppercase text-white">
            {order.orderNumber}
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            Placed {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block">SETTLED TOTAL</span>
          <span className="text-2xl font-display font-medium text-snake-green">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
          <Check size={16} />
          <span>Order fulfillment status & tracking updated.</span>
        </div>
      )}

      {/* Dispatch Controls Card */}
      <form onSubmit={handleUpdate} className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-6">
        <h3 className="text-xs font-mono text-snake-green uppercase tracking-wider border-b border-white/5 pb-2">
          DISPATCH & LOGISTICS CONTROL
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
              Pipeline Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
              Courier Carrier
            </label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
              Waybill / Tracking No.
            </label>
            <input
              type="text"
              value={waybill}
              onChange={(e) => setWaybill(e.target.value)}
              placeholder="e.g. BD-883910291"
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            UPDATE DISPATCH
          </button>
        </div>
      </form>

      {/* Two Column Layout: Customer & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Items */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-4">
          <h3 className="text-sm font-display font-medium text-white border-b border-white/10 pb-3 uppercase tracking-wider">
            GARMENTS ({order.items.length})
          </h3>
          <div className="divide-y divide-white/5">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-18 bg-neutral-900 border border-white/10 shrink-0 overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-medium text-white">
                      {item.productName}
                    </h4>
                    <p className="text-xs font-mono text-neutral-400 mt-1">
                      {item.color} • SIZE {item.size} • QTY {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono text-sm text-white">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer & Address */}
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider border-b border-white/10 pb-2">
              PATRON PROFILE
            </h3>
            <div className="space-y-1.5 text-xs font-mono">
              <p className="text-white font-medium text-sm font-display">{order.customer.name}</p>
              <p className="text-neutral-400 flex items-center gap-2">
                <Mail size={13} /> {order.customer.email}
              </p>
              <p className="text-neutral-400 flex items-center gap-2">
                <Phone size={13} /> {order.customer.phone}
              </p>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider border-b border-white/10 pb-2">
              SHIPPING DESTINATION
            </h3>
            <div className="text-xs font-mono text-neutral-300 space-y-1">
              <p className="text-white font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              {order.shippingAddress.landmark && <p>{order.shippingAddress.landmark}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
