'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, Plus, X, Check, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Product, Size, Gender, FitType, ProductVariant } from '@/lib/types';
import { sanitizeString, sanitizeSlug, sanitizeNumber, isValidImageSource } from '@/lib/security';

const LUXURY_COLOR_PRESETS = [
  { name: 'Obsidian Black', hex: '#0a0a0a' },
  { name: 'Chalk White', hex: '#f2f2f2' },
  { name: 'Washed Charcoal', hex: '#262626' },
  { name: 'Sage Olive', hex: '#3d4a3e' },
  { name: 'Deep Forest', hex: '#112217' },
  { name: 'Bone Ivory', hex: '#e6dfd5' },
];

const ALL_SIZES: Size[] = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL'];

export default function AdminNewProductPage() {
  const router = useRouter();
  const { addProduct } = useStore();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(1499);
  const [mrp, setMrp] = useState<number>(2499);
  const [gsm, setGsm] = useState<number>(280);
  const [fit, setFit] = useState<FitType>('Boxy');
  const [gender, setGender] = useState<Gender>('unisex');
  const [fabric, setFabric] = useState('100% Long-Staple Supima® Cotton (280 GSM Heavyweight)');

  const [selectedSizes, setSelectedSizes] = useState<Size[]>(['S', 'M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Obsidian Black', hex: '#0a0a0a' },
  ]);
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; alt: string; angle: 'front' | 'model' | 'fabric' | 'back' | 'detail' }[]
  >([
    {
      url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1600&auto=format&fit=crop',
      alt: 'Front View in Studio Lighting',
      angle: 'front',
    },
  ]);
  const [externalImageUrl, setExternalImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const base64Url = loadEvt.target?.result as string;
        setUploadedImages((prev) => [
          ...prev,
          { url: base64Url, alt: `${name || 'Product'} image`, angle: 'model' },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddExternalUrl = () => {
    if (!externalImageUrl.trim()) return;
    if (!isValidImageSource(externalImageUrl)) {
      alert('Only https:// or data:image/ URLs are permitted.');
      return;
    }
    setUploadedImages((prev) => [
      ...prev,
      { url: externalImageUrl.trim(), alt: `${name || 'Product'} image`, angle: 'model' },
    ]);
    setExternalImageUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      alert('Please upload or provide at least one product image.');
      return;
    }

    setIsSubmitting(true);
    const cleanName = sanitizeString(name);
    const slug = sanitizeSlug(name);
    const newId = `prod-${Date.now()}`;

    const variants: ProductVariant[] = [];
    selectedColors.forEach((color) => {
      selectedSizes.forEach((sz) => {
        variants.push({
          id: `var-${newId}-${color.name.toLowerCase().replace(/\s+/g, '-')}-${sz}`,
          sku: `SS-${slug.toUpperCase().slice(0, 4)}-${color.name.toUpperCase().slice(0, 3)}-${sz}`,
          colorName: color.name,
          colorHex: color.hex,
          size: sz,
          stock: 50,
          price,
          mrp,
        });
      });
    });

    const newProduct: Product = {
      id: newId,
      name: cleanName,
      slug,
      tagline: sanitizeString(tagline),
      description: sanitizeString(description),
      gender,
      fit,
      price,
      mrp,
      gsm,
      fabric: sanitizeString(fabric),
      careInstructions: [
        'Machine wash cold at 30°C',
        'Wash inside out with similar darks',
        'Do not tumble dry; flat dry in shade',
        'Iron on low heat; avoid print and collar',
      ],
      features: [
        `${gsm} GSM French Terry heavyweight weave`,
        'Reinforced 1x1 ribbed zero-sag collar',
        'Twin-needle bound shoulder and hem construction',
        'Pre-shrunk organic long-staple cotton',
      ],
      images: uploadedImages.map((img, idx) => ({
        ...img,
        isPrimary: idx === 0,
      })),
      colors: selectedColors,
      sizes: selectedSizes,
      variants,
      isNew: true,
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    addProduct(newProduct);
    setTimeout(() => {
      router.push('/admin/products');
    }, 500);
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
        <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
          ADMIN ATELIER
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-display font-medium uppercase text-white">
          CREATE NEW GARMENT
        </h1>
        <p className="text-xs font-mono text-neutral-400">
          Enter technical specifications, GSM benchmarks, color swatches, and high-resolution imagery.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-8">
        {/* Core Attributes */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono text-snake-green uppercase tracking-wider border-b border-white/5 pb-2">
            01 / PRIMARY IDENTIFIERS
          </h3>
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
                placeholder="e.g. MONOLITH HEAVYWEIGHT TEE"
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
                placeholder="e.g. 280 GSM Supima® architectural drape"
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
              placeholder="Detail the cut, fabric tactile response, and presence..."
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green resize-none"
            />
          </div>
        </div>

        {/* Pricing & Fabrication */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono text-snake-green uppercase tracking-wider border-b border-white/5 pb-2">
            02 / PRICING & SPECIFICATIONS
          </h3>
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
                Silhouette Cut
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
                <option value="Slim">Slim</option>
              </select>
            </div>
          </div>
        </div>

        {/* Imagery */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono text-snake-green uppercase tracking-wider border-b border-white/5 pb-2">
            03 / EDITORIAL IMAGERY
          </h3>
          <div className="flex flex-wrap gap-3">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative w-20 h-28 bg-neutral-900 border border-white/15 rounded overflow-hidden group">
                <Image src={img.url} alt={img.alt} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setUploadedImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-28 border border-dashed border-white/20 hover:border-snake-green rounded flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-snake-green transition-colors text-[10px] font-mono"
            >
              <Upload size={16} />
              <span>UPLOAD</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-2 max-w-md pt-1">
            <input
              type="url"
              value={externalImageUrl}
              onChange={(e) => setExternalImageUrl(e.target.value)}
              placeholder="Or paste external image URL..."
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
            <button
              type="button"
              onClick={handleAddExternalUrl}
              className="px-4 py-2 bg-white/10 hover:bg-white hover:text-black text-white text-xs font-mono uppercase tracking-wider transition-colors"
            >
              ADD
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-white/20 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white"
          >
            CANCEL
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-snake-green hover:bg-white text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'SAVING...' : 'PUBLISH GARMENT'}
          </button>
        </div>
      </form>
    </div>
  );
}
