'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  Sparkles,
  Check,
  X,
  Search,
  Filter,
  Palette,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Shirt,
  Calendar,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Collection, CollectionColor } from '@/lib/types';
import { sanitizeString, sanitizeSlug } from '@/lib/security';

const PRESET_IMAGE_OPTIONS = [
  { label: 'Panther Hero Front', url: '/collection-black-panther-hero.jpg' },
  { label: 'Panther Card Back', url: '/collection-black-panther-card.jpg' },
  { label: 'Royals Hero', url: '/collection-the-royals-hero.jpg' },
  { label: 'Royals Card', url: '/collection-the-royals-card.jpg' },
  { label: 'Obsidian Predator', url: '/hero2.png' },
  { label: 'Men Heavyweight', url: '/men-collection.png' },
  { label: 'Women Heavyweight', url: '/women-collection.png' },
  { label: 'Signature Spotlight', url: '/signature-tee-spotlight.png' },
  { label: 'Master Snake Tee', url: '/hero-object-supersnake-tee.png' },
  { label: 'Fabric Mastery', url: '/brand-pillar-fabric.png' },
  { label: 'Architectural Drape', url: '/brand-pillar-fit.png' },
  { label: 'Artisanal Finish', url: '/brand-pillar-finish.png' },
  { label: 'Community Collective', url: '/community-supersnake.png' },
];

const PRESET_PALETTES = [
  {
    name: 'Panther Shadow',
    colors: [
      { name: 'Obsidian Black', hex: '#0a0a0a' },
      { name: 'Panther Charcoal', hex: '#1c1c1c' },
      { name: 'Shadow Mineral', hex: '#2b2b2b' },
      { name: 'Restrained Venom', hex: '#04fc21' },
    ],
  },
  {
    name: 'Imperial Royalty',
    colors: [
      { name: 'Midnight Navy', hex: '#0d1527' },
      { name: 'Imperial Gold', hex: '#c5a059' },
      { name: 'Vintage Burgundy', hex: '#3b1219' },
      { name: 'Bone Ivory', hex: '#e6dfd5' },
    ],
  },
  {
    name: 'Primal Viper',
    colors: [
      { name: 'Venom Green', hex: '#04fc21' },
      { name: 'Obsidian Black', hex: '#0a0a0a' },
      { name: 'Serpent Emerald', hex: '#0d381e' },
      { name: 'Smoked Ash', hex: '#383838' },
    ],
  },
  {
    name: 'Quiet Aura',
    colors: [
      { name: 'Chalk White', hex: '#f2f2f2' },
      { name: 'Bone Ivory', hex: '#e6dfd5' },
      { name: 'Misty Oat', hex: '#cfc6b8' },
      { name: 'Quiet Clay', hex: '#8a7d6d' },
    ],
  },
  {
    name: 'Midnight Cyan',
    colors: [
      { name: 'Acid Charcoal', hex: '#1e1e1e' },
      { name: 'Royal Violet', hex: '#1e142e' },
      { name: 'Electric Cyan', hex: '#00e5ff' },
      { name: 'Deep Pitch', hex: '#050505' },
    ],
  },
  {
    name: 'Velocity Lab',
    colors: [
      { name: 'Carbon Black', hex: '#121212' },
      { name: 'Racing Silver', hex: '#d4d4d4' },
      { name: 'Telemetry Red', hex: '#e50914' },
      { name: 'Asphalt Grey', hex: '#404040' },
    ],
  },
];

