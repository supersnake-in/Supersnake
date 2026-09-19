'use client';

import React from 'react';
import Link from 'next/link';
import { FolderKanban, Plus, ArrowUpRight } from 'lucide-react';

export default function AdminCollectionsPage() {
  const collections = [
    {
      name: 'UNISEX CAPSULE',
      slug: 'unisex',
      itemsCount: 5,
      status: 'PUBLISHED',
      heroGsm: '280 GSM SUPIMA',
    },
    {
      name: 'THE MONOLITH ARCHIVE',
      slug: 'the-monolith-archive',
      itemsCount: 8,
      status: 'PUBLISHED',
      heroGsm: '280–300 GSM',
    },
    {
      name: 'AUTUMN DROP 01',
      slug: 'autumn-drop-01',
      itemsCount: 4,
      status: 'PUBLISHED',
      heroGsm: '260 GSM',
    },
    {
      name: 'WOMEN’S CROPPED SERIES',
      slug: 'womens-cropped-series',
      itemsCount: 3,
      status: 'PUBLISHED',
      heroGsm: '240 GSM',
    },
    {
      name: 'WINTER CAPSULE (DRAFT)',
      slug: 'winter-capsule',
      itemsCount: 2,
      status: 'DRAFT',
      heroGsm: '320 GSM HEAVY LOOPBACK',
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
            CAMPAIGN & DROP COLLECTIONS
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Organize garments into curated seasonal releases.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((c) => (
          <div
            key={c.slug}
            className="p-6 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-4 hover:border-neutral-700 transition-colors"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-white uppercase">{c.name}</h3>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  c.status === 'PUBLISHED'
                    ? 'bg-snake-green/10 text-snake-green border border-snake-green/30'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {c.status}
              </span>
            </div>

            <div className="space-y-1 text-xs text-neutral-400">
              <p>Path: <code className="text-neutral-300">/collection/{c.slug}</code></p>
              <p>Garments: <strong className="text-white">{c.itemsCount} styles</strong></p>
              <p>Fabric Focus: <strong className="text-white">{c.heroGsm}</strong></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
