'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, ShoppingCart, Percent, MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/design-tokens';
import { useStore } from '@/lib/store';

export default function AdminAnalyticsPage() {
  const { orders } = useStore();

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Repeat Purchase Calculation
  const customerOrderCounts: Record<string, number> = {};
  orders.forEach((o) => {
    const email = o.customer?.email?.toLowerCase();
    if (email) {
      customerOrderCounts[email] = (customerOrderCounts[email] || 0) + 1;
    }
  });
  const totalCustomers = Object.keys(customerOrderCounts).length;
  const repeatCustomers = Object.values(customerOrderCounts).filter((c) => c > 1).length;
  const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

  // Geographic Concentration derived from real orders
  const cityMap: Record<string, number> = {};
  orders.forEach((o) => {
    const city = o.shippingAddress?.city?.trim();
    if (city) {
      cityMap[city] = (cityMap[city] || 0) + 1;
    }
  });

  const cityEntries = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const metrics = [
    {
      label: 'TOTAL REVENUE',
      val: formatPrice(totalRevenue),
      change: totalOrders > 0 ? `${totalOrders} orders` : '₹0',
      sub: 'Lifetime gross revenue',
    },
    {
      label: 'FULFILLMENT RATE',
      val: totalOrders > 0 ? `${Math.round((orders.filter((o) => o.status === 'Delivered').length / totalOrders) * 100)}%` : '—',
      change: `${orders.filter((o) => o.status === 'Delivered').length} delivered`,
      sub: 'Orders successfully delivered',
    },
    {
      label: 'RETURN RATE',
      val: totalOrders > 0 ? `${Math.round((orders.filter((o) => o.status === 'Returned').length / totalOrders) * 100)}%` : '0%',
      change: '0 disputes',
      sub: 'Low due to 280+ GSM fit fidelity',
    },
    {
      label: 'REPEAT PURCHASERS',
      val: `${repeatRate}%`,
      change: `${repeatCustomers} repeat patrons`,
      sub: 'Customers with 2+ purchases',
    },
  ];

  return (
    <div className="space-y-8 font-mono">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
          STORE ANALYTICS
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Live fulfillment rates, repeat purchases, and real geographic demand.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item) => (
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
          GEOGRAPHIC CONCENTRATION
        </h3>

        {cityEntries.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500 space-y-1">
            <p className="font-bold text-neutral-400 uppercase">NO REGIONAL SALES DATA YET</p>
            <p className="text-neutral-600">
              City breakdown will dynamically generate as customers place orders across India.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {cityEntries.map(([city, count]) => {
              const pct = Math.round((count / totalOrders) * 100);
              return (
                <div key={city} className="space-y-1">
                  <div className="flex justify-between text-neutral-300">
                    <span>{city}</span>
                    <span className="text-white font-bold">
                      {pct}% ({count} {count === 1 ? 'order' : 'orders'})
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-snake-green transition-all" style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
