'use client';

import React, { useState } from 'react';
import { Tag, Plus, Check, Copy } from 'lucide-react';
import { formatPrice } from '@/lib/design-tokens';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([
    {
      code: 'INSTINCT10',
      discount: '10% OFF',
      minOrder: 1499,
      uses: 142,
      status: 'ACTIVE',
      expires: '2026-12-31',
    },
    {
      code: 'SNAKE20',
      discount: '20% OFF',
      minOrder: 2999,
      uses: 58,
      status: 'ACTIVE',
      expires: '2026-10-31',
    },
    {
      code: 'ATELIERFREE',
      discount: 'FREE SHIPPING',
      minOrder: 999,
      uses: 320,
      status: 'ACTIVE',
      expires: '2026-12-31',
    },
  ]);

  return (
    <div className="space-y-6 font-mono">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
            PROMOTIONS & VOUCHERS
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage promotional codes, VIP discounts, and minimum thresholds.
          </p>
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">PROMO CODE</th>
              <th className="py-3 px-4">BENEFIT</th>
              <th className="py-3 px-4">MIN ORDER</th>
              <th className="py-3 px-4">REDEMPTIONS</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4">EXPIRY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {coupons.map((c) => (
              <tr key={c.code} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 font-bold text-snake-green">{c.code}</td>
                <td className="py-3 px-4 text-white font-bold">{c.discount}</td>
                <td className="py-3 px-4 text-neutral-300">{formatPrice(c.minOrder)}</td>
                <td className="py-3 px-4 text-neutral-300">{c.uses} times</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 rounded text-[9px] font-bold uppercase">
                    {c.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-neutral-500">{c.expires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
