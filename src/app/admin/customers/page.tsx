'use client';

import React from 'react';
import { formatPrice } from '@/lib/design-tokens';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export default function AdminCustomersPage() {
  const customers = [
    {
      id: 'cust-101',
      name: 'Aditya Sharma',
      email: 'aditya.sharma@example.com',
      phone: '+91 98765 43210',
      location: 'Bengaluru, Karnataka',
      ordersCount: 4,
      totalSpent: 6496,
      tier: 'VIP INSTINCT',
      joined: '2026-06-12',
    },
    {
      id: 'cust-102',
      name: 'Rohan Mehra',
      email: 'rohan.m@example.com',
      phone: '+91 98112 34567',
      location: 'Mumbai, Maharashtra',
      ordersCount: 2,
      totalSpent: 3398,
      tier: 'MEMBER',
      joined: '2026-07-04',
    },
    {
      id: 'cust-103',
      name: 'Ananya Roy',
      email: 'ananya.roy@example.com',
      phone: '+91 98450 98765',
      location: 'New Delhi, NCR',
      ordersCount: 5,
      totalSpent: 8795,
      tier: 'VIP INSTINCT',
      joined: '2026-05-18',
    },
    {
      id: 'cust-104',
      name: 'Vikram Sengupta',
      email: 'vikram.s@example.com',
      phone: '+91 97411 22334',
      location: 'Kolkata, West Bengal',
      ordersCount: 1,
      totalSpent: 1899,
      tier: 'MEMBER',
      joined: '2026-08-22',
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
          CLIENT DIRECTORY
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Registered patrons, VIP instinct tier status, and acquisition history.
        </p>
      </div>

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
              <th className="py-3 px-4">JOINED</th>
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
    </div>
  );
}