export default function AdminCollectionsPage() {
  const { collections, addCollection, updateCollection, deleteCollection, products } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ACTIVE' | 'FEATURED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [badge, setBadge] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [artworkMood, setArtworkMood] = useState('');
  const [fabricSpecs, setFabricSpecs] = useState('');
  const [heroImage, setHeroImage] = useState('/hero2.png');
  const [cardImage, setCardImage] = useState('/men-collection.png');
  const [accentColor, setAccentColor] = useState('#04fc21');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(true);
  const [moodPalette, setMoodPalette] = useState<CollectionColor[]>([
    { name: 'Obsidian Black', hex: '#0a0a0a' },
    { name: 'Venom Accent', hex: '#04fc21' },
  ]);

  // Color Builder sub-state
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#04fc21');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered collections
  const filteredCollections = useMemo(() => {
    return collections
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.badge && c.badge.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (c.tagline && c.tagline.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterMode === 'ACTIVE') return c.isActive;
        if (filterMode === 'FEATURED') return c.isFeatured;
        return true;
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [collections, searchQuery, filterMode]);

  // Stats
  const stats = useMemo(() => {
    const total = collections.length;
    const active = collections.filter((c) => c.isActive).length;
    const featured = collections.filter((c) => c.isFeatured).length;
    const assignedProducts = products.filter((p) => Boolean(p.collectionSlug || p.collectionId)).length;
    return { total, active, featured, assignedProducts };
  }, [collections, products]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCollectionId(null);
    setName('');
    setSlug('');
    setBadge(`CHAPTER 0${collections.length + 1} // NEW SERIES`);
    setTagline('Art-directed series exploring a distinct visual aesthetic and narrative.');
    setDescription(
      'Constructed with meticulous attention to silhouette, weight, and subtle branding. Every garment reflects an uncompromising commitment to luxury streetwear.'
    );
    setArtworkMood('Precision chest crest, tonal high-density embroidery, custom interior neck tape.');
    setFabricSpecs('280 GSM Compact Long-Staple Supima® Cotton, Zero-Sag Ribbed Collar, Boxy Contour.');
    setHeroImage('/hero2.png');
    setCardImage('/men-collection.png');
    setAccentColor('#04fc21');
    setDisplayOrder(collections.length + 1);
    setIsActive(true);
    setIsFeatured(true);
    setMoodPalette([
      { name: 'Obsidian Black', hex: '#0a0a0a' },
      { name: 'Venom Accent', hex: '#04fc21' },
      { name: 'Washed Charcoal', hex: '#262626' },
      { name: 'Chalk White', hex: '#f2f2f2' },
    ]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (col: Collection) => {
    setEditingCollectionId(col.id);
    setName(col.name);
    setSlug(col.slug);
    setBadge(col.badge || '');
    setTagline(col.tagline || '');
    setDescription(col.description || '');
    setArtworkMood(col.artworkMood || '');
    setFabricSpecs(col.fabricSpecs || '');
    setHeroImage(col.heroImage || '/hero2.png');
    setCardImage(col.cardImage || '/men-collection.png');
    setAccentColor(col.accentColor || '#04fc21');
    setDisplayOrder(col.displayOrder || 1);
    setIsActive(col.isActive !== false);
    setIsFeatured(Boolean(col.isFeatured));
    setMoodPalette(Array.isArray(col.moodPalette) && col.moodPalette.length > 0 ? col.moodPalette : [
      { name: 'Obsidian Black', hex: '#0a0a0a' },
      { name: 'Signature Accent', hex: '#04fc21' },
    ]);
    setIsModalOpen(true);
  };

  // Name change auto-generates slug if new
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCollectionId) {
      setSlug(sanitizeSlug(val));
    }
  };

  // Add color to mood palette
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const cleanName = sanitizeString(newColorName.trim());
    if (moodPalette.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
      alert('A color with this name already exists in the palette.');
      return;
    }
    setMoodPalette((prev) => [...prev, { name: cleanName, hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (index: number) => {
    if (moodPalette.length <= 1) {
      alert('A collection should maintain at least one mood color.');
      return;
    }
    setMoodPalette((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyPresetPalette = (preset: typeof PRESET_PALETTES[0]) => {
    setMoodPalette([...preset.colors]);
    if (preset.colors[0]?.hex) {
      setAccentColor(preset.colors[preset.colors.length - 1]?.hex || '#04fc21');
    }
  };

  // Toggle Active
  const handleToggleActive = async (col: Collection) => {
    const nextState = !col.isActive;
    await updateCollection(col.id, { isActive: nextState });
    showNotification(`"${col.name}" is now ${nextState ? 'ACTIVE' : 'HIDDEN'} on the storefront.`);
  };

  // Toggle Featured
  const handleToggleFeatured = async (col: Collection) => {
    const nextState = !col.isFeatured;
    await updateCollection(col.id, { isFeatured: nextState });
    showNotification(`"${col.name}" featured status updated.`);
  };

  // Delete Collection
  const handleDeleteCollection = async (col: Collection) => {
    const count = products.filter((p) => p.collectionSlug === col.slug || p.collectionId === col.id).length;
    const confirmMsg = count > 0
      ? `"${col.name}" currently has ${count} product(s) assigned to it. Deleting will unassign these garments. Continue?`
      : `Are you sure you want to permanently delete the "${col.name}" series?`;

    if (!window.confirm(confirmMsg)) return;

    await deleteCollection(col.id);
    showNotification(`Collection series "${col.name}" deleted.`);
  };

  // Save Collection
  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Series name is required.');
      return;
    }

    const cleanName = sanitizeString(name.trim().toUpperCase());
    const cleanSlug = sanitizeSlug(slug.trim() || cleanName);

    if (moodPalette.length === 0) {
      alert('Please define at least one mood palette color.');
      return;
    }

    if (editingCollectionId) {
      const updates: Partial<Collection> = {
        name: cleanName,
        slug: cleanSlug,
        badge: sanitizeString(badge.trim()),
        tagline: sanitizeString(tagline.trim()),
        description: sanitizeString(description.trim()),
        artworkMood: sanitizeString(artworkMood.trim()),
        fabricSpecs: sanitizeString(fabricSpecs.trim()),
        heroImage: heroImage.trim() || '/hero2.png',
        cardImage: cardImage.trim() || '/men-collection.png',
        accentColor: accentColor.trim() || '#04fc21',
        displayOrder: Number(displayOrder) || 1,
        isActive,
        isFeatured,
        moodPalette,
      };

      await updateCollection(editingCollectionId, updates);
      showNotification(`Collection series "${cleanName}" updated successfully.`);
    } else {
      const newCollection: Collection = {
        id: `col-${cleanSlug}-${Date.now()}`,
        name: cleanName,
        slug: cleanSlug,
        badge: sanitizeString(badge.trim()) || `CHAPTER 0${collections.length + 1}`,
        tagline: sanitizeString(tagline.trim()),
        description: sanitizeString(description.trim()),
        artworkMood: sanitizeString(artworkMood.trim()),
        fabricSpecs: sanitizeString(fabricSpecs.trim()),
        heroImage: heroImage.trim() || '/hero2.png',
        cardImage: cardImage.trim() || '/men-collection.png',
        accentColor: accentColor.trim() || '#04fc21',
        displayOrder: Number(displayOrder) || collections.length + 1,
        isActive,
        isFeatured,
        moodPalette,
        createdAt: new Date().toISOString(),
      };

      await addCollection(newCollection);
      showNotification(`New series "${cleanName}" created and added to the SuperSnake universe.`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 font-mono pb-20">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-black/95 text-snake-green border border-snake-green px-5 py-3 rounded-md shadow-[0_0_25px_rgba(4,252,33,0.3)] flex items-center gap-3 text-xs tracking-wider uppercase animate-in fade-in slide-in-from-top-4">
          <Check size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* ============================================================
          01 — HEADER
          ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-snake-green/10 border border-snake-green/20 text-[10px] text-snake-green uppercase tracking-widest mb-2">
            <Layers size={11} />
            <span>FASHION UNIVERSE // ATELIER CHAPTERS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white tracking-tight">
            COLLECTION SERIES & CHAPTERS
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Every SuperSnake T-shirt belongs to a curated series with its own theme, mood, color palette, artwork, and personality. Manage existing chapters or dynamically create new collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/collections"
            target="_blank"
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs uppercase tracking-wider transition-colors flex items-center gap-2 rounded-sm"
          >
            <Eye size={13} />
            <span>VIEW STOREFRONT</span>
            <ArrowUpRight size={13} className="text-neutral-500" />
          </Link>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-snake-green hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 rounded-sm shadow-[0_0_20px_rgba(4,252,33,0.3)] hover:shadow-none"
          >
            <Plus size={14} />
            <span>NEW COLLECTION SERIES</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          02 — METRICS
          ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d0d0d] border border-neutral-800 p-4 rounded-sm">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
            TOTAL CHAPTERS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-white">{stats.total}</span>
            <span className="text-[10px] text-neutral-400">SERIES DEFINED</span>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-neutral-800 p-4 rounded-sm">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
            ACTIVE ON STOREFRONT
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-snake-green">{stats.active}</span>
            <span className="text-[10px] text-neutral-400">OF {stats.total} VISIBLE</span>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-neutral-800 p-4 rounded-sm">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
            FEATURED DROPS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-white">{stats.featured}</span>
            <span className="text-[10px] text-neutral-400">HERO HIGHLIGHTS</span>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-neutral-800 p-4 rounded-sm">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
            GARMENTS ASSIGNED
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-white">{stats.assignedProducts}</span>
            <span className="text-[10px] text-neutral-400">PIECES LINKED</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          03 — SEARCH & FILTERS
          ============================================================ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d0d0d] border border-neutral-800 p-3 rounded-sm">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search series by name, slug, badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-neutral-800 rounded-sm pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'ACTIVE', 'FEATURED'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-sm transition-all ${
                filterMode === mode
                  ? 'bg-white text-black font-bold'
                  : 'bg-black text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================
          04 — COLLECTIONS TABLE & LIST
          ============================================================ */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0e0e0e] text-neutral-400 uppercase text-[10px] tracking-widest">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">SERIES / CHAPTER</th>
                <th className="py-3 px-4 hidden md:table-cell">BADGE & THEME</th>
                <th className="py-3 px-4">MOOD PALETTE</th>
                <th className="py-3 px-4 text-center">PIECES</th>
                <th className="py-3 px-4 text-center">ACTIVE</th>
                <th className="py-3 px-4 text-center">FEATURED</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-500">
                    No collection series matching your query.
                  </td>
                </tr>
              ) : (
                filteredCollections.map((col) => {
                  const pieceCount = products.filter(
                    (p) =>
                      p.collectionSlug === col.slug ||
                      p.collectionId === col.id ||
                      (col.slug === 'the-serpent' && (p.slug === 'the-serpent-tee' || p.slug === 'the-venom-edition'))
                  ).length;

                  return (
                    <tr key={col.id} className="hover:bg-neutral-900/40 transition-colors group">
                      {/* Order */}
                      <td className="py-4 px-4 text-center text-neutral-500 font-mono text-[11px]">
                        0{col.displayOrder || 1}
                      </td>

                      {/* Series Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 bg-neutral-950 border border-neutral-800 rounded overflow-hidden shrink-0">
                            <Image
                              src={col.cardImage || col.heroImage || '/hero2.png'}
                              alt={col.name}
                              fill
                              className="object-cover"
                            />
                            {col.accentColor && (
                              <div
                                className="absolute bottom-0 inset-x-0 h-1"
                                style={{ backgroundColor: col.accentColor }}
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs uppercase tracking-wide">
                                {col.name}
                              </span>
                              <Link
                                href={`/collections/${col.slug}`}
                                target="_blank"
                                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-snake-green transition-opacity"
                                title="Preview on storefront"
                              >
                                <ExternalLink size={12} />
                              </Link>
                            </div>
                            <span className="text-[10px] text-neutral-500 font-mono block">
                              /collections/{col.slug}
                            </span>
                            <span className="text-[11px] text-neutral-400 line-clamp-1 max-w-xs mt-0.5">
                              {col.tagline}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Badge & Theme */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="inline-block px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[9px] text-neutral-300 uppercase tracking-widest mb-1">
                          {col.badge || 'ATELIER DROP'}
                        </span>
                        <p className="text-[10px] text-neutral-500 line-clamp-2 max-w-xs">
                          {col.artworkMood || 'Precision typography and subtle tonal embroidery.'}
                        </p>
                      </td>

                      {/* Mood Palette */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-[160px]">
                          {col.moodPalette?.map((swatch, sIdx) => (
                            <div
                              key={`${swatch.name}-${sIdx}`}
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm relative group/swatch"
                              style={{ backgroundColor: swatch.hex }}
                              title={`${swatch.name} (${swatch.hex})`}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Product Pieces */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300">
                          <Shirt size={10} className="text-snake-green" />
                          <span>{pieceCount}</span>
                        </span>
                      </td>

                      {/* Active Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(col)}
                          className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                            col.isActive !== false ? 'bg-snake-green' : 'bg-neutral-800'
                          }`}
                          title={col.isActive !== false ? 'Active (Click to Hide)' : 'Hidden (Click to Activate)'}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-black transition-transform ${
                              col.isActive !== false ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(col)}
                          className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                            col.isFeatured ? 'bg-white' : 'bg-neutral-800'
                          }`}
                          title={col.isFeatured ? 'Featured (Click to unfeature)' : 'Not Featured'}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-black transition-transform ${
                              col.isFeatured ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(col)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                            title="Edit Series"
                          >
                            <Edit2 size={13} />
                          </button>
                          <Link
                            href={`/collections/${col.slug}`}
                            target="_blank"
                            className="p-1.5 text-neutral-400 hover:text-snake-green hover:bg-neutral-800 rounded transition-colors"
                            title="View Public Page"
                          >
                            <Eye size={13} />
                          </Link>
                          <button
                            onClick={() => handleDeleteCollection(col)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
                            title="Delete Series"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          05 — CREATE / EDIT MODAL
          ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0d0d0d] border border-neutral-800 rounded-sm shadow-2xl my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#111]">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-snake-green" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  {editingCollectionId ? 'EDIT COLLECTION SERIES' : 'CREATE NEW COLLECTION SERIES'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCollection} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Row 1: Name and Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-bold">
                    SERIES NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. THE BLACK PANTHER"
                    className="w-full bg-black border border-neutral-800 rounded-sm px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-snake-green uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-bold">
                    URL SLUG *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
                    placeholder="e.g. the-black-panther"
                    className="w-full bg-black border border-neutral-800 rounded-sm px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-snake-green font-mono"
                  />
                  <span className="text-[9px] text-neutral-500 mt-1 block">
                    URL: /collections/{slug || '...'}
                  </span>
                </div>
              </div>

              {/* Row 2: Badge and Tagline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-bold">
                    BADGE / NOMENCLATURE
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. CHAPTER 01 // SHADOW PREDATOR"
                    className="w-full bg-black border border-neutral-800 rounded-sm px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-snake-green uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-bold">
                    TAGLINE
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Power, stealth, and feline elegance engineered in deep shadow tones."
                    className="w-full bg-black border border-neutral-800 rounded-sm px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-snake-green"
                  />
                </div>
              </div>

              {/* Row 3: Narrative Story / Manifesto */}
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-bold">
                  CHAPTER STORY & DESIGN MANIFESTO *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the creative inspiration, mood, and persona of this series..."
                  className="w-full bg-black border border-neutral-800 rounded-sm px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-snake-green leading-relaxed"
                />
              </div>

              {/* Row 4: Artwork & Fabric Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-bold">
                    ARTWORK & GRAPHIC MOTIFS
                  </label>
                  <textarea
                    rows={2}
                    value={artworkMood}
                    onChange={(e) => setArtworkMood(e.target.value)}
                    placeholder="e.g. Micro-embossed chest crest, tonal embroidery, neon bar-tacks..."
                    className="w-full bg-black border border-neutral-800 rounded-sm px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-snake-green"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-bold">
                    FABRIC & CONSTRUCTION DOSSIER
                  </label>
                  <textarea
                    rows={2}
                    value={fabricSpecs}
                    onChange={(e) => setFabricSpecs(e.target.value)}
                    placeholder="e.g. 280–300 GSM Heavyweight Supima®, 1-inch zero-sag collar..."
                    className="w-full bg-black border border-neutral-800 rounded-sm px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-snake-green"
                  />
                </div>
              </div>

              {/* Row 5: Imagery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-bold">
                    HERO BACKDROP IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="/hero2.png or https://..."
                    className="w-full bg-black border border-neutral-800 rounded-sm px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-snake-green font-mono text-[11px]"
                  />
                  {/* Preset quick links */}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {PRESET_IMAGE_OPTIONS.slice(0, 4).map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setHeroImage(p.url)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-bold">
                    CARD THUMBNAIL IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={cardImage}
                    onChange={(e) => setCardImage(e.target.value)}
                    placeholder="/men-collection.png or https://..."
                    className="w-full bg-black border border-neutral-800 rounded-sm px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-snake-green font-mono text-[11px]"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {PRESET_IMAGE_OPTIONS.slice(4, 8).map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setCardImage(p.url)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 6: Mood Color Palette Builder */}
              <div className="border border-neutral-800 p-4 rounded-sm bg-neutral-950">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Palette size={14} className="text-snake-green" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      MOOD COLOR PALETTE SWATCHES
                    </span>
                  </div>
                  <span className="text-[9px] text-neutral-500 font-mono">
                    {moodPalette.length} SWATCHES CONFIGURED
                  </span>
                </div>

                {/* Preset Palettes Quick Pick */}
                <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[9px] text-neutral-500 uppercase tracking-widest shrink-0">
                    PRESETS:
                  </span>
                  {PRESET_PALETTES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPresetPalette(preset)}
                      className="px-2 py-0.5 text-[9px] rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-snake-green hover:border-snake-green/40 whitespace-nowrap transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                {/* Current Swatches */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {moodPalette.map((color, idx) => (
                    <div
                      key={`${color.name}-${idx}`}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black border border-neutral-800 text-white"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] font-mono">{color.name}</span>
                      <span className="text-[9px] text-neutral-500 font-mono">({color.hex})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-neutral-500 hover:text-red-400 ml-1"
                        title="Remove swatch"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Swatch Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Color Name (e.g. Royal Gold)"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="flex-1 bg-black border border-neutral-800 rounded px-2.5 py-1.5 text-[11px] text-white placeholder-neutral-600 focus:outline-none focus:border-snake-green"
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-8 h-8 rounded border border-neutral-800 bg-transparent cursor-pointer p-0.5"
                    title="Choose Hex Color"
                  />
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    placeholder="#hex"
                    className="w-24 bg-black border border-neutral-800 rounded px-2 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-snake-green"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                  >
                    ADD SWATCH
                  </button>
                </div>
              </div>

              {/* Row 7: Order, Accent, and Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-bold">
                    DISPLAY ORDER
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-black border border-neutral-800 rounded-sm px-3 py-2 text-white focus:outline-none focus:border-snake-green font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-bold">
                    SIGNATURE ACCENT COLOR
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded border border-neutral-800 bg-transparent cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 bg-black border border-neutral-800 rounded-sm px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-snake-green"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-neutral-800 text-snake-green focus:ring-0 w-4 h-4"
                    />
                    <span className="text-[10px] uppercase tracking-wider text-neutral-300">
                      ACTIVE (VISIBLE IN STORE)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-neutral-800 text-snake-green focus:ring-0 w-4 h-4"
                    />
                    <span className="text-[10px] uppercase tracking-wider text-neutral-300">
                      FEATURED (HERO PROMOTION)
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs uppercase tracking-wider rounded-sm transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-snake-green hover:bg-white text-black text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(4,252,33,0.3)] hover:shadow-none"
                >
                  {editingCollectionId ? 'SAVE CHANGES' : 'CREATE SERIES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
