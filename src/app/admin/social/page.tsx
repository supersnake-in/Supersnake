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
  ExternalLink,
  Instagram,
  Share2,
  Phone,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useStore, DEFAULT_SOCIAL_CONFIG } from '@/lib/store';

const STUDIO_PRESETS = [
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=600&auto=format&fit=crop',
];

export default function AdminSocialMediaPage() {
  const { socialConfig, updateSocialConfig } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [communityImages, setCommunityImages] = useState<string[]>(
    socialConfig?.communityImages?.length > 0 ? socialConfig.communityImages : DEFAULT_SOCIAL_CONFIG.communityImages
  );
  const [instagram, setInstagram] = useState(socialConfig?.instagram || DEFAULT_SOCIAL_CONFIG.instagram);
  const [x, setX] = useState(socialConfig?.x || DEFAULT_SOCIAL_CONFIG.x);
  const [youtube, setYoutube] = useState(socialConfig?.youtube || DEFAULT_SOCIAL_CONFIG.youtube);
  const [threads, setThreads] = useState(socialConfig?.threads || DEFAULT_SOCIAL_CONFIG.threads);
  const [linkedin, setLinkedin] = useState(socialConfig?.linkedin || DEFAULT_SOCIAL_CONFIG.linkedin);
  const [contactPhone, setContactPhone] = useState(socialConfig?.contactPhone || DEFAULT_SOCIAL_CONFIG.contactPhone);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Sync state if store updates from persistence
  useEffect(() => {
    if (socialConfig) {
      if (socialConfig.communityImages && socialConfig.communityImages.length > 0) {
        setCommunityImages(socialConfig.communityImages);
      }
      if (socialConfig.instagram) setInstagram(socialConfig.instagram);
      if (socialConfig.x) setX(socialConfig.x);
      if (socialConfig.youtube) setYoutube(socialConfig.youtube);
      if (socialConfig.threads) setThreads(socialConfig.threads);
      if (socialConfig.linkedin) setLinkedin(socialConfig.linkedin);
      if (socialConfig.contactPhone) setContactPhone(socialConfig.contactPhone);
    }
  }, [socialConfig]);

  // Client-side image compression
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 1200;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Handle local file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImgs: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          alert('Only image files (PNG, JPG, WEBP) are supported.');
          continue;
        }
        const compressed = await compressImage(file);
        newImgs.push(compressed);
      }
      if (newImgs.length > 0) {
        setCommunityImages((prev) => [...prev, ...newImgs]);
      }
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle adding image via URL
  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
      alert('Please enter a valid image URL starting with https://');
      return;
    }
    setCommunityImages((prev) => [...prev, trimmed]);
    setNewImageUrl('');
  };

  // Reorder images
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= communityImages.length) return;
    const updated = [...communityImages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setCommunityImages(updated);
  };

  // Remove image
  const removeImage = (index: number) => {
    setCommunityImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset to presets
  const resetToPresets = () => {
    if (confirm('Reset Community & Editorial images to studio defaults?')) {
      setCommunityImages(STUDIO_PRESETS);
    }
  };

  // Save all settings
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await updateSocialConfig({
        communityImages,
        instagram: instagram.trim(),
        x: x.trim(),
        youtube: youtube.trim(),
        threads: threads.trim(),
        linkedin: linkedin.trim(),
        contactPhone: contactPhone.trim(),
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-mono max-w-6xl">
      {/* Top Header */}
      <div className="border-b border-neutral-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Share2 size={16} className="text-snake-green" />
            <span className="text-[10px] tracking-[0.3em] text-snake-green uppercase">
              STOREFRONT CONFIGURATION
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
            SOCIAL MEDIA &amp; COMMUNITY
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage Community &amp; Editorial images, brand social profile links, and the official customer concierge phone number.
          </p>
        </div>

        {/* Save Action */}
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-xs text-snake-green bg-snake-green/10 border border-snake-green/30 px-3 py-1.5 rounded">
              <Check size={14} />
              <span>SAVED &amp; LIVE</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/20 border border-red-500/30 px-3 py-1.5 rounded">
              <AlertCircle size={14} />
              <span>SAVE FAILED</span>
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-snake-green hover:bg-white text-black text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 rounded disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>SAVING...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>SAVE CHANGES</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: COMMUNITY & EDITORIAL IMAGES (#SUPERSNAKE) */}
      <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                COMMUNITY &amp; EDITORIAL SHOWCASE (#SUPERSNAKE)
              </span>
              <span className="text-[10px] text-snake-green bg-snake-green/10 px-2 py-0.5 rounded border border-snake-green/20">
                {communityImages.length} IMAGES
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              These images are dynamically displayed on the homepage under the <strong>COMMUNITY &amp; EDITORIAL #SUPERSNAKE</strong> section. On mobile devices, horizontal scrolling activates when more than 4 images are published; on larger screens, horizontal scrolling activates when more than 8 images are published.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToPresets}
              className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={12} />
              <span>RESET TO PRESETS</span>
            </button>
          </div>
        </div>

        {/* Current Images Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {communityImages.map((imgUrl, index) => (
            <div
              key={`community-${index}`}
              className="group relative aspect-square bg-neutral-900 border border-neutral-800 rounded overflow-hidden flex flex-col justify-between"
            >
              <Image
                src={imgUrl}
                alt={`Community Showcase ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />

              {/* Number Badge */}
              <div className="relative z-10 p-2">
                <span className="text-[10px] bg-black/80 backdrop-blur-sm text-snake-green px-1.5 py-0.5 rounded border border-white/10 font-bold">
                  0{index + 1}
                </span>
              </div>

              {/* Hover Actions */}
              <div className="relative z-10 p-2 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <button
                      onClick={() => moveImage(index, 'up')}
                      title="Move Left / Earlier"
                      className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-700"
                    >
                      <ArrowUp size={12} className="-rotate-90" />
                    </button>
                  )}
                  {index < communityImages.length - 1 && (
                    <button
                      onClick={() => moveImage(index, 'down')}
                      title="Move Right / Later"
                      className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-700"
                    >
                      <ArrowDown size={12} className="-rotate-90" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => removeImage(index)}
                  title="Remove Image"
                  className="p-1 bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white rounded border border-red-800/80"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-neutral-800 hover:border-snake-green/50 rounded flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-neutral-950/40 hover:bg-snake-green/5"
          >
            <Upload size={20} className="text-neutral-500 mb-2 group-hover:text-snake-green" />
            <span className="text-[11px] text-neutral-300 font-bold uppercase">UPLOAD IMAGE</span>
            <span className="text-[9px] text-neutral-500 mt-1">PNG, JPG, WEBP (AUTO-COMPRESSED)</span>
          </div>
        </div>

        {/* Upload Controls */}
        <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png, image/jpeg, image/webp"
            multiple
            className="hidden"
          />

          <form onSubmit={handleAddImageUrl} className="flex-1 flex items-center gap-2 w-full sm:max-w-md">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Or paste an image URL (https://...)"
              className="flex-1 bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 rounded text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Plus size={14} />
              <span>ADD URL</span>
            </button>
          </form>

          {isUploading && (
            <div className="flex items-center gap-2 text-xs text-snake-green">
              <Loader2 size={14} className="animate-spin" />
              <span>Compressing and uploading images...</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: BRAND SOCIAL MEDIA PROFILES */}
      <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-6">
        <div className="border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-snake-green" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              BRAND SOCIAL PROFILE CHANNELS
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Update these URLs to synchronize all social media links appearing across the site (Footer, Contact page, Header, and Homepage Community section).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Instagram */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-neutral-300 font-bold uppercase flex items-center gap-1.5">
                <Instagram size={14} className="text-snake-green" />
                <span>INSTAGRAM</span>
              </label>
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-neutral-500 hover:text-snake-green flex items-center gap-1"
                >
                  <span>TEST</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
            <input
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/supersnake.in"
              className="w-full bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 rounded text-white focus:outline-none focus:border-snake-green font-mono"
            />
          </div>

          {/* X (Twitter) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-neutral-300 font-bold uppercase flex items-center gap-1.5">
                <span className="font-bold text-snake-green">𝕏</span>
                <span>X (FORMERLY TWITTER)</span>
              </label>
              {x && (
                <a
                  href={x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-neutral-500 hover:text-snake-green flex items-center gap-1"
                >
                  <span>TEST</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
            <input
              type="url"
              value={x}
              onChange={(e) => setX(e.target.value)}
              placeholder="https://x.com/supersnake_in"
              className="w-full bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 rounded text-white focus:outline-none focus:border-snake-green font-mono"
            />
          </div>

          {/* YouTube */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-neutral-300 font-bold uppercase flex items-center gap-1.5">
                <span className="text-red-500 font-bold">▶</span>
                <span>YOUTUBE</span>
              </label>
              {youtube && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-neutral-500 hover:text-snake-green flex items-center gap-1"
                >
                  <span>TEST</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
            <input
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="https://youtube.com/@supersnake_in"
              className="w-full bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 rounded text-white focus:outline-none focus:border-snake-green font-mono"
            />
          </div>

          {/* Threads */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-neutral-300 font-bold uppercase flex items-center gap-1.5">
                <span className="text-snake-green font-bold">@</span>
                <span>THREADS</span>
              </label>
              {threads && (
                <a
                  href={threads}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-neutral-500 hover:text-snake-green flex items-center gap-1"
                >
                  <span>TEST</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
            <input
              type="url"
              value={threads}
              onChange={(e) => setThreads(e.target.value)}
              placeholder="https://threads.net/@supersnake.in"
              className="w-full bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 rounded text-white focus:outline-none focus:border-snake-green font-mono"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-neutral-300 font-bold uppercase flex items-center gap-1.5">
                <span className="text-blue-400 font-bold">in</span>
                <span>LINKEDIN</span>
              </label>
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-neutral-500 hover:text-snake-green flex items-center gap-1"
                >
                  <span>TEST</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/company/supersnake-in"
              className="w-full bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 rounded text-white focus:outline-none focus:border-snake-green font-mono"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: OFFICIAL CONTACT TELEPHONE NUMBER */}
      <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-6">
        <div className="border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-snake-green" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              OFFICIAL CONCIERGE CONTACT TELEPHONE
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            This contact number is displayed across official support channels (Contact Us page, Customer Care section, and Storefront Footer).
          </p>
        </div>

        <div className="max-w-md space-y-2">
          <label className="text-xs text-neutral-300 font-bold uppercase block">
            CONCIERGE PHONE NUMBER
          </label>
          <div className="relative">
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 pl-9 rounded text-white focus:outline-none focus:border-snake-green font-mono"
            />
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          </div>
          <p className="text-[10px] text-neutral-500">
            Formatted with country code (e.g. <code>+91 98765 43210</code>). Clicking on it on the storefront triggers a direct telephone call.
          </p>
        </div>
      </div>
    </div>
  );
}
