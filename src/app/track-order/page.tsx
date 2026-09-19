'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, Search, ArrowRight, Package, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { OrderStatus, Order } from '@/lib/types';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

export default function TrackOrderPage() {
  const { orders } = useStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    const cleanNum = orderNumber.trim().toLowerCase();
    const cleanId = identifier.trim().toLowerCase();

    const match = orders.find((o) => {
      const numMatch =
        o.orderNumber.toLowerCase() === cleanNum || o.id.toLowerCase() === cleanNum;
      const idMatch =
        !cleanId ||
        o.customer.email.toLowerCase() === cleanId ||
        o.customer.phone.replace(/\s+/g, '').includes(cleanId.replace(/\s+/g, ''));
      return numMatch && idMatch;
    });

    setFoundOrder(match || null);
  };

  const statusSteps: OrderStatus[] = [
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
            LOGISTICS RADAR
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            TRACK YOUR SHIPMENT
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-400 max-w-lg mx-auto">
            Real-time status direct from our Bengaluru fulfillment center and air express courier.
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-[#0a0a0a] border border-white/10 p-5 md:p-8 rounded-sm">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                  placeholder="e.g. SS-2026-1049"
                  className="w-full min-h-[48px] bg-[#121212] border border-white/15 px-4 py-3 text-base sm:text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. patron@supersnake.in"
                  className="w-full min-h-[48px] bg-[#121212] border border-white/15 px-4 py-3 text-base sm:text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 group mt-2"
            >
              <span>TRACK SHIPMENT</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && (
          foundOrder ? (
            <div className="bg-[#0a0a0a] border border-white/10 p-5 md:p-8 rounded-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
                    LIVE STATUS
                  </span>
                  <h3 className="text-xl font-display font-medium text-white">
                    ORDER {foundOrder.orderNumber}
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    Carrier: {foundOrder.tracking?.carrier || 'Blue Dart Air Express'}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono text-neutral-500 block uppercase">
                    ESTIMATED ARRIVAL
                  </span>
                  <span className="text-lg font-display font-medium text-snake-green">
                    {foundOrder.tracking?.estimatedDelivery || 'Within 2–4 Business Days'}
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 py-2">
                {/* Desktop / Tablet Horizontal Timeline (sm+) */}
                <div className="hidden sm:grid sm:grid-cols-6 gap-2">
                  {statusSteps.map((step, idx) => {
                    const currentIdx = statusSteps.indexOf(foundOrder.status);
                    const isPast = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;
                    return (
                      <div key={step} className="space-y-2 text-center">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            isPast ? 'bg-snake-green' : 'bg-white/10'
                          }`}
                        />
                        <span
                          className={`text-[9px] font-mono uppercase block ${
                            isCurrent
                              ? 'text-snake-green font-bold'
                              : isPast
                              ? 'text-white'
                              : 'text-neutral-600'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Vertical Timeline (< sm) */}
                <div className="sm:hidden space-y-4 py-2 pl-2">
                  {statusSteps.map((step, idx) => {
                    const currentIdx = statusSteps.indexOf(foundOrder.status);
                    const isPast = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;
                    const isLast = idx === statusSteps.length - 1;

                    return (
                      <div key={step} className="flex items-start gap-4 relative">
                        {/* Connecting Line */}
                        {!isLast && (
                          <div
                            className={`absolute left-[9px] top-4 bottom-[-16px] w-[2px] ${
                              currentIdx > idx ? 'bg-snake-green' : 'bg-white/10'
                            }`}
                          />
                        )}

                        {/* Step Dot */}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                            isCurrent
                              ? 'bg-snake-green text-black ring-4 ring-snake-green/20'
                              : isPast
                              ? 'bg-snake-green text-black'
                              : 'bg-[#1a1a1a] border border-white/20 text-neutral-600'
                          }`}
                        >
                          {isPast ? (
                            <CheckCircle2 size={12} className="stroke-[3]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                          )}
                        </div>

                        {/* Step Details */}
                        <div className="flex-1 pb-1">
                          <p
                            className={`text-xs font-mono uppercase tracking-wider ${
                              isCurrent
                                ? 'text-snake-green font-bold'
                                : isPast
                                ? 'text-white font-medium'
                                : 'text-neutral-500'
                            }`}
                          >
                            {step}
                          </p>
                          {isCurrent && (
                            <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                              Current stage • Updated in real-time
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Waybill info */}
              <div className="p-4 bg-[#121212] border border-white/5 rounded-sm flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-neutral-400">Waybill / Airbill: </span>
                  <span className="text-white font-medium">
                    {foundOrder.tracking?.trackingNumber || 'Pending Courier Scan'}
                  </span>
                </div>
                <Link
                  href={`/account/orders/${foundOrder.id}`}
                  className="text-snake-green hover:underline text-[11px] uppercase"
                >
                  FULL RECEIPT →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm text-center space-y-4">
              <AlertCircle size={32} className="mx-auto text-neutral-500" />
              <h3 className="text-base font-display font-medium text-white">
                NO SHIPMENT LOCATED
              </h3>
              <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto leading-relaxed">
                We could not find an active shipment for order &quot;{orderNumber}&quot;. Please verify the order number on your confirmation email or contact our atelier concierge.
              </p>
              <Link
                href="/contact"
                className="inline-block mt-2 px-5 py-2.5 border border-white/20 hover:border-snake-green hover:text-snake-green text-white font-mono text-xs uppercase tracking-wider transition-colors"
              >
                CONTACT SUPPORT
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}
