'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatPrice } from '@/lib/design-tokens';
import { useStore } from '@/lib/store';
import { PRODUCTS } from '@/lib/data/products';

export default function AdminDashboardPage() {
  const { orders } = useStore();

  const metrics = [
    { label: 'Total Revenue', value: '₹3,42,850', change: '+18.4%', isPositive: true, subtext: 'vs last month' },
    { label: 'Atelier Orders', value: '218', change: '+12.1%', isPositive: true, subtext: 'vs last month' },
    { label: 'Active Customers', value: '184', change: '+24.8%', isPositive: true, subtext: 'verified accounts' },
    { label: 'Units Sold', value: '312', change: '+15.2%', isPositive: true, subtext: '280+ GSM tees' },
    { label: 'Avg Order Value (AOV)', value: '₹1,572', change: '+5.5%', isPositive: true, subtext: 'per transaction' },
  ];

  const topSellers = [
    { name: 'THE SIGNATURE TEE', units: 142, revenue: '₹2,12,858', stock: '86% in stock' },
    { name: 'THE SERPENT TEE', units: 88, revenue: '₹1,67,112', stock: '45% in stock' },
    { name: 'THE MONOLITH OVERSIZED', units: 54, revenue: '₹97,146', stock: '32% in stock' },
    { name: 'THE VENOM EDITION', units: 28, revenue: '₹55,972', stock: '12% in stock (LOW)' },
  ];

  return (
    <div className="space-y-8 font-mono">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase tracking-tight text-white">
            COMMERCE DASHBOARD
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time analytics for SuperSnake India atelier operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-snake-green text-black text-xs font-bold uppercase tracking-wider rounded hover:bg-white transition-colors"
          >
            + ADD PRODUCT
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 border border-neutral-800 text-neutral-300 hover:text-white text-xs uppercase tracking-wider rounded transition-colors"
          >
            VIEW ORDERS
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="p-5 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-2"
          >
            <span className="text-[11px] tracking-wider text-neutral-400 uppercase block">
              {m.label}
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white tracking-tight">{m.value}</span>
              <span
                className={`text-xs font-bold flex items-center gap-0.5 ${
                  m.isPositive ? 'text-snake-green' : 'text-red-400'
                }`}
              >
                {m.change}
                {m.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 block">{m.subtext}</span>
          </div>
        ))}
      </div>

      {/* Analytics Visual Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue Trend Bar Chart Simulation */}
        <div className="lg:col-span-8 p-6 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                REVENUE VELOCITY (LAST 14 DAYS)
              </h3>
              <p className="text-[11px] text-neutral-500">Gross sales performance in INR (₹)</p>
            </div>
            <span className="text-xs text-snake-green font-bold">AVG ₹24,489 / DAY</span>
          </div>

          {/* Bar Chart Simulation */}
          <div className="h-48 flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-neutral-800">
            {[45, 60, 52, 78, 65, 85, 92, 70, 88, 95, 110, 105, 120, 135].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full bg-neutral-800 group-hover:bg-snake-green rounded-t transition-all relative"
                  style={{ height: `${height}%` }}
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1.5 py-0.5 border border-white/20 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 text-white">
                    ₹{(height * 280).toLocaleString()}
                  </span>
                </div>
                <span className="text-[9px] text-neutral-600">D{i + 1}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[11px] text-neutral-400 pt-1">
            <span>START: SEP 06</span>
            <span className="text-white font-semibold">TODAY: SEP 19 (PEAK: ₹37,800)</span>
          </div>
        </div>

        {/* Right: Men vs Women & Size Breakdowns */}
        <div className="lg:col-span-4 p-6 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              DEMOGRAPHIC SPLIT
            </h3>
            <p className="text-[11px] text-neutral-500">Sales volume by collection</p>
          </div>

          {/* Men vs Women Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">MEN&apos;S HEAVYWEIGHT (58%)</span>
              <span className="text-snake-green">WOMEN&apos;S CROPPED (42%)</span>
            </div>
            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden flex">
              <div className="w-[58%] bg-white h-full" />
              <div className="w-[42%] bg-snake-green h-full" />
            </div>
          </div>

          {/* Size Distribution */}
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <h4 className="text-xs text-neutral-400 uppercase tracking-wider">SIZE DISTRIBUTION</h4>
            <div className="space-y-2 text-xs">
              {[
                { size: 'L (Large)', pct: '38%', bar: 'w-[38%]' },
                { size: 'M (Medium)', pct: '32%', bar: 'w-[32%]' },
                { size: 'XL (Extra Large)', pct: '18%', bar: 'w-[18%]' },
                { size: 'S (Small)', pct: '8%', bar: 'w-[8%]' },
                { size: 'XXL (Double Extra Large)', pct: '4%', bar: 'w-[4%]' },
              ].map((s) => (
                <div key={s.size} className="space-y-1">
                  <div className="flex justify-between text-[11px] text-neutral-300">
                    <span>{s.size}</span>
                    <span className="font-semibold text-white">{s.pct}</span>
                  </div>
                  <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-snake-green ${s.bar}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing T-Shirts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top T-shirts */}
        <div className="lg:col-span-6 p-6 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              TOP PERFORMING GARMENTS
            </h3>
            <Link href="/admin/products" className="text-xs text-snake-green hover:underline">
              ALL PRODUCTS →
            </Link>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {topSellers.map((item, idx) => (
              <div key={item.name} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-white block uppercase">
                    0{idx + 1}. {item.name}
                  </span>
                  <span className="text-[11px] text-neutral-500">{item.stock}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold block">{item.revenue}</span>
                  <span className="text-[11px] text-snake-green">{item.units} units sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-6 p-6 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              RECENT ATELIER ORDERS
            </h3>
            <Link href="/admin/orders" className="text-xs text-snake-green hover:underline">
              MANAGE ALL →
            </Link>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {orders.map((ord) => (
              <div key={ord.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{ord.orderNumber}</span>
                    <span className="px-1.5 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 rounded text-[9px] uppercase font-bold">
                      {ord.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    {ord.customer.name} • {ord.items.length} garments
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold block">{formatPrice(ord.total)}</span>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
