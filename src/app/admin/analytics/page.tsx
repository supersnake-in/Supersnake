'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, ShoppingCart, Percent } from 'lucide-react';
import { formatPrice } from '@/lib/design-tokens';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8 font-mono">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
          ADVANCED STORE ANALYTICS
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Conversion rates, funnel drops, regional demand, and cohort retention.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'CONVERSION RATE', val: '3.82%', change: '+0.6%', sub: 'Shop to Checkout' },
          { label: 'CART ABANDONMENT', val: '24.1%', change: '-3.2%', sub: 'Industry avg: 68%' },
          { label: 'RETURN RATE', val: '1.4%', change: '-0.2%', sub: 'Low due to heavy GSM fit' },
          { label: 'REPEAT PURCHASE', val: '41.6%', change: '+8.4%', sub: 'Within 60 days' },
        ].map((item) => (
          <div key={item.label} className="p-5 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-2">
            <span className="text-[11px] text-neutral-400 uppercase">{item.label}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{item.val}</span>
              <span className="text-xs text-snake-green font-bold">{item.change}</span>
            </div>
            <span className="text-[10px] text-neutral-500 block">{item.sub}</span>
          </div>
        ))}
      </div>

      {/* Regional Demand Heatmap / Table */}
      <div className="p-6 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          GEOGRAPHIC CONCENTRATION (TOP METROS)
        </h3>
        <div className="space-y-3 text-xs">
          {[
            { city: 'Bengaluru (Karnataka)', share: '36%', orders: 78, bar: 'w-[36%]' },
            { city: 'Mumbai & MMR (Maharashtra)', share: '28%', orders: 61, bar: 'w-[28%]' },
            { city: 'Delhi NCR (Delhi, Gurgaon, Noida)', share: '18%', orders: 39, bar: 'w-[18%]' },
            { city: 'Hyderabad (Telangana)', share: '10%', orders: 22, bar: 'w-[10%]' },
            { city: 'Other Tier 1 & 2 Cities', share: '8%', orders: 18, bar: 'w-[8%]' },
          ].map((reg) => (
            <div key={reg.city} className="space-y-1">
              <div className="flex justify-between text-neutral-300">
                <span>{reg.city}</span>
                <span className="text-white font-bold">{reg.share} ({reg.orders} orders)</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className={`h-full bg-snake-green ${reg.bar}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
