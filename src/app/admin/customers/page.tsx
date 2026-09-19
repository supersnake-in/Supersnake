'use client';

import React, { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';
import { Users, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';

interface Patron {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  ordersCount: number;
  totalSpent: number;
  tier: string;
  joined: string;
}

export default function AdminCustomersPage() {
  const { orders } = useStore();

  // Dynamically derive patrons from real orders
  const customers: Patron[] = useMemo(() => {
    const customerMap = new Map<string, Patron>();

    orders.forEach((o) => {
      const email = o.customer?.email?.trim().toLowerCase();
      if (!email) return;

      const orderTotal = Number(o.total) || 0;
      const orderDate = (o.createdAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
      const city = o.shippingAddress?.city || '';
      const state = o.shippingAddress?.state || '';
      const loc = city && state ? `${city}, ${state}` : city || state || 'India';

      if (customerMap.has(email)) {
        const existing = customerMap.get(email)!;
        existing.ordersCount += 1;
        existing.totalSpent += orderTotal;
        existing.tier = existing.totalSpent >= 5000 ? 'VIP INSTINCT' : 'MEMBER';
        if (orderDate < existing.joined) {
          existing.joined = orderDate;
        }
      } else {
        customerMap.set(email, {
          id: `cust-${email}`,
          name: o.customer?.name || 'Customer',
          email: o.customer?.email || email,
          phone: o.customer?.phone || '—',
          location: loc,
          ordersCount: 1,
          totalSpent: orderTotal,
          tier: orderTotal >= 5000 ? 'VIP INSTINCT' : 'MEMBER',
          joined: orderDate,
        });
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  return (
    <div className="space-y-6 font-mono">
      <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
            CLIENT DIRECTORY
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Live patrons, VIP instinct tier status, and real acquisition history.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-300">
            TOTAL PATRONS: <strong className="text-white">{customers.length}</strong>
          </span>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-16 text-center space-y-3">
          <Users size={36} className="mx-auto text-neutral-600" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            NO REGISTERED PATRONS YET
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Customer profiles, order counts, and lifetime value metrics will dynamically populate here in real time as patrons place orders on SUPERSNAKE.IN.
          </p>
        </div>
      ) : (
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">PATRON</th>
                <th className="py-3 px-4">CONTACT</th>
                <th className="py-3 px-4">LOCATION</th>
                <th className="py-3 px-4">ORDERS</th>
                <th className="py-3 px-4">LIFETIME VALUE</th>
                <th className="py-3 px-4">TIER</th>
                <th className="py-3 px-4">FIRST ORDER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                  <td className="py-3 px-4 text-neutral-400">
                    <span>{c.email}</span>
                    <span className="block text-[10px] text-neutral-500">{c.phone}</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-300">{c.location}</td>
                  <td className="py-3 px-4 text-white font-bold">{c.ordersCount} orders</td>
                  <td className="py-3 px-4 text-snake-green font-bold">{formatPrice(c.totalSpent)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-snake-green/30 text-snake-green rounded text-[9px] font-bold uppercase">
                      {c.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-500">{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
