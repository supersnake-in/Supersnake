'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Trash2, Check, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Product, Size, Gender, FitType } from '@/lib/types';
import { sanitizeString } from '@/lib/security';

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const { products, updateProduct, deleteProduct } = useStore();

  const product = products.find((p) => p.id === productId);

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(1499);
  const [mrp, setMrp] = useState<number>(2499);
  const [gsm, setGsm] = useState<number>(280);
  const [fit, setFit] = useState<FitType>('Boxy');
  const [gender, setGender] = useState<Gender>('unisex');
  const [fabric, setFabric] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setTagline(product.tagline || '');
      setDescription(product.description || '');
      setPrice(product.price);
      setMrp(product.mrp);
      setGsm(product.gsm);
      setFit(product.fit);
      setGender(product.gender);
      setFabric(product.fabric || '');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="space-y-4 text-center py-20">
        <h2 className="text-xl font-display font-medium text-white">GARMENT NOT FOUND</h2>
        <p className="text-xs font-mono text-neutral-400">ID: {productId}</p>
        <Link
          href="/admin/products"
          className="inline-block px-6 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-wider font-semibold"
        >
          BACK TO CATALOG
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Product = {
      ...product,
      name: sanitizeString(name),
      tagline: sanitizeString(tagline),
      description: sanitizeString(description),
      price,
      mrp,
      gsm,
      fit,
      gender,
      fabric: sanitizeString(fabric),
    };

    updateProduct(updated);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push('/admin/products');
    }, 1200);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteProduct(product.id);
      router.push('/admin/products');
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO CATALOG</span>
        </Link>
        <button
          onClick={handleDelete}
          className="text-xs font-mono text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <Trash2 size={13} />
          <span>DELETE PRODUCT</span>
        </button>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
          SKU: {product.slug.toUpperCase()}
        </span>
        <h1 className="text-2xl md:text-3xl font-display font-medium uppercase text-white">
          EDIT: {product.name}
        </h1>
      </div>

      {saved && (
        <div className="p-4 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
          <Check size={16} />
          <span>Product updated and synced to catalog. Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
              Garment Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green resize-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
              Price (INR ₹)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
              MRP (INR ₹)
            </label>
            <input
              type="number"
              value={mrp}
              onChange={(e) => setMrp(Number(e.target.value))}
              required
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
              GSM Density
            </label>
            <input
              type="number"
              value={gsm}
              onChange={(e) => setGsm(Number(e.target.value))}
              required
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
              Cut
            </label>
            <select
              value={fit}
              onChange={(e) => setFit(e.target.value as FitType)}
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            >
              <option value="Boxy">Boxy</option>
              <option value="Oversized">Oversized</option>
              <option value="Relaxed">Relaxed</option>
              <option value="Classic">Classic</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 border border-white/20 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white"
          >
            CANCEL
          </Link>
          <button
            type="submit"
            className="px-8 py-2.5 bg-snake-green hover:bg-white text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            SAVE CHANGES
          </button>
        </div>
      </form>
    </div>
  );
}
