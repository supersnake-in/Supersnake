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
  Database,
  Copy,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useStore, DEFAULT_HOMEPAGE_CONFIG } from '@/lib/store';

const SUPABASE_HOMEPAGE_SQL = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.homepage_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_images TEXT[] NOT NULL DEFAULT '{}',
  hero_interval_seconds INTEGER DEFAULT 3,
  hero_headline TEXT DEFAULT 'WEAR YOUR INSTINCT.',
  hero_supporting_copy TEXT DEFAULT 'Premium T-shirts. Designed for your everyday. Engineered for presence.',
  spotlight_product_id TEXT DEFAULT 'the-signature-tee',
  brand_statement TEXT DEFAULT 'NOT MADE TO BLEND IN.',
  men_collection_image TEXT,
  women_collection_image TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If the table was already created, add the new image and Hero Object columns:
ALTER TABLE public.homepage_config 
  ADD COLUMN IF NOT EXISTS men_collection_image TEXT,
  ADD COLUMN IF NOT EXISTS women_collection_image TEXT,
  ADD COLUMN IF NOT EXISTS supersnake_tee_image TEXT,
  ADD COLUMN IF NOT EXISTS signature_tee_image TEXT,
  ADD COLUMN IF NOT EXISTS pillar1_image TEXT,
  ADD COLUMN IF NOT EXISTS pillar2_image TEXT,
  ADD COLUMN IF NOT EXISTS pillar3_image TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_eyebrow TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_title TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_quote TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_badge TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_spec1_eyebrow TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_spec1_title TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_spec1_desc TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_spec2_eyebrow TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_spec2_title TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_spec2_desc TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_spec3_eyebrow TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_spec3_title TEXT,
  ADD COLUMN IF NOT EXISTS hero_object_spec3_desc TEXT;

-- Enable Row Level Security (RLS)
ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for storefront visitors)
CREATE POLICY "Allow public read homepage_config"
  ON public.homepage_config FOR SELECT
  TO public USING (true);

