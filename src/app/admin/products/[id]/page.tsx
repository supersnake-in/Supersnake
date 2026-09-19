'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Trash2, Check, AlertCircle, Upload, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Product, Size, Gender, FitType } from '@/lib/types';
import { sanitizeString, isValidImageSource } from '@/lib/security';
import { compressImage } from '@/lib/image-compression';

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
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; alt: string; angle: 'front' | 'model' | 'fabric' | 'back' | 'detail' | 'studio' | 'side' }[]
  >([]);
  const [externalImageUrl, setExternalImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
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
      if (product.images && product.images.length > 0) {
        setUploadedImages(
          product.images.map((img) => ({
            url: img.url,
            alt: img.alt || `${product.name} view`,
            angle: (img.angle as any) || 'front',
          }))
        );
      }
    }
  }, [product]);

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
      images: uploadedImages.map((img, idx) => ({
        url: img.url,
        alt: `${name} view ${idx + 1}`,
        angle: img.angle,
        isPrimary: idx === 0,
      })),
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

        {/* Photography */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs font-mono text-snake-green uppercase tracking-wider">
              EDITORIAL PHOTOGRAPHY ({uploadedImages.length})
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
