'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, Plus, X, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Product, Size, Gender, FitType, ProductVariant } from '@/lib/types';
import { sanitizeString, sanitizeSlug, sanitizeNumber, isValidImageSource } from '@/lib/security';
import { compressImage } from '@/lib/image-compression';

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
  const { addProduct, setSignatureProduct } = useStore();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(1499);
  const [mrp, setMrp] = useState<number>(2499);
  const [gsm, setGsm] = useState<number>(280);
  const [fit, setFit] = useState<FitType>('Boxy');
  const [gender, setGender] = useState<Gender>('unisex');
  const [fabric, setFabric] = useState('100% Long-Staple Supima® Cotton (280 GSM Heavyweight)');
  const [isSignatureChoice, setIsSignatureChoice] = useState(false);

  const [selectedSizes, setSelectedSizes] = useState<Size[]>(['S', 'M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Obsidian Black', hex: '#0a0a0a' },
  ]);
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; alt: string; angle: 'front' | 'model' | 'fabric' | 'back' | 'detail' | 'studio' | 'side' }[]
  >([
    {
      url: '/product-fallback.png',
      alt: 'Front View in Studio Lighting',
      angle: 'front',
    },
  ]);
  const [externalImageUrl, setExternalImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const addedImages: { url: string; alt: string; angle: 'front' | 'model' | 'fabric' | 'back' | 'detail' | 'studio' | 'side' }[] = [];

    const fileList = Array.from(files);
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const compressedDataUrl = await compressImage(file);
        if (isValidImageSource(compressedDataUrl)) {
          const totalIdx = uploadedImages.length + addedImages.length;
          const defaultAngle: 'front' | 'model' | 'fabric' | 'back' | 'detail' | 'studio' | 'side' =
            totalIdx === 0 ? 'front' : totalIdx === 1 ? 'model' : totalIdx === 2 ? 'fabric' : totalIdx === 3 ? 'back' : 'detail';
          addedImages.push({
            url: compressedDataUrl,
            alt: `${name || 'Product'} Image ${totalIdx + 1}`,
            angle: defaultAngle,
          });
        }
      } catch (err) {
        console.error('Image compression error:', err);
      }
    }

    if (addedImages.length > 0) {
      setUploadedImages((prev) => [...prev, ...addedImages]);
    } else {
      alert('Could not process selected image(s). Please choose valid JPG, PNG, or WEBP files.');
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddExternalUrl = () => {
    if (!externalImageUrl.trim()) return;
    if (!isValidImageSource(externalImageUrl.trim())) {
      alert('Please enter a valid https:// image URL.');
      return;
    }

    const currentLen = uploadedImages.length;
    const defaultAngle: 'front' | 'model' | 'fabric' | 'back' | 'detail' | 'studio' | 'side' =
      currentLen === 0 ? 'front' : currentLen === 1 ? 'model' : currentLen === 2 ? 'fabric' : 'detail';

    setUploadedImages((prev) => [
      ...prev,
      {
        url: externalImageUrl.trim(),
        alt: `${name || 'Product'} image ${prev.length + 1}`,
        angle: defaultAngle,
      },
    ]);
    setExternalImageUrl('');
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setUploadedImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  const handleMoveImage = (fromIndex: number, direction: 'left' | 'right') => {
    setUploadedImages((prev) => {
      const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[fromIndex];
      next[fromIndex] = next[toIndex];
      next[toIndex] = temp;
      return next;
    });
  };

  const handleUpdateImageAngle = (
    index: number,
    angle: 'front' | 'model' | 'fabric' | 'back' | 'detail' | 'studio' | 'side'
  ) => {
    setUploadedImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, angle } : img))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (isSignatureChoice) {
      await setSignatureProduct(newProduct.id);
    }
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
                className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green cursor-pointer"
              >
                <option value="Boxy">Boxy</option>
                <option value="Oversized">Oversized</option>
                <option value="Relaxed">Relaxed</option>
                <option value="Classic">Classic</option>
                <option value="Slim">Slim</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                Collection / Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green cursor-pointer"
              >
                <option value="unisex">Unisex Collection</option>
                <option value="men">Men Collection</option>
                <option value="women">Women Collection</option>
              </select>
            </div>
          </div>
        </div>

        {/* Imagery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs font-mono text-snake-green uppercase tracking-wider">
              03 / EDITORIAL PHOTOGRAPHY ({uploadedImages.length})
            </h3>
            <span className="text-[10px] text-neutral-400 font-mono">
              Auto-compressed (PNG, JPG, WEBP, AVIF)
            </span>
          </div>

          {/* Compression Progress Notice */}
          {isUploading && (
            <div className="p-3 bg-snake-green/10 border border-snake-green/30 rounded flex items-center justify-center gap-2 text-snake-green text-xs font-mono animate-pulse">
              <span>⏳</span>
              <span>OPTIMIZING & COMPRESSING PHOTOGRAPHY (MAX 1800PX)...</span>
            </div>
          )}

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {uploadedImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative rounded overflow-hidden bg-black border ${
                    idx === 0 ? 'border-snake-green/80 shadow-[0_0_12px_rgba(4,252,33,0.15)]' : 'border-neutral-800'
                  } flex flex-col`}
                >
                  <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden group">
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="180px"
                      unoptimized={Boolean(img.url.startsWith('data:') || img.url.startsWith('blob:'))}
                      className="object-cover"
                    />
                    {/* Badge */}
                    <div
                      className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-mono uppercase font-bold rounded ${
                        idx === 0
                          ? 'bg-snake-green text-black font-bold'
                          : 'bg-black/80 text-white border border-white/10'
                      }`}
                    >
                      {idx === 0 ? 'PRIMARY' : `SHOT ${idx + 1}`}
                    </div>

                    {/* Top-Right Remove Button */}
                    <button
                      type="button"
                      onClick={() => setUploadedImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-red-500 text-white rounded transition-colors"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>

                    {/* Quick Actions Overlay (Reorder / Set Primary) */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-1.5 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, 'left')}
                          className="px-1.5 py-0.5 bg-black/80 hover:bg-neutral-800 disabled:opacity-30 text-white rounded text-[9px] font-mono"
                          title="Move left"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          disabled={idx === uploadedImages.length - 1}
                          onClick={() => handleMoveImage(idx, 'right')}
                          className="px-1.5 py-0.5 bg-black/80 hover:bg-neutral-800 disabled:opacity-30 text-white rounded text-[9px] font-mono"
                          title="Move right"
                        >
                          ▶
                        </button>
                      </div>

                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="px-1.5 py-0.5 bg-snake-green/20 hover:bg-snake-green text-snake-green hover:text-black border border-snake-green/40 rounded text-[9px] font-mono uppercase transition-colors"
                          title="Make primary storefront shot"
                        >
                          ★ Primary
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Angle Selector Bar */}
                  <div className="p-1.5 bg-[#121212] border-t border-neutral-800 flex items-center justify-between gap-1">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase">ANGLE:</span>
                    <select
                      value={img.angle || 'front'}
                      onChange={(e) => handleUpdateImageAngle(idx, e.target.value as any)}
                      className="bg-black border border-neutral-700 text-white text-[10px] font-mono px-1 py-0.5 rounded focus:border-snake-green focus:outline-none"
                    >
                      <option value="front">Front</option>
                      <option value="model">Model</option>
                      <option value="fabric">Fabric</option>
                      <option value="back">Back</option>
                      <option value="detail">Detail</option>
                      <option value="studio">Studio</option>
                      <option value="side">Side</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 border border-dashed border-white/30 hover:border-snake-green rounded flex items-center gap-2 text-neutral-300 hover:text-snake-green transition-colors text-xs font-mono"
            >
              <Upload size={14} />
              <span>UPLOAD PHOTOGRAPHY</span>
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

        {/* Homepage Spotlight Designation */}
        <div className="pt-4 border-t border-white/10">
          <div className="p-4 bg-[#121212] border border-white/10 rounded-sm flex items-center justify-between">
            <div>
              <label htmlFor="signatureToggle" className="text-white font-bold uppercase text-[11px] block cursor-pointer flex items-center gap-1.5 font-mono">
                <Sparkles size={13} className="text-amber-400" />
                SET AS SIGNATURE PRODUCT (HOMEPAGE SPOTLIGHT)
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">
                When checked, this new garment will become the active homepage spotlight (replacing the current signature garment) upon publishing.
              </span>
            </div>
            <input
              id="signatureToggle"
              type="checkbox"
              checked={isSignatureChoice}
              onChange={(e) => setIsSignatureChoice(e.target.checked)}
              className="w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-amber-400 focus:ring-amber-400 focus:ring-offset-0 accent-amber-400 cursor-pointer"
            />
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
