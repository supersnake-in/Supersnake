'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Sparkles,
  Clock,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useStore, DEFAULT_HOMEPAGE_CONFIG } from '@/lib/store';

const CAMPAIGN_PRESETS = [
  {
    title: 'Monolith Editorial',
    url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2400&auto=format&fit=crop',
  },
  {
    title: 'Studio Signature',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=2400&auto=format&fit=crop',
  },
  {
    title: 'Serpent Editorial',
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2400&auto=format&fit=crop',
  },
  {
    title: 'Obsidian Dark',
    url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=2400&auto=format&fit=crop',
  },
  {
    title: 'Atelier Runway',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2400&auto=format&fit=crop',
  },
  {
    title: 'Minimalist Streetwear',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2400&auto=format&fit=crop',
  },
];

export default function AdminHomepageConfigPage() {
  const { homepageConfig, updateHomepageConfig, products } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [heroImages, setHeroImages] = useState<string[]>(
    homepageConfig?.heroImages || DEFAULT_HOMEPAGE_CONFIG.heroImages
  );
  const [heroIntervalSeconds, setHeroIntervalSeconds] = useState<number>(
    homepageConfig?.heroIntervalSeconds || 3
  );
  const [heroHeadline, setHeroHeadline] = useState<string>(
    homepageConfig?.heroHeadline || DEFAULT_HOMEPAGE_CONFIG.heroHeadline
  );
  const [heroSupportingCopy, setHeroSupportingCopy] = useState<string>(
    homepageConfig?.heroSupportingCopy || DEFAULT_HOMEPAGE_CONFIG.heroSupportingCopy
  );
  const [spotlightProductId, setSpotlightProductId] = useState<string>(
    homepageConfig?.spotlightProductId || DEFAULT_HOMEPAGE_CONFIG.spotlightProductId
  );
  const [brandStatement, setBrandStatement] = useState<string>(
    homepageConfig?.brandStatement || DEFAULT_HOMEPAGE_CONFIG.brandStatement
  );

  const [newImageUrl, setNewImageUrl] = useState('');
  const [saved, setSaved] = useState(false);

  // Sync state if store updates from persistence
  useEffect(() => {
    if (homepageConfig) {
      if (homepageConfig.heroImages && homepageConfig.heroImages.length > 0) {
        setHeroImages(homepageConfig.heroImages);
      }
      if (homepageConfig.heroIntervalSeconds) {
        setHeroIntervalSeconds(homepageConfig.heroIntervalSeconds);
      }
      if (homepageConfig.heroHeadline) {
        setHeroHeadline(homepageConfig.heroHeadline);
      }
      if (homepageConfig.heroSupportingCopy) {
        setHeroSupportingCopy(homepageConfig.heroSupportingCopy);
      }
      if (homepageConfig.spotlightProductId) {
        setSpotlightProductId(homepageConfig.spotlightProductId);
      }
      if (homepageConfig.brandStatement) {
        setBrandStatement(homepageConfig.brandStatement);
      }
    }
  }, [homepageConfig]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Only image files (PNG, JPG, WEBP) are supported.');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        alert('Image file size should be less than 8MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setHeroImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Add Image via URL
  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
      alert('Please enter a valid image URL starting with https://');
      return;
    }
    setHeroImages((prev) => [...prev, trimmed]);
    setNewImageUrl('');
  };

  // Reordering
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroImages.length) return;
    const updated = [...heroImages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setHeroImages(updated);
  };

  // Remove
  const removeImage = (index: number) => {
    if (heroImages.length <= 1) {
      if (!confirm('Removing all images will revert to the default hero campaign. Continue?')) {
        return;
      }
    }
    setHeroImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Preset
  const addPreset = (url: string) => {
    if (heroImages.includes(url)) {
      alert('This image is already in your hero campaign.');
      return;
    }
    setHeroImages((prev) => [...prev, url]);
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const finalImages = heroImages.length > 0 ? heroImages : DEFAULT_HOMEPAGE_CONFIG.heroImages;

    updateHomepageConfig({
      heroImages: finalImages,
      heroIntervalSeconds,
      heroHeadline,
      heroSupportingCopy,
      spotlightProductId,
      brandStatement,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 font-mono max-w-5xl">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight flex items-center gap-2">
          <span>HOMEPAGE HERO & EDITORIAL CURATION</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Configure multiple rotating hero background images (3-second auto-scroll), headline typography, and curated storefront products.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* ============================================================
            SECTION 1: HERO BACKGROUND CAMPAIGN IMAGES
            ============================================================ */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-snake-green" />
                HERO BACKGROUND IMAGES ({heroImages.length})
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                The homepage cycles through these campaign images automatically every {heroIntervalSeconds} seconds.
              </p>
            </div>

            {/* Auto-Scroll Interval Setting */}
            <div className="flex items-center gap-2 bg-black border border-neutral-800 px-3 py-1.5 rounded">
              <Clock size={14} className="text-snake-green" />
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">ROTATION SPEED:</span>
              <select
                value={heroIntervalSeconds}
                onChange={(e) => setHeroIntervalSeconds(Number(e.target.value))}
                className="bg-transparent text-white text-xs font-mono font-bold focus:outline-none"
              >
                <option value={2} className="bg-black">2 Seconds (Fast)</option>
                <option value={3} className="bg-black">3 Seconds (Standard)</option>
                <option value={4} className="bg-black">4 Seconds</option>
                <option value={5} className="bg-black">5 Seconds (Cinematic)</option>
              </select>
            </div>
          </div>

          {/* Active Images Grid */}
          <div className="space-y-3">
            <label className="text-[11px] text-neutral-400 uppercase font-semibold block">
              ACTIVE CAMPAIGN SLIDES (DRAG / REORDER / DELETE)
            </label>

            {heroImages.length === 0 ? (
              <div className="p-8 border border-dashed border-neutral-800 rounded text-center text-neutral-500 text-xs">
                No hero images configured. Default SuperSnake campaign visuals will be displayed.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {heroImages.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}`}
                    className="group relative bg-black border border-neutral-800 rounded-lg overflow-hidden flex flex-col transition-all hover:border-neutral-700"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden">
                      <Image
                        src={imgUrl}
                        alt={`Hero Slide ${idx + 1}`}
                        fill
                        unoptimized={imgUrl.startsWith('data:') || !imgUrl.includes('unsplash.com')}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                      {/* Badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md text-white text-[9px] font-mono uppercase tracking-widest border border-white/10 rounded">
                        {idx === 0 ? (
                          <span className="text-snake-green font-bold">#1 PRIMARY</span>
                        ) : (
                          `#${idx + 1} SLIDE`
                        )}
                      </span>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-950/80 text-red-400 border border-red-800/60 rounded hover:bg-red-600 hover:text-white transition-colors"
                        title="Remove image"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Controls Footer */}
                    <div className="p-2.5 bg-[#111] border-t border-neutral-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-neutral-400 truncate max-w-[100px]" title={imgUrl}>
                        {imgUrl.startsWith('data:') ? 'Local Upload' : imgUrl.replace(/^https?:\/\//, '').split('/')[0]}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, 'up')}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                          title="Move Earlier"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === heroImages.length - 1}
                          onClick={() => moveImage(idx, 'down')}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                          title="Move Later"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload and URL Input Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-800/60">
            {/* Local File Upload */}
            <div className="border border-dashed border-neutral-800 hover:border-snake-green/60 p-4 rounded-lg flex flex-col items-center justify-center text-center gap-2 transition-colors bg-black/40">
              <Upload size={20} className="text-snake-green" />
              <div className="space-y-0.5">
                <span className="text-xs text-white font-bold uppercase block">UPLOAD FROM DEVICE</span>
                <span className="text-[10px] text-neutral-500 block">PNG, JPG, WEBP (Max 8MB)</span>
              </div>
              <label className="cursor-pointer px-4 py-2 bg-neutral-900 border border-neutral-700 text-white text-[11px] uppercase tracking-wider font-bold rounded hover:bg-neutral-800 transition-colors">
                CHOOSE IMAGE FILE
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* External URL Input */}
            <div className="border border-neutral-800 p-4 rounded-lg flex flex-col justify-center gap-2 bg-black/40">
              <span className="text-xs text-white font-bold uppercase flex items-center gap-1.5">
                <ExternalLink size={14} className="text-snake-green" />
                ADD IMAGE VIA URL
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 bg-black border border-neutral-800 px-3 py-2 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-white text-black font-bold text-xs uppercase rounded hover:bg-snake-green transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> ADD
                </button>
              </div>
              <span className="text-[10px] text-neutral-500">Paste any public high-resolution image URL.</span>
            </div>
          </div>

          {/* Curated Presets Library */}
          <div className="space-y-2 pt-2 border-t border-neutral-800/60">
            <span className="text-[11px] text-neutral-400 uppercase font-semibold flex items-center gap-1.5">
              <Sparkles size={12} className="text-snake-green" />
              CURATED EDITORIAL CAMPAIGN PRESETS (CLICK TO ADD)
            </span>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => addPreset(preset.url)}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-snake-green/80 text-[11px] text-neutral-300 hover:text-white rounded transition-colors flex items-center gap-1.5"
                >
                  <Plus size={12} className="text-snake-green" />
                  {preset.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================
            SECTION 2: EDITORIAL HEADLINE & COPY
            ============================================================ */}
        <div className="space-y-6 text-xs bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 sm:p-8">
          <h2 className="text-sm font-bold uppercase text-white tracking-wider border-b border-neutral-800 pb-3">
            EDITORIAL COPY & SPOTLIGHT PRODUCT
          </h2>

          <div className="space-y-2">
            <label className="text-neutral-400 uppercase font-semibold">HERO PRIMARY HEADLINE</label>
            <input
              type="text"
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-neutral-400 uppercase font-semibold">HERO SUPPORTING COPY</label>
            <input
              type="text"
              value={heroSupportingCopy}
              onChange={(e) => setHeroSupportingCopy(e.target.value)}
              className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-neutral-400 uppercase font-semibold">FLAGSHIP SPOTLIGHT PRODUCT</label>
            <select
              value={spotlightProductId}
              onChange={(e) => setSpotlightProductId(e.target.value)}
              className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green focus:outline-none"
            >
              {products && products.length > 0 ? (
                products.map((p) => (
                  <option key={p.id} value={p.slug || p.id}>
                    {p.name.toUpperCase()} (₹{p.price})
                  </option>
                ))
              ) : (
                <>
                  <option value="the-signature-tee">THE SIGNATURE TEE (₹1,499)</option>
                  <option value="the-serpent-tee">THE SERPENT TEE (₹1,899)</option>
                  <option value="the-monolith-oversized">THE MONOLITH OVERSIZED (₹1,799)</option>
                  <option value="the-venom-edition">THE VENOM EDITION (₹1,999)</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-neutral-400 uppercase font-semibold">BRAND STATEMENT SLOGAN</label>
            <input
              type="text"
              value={brandStatement}
              onChange={(e) => setBrandStatement(e.target.value)}
              className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            {saved && (
              <span className="text-snake-green flex items-center gap-1.5 font-bold animate-pulse">
                <Check size={16} /> HOMEPAGE CURATION PUBLISHED — STOREFRONT UPDATED
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-6 py-3 bg-snake-green text-black font-bold uppercase rounded hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(4,252,33,0.3)]"
            >
              <Check size={16} />
              PUBLISH CHANGES
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

