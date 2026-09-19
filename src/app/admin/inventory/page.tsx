'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { AlertTriangle, CheckCircle, Plus, Minus, Search, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/design-tokens';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
  price: number;
}

export default function AdminInventoryPage() {
  const { products } = useStore();
  // Flatten all variants from products
  const initialItems: InventoryItem[] = products.flatMap((p) =>
    p.variants.map((v) => ({
      id: v.id,
      productName: p.name,
      sku: v.sku,
      color: v.colorName,
      size: v.size,
      stock: v.stock,
      price: v.price,
    }))
  );

  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');

  const updateStock = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item
      )
    );
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.color.toLowerCase().includes(search.toLowerCase());

    if (filterStatus === 'low') return matchesSearch && item.stock > 0 && item.stock <= 10;
    if (filterStatus === 'out') return matchesSearch && item.stock === 0;
    return matchesSearch;
  });

  const lowStockCount = items.filter((i) => i.stock > 0 && i.stock <= 10).length;
  const outOfStockCount = items.filter((i) => i.stock === 0).length;

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
            VARIANT-LEVEL INVENTORY
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time stock matrices across colors, sizes, and atelier production runs.
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-300">
            TOTAL SKUS: <strong className="text-white">{items.length}</strong>
          </span>
          <span className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 font-bold">
            LOW STOCK: {lowStockCount}
          </span>
          <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-red-400 font-bold">
            OUT OF STOCK: {outOfStockCount}
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, garment, or color..."
            className="w-full bg-[#0d0d0d] border border-neutral-800 rounded px-3 py-2 pl-9 text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'low', 'out'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded uppercase transition-colors ${
                filterStatus === st
                  ? 'bg-snake-green text-black font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {st === 'all' ? 'ALL STOCK' : st === 'low' ? 'LOW (<10)' : 'OUT OF STOCK (0)'}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">SKU REFERENCE</th>
              <th className="py-3 px-4">GARMENT NAME</th>
              <th className="py-3 px-4">COLOR</th>
              <th className="py-3 px-4">SIZE</th>
              <th className="py-3 px-4">UNIT PRICE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-right">STOCK ADJUSTMENT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {filtered.map((item) => {
              const isLow = item.stock > 0 && item.stock <= 10;
              const isOut = item.stock === 0;

              return (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-bold">{item.sku}</td>
                  <td className="py-3 px-4 text-neutral-200 uppercase">{item.productName}</td>
                  <td className="py-3 px-4 text-neutral-400">{item.color}</td>
                  <td className="py-3 px-4 text-white font-bold">{item.size}</td>
                  <td className="py-3 px-4 text-neutral-300">{formatPrice(item.price)}</td>

                  <td className="py-3 px-4">
                    {isOut ? (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded text-[9px] font-bold uppercase flex items-center gap-1 w-fit">
                        <AlertTriangle size={10} /> OUT OF STOCK
                      </span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded text-[9px] font-bold uppercase flex items-center gap-1 w-fit">
                        <AlertTriangle size={10} /> LOW ({item.stock})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 rounded text-[9px] font-bold uppercase flex items-center gap-1 w-fit">
                        <CheckCircle size={10} /> IN STOCK ({item.stock})
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2 border border-neutral-800 rounded bg-black px-2 py-1">
                      <button
                        onClick={() => updateStock(item.id, -1)}
                        className="text-neutral-400 hover:text-white px-1"
                        aria-label="Decrease stock"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-white min-w-[28px] text-center">
                        {item.stock}
                      </span>
                      <button
                        onClick={() => updateStock(item.id, 1)}
                        className="text-neutral-400 hover:text-white px-1"
                        aria-label="Increase stock"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
