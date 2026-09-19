'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Clock, MapPin, Package, ArrowRight } from 'lucide-react';
import { BRAND } from '@/lib/design-tokens';

export default function ShippingPage() {
  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
            LOGISTICS PROTOCOL
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            SHIPPING & TRANSIT
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-400">
            Engineered dispatches from our Bengaluru atelier to your doorstep via Blue Dart Air Express.
          </p>
        </div>

        {/* Shipping Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-snake-green uppercase tracking-widest">
                STANDARD COMPLIMENTARY
              </span>
              <Truck size={18} className="text-snake-green" />
            </div>
            <h3 className="text-2xl font-display font-medium text-white">FREE EXPRESS</h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Applicable to all orders totaling ₹1,999 or greater. Dispatched via priority air cargo with full transit tracking.
            </p>
            <div className="pt-2 text-xs font-mono text-neutral-300">
              Transit: <span className="text-white font-semibold">2–4 Business Days</span>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                BELOW THRESHOLD
              </span>
              <Package size={18} className="text-neutral-500" />
            </div>
            <h3 className="text-2xl font-display font-medium text-white">₹99 FLAT LOGISTICS</h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              For single-item or orders below ₹1,999. Includes high-durability matte black packaging and door-to-door insurance.
            </p>
            <div className="pt-2 text-xs font-mono text-neutral-300">
              Transit: <span className="text-white font-semibold">2–4 Business Days</span>
            </div>
          </div>
        </div>

        {/* Delivery Zones Table */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-6">
          <h3 className="text-lg font-display font-medium text-white uppercase tracking-wider">
            DOMESTIC ESTIMATED TRANSIT TIMES
          </h3>
          <div className="divide-y divide-white/5 text-xs font-mono">
            <div className="py-3 flex justify-between items-center">
              <span className="text-neutral-300">Bengaluru & Karnataka</span>
              <span className="text-snake-green font-semibold">1–2 Business Days</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-neutral-300">Tier-1 Metros (Mumbai, Delhi NCR, Hyderabad, Chennai)</span>
              <span className="text-white font-medium">2–3 Business Days</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-neutral-300">Tier-2 Cities & State Capitals</span>
              <span className="text-white font-medium">3–4 Business Days</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-neutral-300">Northeast, Jammu & Kashmir, Remote Outposts</span>
              <span className="text-neutral-400">4–6 Business Days</span>
            </div>
          </div>
        </div>

        {/* Packaging & Inspection Standards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <ShieldCheck size={18} className="text-snake-green" />
            <h4 className="text-sm font-display font-medium text-white">REINFORCED PACKAGING</h4>
            <p className="text-neutral-400 leading-relaxed">
              Every SuperSnake piece is vacuum-sealed in recyclable matte black protective pouches to prevent moisture and transit friction.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <Clock size={18} className="text-snake-green" />
            <h4 className="text-sm font-display font-medium text-white">SAME-DAY DISPATCH</h4>
            <p className="text-neutral-400 leading-relaxed">
              Orders placed before 2:00 PM IST on business days are tailored, inspected, and handed to Blue Dart on the same calendar day.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <MapPin size={18} className="text-snake-green" />
            <h4 className="text-sm font-display font-medium text-white">AIR EXPRESS PARTNERSHIP</h4>
            <p className="text-neutral-400 leading-relaxed">
              Exclusively routed via Blue Dart and DTDC Premium Air to minimize road transit shock and ensure reliable tracking scans.
            </p>
          </div>
        </div>

        {/* Tracking Callout */}
        <div className="border border-white/15 p-8 text-center space-y-4 bg-gradient-to-b from-neutral-900/50 to-black">
          <h3 className="text-xl font-display font-medium text-white">HAVE AN ACTIVE ORDER NUMBER?</h3>
          <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto">
            Input your order number and phone to view live courier milestones and estimated delivery hours.
          </p>
          <div className="pt-2">
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              <span>TRACK YOUR ORDER</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
