'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Layers,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '@/lib/design-tokens';
import { useStore } from '@/lib/store';

export default function AdminDashboardPage() {
  const { orders, products } = useStore();
  const signatureProduct = products.find((p) => p.isSignature);

  // Dynamic metrics derived directly from real live orders
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = orders.length;
  const uniqueCustomers = new Set(orders.map((o) => o.customer?.email).filter(Boolean)).size;
  const totalUnitsSold = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((s, i) => s + (i.quantity || 1), 0),
    0
  );
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const metrics = [
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      change: totalOrders > 0 ? 'Live Sync' : 'No Sales Yet',
      isPositive: totalRevenue > 0,
      subtext: `${totalOrders} orders processed`,
    },
    {
      label: 'Atelier Orders',
      value: totalOrders.toString(),
      change: totalOrders > 0 ? `${totalOrders} total` : '0',
      isPositive: totalOrders > 0,
      subtext: 'verified transactions',
    },
    {
      label: 'Active Customers',
      value: uniqueCustomers.toString(),
      change: uniqueCustomers > 0 ? `${uniqueCustomers} patrons` : '0',
      isPositive: uniqueCustomers > 0,
      subtext: 'unique buyer accounts',
    },
    {
      label: 'Units Sold',
      value: totalUnitsSold.toString(),
      change: totalUnitsSold > 0 ? `${totalUnitsSold} units` : '0',
      isPositive: totalUnitsSold > 0,
      subtext: 'heavyweight tees',
    },
    {
      label: 'Avg Order Value (AOV)',
      value: formatPrice(avgOrderValue),
      change: avgOrderValue > 0 ? 'Dynamic' : '₹0',
      isPositive: avgOrderValue > 0,
      subtext: 'per transaction',
    },
  ];

  // Dynamic 14-Day Velocity derived from real order dates
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const dailyRevenueMap: Record<string, number> = {};
  const dailyOrdersCountMap: Record<string, number> = {};
  last14Days.forEach((day) => {
    dailyRevenueMap[day] = 0;
    dailyOrdersCountMap[day] = 0;
  });

  orders.forEach((o) => {
    const orderTotal = Number(o.total) || 0;
    const rawStr = String(o.createdAt || '');

    let matchedDay: string | undefined;

    try {
      const d = new Date(rawStr);
      if (!isNaN(d.getTime())) {
        const localKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const utcKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

        if (dailyRevenueMap[localKey] !== undefined) {
          matchedDay = localKey;
        } else if (dailyRevenueMap[utcKey] !== undefined) {
          matchedDay = utcKey;
        }
      }
    } catch {}

    if (!matchedDay) {
      const directKey = rawStr.slice(0, 10);
      if (dailyRevenueMap[directKey] !== undefined) {
        matchedDay = directKey;
      }
    }

    if (matchedDay) {
      dailyRevenueMap[matchedDay] += orderTotal;
      dailyOrdersCountMap[matchedDay] += 1;
    }
  });

  const fourteenDayRevenue = Object.values(dailyRevenueMap).reduce((sum, v) => sum + v, 0);
  const maxDailyRevenue = Math.max(...Object.values(dailyRevenueMap), 1);
  const avgDailyRevenue = Math.round(fourteenDayRevenue / 14);

  // Dynamic Demographic Split from catalog
  const menCount = products.filter((p) => p.gender === 'men' || p.gender === 'unisex').length;
  const womenCount = products.filter((p) => p.gender === 'women' || p.gender === 'unisex').length;
  const totalCatalogGenders = Math.max(menCount + womenCount, 1);
  const menPct = Math.round((menCount / totalCatalogGenders) * 100);
  const womenPct = 100 - menPct;

  // Dynamic Size Distribution from live product inventory
  const sizeStockMap: Record<string, number> = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  products.forEach((p) => {
    (p.variants || []).forEach((v) => {
      if (sizeStockMap[v.size] !== undefined) {
        sizeStockMap[v.size] += v.stock || 0;
      }
    });
  });
  const totalStock = Math.max(Object.values(sizeStockMap).reduce((a, b) => a + b, 0), 1);

  // Dynamic Top Garments (from orders if available, otherwise from live product catalog)
  const productSalesMap: Record<string, { units: number; revenue: number; stock: string }> = {};
  products.forEach((p) => {
    const totalPStock = (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
    productSalesMap[p.name] = {
      units: 0,
      revenue: 0,
      stock: totalPStock > 0 ? `${totalPStock} units in stock` : 'Out of stock',
    };
  });

  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      if (productSalesMap[item.productName]) {
        productSalesMap[item.productName].units += item.quantity || 1;
        productSalesMap[item.productName].revenue += (item.price || 0) * (item.quantity || 1);
      }
    });
  });

  const topGarments = Object.entries(productSalesMap)
    .sort((a, b) => b[1].revenue - a[1].revenue || b[1].units - a[1].units)
    .slice(0, 5);

  return (
    <div className="space-y-8 font-mono">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase tracking-tight text-white">
            COMMERCE DASHBOARD
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time live analytics for SuperSnake India atelier operations.
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
                  m.isPositive ? 'text-snake-green' : 'text-neutral-500'
                }`}
              >
                {m.change}
                {m.isPositive && <ArrowUpRight size={12} />}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 block">{m.subtext}</span>
          </div>
        ))}
      </div>

      {/* Analytics Visual Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue Velocity */}
        <div className="lg:col-span-8 p-6 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                REVENUE VELOCITY (LAST 14 DAYS)
              </h3>
              <p className="text-[11px] text-neutral-500">Gross sales performance in INR (₹)</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">
                14-Day: <span className="text-white font-bold">{formatPrice(fourteenDayRevenue)}</span>
              </span>
              <span className="text-xs text-snake-green font-bold bg-snake-green/10 border border-snake-green/20 px-2 py-0.5 rounded">
                AVG {formatPrice(avgDailyRevenue)} / DAY
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-48 flex flex-col justify-end pt-2 pb-2 border-b border-neutral-800">
            {/* Bars Area (dedicated explicit height so percentage heights calculate accurately) */}
            <div className="h-36 w-full flex items-end gap-1 sm:gap-2">
              {last14Days.map((day) => {
                const rev = dailyRevenueMap[day] || 0;
                const orderCount = dailyOrdersCountMap[day] || 0;
                const heightPct = maxDailyRevenue > 0 && rev > 0 ? Math.max(Math.round((rev / maxDailyRevenue) * 100), 10) : 0;
                const dateObj = new Date(day);
                const dayLabel = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                const weekday = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });

                return (
                  <div key={day} className="flex-1 h-full flex flex-col items-center justify-end group relative cursor-pointer">
                    {/* Hover Floating Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black border border-neutral-700/80 px-2.5 py-1.5 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-30 flex flex-col items-center text-center">
                      <span className="text-[10px] font-bold text-snake-green">{formatPrice(rev)}</span>
                      <span className="text-[9px] text-neutral-300">
                        {weekday}, {dayLabel} • {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                      </span>
                    </div>

                    {/* Bar Track & Fill */}
                    <div className="w-full flex-1 flex items-end justify-center">
                      <div
                        className={`w-full max-w-[26px] rounded-t transition-all duration-300 ${
                          rev > 0
                            ? 'bg-snake-green hover:bg-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                            : 'bg-neutral-800/80 group-hover:bg-neutral-700 h-[3px]'
                        }`}
                        style={rev > 0 ? { height: `${heightPct}%` } : undefined}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="w-full flex items-center gap-1 sm:gap-2 pt-2.5">
              {last14Days.map((day) => {
                const d = new Date(day);
                const dayNum = d.getDate();
                const hasRev = (dailyRevenueMap[day] || 0) > 0;
                return (
                  <div key={day} className="flex-1 text-center">
                    <span
                      className={`text-[9px] block transition-colors ${
                        hasRev ? 'text-snake-green font-bold' : 'text-neutral-500'
                      }`}
                    >
                      {dayNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-neutral-400 pt-1">
            <span>
              WINDOW: {last14Days[0]} → {last14Days[13]}
            </span>
            <span className="text-white font-semibold">
              LIFETIME SALES: {formatPrice(totalRevenue)} ({totalOrders} orders)
            </span>
          </div>
        </div>

        {/* Right: Demographic Split & Size Distribution */}
        <div className="lg:col-span-4 p-6 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              CATALOG DISTRIBUTION
            </h3>
            <p className="text-[11px] text-neutral-500">Live proportion by gender collection</p>
          </div>

          {/* Men vs Women Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">MEN&apos;S SILHOUETTES ({menPct}%)</span>
              <span className="text-snake-green">WOMEN&apos;S ({womenPct}%)</span>
            </div>
            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden flex">
              <div className="bg-white h-full transition-all" style={{ width: `${menPct}%` }} />
              <div className="bg-snake-green h-full transition-all" style={{ width: `${womenPct}%` }} />
            </div>
          </div>

          {/* Size Distribution */}
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <h4 className="text-xs text-neutral-400 uppercase tracking-wider">LIVE INVENTORY BY SIZE</h4>
            <div className="space-y-2 text-xs">
              {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                const stock = sizeStockMap[sz] || 0;
                const pct = Math.round((stock / totalStock) * 100);
                return (
                  <div key={sz} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-300">
                      <span>SIZE {sz}</span>
                      <span className="font-semibold text-white">
                        {stock} units ({pct}%)
                      </span>
                    </div>
                    <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-snake-green transition-all"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CURRENT SIGNATURE PRODUCT WIDGET */}
      {signatureProduct && (
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-[#0d0d0d] to-[#0d0d0d] border border-amber-500/30 rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                CURRENT SIGNATURE PRODUCT (HOMEPAGE SPOTLIGHT)
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-400 border border-amber-400/40 uppercase tracking-wider self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> LIVE ON SECTION 05
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-20 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-neutral-800">
                <Image
                  src={signatureProduct.images[0]?.url || ''}
                  alt={signatureProduct.name}
                  fill
                  sizes="80px"
                  unoptimized={Boolean(signatureProduct.images[0]?.url?.startsWith('data:') || signatureProduct.images[0]?.url?.startsWith('blob:'))}
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-white uppercase tracking-tight">
                    {signatureProduct.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded font-mono uppercase">
                    {signatureProduct.fit} FIT
                  </span>
                </div>
                <p className="text-xs text-neutral-400 max-w-xl line-clamp-2">
                  {signatureProduct.description}
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs">
                  <span className="font-bold text-white">{formatPrice(signatureProduct.price)}</span>
                  <span className="text-neutral-500 line-through text-[11px]">{formatPrice(signatureProduct.mrp)}</span>
                  <span className="text-snake-green font-bold">{signatureProduct.gsm} GSM</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center flex-shrink-0">
              <Link
                href={`/product/${signatureProduct.slug}`}
                target="_blank"
                className="px-4 py-2 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <span>VIEW STOREFRONT</span>
                <ArrowUpRight size={13} />
              </Link>
              <Link
                href="/admin/products"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded text-xs uppercase tracking-wider transition-colors shadow-[0_0_12px_rgba(251,191,36,0.25)]"
              >
                SWITCH SIGNATURE →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Top Performing Garments & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top T-shirts */}
        <div className="lg:col-span-6 p-6 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              CATALOG PERFORMANCE
            </h3>
            <Link href="/admin/products" className="text-xs text-snake-green hover:underline">
              ALL PRODUCTS ({products.length}) →
            </Link>
          </div>

          {topGarments.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-xs">
              No products found in atelier catalog.
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/60">
              {topGarments.map(([name, data], idx) => (
                <div key={name} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white block uppercase">
                      0{idx + 1}. {name}
                    </span>
                    <span className="text-[11px] text-neutral-500">{data.stock}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold block">
                      {data.revenue > 0 ? formatPrice(data.revenue) : '—'}
                    </span>
                    <span className="text-[11px] text-snake-green">
                      {data.units > 0 ? `${data.units} units sold` : 'Active on site'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-6 p-6 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              RECENT ATELIER ORDERS
            </h3>
            <Link href="/admin/orders" className="text-xs text-snake-green hover:underline">
              MANAGE ALL ({orders.length}) →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <Inbox size={28} className="text-neutral-600" />
              <p className="text-xs text-neutral-400 font-bold uppercase">NO ATELIER ORDERS YET</p>
              <p className="text-[11px] text-neutral-600 max-w-xs">
                When customers complete checkout on SUPERSNAKE.IN, live transactions will stream here in real time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/60">
              {orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{ord.orderNumber}</span>
                      <span className="px-1.5 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 rounded text-[9px] uppercase font-bold">
                        {ord.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">
                      {ord.customer?.name || 'Customer'} • {(ord.items || []).length} garments
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
          )}
        </div>
      </div>
    </div>
  );
}