-- Allow insert/update
CREATE POLICY "Allow public all homepage_config"
  ON public.homepage_config FOR ALL
  TO public USING (true) WITH CHECK (true);`;

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
  const menFileInputRef = useRef<HTMLInputElement>(null);
  const womenFileInputRef = useRef<HTMLInputElement>(null);
  const supersnakeTeeFileRef = useRef<HTMLInputElement>(null);
  const signatureTeeFileRef = useRef<HTMLInputElement>(null);
  const pillar1FileRef = useRef<HTMLInputElement>(null);
  const pillar2FileRef = useRef<HTMLInputElement>(null);
  const pillar3FileRef = useRef<HTMLInputElement>(null);

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
  const [menCollectionImage, setMenCollectionImage] = useState<string>(
    homepageConfig?.menCollectionImage || DEFAULT_HOMEPAGE_CONFIG.menCollectionImage || ''
  );
  const [womenCollectionImage, setWomenCollectionImage] = useState<string>(
    homepageConfig?.womenCollectionImage || DEFAULT_HOMEPAGE_CONFIG.womenCollectionImage || ''
  );

  // New section image states
  const [supersnakeTeeImage, setSupersnakeTeeImage] = useState<string>(
    homepageConfig?.supersnakeTeeImage || DEFAULT_HOMEPAGE_CONFIG.supersnakeTeeImage || ''
  );
  const [signatureTeeImage, setSignatureTeeImage] = useState<string>(
    homepageConfig?.signatureTeeImage || DEFAULT_HOMEPAGE_CONFIG.signatureTeeImage || ''
  );
  const [pillar1Image, setPillar1Image] = useState<string>(
    homepageConfig?.pillar1Image || DEFAULT_HOMEPAGE_CONFIG.pillar1Image || ''
  );
  const [pillar2Image, setPillar2Image] = useState<string>(
    homepageConfig?.pillar2Image || DEFAULT_HOMEPAGE_CONFIG.pillar2Image || ''
  );
  const [pillar3Image, setPillar3Image] = useState<string>(
    homepageConfig?.pillar3Image || DEFAULT_HOMEPAGE_CONFIG.pillar3Image || ''
  );

  // The Hero Object editable text states
  const [heroObjectEyebrow, setHeroObjectEyebrow] = useState<string>(
    homepageConfig?.heroObjectEyebrow || DEFAULT_HOMEPAGE_CONFIG.heroObjectEyebrow || 'THE HERO OBJECT'
  );
  const [heroObjectTitle, setHeroObjectTitle] = useState<string>(
    homepageConfig?.heroObjectTitle || DEFAULT_HOMEPAGE_CONFIG.heroObjectTitle || 'THE SUPERSNAKE TEE'
  );
  const [heroObjectQuote, setHeroObjectQuote] = useState<string>(
    homepageConfig?.heroObjectQuote || DEFAULT_HOMEPAGE_CONFIG.heroObjectQuote || '“Designed around the everyday. Built around you.”'
  );
  const [heroObjectBadge, setHeroObjectBadge] = useState<string>(
    homepageConfig?.heroObjectBadge || DEFAULT_HOMEPAGE_CONFIG.heroObjectBadge || 'ARCHITECTURAL BOXY FIT'
  );
  const [heroObjectSpec1Eyebrow, setHeroObjectSpec1Eyebrow] = useState<string>(
    homepageConfig?.heroObjectSpec1Eyebrow || DEFAULT_HOMEPAGE_CONFIG.heroObjectSpec1Eyebrow || '01 / WEIGHT & STABILITY'
  );
  const [heroObjectSpec1Title, setHeroObjectSpec1Title] = useState<string>(
    homepageConfig?.heroObjectSpec1Title || DEFAULT_HOMEPAGE_CONFIG.heroObjectSpec1Title || '280 GSM SUPIMA® COTTON'
  );
  const [heroObjectSpec1Desc, setHeroObjectSpec1Desc] = useState<string>(
    homepageConfig?.heroObjectSpec1Desc || DEFAULT_HOMEPAGE_CONFIG.heroObjectSpec1Desc || 'Long-staple fibers combed to perfection. Substantial architectural drape that holds its form all day without feeling stiff.'
  );
  const [heroObjectSpec2Eyebrow, setHeroObjectSpec2Eyebrow] = useState<string>(
    homepageConfig?.heroObjectSpec2Eyebrow || DEFAULT_HOMEPAGE_CONFIG.heroObjectSpec2Eyebrow || '02 / STRUCTURAL INTEGRITY'
  );
  const [heroObjectSpec2Title, setHeroObjectSpec2Title] = useState<string>(
    homepageConfig?.heroObjectSpec2Title || DEFAULT_HOMEPAGE_CONFIG.heroObjectSpec2Title || 'ZERO-SAG 1-INCH COLLAR'
  );
  const [heroObjectSpec2Desc, setHeroObjectSpec2Desc] = useState<string>(
    homepageConfig?.heroObjectSpec2Desc || DEFAULT_HOMEPAGE_CONFIG.heroObjectSpec2Desc || 'Twin-needle reinforced collar band with internal cotton herringbone tape. Retains razor-sharp neck tension through 100+ washes.'
  );
  const [heroObjectSpec3Eyebrow, setHeroObjectSpec3Eyebrow] = useState<string>(
    homepageConfig?.heroObjectSpec3Eyebrow || DEFAULT_HOMEPAGE_CONFIG.heroObjectSpec3Eyebrow || '03 / ATELIER FINISH'
  );
  const [heroObjectSpec3Title, setHeroObjectSpec3Title] = useState<string>(
    homepageConfig?.heroObjectSpec3Title || DEFAULT_HOMEPAGE_CONFIG.heroObjectSpec3Title || 'BLIND-STITCHED HEMS'
  );
  const [heroObjectSpec3Desc, setHeroObjectSpec3Desc] = useState<string>(
    homepageConfig?.heroObjectSpec3Desc || DEFAULT_HOMEPAGE_CONFIG.heroObjectSpec3Desc || 'Seamless Japanese blind-hem technique for an uninterrupted silhouette. No curling, no puckering, zero exterior stitch noise.'
  );

  const [newImageUrl, setNewImageUrl] = useState('');
  const [menImageUrl, setMenImageUrl] = useState('');
  const [womenImageUrl, setWomenImageUrl] = useState('');
  const [supersnakeTeeUrl, setSupersnakeTeeUrl] = useState('');
  const [signatureTeeUrl, setSignatureTeeUrl] = useState('');
  const [pillar1Url, setPillar1Url] = useState('');
  const [pillar2Url, setPillar2Url] = useState('');
  const [pillar3Url, setPillar3Url] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingMen, setIsUploadingMen] = useState(false);
  const [isUploadingWomen, setIsUploadingWomen] = useState(false);
  const [isUploadingSupersnakeTee, setIsUploadingSupersnakeTee] = useState(false);
  const [isUploadingSignatureTee, setIsUploadingSignatureTee] = useState(false);
  const [isUploadingPillar1, setIsUploadingPillar1] = useState(false);
  const [isUploadingPillar2, setIsUploadingPillar2] = useState(false);
  const [isUploadingPillar3, setIsUploadingPillar3] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved_supabase' | 'saved_local' | 'error'>('idle');
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const hasInitialized = useRef(false);
  const isDirty = useRef(false);

  // Sync state if store updates from persistence on initial load only
  useEffect(() => {
    if (!hasInitialized.current && homepageConfig) {
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
      if (homepageConfig.menCollectionImage) {
        setMenCollectionImage(homepageConfig.menCollectionImage);
      }
      if (homepageConfig.womenCollectionImage) {
        setWomenCollectionImage(homepageConfig.womenCollectionImage);
      }
      if (homepageConfig.supersnakeTeeImage) {
        setSupersnakeTeeImage(homepageConfig.supersnakeTeeImage);
      }
      if (homepageConfig.signatureTeeImage) {
        setSignatureTeeImage(homepageConfig.signatureTeeImage);
      }
      if (homepageConfig.pillar1Image) {
        setPillar1Image(homepageConfig.pillar1Image);
      }
      if (homepageConfig.pillar2Image) {
        setPillar2Image(homepageConfig.pillar2Image);
      }
      if (homepageConfig.pillar3Image) {
        setPillar3Image(homepageConfig.pillar3Image);
      }
      if (homepageConfig.heroObjectEyebrow) setHeroObjectEyebrow(homepageConfig.heroObjectEyebrow);
      if (homepageConfig.heroObjectTitle) setHeroObjectTitle(homepageConfig.heroObjectTitle);
      if (homepageConfig.heroObjectQuote) setHeroObjectQuote(homepageConfig.heroObjectQuote);
      if (homepageConfig.heroObjectBadge) setHeroObjectBadge(homepageConfig.heroObjectBadge);
      if (homepageConfig.heroObjectSpec1Eyebrow) setHeroObjectSpec1Eyebrow(homepageConfig.heroObjectSpec1Eyebrow);
      if (homepageConfig.heroObjectSpec1Title) setHeroObjectSpec1Title(homepageConfig.heroObjectSpec1Title);
      if (homepageConfig.heroObjectSpec1Desc) setHeroObjectSpec1Desc(homepageConfig.heroObjectSpec1Desc);
      if (homepageConfig.heroObjectSpec2Eyebrow) setHeroObjectSpec2Eyebrow(homepageConfig.heroObjectSpec2Eyebrow);
      if (homepageConfig.heroObjectSpec2Title) setHeroObjectSpec2Title(homepageConfig.heroObjectSpec2Title);
      if (homepageConfig.heroObjectSpec2Desc) setHeroObjectSpec2Desc(homepageConfig.heroObjectSpec2Desc);
      if (homepageConfig.heroObjectSpec3Eyebrow) setHeroObjectSpec3Eyebrow(homepageConfig.heroObjectSpec3Eyebrow);
      if (homepageConfig.heroObjectSpec3Title) setHeroObjectSpec3Title(homepageConfig.heroObjectSpec3Title);
      if (homepageConfig.heroObjectSpec3Desc) setHeroObjectSpec3Desc(homepageConfig.heroObjectSpec3Desc);
      hasInitialized.current = true;
    }
  }, [homepageConfig]);

  // Compress image client-side to prevent browser storage quota and payload size issues
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
          const maxWidth = 1920;
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
          // Compress to JPEG at 82% quality (great visual clarity, under 250KB)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Handle local file upload with compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    isDirty.current = true;
    try {
      const newImages: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          alert('Only image files (PNG, JPG, WEBP) are supported.');
          continue;
        }
        const compressed = await compressImage(file);
        newImages.push(compressed);
      }
      if (newImages.length > 0) {
        setHeroImages((prev) => [...prev, ...newImages]);
      }
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
    isDirty.current = true;
    setHeroImages((prev) => [...prev, trimmed]);
    setNewImageUrl('');
  };

  // Reordering
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroImages.length) return;
    isDirty.current = true;
    const updated = [...heroImages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setHeroImages(updated);
  };

  // Remove
  const removeImage = (index: number) => {
    isDirty.current = true;
    setHeroImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all images
  const clearAllImages = () => {
    isDirty.current = true;
    setHeroImages([]);
  };

  // Add Preset
  const addPreset = (url: string) => {
    if (heroImages.includes(url)) {
      alert('This image is already in your hero campaign.');
      return;
    }
    isDirty.current = true;
    setHeroImages((prev) => [...prev, url]);
  };

  // Handle Men Banner upload
  const handleMenFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files (PNG, JPG, WEBP) are supported.');
      return;
    }
    setIsUploadingMen(true);
    isDirty.current = true;
    try {
      const compressed = await compressImage(file);
      setMenCollectionImage(compressed);
    } catch (err) {
      console.error('Men image compression failed:', err);
    } finally {
      setIsUploadingMen(false);
      if (menFileInputRef.current) menFileInputRef.current.value = '';
    }
  };

  // Handle Women Banner upload
  const handleWomenFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files (PNG, JPG, WEBP) are supported.');
      return;
    }
    setIsUploadingWomen(true);
    isDirty.current = true;
    try {
      const compressed = await compressImage(file);
      setWomenCollectionImage(compressed);
    } catch (err) {
      console.error('Women image compression failed:', err);
    } finally {
      setIsUploadingWomen(false);
      if (womenFileInputRef.current) womenFileInputRef.current.value = '';
    }
  };

  // Helper for single image upload with client-side canvas compression
  const handleSingleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    setLoading: (val: boolean) => void,
    ref: React.RefObject<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files (PNG, JPG, WEBP) are supported.');
      return;
    }
    setLoading(true);
    isDirty.current = true;
    try {
      const compressed = await compressImage(file);
      setter(compressed);
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setLoading(false);
      if (ref.current) ref.current.value = '';
    }
  };

  // Save changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');

    // Save EXACTLY what the user has configured in the editor
    const finalImages = heroImages;

    try {
      const syncedToSupabase = await updateHomepageConfig({
        heroImages: finalImages,
        heroIntervalSeconds,
        heroHeadline,
        heroSupportingCopy,
        spotlightProductId,
        brandStatement,
        menCollectionImage,
        womenCollectionImage,
        supersnakeTeeImage,
        signatureTeeImage,
        pillar1Image,
        pillar2Image,
        pillar3Image,
        heroObjectEyebrow,
        heroObjectTitle,
        heroObjectQuote,
        heroObjectBadge,
        heroObjectSpec1Eyebrow,
        heroObjectSpec1Title,
        heroObjectSpec1Desc,
        heroObjectSpec2Eyebrow,
        heroObjectSpec2Title,
        heroObjectSpec2Desc,
        heroObjectSpec3Eyebrow,
        heroObjectSpec3Title,
        heroObjectSpec3Desc,
      });

      if (syncedToSupabase) {
        setSaveStatus('saved_supabase');
        isDirty.current = false;
      } else {
        setSaveStatus('saved_local');
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_HOMEPAGE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-8 font-mono max-w-5xl pb-16">
      {/* Header with Quick Save */}
      <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight flex items-center gap-2">
            <span>HOMEPAGE HERO & EDITORIAL CURATION</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Configure rotating hero background images (3-second auto-scroll) and storefront editorial text.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSql(!showSql)}
            className="px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-bold uppercase rounded flex items-center gap-1.5 transition-colors"
          >
            <Database size={14} className="text-snake-green" />
            <span>SUPABASE SQL</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave()}
            className="px-5 py-2.5 bg-snake-green text-black font-bold uppercase text-xs rounded hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(4,252,33,0.35)] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>SAVING...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>PUBLISH CHANGES</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Status Notification Banner */}
      {saveStatus === 'saved_supabase' && (
        <div className="p-4 bg-snake-green/10 border border-snake-green/40 text-snake-green rounded-lg flex items-center justify-between text-xs font-mono animate-in fade-in">
          <span className="flex items-center gap-2 font-bold">
            <Check size={16} />
            HOMEPAGE HERO SAVED & SYNCED TO SUPABASE — LIVE ACROSS ALL VISITORS!
          </span>
          <span className="text-[10px] text-neutral-400">Database updated</span>
        </div>
      )}

      {saveStatus === 'saved_local' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded-lg space-y-2 text-xs font-mono animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-bold">
              <AlertTriangle size={16} className="text-amber-400 shrink-0" />
              SAVED LOCALLY IN BROWSER STORAGE.
            </span>
            <button
              type="button"
              onClick={() => setShowSql(true)}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-white rounded border border-amber-500/40 text-[11px] font-bold uppercase transition-colors shrink-0"
            >
              VIEW SUPABASE SQL QUERY
            </button>
          </div>
          <p className="text-[11px] text-amber-200/80">
            To make your custom hero images persistent across all devices and live visitors, run the SQL query in your Supabase SQL Editor.
          </p>
        </div>
      )}

      {/* Supabase SQL Query Accordion */}
      {showSql && (
        <div className="bg-[#111] border border-snake-green/30 rounded-lg p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white text-xs font-bold uppercase">
              <Database size={15} className="text-snake-green" />
              <span>SUPABASE DATABASE QUERY (RUN IN SUPABASE SQL EDITOR)</span>
            </div>
            <button
              type="button"
              onClick={copySqlToClipboard}
              className="px-3 py-1 bg-snake-green text-black font-bold text-[11px] uppercase rounded hover:bg-white transition-colors flex items-center gap-1"
            >
              {copiedSql ? <Check size={13} /> : <Copy size={13} />}
              {copiedSql ? 'COPIED TO CLIPBOARD' : 'COPY SQL'}
            </button>
          </div>
          <p className="text-[11px] text-neutral-400">
            Copy and paste this into your <strong>Supabase Dashboard &gt; SQL Editor</strong> and click <strong>Run</strong>. This creates the <code className="text-snake-green">homepage_config</code> table so all uploaded hero images sync directly to Supabase.
          </p>
          <pre className="bg-black p-4 rounded text-[11px] text-neutral-300 font-mono overflow-x-auto border border-neutral-800">
            {SUPABASE_HOMEPAGE_SQL}
          </pre>
        </div>
      )}

      <form onSubmit={(e) => handleSave(e)} className="space-y-8">
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

            <div className="flex items-center gap-3">
              {/* Auto-Scroll Interval Setting */}
              <div className="flex items-center gap-2 bg-black border border-neutral-800 px-3 py-1.5 rounded">
                <Clock size={14} className="text-snake-green" />
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">SPEED:</span>
                <select
                  value={heroIntervalSeconds}
                  onChange={(e) => setHeroIntervalSeconds(Number(e.target.value))}
                  className="bg-transparent text-white text-xs font-mono font-bold focus:outline-none"
                >
                  <option value={2} className="bg-black">2s (Fast)</option>
                  <option value={3} className="bg-black">3s (Standard)</option>
                  <option value={4} className="bg-black">4s</option>
                  <option value={5} className="bg-black">5s (Cinematic)</option>
                </select>
              </div>

              {/* Section Save Button */}
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave()}
                className="px-4 py-1.5 bg-snake-green text-black font-bold uppercase text-xs rounded hover:bg-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                <span>SAVE IMAGES</span>
              </button>
            </div>
          </div>

          {/* Active Images Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-neutral-400 uppercase font-semibold block">
                ACTIVE CAMPAIGN SLIDES ({heroImages.length})
              </label>
              {heroImages.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllImages}
                  className="text-[10px] text-red-400 hover:text-red-300 font-mono uppercase flex items-center gap-1 transition-colors px-2 py-0.5 rounded border border-red-900/40 bg-red-950/20"
                >
                  <Trash2 size={11} />
                  <span>CLEAR ALL PREVIOUS IMAGES</span>
                </button>
              )}
            </div>

            {heroImages.length === 0 ? (
              <div className="p-8 border border-dashed border-neutral-800 rounded text-center text-neutral-500 text-xs">
                No hero images configured. Default SuperSnake campaign visuals will be displayed.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {heroImages.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl.slice(0, 30)}-${idx}`}
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
                      <span className="text-neutral-400 truncate max-w-[120px]" title={imgUrl}>
                        {imgUrl.startsWith('data:') ? 'Uploaded Image' : imgUrl.replace(/^https?:\/\//, '').split('/')[0]}
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
            {/* Local File Upload with compression */}
            <div className="border border-dashed border-neutral-800 hover:border-snake-green/60 p-4 rounded-lg flex flex-col items-center justify-center text-center gap-2 transition-colors bg-black/40">
              {isUploading ? (
                <Loader2 size={22} className="text-snake-green animate-spin" />
              ) : (
                <Upload size={22} className="text-snake-green" />
              )}
              <div className="space-y-0.5">
                <span className="text-xs text-white font-bold uppercase block">
                  {isUploading ? 'OPTIMIZING & UPLOADING...' : 'UPLOAD FROM DEVICE'}
                </span>
                <span className="text-[10px] text-neutral-500 block">PNG, JPG, WEBP (Auto-optimized for instant loading)</span>
              </div>
              <label className="cursor-pointer px-4 py-2 bg-neutral-900 border border-neutral-700 text-white text-[11px] uppercase tracking-wider font-bold rounded hover:bg-neutral-800 transition-colors">
                CHOOSE IMAGE FILE
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploading}
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
                  className="px-4 py-2 bg-white text-black font-bold text-xs uppercase rounded hover:bg-snake-green transition-colors flex items-center gap-1 shrink-0"
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
            SECTION 2: MEN & WOMEN COLLECTION EDITORIAL BANNERS
            ============================================================ */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-snake-green" />
                MEN & WOMEN COLLECTION BANNERS
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Upload and manage the 2 campaign images displayed for Collection 01 (MEN) and Collection 02 (WOMEN) on the homepage.
              </p>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="px-4 py-1.5 bg-snake-green text-black font-bold uppercase text-xs rounded hover:bg-white transition-colors flex items-center gap-1.5 disabled:opacity-50 self-start sm:self-auto"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>SAVE BANNERS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MEN COLLECTION BANNER */}
            <div className="bg-black border border-neutral-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                  MEN BANNER
                </span>
                <button
                  type="button"
                  onClick={() => {
                    isDirty.current = true;
                    setMenCollectionImage(DEFAULT_HOMEPAGE_CONFIG.menCollectionImage || '');
                  }}
                  className="text-[10px] text-neutral-400 hover:text-white uppercase transition-colors"
                >
                  RESET DEFAULT
                </button>
              </div>

              {/* Preview Thumbnail */}
              <div className="relative aspect-[4/5] w-full bg-neutral-900 rounded-md overflow-hidden border border-neutral-800">
                <Image
                  src={menCollectionImage || DEFAULT_HOMEPAGE_CONFIG.menCollectionImage || ''}
                  alt="Men Collection Banner"
                  fill
                  unoptimized={menCollectionImage?.startsWith('data:') || (menCollectionImage ? !menCollectionImage.includes('unsplash.com') : false)}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-2xl font-display font-bold uppercase text-white tracking-tight">MEN</span>
                </div>
              </div>

              {/* Upload & URL Controls */}
              <div className="space-y-2">
                <label className="cursor-pointer w-full py-2.5 bg-neutral-900 border border-neutral-700 hover:border-snake-green text-white text-xs uppercase font-bold rounded flex items-center justify-center gap-2 transition-colors">
                  {isUploadingMen ? <Loader2 size={14} className="animate-spin text-snake-green" /> : <Upload size={14} className="text-snake-green" />}
                  <span>{isUploadingMen ? 'OPTIMIZING...' : 'UPLOAD MEN BANNER'}</span>
                  <input
                    ref={menFileInputRef}
                    type="file"
                    accept="image/*"
                    disabled={isUploadingMen}
                    onChange={handleMenFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste image URL..."
                    value={menImageUrl}
                    onChange={(e) => setMenImageUrl(e.target.value)}
                    className="flex-1 bg-[#111] border border-neutral-800 px-3 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!menImageUrl.trim()) return;
                      isDirty.current = true;
                      setMenCollectionImage(menImageUrl.trim());
                      setMenImageUrl('');
                    }}
                    className="px-3 py-1.5 bg-white text-black font-bold text-xs uppercase rounded hover:bg-snake-green transition-colors shrink-0"
                  >
                    SET
                  </button>
                </div>
              </div>
            </div>

            {/* WOMEN COLLECTION BANNER */}
            <div className="bg-black border border-neutral-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                  WOMEN BANNER
                </span>
                <button
                  type="button"
                  onClick={() => {
                    isDirty.current = true;
                    setWomenCollectionImage(DEFAULT_HOMEPAGE_CONFIG.womenCollectionImage || '');
                  }}
                  className="text-[10px] text-neutral-400 hover:text-white uppercase transition-colors"
                >
                  RESET DEFAULT
                </button>
              </div>

              {/* Preview Thumbnail */}
              <div className="relative aspect-[4/5] w-full bg-neutral-900 rounded-md overflow-hidden border border-neutral-800">
                <Image
                  src={womenCollectionImage || DEFAULT_HOMEPAGE_CONFIG.womenCollectionImage || ''}
                  alt="Women Collection Banner"
                  fill
                  unoptimized={womenCollectionImage?.startsWith('data:') || (womenCollectionImage ? !womenCollectionImage.includes('unsplash.com') : false)}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-2xl font-display font-bold uppercase text-white tracking-tight">WOMEN</span>
                </div>
              </div>

              {/* Upload & URL Controls */}
              <div className="space-y-2">
                <label className="cursor-pointer w-full py-2.5 bg-neutral-900 border border-neutral-700 hover:border-snake-green text-white text-xs uppercase font-bold rounded flex items-center justify-center gap-2 transition-colors">
                  {isUploadingWomen ? <Loader2 size={14} className="animate-spin text-snake-green" /> : <Upload size={14} className="text-snake-green" />}
                  <span>{isUploadingWomen ? 'OPTIMIZING...' : 'UPLOAD WOMEN BANNER'}</span>
                  <input
                    ref={womenFileInputRef}
                    type="file"
                    accept="image/*"
                    disabled={isUploadingWomen}
                    onChange={handleWomenFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste image URL..."
                    value={womenImageUrl}
                    onChange={(e) => setWomenImageUrl(e.target.value)}
                    className="flex-1 bg-[#111] border border-neutral-800 px-3 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!womenImageUrl.trim()) return;
                      isDirty.current = true;
                      setWomenCollectionImage(womenImageUrl.trim());
                      setWomenImageUrl('');
                    }}
                    className="px-3 py-1.5 bg-white text-black font-bold text-xs uppercase rounded hover:bg-snake-green transition-colors shrink-0"
                  >
                    SET
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            SECTION 3: THE HERO OBJECT — THE SUPERSNAKE TEE (IMAGE & TEXT SPECS)
            ============================================================ */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-snake-green" />
                THE HERO OBJECT — THE SUPERSNAKE TEE (IMAGE & TEXT SPECS)
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Manage the monumental macro hero photography, floating badge text, and the 3 craftsmanship specs displayed on the homepage.
              </p>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="px-4 py-1.5 bg-snake-green text-black font-bold uppercase text-xs rounded hover:bg-white transition-colors flex items-center gap-1.5 disabled:opacity-50 self-start sm:self-auto"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>SAVE SECTION 3</span>
            </button>
          </div>

          {/* Top Row: Image Preview & Image Upload Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Preview Thumbnail */}
            <div className="lg:col-span-7 bg-black border border-neutral-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                  IMAGE & BADGE LIVE PREVIEW
                </span>
                <button
                  type="button"
                  onClick={() => {
                    isDirty.current = true;
                    setSupersnakeTeeImage(DEFAULT_HOMEPAGE_CONFIG.supersnakeTeeImage || '');
                  }}
                  className="text-[10px] text-neutral-400 hover:text-white uppercase transition-colors"
                >
                  RESET DEFAULT IMAGE
                </button>
              </div>

              <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full bg-neutral-900 rounded-md overflow-hidden border border-neutral-800 group">
                <Image
                  src={supersnakeTeeImage || DEFAULT_HOMEPAGE_CONFIG.supersnakeTeeImage || ''}
                  alt="The SuperSnake Tee Hero Object"
                  fill
                  unoptimized={supersnakeTeeImage?.startsWith('data:') || (supersnakeTeeImage ? !supersnakeTeeImage.includes('unsplash.com') : false)}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 p-2.5 bg-black/70 backdrop-blur-md border border-white/10 flex justify-between items-center text-xs font-mono rounded">
                  <span className="text-neutral-300 tracking-wider">
                    {heroObjectBadge || 'ARCHITECTURAL BOXY FIT'}
                  </span>
                  <span className="text-snake-green font-bold">₹1,499</span>
                </div>
              </div>

              {/* Floating Badge Text Input right below the preview */}
              <div className="pt-2 border-t border-neutral-800 space-y-1.5">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  IMAGE FLOATING BADGE TEXT:
                </label>
                <input
                  type="text"
                  value={heroObjectBadge}
                  onChange={(e) => {
                    isDirty.current = true;
                    setHeroObjectBadge(e.target.value);
                  }}
                  placeholder="ARCHITECTURAL BOXY FIT"
                  className="w-full bg-[#111] border border-neutral-800 px-3 py-2 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500 block">
                  This text appears inside the pill overlay at the bottom-left of the photography.
                </span>
              </div>
            </div>

            {/* Image Upload Controls */}
            <div className="lg:col-span-5 bg-black border border-neutral-800 rounded-lg p-5 space-y-4">
              <span className="text-xs font-bold uppercase text-white tracking-wider block border-b border-neutral-800 pb-2">
                UPLOAD / UPDATE VISUAL
              </span>

              <div className="space-y-3">
                <label className="cursor-pointer w-full py-3 bg-neutral-900 border border-neutral-700 hover:border-snake-green text-white text-xs uppercase font-bold rounded flex items-center justify-center gap-2 transition-colors">
                  {isUploadingSupersnakeTee ? (
                    <Loader2 size={15} className="animate-spin text-snake-green" />
                  ) : (
                    <Upload size={15} className="text-snake-green" />
                  )}
                  <span>{isUploadingSupersnakeTee ? 'OPTIMIZING & UPLOADING...' : 'UPLOAD FROM DEVICE'}</span>
                  <input
                    ref={supersnakeTeeFileRef}
                    type="file"
                    accept="image/*"
                    disabled={isUploadingSupersnakeTee}
                    onChange={(e) =>
                      handleSingleUpload(
                        e,
                        setSupersnakeTeeImage,
                        setIsUploadingSupersnakeTee,
                        supersnakeTeeFileRef
                      )
                    }
                    className="hidden"
                  />
                </label>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">OR ENTER IMAGE URL:</span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={supersnakeTeeUrl}
                      onChange={(e) => setSupersnakeTeeUrl(e.target.value)}
                      className="flex-1 bg-[#111] border border-neutral-800 px-3 py-2 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!supersnakeTeeUrl.trim()) return;
                        isDirty.current = true;
                        setSupersnakeTeeImage(supersnakeTeeUrl.trim());
                        setSupersnakeTeeUrl('');
                      }}
                      className="px-4 py-2 bg-white text-black font-bold text-xs uppercase rounded hover:bg-snake-green transition-colors shrink-0"
                    >
                      SET
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 leading-relaxed pt-1">
                  Recommended: High-resolution landscape (`1600 × 1100 px` or `1600 × 1200 px`) photograph showcasing garment drape and collar construction. Completely independent of product images.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row: Section Headlines & 3 Craftsmanship Specs Editing */}
          <div className="bg-black border border-neutral-800 rounded-lg p-5 space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <span className="text-xs font-bold uppercase text-white tracking-wider block">
                SECTION HEADLINES & CRAFTSMANSHIP SPECS
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Customize the headlines and the 3 architectural specifications displayed to the left of the photography.
              </p>
            </div>

            {/* Section Header Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase block">SECTION EYEBROW:</label>
                <input
                  type="text"
                  value={heroObjectEyebrow}
                  onChange={(e) => {
                    isDirty.current = true;
                    setHeroObjectEyebrow(e.target.value);
                  }}
                  placeholder="THE HERO OBJECT"
                  className="w-full bg-[#111] border border-neutral-800 px-3 py-2 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase block">SECTION TITLE:</label>
                <input
                  type="text"
                  value={heroObjectTitle}
                  onChange={(e) => {
                    isDirty.current = true;
                    setHeroObjectTitle(e.target.value);
                  }}
                  placeholder="THE SUPERSNAKE TEE"
                  className="w-full bg-[#111] border border-neutral-800 px-3 py-2 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase block">SECTION QUOTE:</label>
                <input
                  type="text"
                  value={heroObjectQuote}
                  onChange={(e) => {
                    isDirty.current = true;
                    setHeroObjectQuote(e.target.value);
                  }}
                  placeholder="“Designed around the everyday. Built around you.”"
                  className="w-full bg-[#111] border border-neutral-800 px-3 py-2 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                />
              </div>
            </div>

            {/* The 3 Craftsmanship Specs Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* SPEC 01 */}
              <div className="bg-[#111] border border-neutral-800 rounded-lg p-4 space-y-3 border-l-2 border-l-snake-green">
                <span className="text-[11px] font-bold uppercase text-snake-green block">SPECIFICATION 01</span>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-500 uppercase block">EYEBROW:</label>
                  <input
                    type="text"
                    value={heroObjectSpec1Eyebrow}
                    onChange={(e) => {
                      isDirty.current = true;
                      setHeroObjectSpec1Eyebrow(e.target.value);
                    }}
                    placeholder="01 / WEIGHT & STABILITY"
                    className="w-full bg-black border border-neutral-800 px-2.5 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-500 uppercase block">TITLE:</label>
                  <input
                    type="text"
                    value={heroObjectSpec1Title}
                    onChange={(e) => {
                      isDirty.current = true;
                      setHeroObjectSpec1Title(e.target.value);
                    }}
                    placeholder="280 GSM SUPIMA® COTTON"
                    className="w-full bg-black border border-neutral-800 px-2.5 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-500 uppercase block">DESCRIPTION:</label>
                  <textarea
                    rows={3}
                    value={heroObjectSpec1Desc}
                    onChange={(e) => {
                      isDirty.current = true;
                      setHeroObjectSpec1Desc(e.target.value);
                    }}
                    placeholder="Long-staple fibers combed to perfection..."
                    className="w-full bg-black border border-neutral-800 px-2.5 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* SPEC 02 */}
              <div className="bg-[#111] border border-neutral-800 rounded-lg p-4 space-y-3 border-l-2 border-l-neutral-600">
                <span className="text-[11px] font-bold uppercase text-neutral-300 block">SPECIFICATION 02</span>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-500 uppercase block">EYEBROW:</label>
                  <input
                    type="text"
                    value={heroObjectSpec2Eyebrow}
                    onChange={(e) => {
                      isDirty.current = true;
                      setHeroObjectSpec2Eyebrow(e.target.value);
                    }}
                    placeholder="02 / STRUCTURAL INTEGRITY"
                    className="w-full bg-black border border-neutral-800 px-2.5 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-500 uppercase block">TITLE:</label>
                  <input
                    type="text"
                    value={heroObjectSpec2Title}
                    onChange={(e) => {
                      isDirty.current = true;
                      setHeroObjectSpec2Title(e.target.value);
                    }}
                    placeholder="ZERO-SAG 1-INCH COLLAR"
                    className="w-full bg-black border border-neutral-800 px-2.5 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-500 uppercase block">DESCRIPTION:</label>
                  <textarea
                    rows={3}
                    value={heroObjectSpec2Desc}
                    onChange={(e) => {
                      isDirty.current = true;
                      setHeroObjectSpec2Desc(e.target.value);
                    }}
                    placeholder="Twin-needle reinforced collar band with internal cotton herringbone tape..."
                    className="w-full bg-black border border-neutral-800 px-2.5 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* SPEC 03 */}
              <div className="bg-[#111] border border-neutral-800 rounded-lg p-4 space-y-3 border-l-2 border-l-neutral-600">
                <span className="text-[11px] font-bold uppercase text-neutral-300 block">SPECIFICATION 03</span>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-500 uppercase block">EYEBROW:</label>
                  <input
                    type="text"
                    value={heroObjectSpec3Eyebrow}
                    onChange={(e) => {
                      isDirty.current = true;
                      setHeroObjectSpec3Eyebrow(e.target.value);
                    }}
                    placeholder="03 / ATELIER FINISH"
                    className="w-full bg-black border border-neutral-800 px-2.5 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-500 uppercase block">TITLE:</label>
                  <input
                    type="text"
                    value={heroObjectSpec3Title}
                    onChange={(e) => {
                      isDirty.current = true;
                      setHeroObjectSpec3Title(e.target.value);
                    }}
                    placeholder="BLIND-STITCHED HEMS"
                    className="w-full bg-black border border-neutral-800 px-2.5 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-500 uppercase block">DESCRIPTION:</label>
                  <textarea
                    rows={3}
                    value={heroObjectSpec3Desc}
                    onChange={(e) => {
                      isDirty.current = true;
                      setHeroObjectSpec3Desc(e.target.value);
                    }}
                    placeholder="Seamless Japanese blind-hem technique for an uninterrupted silhouette..."
                    className="w-full bg-black border border-neutral-800 px-2.5 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            SECTION 4: THE SIGNATURE TEE (SPOTLIGHT CAMPAIGN VISUAL)
            ============================================================ */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-snake-green" />
                THE SIGNATURE TEE — SPOTLIGHT CAMPAIGN VISUAL
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Upload and manage the full-bleed campaign backdrop for the Spotlight Campaign section on the homepage. Completely independent of product catalog images.
              </p>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="px-4 py-1.5 bg-snake-green text-black font-bold uppercase text-xs rounded hover:bg-white transition-colors flex items-center gap-1.5 disabled:opacity-50 self-start sm:self-auto"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>SAVE IMAGE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Preview Thumbnail */}
            <div className="lg:col-span-7 bg-black border border-neutral-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                  LIVE PREVIEW
                </span>
                <button
                  type="button"
                  onClick={() => {
                    isDirty.current = true;
                    setSignatureTeeImage(DEFAULT_HOMEPAGE_CONFIG.signatureTeeImage || '');
                  }}
                  className="text-[10px] text-neutral-400 hover:text-white uppercase transition-colors"
                >
                  RESET DEFAULT
                </button>
              </div>

              <div className="relative aspect-[16/9] w-full bg-neutral-900 rounded-md overflow-hidden border border-neutral-800 group">
                <Image
                  src={
                    signatureTeeImage ||
                    DEFAULT_HOMEPAGE_CONFIG.signatureTeeImage ||
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=2400&auto=format&fit=crop'
                  }
                  alt="The Signature Tee Spotlight"
                  fill
                  unoptimized={signatureTeeImage?.startsWith('data:') || (signatureTeeImage ? !signatureTeeImage.includes('unsplash.com') : false)}
                  className="object-cover brightness-80 contrast-105"
                />
                <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 via-40% to-transparent pointer-events-none" />
                <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />
                <div className="absolute bottom-4 left-4 space-y-1">
                  <span className="text-[9px] font-mono tracking-widest text-snake-green uppercase block">SPOTLIGHT CAMPAIGN</span>
                  <span className="text-lg sm:text-xl font-display font-black text-white uppercase block">THE SIGNATURE TEE</span>
                  <span className="inline-block px-2.5 py-1 bg-snake-green text-black font-mono text-[9px] font-bold uppercase rounded-sm">SHOP NOW →</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="lg:col-span-5 bg-black border border-neutral-800 rounded-lg p-5 space-y-4">
              <span className="text-xs font-bold uppercase text-white tracking-wider block border-b border-neutral-800 pb-2">
                UPLOAD / UPDATE VISUAL
              </span>

              <div className="space-y-3">
                <label className="cursor-pointer w-full py-3 bg-neutral-900 border border-neutral-700 hover:border-snake-green text-white text-xs uppercase font-bold rounded flex items-center justify-center gap-2 transition-colors">
                  {isUploadingSignatureTee ? (
                    <Loader2 size={15} className="animate-spin text-snake-green" />
                  ) : (
                    <Upload size={15} className="text-snake-green" />
                  )}
                  <span>{isUploadingSignatureTee ? 'OPTIMIZING & UPLOADING...' : 'UPLOAD FROM DEVICE'}</span>
                  <input
                    ref={signatureTeeFileRef}
                    type="file"
                    accept="image/*"
                    disabled={isUploadingSignatureTee}
                    onChange={(e) =>
                      handleSingleUpload(
                        e,
                        setSignatureTeeImage,
                        setIsUploadingSignatureTee,
                        signatureTeeFileRef
                      )
                    }
                    className="hidden"
                  />
                </label>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">OR ENTER IMAGE URL:</span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={signatureTeeUrl}
                      onChange={(e) => setSignatureTeeUrl(e.target.value)}
                      className="flex-1 bg-[#111] border border-neutral-800 px-3 py-2 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!signatureTeeUrl.trim()) return;
                        isDirty.current = true;
                        setSignatureTeeImage(signatureTeeUrl.trim());
                        setSignatureTeeUrl('');
                      }}
                      className="px-4 py-2 bg-white text-black font-bold text-xs uppercase rounded hover:bg-snake-green transition-colors shrink-0"
                    >
                      SET
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 leading-relaxed pt-1">
                  Full-bleed cinematic landscape visual. Leave empty to automatically fallback to the primary product image.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            SECTION 5: THE THREE PILLARS (HONEST MATERIALS EDITORIAL)
            ============================================================ */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-snake-green" />
                THE THREE PILLARS — HONEST MATERIALS PHOTOGRAPHY
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Upload and manage the 3 editorial images representing the craftsmanship pillars on the homepage.
              </p>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="px-4 py-1.5 bg-snake-green text-black font-bold uppercase text-xs rounded hover:bg-white transition-colors flex items-center gap-1.5 disabled:opacity-50 self-start sm:self-auto"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>SAVE ALL PILLARS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PILLAR 1: PREMIUM FABRIC */}
            <div className="bg-black border border-neutral-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                  01 / PREMIUM FABRIC
                </span>
                <button
                  type="button"
                  onClick={() => {
                    isDirty.current = true;
                    setPillar1Image(DEFAULT_HOMEPAGE_CONFIG.pillar1Image || '');
                  }}
                  className="text-[10px] text-neutral-400 hover:text-white uppercase transition-colors"
                >
                  RESET DEFAULT
                </button>
              </div>

              {/* Preview Thumbnail */}
              <div className="relative aspect-[4/5] w-full bg-neutral-900 rounded-md overflow-hidden border border-neutral-800">
                <Image
                  src={pillar1Image || DEFAULT_HOMEPAGE_CONFIG.pillar1Image || ''}
                  alt="Pillar 1: Premium Fabric"
                  fill
                  unoptimized={pillar1Image?.startsWith('data:') || (pillar1Image ? !pillar1Image.includes('unsplash.com') : false)}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5 text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  01 / PILLAR
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className="text-xs font-mono font-bold uppercase text-white">PREMIUM FABRIC</span>
                </div>
              </div>

              {/* Upload & URL Controls */}
              <div className="space-y-2">
                <label className="cursor-pointer w-full py-2.5 bg-neutral-900 border border-neutral-700 hover:border-snake-green text-white text-xs uppercase font-bold rounded flex items-center justify-center gap-2 transition-colors">
                  {isUploadingPillar1 ? (
                    <Loader2 size={14} className="animate-spin text-snake-green" />
                  ) : (
                    <Upload size={14} className="text-snake-green" />
                  )}
                  <span>{isUploadingPillar1 ? 'OPTIMIZING...' : 'UPLOAD PILLAR 01'}</span>
                  <input
                    ref={pillar1FileRef}
                    type="file"
                    accept="image/*"
                    disabled={isUploadingPillar1}
                    onChange={(e) =>
                      handleSingleUpload(e, setPillar1Image, setIsUploadingPillar1, pillar1FileRef)
                    }
                    className="hidden"
                  />
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste URL..."
                    value={pillar1Url}
                    onChange={(e) => setPillar1Url(e.target.value)}
                    className="flex-1 bg-[#111] border border-neutral-800 px-3 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!pillar1Url.trim()) return;
                      isDirty.current = true;
                      setPillar1Image(pillar1Url.trim());
                      setPillar1Url('');
                    }}
                    className="px-3 py-1.5 bg-white text-black font-bold text-xs uppercase rounded hover:bg-snake-green transition-colors shrink-0"
                  >
                    SET
                  </button>
                </div>
              </div>
            </div>

            {/* PILLAR 2: BUILT FOR COMFORT */}
            <div className="bg-black border border-neutral-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                  02 / BUILT FOR COMFORT
                </span>
                <button
                  type="button"
                  onClick={() => {
                    isDirty.current = true;
                    setPillar2Image(DEFAULT_HOMEPAGE_CONFIG.pillar2Image || '');
                  }}
                  className="text-[10px] text-neutral-400 hover:text-white uppercase transition-colors"
                >
                  RESET DEFAULT
                </button>
              </div>

              {/* Preview Thumbnail */}
              <div className="relative aspect-[4/5] w-full bg-neutral-900 rounded-md overflow-hidden border border-neutral-800">
                <Image
                  src={pillar2Image || DEFAULT_HOMEPAGE_CONFIG.pillar2Image || ''}
                  alt="Pillar 2: Built for Comfort"
                  fill
                  unoptimized={pillar2Image?.startsWith('data:') || (pillar2Image ? !pillar2Image.includes('unsplash.com') : false)}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5 text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  02 / PILLAR
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className="text-xs font-mono font-bold uppercase text-white">BUILT FOR COMFORT</span>
                </div>
              </div>

              {/* Upload & URL Controls */}
              <div className="space-y-2">
                <label className="cursor-pointer w-full py-2.5 bg-neutral-900 border border-neutral-700 hover:border-snake-green text-white text-xs uppercase font-bold rounded flex items-center justify-center gap-2 transition-colors">
                  {isUploadingPillar2 ? (
                    <Loader2 size={14} className="animate-spin text-snake-green" />
                  ) : (
                    <Upload size={14} className="text-snake-green" />
                  )}
                  <span>{isUploadingPillar2 ? 'OPTIMIZING...' : 'UPLOAD PILLAR 02'}</span>
                  <input
                    ref={pillar2FileRef}
                    type="file"
                    accept="image/*"
                    disabled={isUploadingPillar2}
                    onChange={(e) =>
                      handleSingleUpload(e, setPillar2Image, setIsUploadingPillar2, pillar2FileRef)
                    }
                    className="hidden"
                  />
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste URL..."
                    value={pillar2Url}
                    onChange={(e) => setPillar2Url(e.target.value)}
                    className="flex-1 bg-[#111] border border-neutral-800 px-3 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!pillar2Url.trim()) return;
                      isDirty.current = true;
                      setPillar2Image(pillar2Url.trim());
                      setPillar2Url('');
                    }}
                    className="px-3 py-1.5 bg-white text-black font-bold text-xs uppercase rounded hover:bg-snake-green transition-colors shrink-0"
                  >
                    SET
                  </button>
                </div>
              </div>
            </div>

            {/* PILLAR 3: DESIGNED TO LAST */}
            <div className="bg-black border border-neutral-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                  03 / DESIGNED TO LAST
                </span>
                <button
                  type="button"
                  onClick={() => {
                    isDirty.current = true;
                    setPillar3Image(DEFAULT_HOMEPAGE_CONFIG.pillar3Image || '');
                  }}
                  className="text-[10px] text-neutral-400 hover:text-white uppercase transition-colors"
                >
                  RESET DEFAULT
                </button>
              </div>

              {/* Preview Thumbnail */}
              <div className="relative aspect-[4/5] w-full bg-neutral-900 rounded-md overflow-hidden border border-neutral-800">
                <Image
                  src={pillar3Image || DEFAULT_HOMEPAGE_CONFIG.pillar3Image || ''}
                  alt="Pillar 3: Designed to Last"
                  fill
                  unoptimized={pillar3Image?.startsWith('data:') || (pillar3Image ? !pillar3Image.includes('unsplash.com') : false)}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5 text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  03 / PILLAR
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className="text-xs font-mono font-bold uppercase text-white">DESIGNED TO LAST</span>
                </div>
              </div>

              {/* Upload & URL Controls */}
              <div className="space-y-2">
                <label className="cursor-pointer w-full py-2.5 bg-neutral-900 border border-neutral-700 hover:border-snake-green text-white text-xs uppercase font-bold rounded flex items-center justify-center gap-2 transition-colors">
                  {isUploadingPillar3 ? (
                    <Loader2 size={14} className="animate-spin text-snake-green" />
                  ) : (
                    <Upload size={14} className="text-snake-green" />
                  )}
                  <span>{isUploadingPillar3 ? 'OPTIMIZING...' : 'UPLOAD PILLAR 03'}</span>
                  <input
                    ref={pillar3FileRef}
                    type="file"
                    accept="image/*"
                    disabled={isUploadingPillar3}
                    onChange={(e) =>
                      handleSingleUpload(e, setPillar3Image, setIsUploadingPillar3, pillar3FileRef)
                    }
                    className="hidden"
                  />
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste URL..."
                    value={pillar3Url}
                    onChange={(e) => setPillar3Url(e.target.value)}
                    className="flex-1 bg-[#111] border border-neutral-800 px-3 py-1.5 text-white text-xs rounded focus:border-snake-green focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!pillar3Url.trim()) return;
                      isDirty.current = true;
                      setPillar3Image(pillar3Url.trim());
                      setPillar3Url('');
                    }}
                    className="px-3 py-1.5 bg-white text-black font-bold text-xs uppercase rounded hover:bg-snake-green transition-colors shrink-0"
                  >
                    SET
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            SECTION 6: EDITORIAL HEADLINE & COPY
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
            <div className="text-[11px] text-neutral-400">
              Changes will update the live homepage and persist to Supabase.
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-snake-green text-black font-bold uppercase rounded hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(4,252,33,0.3)] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>SAVING CHANGES...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>PUBLISH CHANGES</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


