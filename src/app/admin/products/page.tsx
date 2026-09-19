'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Copy,
  Trash2,
  Search,
  Check,
  Eye,
  Upload,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Palette,
  Ruler,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Product, Size, Gender, FitType } from '@/lib/types';
import { formatPrice } from '@/lib/design-tokens';
import { sanitizeString, sanitizeSlug, sanitizeNumber, isValidImageSource } from '@/lib/security';

const LUXURY_COLOR_PRESETS = [
  { name: 'Obsidian Black', hex: '#0a0a0a' },
  { name: 'Chalk White', hex: '#f2f2f2' },
  { name: 'Washed Charcoal', hex: '#262626' },
  { name: 'Sage Olive', hex: '#3d4a3e' },
  { name: 'Deep Forest', hex: '#112217' },
  { name: 'Bone Ivory', hex: '#e6dfd5' },
  { name: 'Raw Sand', hex: '#8a7d6d' },
  { name: 'Vintage Navy', hex: '#162238' },
  { name: 'Crimson Burgundy', hex: '#3b1219' },
];

const ALL_SIZES: Size[] = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL'];

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(1499);
  const [mrp, setMrp] = useState<number>(2499);
  const [gsm, setGsm] = useState<number>(280);
  const [fit, setFit] = useState<FitType>('Boxy');
  const [gender, setGender] = useState<Gender>('unisex');
  const [fabric, setFabric] = useState('100% Long-Staple Supima® Cotton (280 GSM Heavyweight)');
  const [specificationsText, setSpecificationsText] = useState(
    '280 GSM Heavyweight structure\nZero-sag reinforced 1-inch collar\nPre-shrunk architectural geometry\nHigh-density luxury stitch finish'
  );
  const [careInstructionsText, setCareInstructionsText] = useState(
    'Machine wash cold, inside out with like colors\nDo not tumble dry\nLay flat to dry in shade\nCool iron on reverse; avoid contact with prints/embroidery'
  );
  const [isNewProduct, setIsNewProduct] = useState(true);

  // Selected Sizes & Colors
  const [selectedSizes, setSelectedSizes] = useState<Size[]>(['S', 'M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Obsidian Black', hex: '#0a0a0a' },
  ]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#04fc21');

  // Image Upload State
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered product list
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = selectedGender === 'all' || p.gender === selectedGender;
    return matchesSearch && matchesGender;
  });

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Only image files (PNG, JPG, WEBP) are supported.');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size should be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result && isValidImageSource(result)) {
          setUploadedImages((prev) => [
            ...prev,
            {
              url: result,
              alt: `${name || 'Product'} Image`,
              angle: prev.length === 0 ? 'front' : prev.length === 1 ? 'model' : 'fabric',
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddExternalImageUrl = () => {
    if (!externalImageUrl.trim()) return;
    if (!isValidImageSource(externalImageUrl.trim())) {
      alert('Please enter a valid https:// image URL.');
      return;
    }

    setUploadedImages((prev) => [
      ...prev,
      {
        url: externalImageUrl.trim(),
        alt: `${name || 'Product'} Image`,
        angle: prev.length === 0 ? 'front' : 'model',
      },
    ]);
    setExternalImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: Size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const selectAllSizes = () => {
    setSelectedSizes([...ALL_SIZES]);
  };

  const selectCoreSizes = () => {
    setSelectedSizes(['S', 'M', 'L', 'XL']);
  };

  const clearAllSizes = () => {
    setSelectedSizes([]);
  };

  const toggleColorPreset = (preset: { name: string; hex: string }) => {
    setSelectedColors((prev) => {
      const exists = prev.some((c) => c.name === preset.name);
      if (exists) {
        return prev.length > 1 ? prev.filter((c) => c.name !== preset.name) : prev;
      }
      return [...prev, preset];
    });
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    const cleanName = sanitizeString(customColorName.trim());
    setSelectedColors((prev) => [...prev, { name: cleanName, hex: customColorHex }]);
    setCustomColorName('');
  };

  const handleOpenCreateModal = () => {
    setEditingProductId(null);
    setName('');
    setTagline('');
    setDescription('Constructed from premium heavyweight long-staple cotton with architectural drape.');
    setPrice(1499);
    setMrp(2499);
    setGsm(280);
    setFit('Boxy');
    setGender('unisex');
    setFabric('100% Long-Staple Supima® Cotton (280 GSM Heavyweight)');
    setSpecificationsText(
      '280 GSM Heavyweight structure\nZero-sag reinforced 1-inch collar\nPre-shrunk architectural geometry\nHigh-density luxury stitch finish'
    );
    setCareInstructionsText(
      'Machine wash cold, inside out with like colors\nDo not tumble dry\nLay flat to dry in shade\nCool iron on reverse; avoid contact with prints/embroidery'
    );
    setIsNewProduct(true);
    setSelectedSizes(['S', 'M', 'L', 'XL']);
    setSelectedColors([{ name: 'Obsidian Black', hex: '#0a0a0a' }]);
    setUploadedImages([
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1600&auto=format&fit=crop',
        alt: 'Front View in Studio Lighting',
        angle: 'front',
      },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setName(prod.name);
    setTagline(prod.tagline || '');
    setDescription(prod.description || '');
    setPrice(prod.price);
    setMrp(prod.mrp);
    setGsm(prod.gsm);
    setFit(prod.fit);
    setGender(prod.gender);
    setFabric(prod.fabric || `${prod.gsm} GSM 100% Long-Staple Supima® Cotton`);
    setSpecificationsText(
      prod.features && prod.features.length > 0
        ? prod.features.join('\n')
        : `${prod.gsm} GSM Heavyweight structure\nZero-sag reinforced 1-inch collar\nPre-shrunk architectural geometry\nHigh-density luxury stitch finish`
    );
    setCareInstructionsText(
      prod.careInstructions && prod.careInstructions.length > 0
        ? prod.careInstructions.join('\n')
        : 'Machine wash cold, inside out with like colors\nDo not tumble dry\nLay flat to dry in shade\nCool iron on reverse; avoid contact with prints/embroidery'
    );
    setIsNewProduct(prod.isNew ?? true);
    setSelectedSizes(prod.sizes || ['S', 'M', 'L', 'XL']);
    setSelectedColors(prod.colors || [{ name: 'Obsidian Black', hex: '#0a0a0a' }]);
    setUploadedImages(
      prod.images.map((img) => ({
        url: img.url,
        alt: img.alt,
        angle: img.angle || 'front',
      }))
    );
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Product name is required.');
      return;
    }
    if (selectedSizes.length === 0) {
      alert('Select at least one available size (from XXS to 6XL).');
      return;
    }
    if (selectedColors.length === 0) {
      alert('Select at least one available color.');
      return;
    }
    if (uploadedImages.length === 0) {
      alert('Please upload or provide at least one product image.');
      return;
    }

    const cleanName = sanitizeString(name);
    const cleanSlug = sanitizeSlug(cleanName);
    const cleanPrice = sanitizeNumber(price, 1499);
    const cleanMrp = sanitizeNumber(mrp, Math.max(cleanPrice, 2499));
    const cleanGsm = sanitizeNumber(gsm, 280);

    const parsedFeatures = specificationsText
      .split('\n')
      .map((line) => sanitizeString(line.trim()))
      .filter(Boolean);

    const parsedCare = careInstructionsText
      .split('\n')
      .map((line) => sanitizeString(line.trim()))
      .filter(Boolean);

    // Build variant matrix
    const variants = selectedColors.flatMap((c) =>
      selectedSizes.map((s) => ({
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sku: `SS-${cleanName.slice(0, 3).toUpperCase()}-${c.name.slice(0, 3).toUpperCase()}-${s}`,
        colorName: c.name,
        colorHex: c.hex,
        size: s,
        stock: 30,
        price: cleanPrice,
        mrp: cleanMrp,
      }))
    );

    const existingProd = editingProductId ? products.find((p) => p.id === editingProductId) : null;

    const productPayload: Product = {
      id: editingProductId || `prod-${Date.now()}`,
      name: cleanName,
      slug: cleanSlug,
      tagline: sanitizeString(tagline || `${cleanGsm} GSM Engineered luxury garment`),
      description: sanitizeString(
        description || 'Constructed from premium heavyweight long-staple cotton with architectural drape.'
      ),
      gender,
      fit,
      price: cleanPrice,
      mrp: cleanMrp,
      gsm: cleanGsm,
      fabric: sanitizeString(fabric || `${cleanGsm} GSM 100% Long-Staple Supima® Cotton`),
      careInstructions:
        parsedCare.length > 0
          ? parsedCare
          : [
              'Machine wash cold, inside out with like colors',
              'Do not tumble dry',
              'Lay flat to dry in shade',
              'Cool iron on reverse; avoid contact with prints/embroidery',
            ],
      features:
        parsedFeatures.length > 0
          ? parsedFeatures
          : [
              `${cleanGsm} GSM Heavyweight structure`,
              'Zero-sag reinforced 1-inch collar',
              'Pre-shrunk architectural geometry',
              'High-density luxury stitch finish',
            ],
      images: uploadedImages.map((img, idx) => ({
        url: img.url,
        alt: `${cleanName} - ${img.angle}`,
        isPrimary: idx === 0,
        angle: img.angle,
      })),
      colors: selectedColors,
      sizes: selectedSizes,
      variants,
      isNew: isNewProduct,
      rating: existingProd?.rating ?? 5.0,
      reviewsCount: existingProd?.reviewsCount ?? 0,
      createdAt: existingProd?.createdAt || new Date().toISOString(),
    };

    if (editingProductId) {
      updateProduct(productPayload);
      setNotification(`UPDATED: "${cleanName}" IS NOW LIVE ON STOREFRONT`);
    } else {
      addProduct(productPayload);
      setNotification(`PUBLISHED: "${cleanName}" IS NOW LIVE ON STOREFRONT`);
    }

    // Call server API for background sync
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload),
      });
    } catch (e) {}

    setIsModalOpen(false);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDeleteProduct = (id: string, prodName: string) => {
    if (confirm(`Remove "${prodName}" from customer-facing storefront?`)) {
      deleteProduct(id);
      setNotification(`REMOVED: "${prodName}" from storefront`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Success Notification Banner */}
      {notification && (
        <div className="p-4 bg-snake-green/10 border border-snake-green text-snake-green rounded-lg flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-xs font-bold uppercase">
            <Check size={16} />
            <span>{notification}</span>
          </div>
          <Link
            href="/shop"
            target="_blank"
            className="text-xs font-bold underline hover:text-white flex items-center gap-1 uppercase"
          >
            VIEW ON STOREFRONT <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
            PRODUCT ATELIER CATALOG
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Create garments, upload photography, set prices, and configure size & color matrices.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 bg-snake-green text-black text-xs font-bold uppercase tracking-wider rounded hover:bg-white transition-all flex items-center gap-2 self-start shadow-[0_0_15px_rgba(4,252,33,0.3)]"
        >
          <Plus size={16} /> ADD NEW GARMENT
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, slug, or SKU..."
            className="w-full bg-[#0d0d0d] border border-neutral-800 rounded px-3 py-2 pl-9 text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500">GENDER:</span>
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="bg-[#0d0d0d] border border-neutral-800 text-neutral-300 rounded px-3 py-2 focus:outline-none focus:border-snake-green cursor-pointer"
          >
            <option value="all">ALL COLLECTIONS</option>
            <option value="men">MEN ONLY</option>
            <option value="women">WOMEN ONLY</option>
            <option value="unisex">UNISEX</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3 w-12 text-center" title="Check to show in New Drops section">
                <span className="text-[9px] font-bold text-snake-green block">NEW DROP</span>
              </th>
              <th className="py-3 px-4">GARMENT</th>
              <th className="py-3 px-4">GSM & FABRIC</th>
              <th className="py-3 px-4">COLORS</th>
              <th className="py-3 px-4">SIZES</th>
              <th className="py-3 px-4">PRICE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {filtered.map((prod) => (
              <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={Boolean(prod.isNew)}
                    onChange={(e) => {
                      const updated = { ...prod, isNew: e.target.checked };
                      updateProduct(updated);
                      setNotification(
                        e.target.checked
                          ? `ADDED TO NEW DROPS: "${prod.name}"`
                          : `REMOVED FROM NEW DROPS: "${prod.name}"`
                      );
                      setTimeout(() => setNotification(null), 3000);
                    }}
                    title={prod.isNew ? 'Currently in New Drops (click to uncheck)' : 'Add to New Drops section'}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-snake-green focus:ring-snake-green focus:ring-offset-0 accent-snake-green cursor-pointer"
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-12 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-neutral-800">
                      <Image
                        src={prod.images[0]?.url || ''}
                        alt={prod.name}
                        fill
                        sizes="50px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-white block uppercase">{prod.name}</span>
                      <span className="text-[10px] text-neutral-500">
                        /{prod.slug} • {prod.gender.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <span className="text-snake-green font-bold block">{prod.gsm} GSM</span>
                  <span className="text-[10px] text-neutral-400 block max-w-[160px] truncate">
                    {prod.fabric}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    {prod.colors.map((c) => (
                      <span
                        key={c.name}
                        title={c.name}
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                    <span className="text-[10px] text-neutral-500 ml-1">
                      ({prod.colors.length})
                    </span>
                  </div>
                </td>

                <td className="py-3 px-4 text-neutral-300">
                  <div className="flex gap-1">
                    {prod.sizes.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[9px] font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <span className="text-white font-bold block">{formatPrice(prod.price)}</span>
                  <span className="text-[10px] text-neutral-500 line-through">
                    {formatPrice(prod.mrp)}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 rounded text-[9px] uppercase font-bold">
                    LIVE
                  </span>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-neutral-400">
                    <Link
                      href={`/product/${prod.slug}`}
                      target="_blank"
                      className="p-1 hover:text-white"
                      title="View live on customer site"
                    >
                      <Eye size={14} />
                    </Link>
                    <button
                      onClick={() => handleOpenEditModal(prod)}
                      className="p-1 hover:text-white"
                      title="Edit product"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      className="p-1 hover:text-red-400"
                      title="Delete from storefront"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============================================================
          CREATE / EDIT PRODUCT MODAL (VERTICAL SCROLL FIXED + STICKY FOOTER SAVE BUTTON)
          ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-[#0e0e0e] border border-neutral-800 rounded-xl shadow-2xl flex flex-col h-[88vh] max-h-[88vh] overflow-hidden">
            {/* STICKY HEADER */}
            <div className="shrink-0 border-b border-neutral-800 px-6 py-4 flex justify-between items-center bg-[#0e0e0e] z-10">
              <div>
                <h3 className="text-sm sm:text-base font-bold uppercase text-white tracking-wider flex items-center gap-2">
                  <Sparkles size={16} className="text-snake-green" />
                  {editingProductId ? `EDIT: ${name || 'GARMENT'}` : 'CREATE & PUBLISH NEW GARMENT'}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Configure technical specifications, GSM, size grid, and photography. Live on storefront upon save.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-2 rounded-md hover:bg-neutral-800 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM: Wraps scrollable body + sticky footer */}
            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* SCROLLABLE BODY */}
              <div
                tabIndex={0}
                className="flex-1 min-h-0 overflow-y-scroll p-6 space-y-6 text-xs modal-scroller focus:outline-none"
              >
                {/* SECTION 1: IMAGES UPLOAD */}
                <div className="space-y-3 p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <label className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Upload size={14} className="text-snake-green" />
                      PRODUCT PHOTOGRAPHY ({uploadedImages.length}) *
                    </label>
                    <span className="text-[10px] text-neutral-500">Supports PNG, JPG, WEBP (Max 5MB)</span>
                  </div>

                  {/* Upload Trigger Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-800 hover:border-snake-green/60 p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-black/40"
                    >
                      <Upload size={20} className="text-snake-green mb-1" />
                      <span className="text-white font-bold text-[11px]">UPLOAD IMAGE FROM COMPUTER</span>
                      <span className="text-[10px] text-neutral-500">Drag or click to choose files</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {/* External URL alternative */}
                    <div className="p-4 bg-black/40 border border-neutral-800 rounded-lg flex flex-col justify-between space-y-2">
                      <span className="text-neutral-400 text-[10px] uppercase font-bold">OR ADD VIA IMAGE URL:</span>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={externalImageUrl}
                          onChange={(e) => setExternalImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-white rounded text-[11px] focus:outline-none focus:border-snake-green"
                        />
                        <button
                          type="button"
                          onClick={handleAddExternalImageUrl}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-snake-green hover:text-black text-white font-bold uppercase rounded text-[10px] transition-colors"
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image Previews */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-[4/5] rounded overflow-hidden bg-black border border-neutral-800 group"
                        >
                          <Image
                            src={img.url}
                            alt={img.alt}
                            fill
                            sizes="150px"
                            className="object-cover"
                          />
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 text-[9px] font-bold text-snake-green uppercase rounded">
                            {idx === 0 ? 'PRIMARY' : `SHOT ${idx + 1}`}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-500 text-white rounded transition-colors"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECTION 2: GARMENT IDENTIFIERS (NAME & TAGLINE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-neutral-400 uppercase font-semibold text-[11px]">
                      GARMENT NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. THE ARCHIVE HEAVYWEIGHT"
                      className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 uppercase font-semibold text-[11px]">
                      TAGLINE / SHORT SUBTITLE
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. 280 GSM Supima® architectural drape"
                      className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
                    />
                  </div>
                </div>

                {/* SECTION 3: PRICING & MRP */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-neutral-400 uppercase font-semibold text-[11px]">
                      PRICE (INR ₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green font-bold text-snake-green"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 uppercase font-semibold text-[11px]">
                      MRP (STRIKE PRICE) *
                    </label>
                    <input
                      type="number"
                      required
                      value={mrp}
                      onChange={(e) => setMrp(Number(e.target.value))}
                      className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 uppercase font-semibold text-[11px]">
                      LIVE DISCOUNT
                    </label>
                    <div className="py-2 px-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-300 font-bold flex items-center justify-between">
                      <span>{mrp > price ? `SAVE ${Math.round(((mrp - price) / mrp) * 100)}%` : 'NO DISCOUNT'}</span>
                      {mrp > price && <Tag size={12} className="text-snake-green" />}
                    </div>
                  </div>
                </div>

                {/* SECTION 4: SIZES AVAILABLE (XXS TO 6XL) */}
                <div className="space-y-2.5 p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <label className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Ruler size={14} className="text-snake-green" />
                      SIZES AVAILABLE IN STOCK (XXS - 6XL) *
                    </label>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={selectCoreSizes}
                        className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-800 transition-colors"
                      >
                        CORE (S-XL)
                      </button>
                      <button
                        type="button"
                        onClick={selectAllSizes}
                        className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-snake-green rounded border border-neutral-800 transition-colors"
                      >
                        ALL (XXS-6XL)
                      </button>
                      <button
                        type="button"
                        onClick={clearAllSizes}
                        className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-500 rounded border border-neutral-800 transition-colors"
                      >
                        CLEAR
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-1.5">
                    {ALL_SIZES.map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`py-2 rounded font-bold uppercase text-xs transition-all border ${
                            isSelected
                              ? 'bg-snake-green text-black border-snake-green shadow-[0_0_10px_rgba(4,252,33,0.3)]'
                              : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-neutral-500 pt-1">
                    Selected: {selectedSizes.length} sizes ({selectedSizes.join(', ') || 'None'})
                  </div>
                </div>

                {/* SECTION 5: COLORS AVAILABLE */}
                <div className="space-y-3 p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <label className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Palette size={14} className="text-snake-green" />
                      COLORS AVAILABLE *
                    </label>
                    <span className="text-[10px] text-neutral-500">
                      {selectedColors.length} color(s) configured
                    </span>
                  </div>

                  {/* Preset Luxury Colors */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-neutral-400 uppercase">LUXURY PRESETS:</span>
                    <div className="flex flex-wrap gap-2">
                      {LUXURY_COLOR_PRESETS.map((preset) => {
                        const isSelected = selectedColors.some((c) => c.name === preset.name);
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => toggleColorPreset(preset)}
                            className={`px-3 py-1.5 rounded-full border text-[11px] flex items-center gap-2 transition-all ${
                              isSelected
                                ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                                : 'border-neutral-800 bg-black text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/20"
                              style={{ backgroundColor: preset.hex }}
                            />
                            <span>{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Creator */}
                  <div className="pt-2 border-t border-neutral-800 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-neutral-400 uppercase">ADD BESPOKE SHADE:</span>
                    <input
                      type="text"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      placeholder="Color Name (e.g. Acid Lime)"
                      className="bg-black border border-neutral-800 px-2.5 py-1 text-white rounded text-xs focus:border-snake-green"
                    />
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-8 h-8 rounded bg-transparent border border-neutral-800 cursor-pointer p-0.5"
                      title="Choose Hex Color"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      className="px-3 py-1 bg-neutral-800 hover:bg-snake-green hover:text-black text-white font-bold uppercase rounded text-[10px] transition-colors"
                    >
                      + ADD SHADE
                    </button>
                  </div>
                </div>

                {/* SECTION 6: GSM, FIT, GENDER & FABRIC */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-neutral-400 uppercase font-semibold text-[11px]">
                        GSM DENSITY *
                      </label>
                      <span className="text-[10px] text-snake-green font-bold">{gsm} GSM</span>
                    </div>
                    <input
                      type="number"
                      required
                      value={gsm}
                      onChange={(e) => setGsm(Number(e.target.value))}
                      className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[220, 240, 260, 280, 300, 320, 400].map((weight) => (
                        <button
                          key={weight}
                          type="button"
                          onClick={() => setGsm(weight)}
                          className={`px-1.5 py-0.5 text-[9px] rounded border transition-colors ${
                            gsm === weight
                              ? 'bg-snake-green text-black border-snake-green font-bold'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                          }`}
                        >
                          {weight}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 uppercase font-semibold text-[11px]">
                      FIT / SUB-CATEGORY *
                    </label>
                    <select
                      value={fit}
                      onChange={(e) => setFit(e.target.value as any)}
                      className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green cursor-pointer"
                    >
                      <option value="Boxy">Boxy Fit</option>
                      <option value="Oversized">Oversized Fit</option>
                      <option value="Relaxed">Relaxed Fit</option>
                      <option value="Classic">Classic Fit</option>
                      <option value="Slim">Slim Fit</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 uppercase font-semibold text-[11px]">
                      COLLECTION / CATEGORY *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green cursor-pointer"
                    >
                      <option value="unisex">Unisex Collection</option>
                      <option value="men">Men Collection</option>
                      <option value="women">Women Collection</option>
                    </select>
                  </div>
                </div>

                {/* SECTION 7: FABRIC & GARMENT SPECIFICATIONS */}
                <div className="space-y-4 p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <div className="space-y-1">
                    <label className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Sparkles size={14} className="text-snake-green" />
                      FABRIC COMPOSITION & MATERIAL SPECIFICATION *
                    </label>
                    <input
                      type="text"
                      required
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      placeholder="e.g. 100% Long-Staple Supima® Cotton (280 GSM Heavyweight)"
                      className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-neutral-300 uppercase font-bold text-[11px]">
                        GARMENT SPECIFICATIONS / KEY FEATURES (1 PER LINE)
                      </label>
                      <span className="text-[10px] text-neutral-500">Separated by line breaks</span>
                    </div>
                    <textarea
                      rows={4}
                      value={specificationsText}
                      onChange={(e) => setSpecificationsText(e.target.value)}
                      placeholder="e.g.&#10;280 GSM Heavyweight structure&#10;Zero-sag reinforced 1-inch collar&#10;Pre-shrunk architectural geometry&#10;High-density luxury stitch finish"
                      className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green resize-none text-xs leading-relaxed"
                    />
                  </div>
                </div>

                {/* SECTION 8: ABOUT PRODUCT / DESCRIPTION */}
                <div className="space-y-1">
                  <label className="text-neutral-400 uppercase font-semibold text-[11px]">
                    ABOUT THE PRODUCT / DESCRIPTION *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Constructed from premium heavyweight long-staple cotton with architectural drape..."
                    className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green resize-none text-xs leading-relaxed"
                  />
                </div>

                {/* SECTION 9: CRAFTSMANSHIP, CARE & POLICIES (AUTO-CONFIGURED) */}
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-snake-green" />
                      <span className="text-white font-bold uppercase tracking-wider text-[11px]">
                        CRAFTSMANSHIP, CARE & STORE POLICIES
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 rounded text-[9px] uppercase font-bold">
                      AUTO-CONFIGURED
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    SuperSnake automatically standardizes luxury care protocols and shipping & return policies across all products. You can customize care instructions below if desired:
                  </p>

                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 uppercase font-semibold">
                      CARE INSTRUCTIONS (1 PER LINE)
                    </label>
                    <textarea
                      rows={3}
                      value={careInstructionsText}
                      onChange={(e) => setCareInstructionsText(e.target.value)}
                      className="w-full bg-black border border-neutral-800 px-3 py-2 text-neutral-300 rounded focus:border-snake-green resize-none text-xs leading-relaxed font-mono"
                    />
                  </div>

                  <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-400">
                    <span>SHIPPING & RETURNS:</span>
                    <span className="text-neutral-300 font-medium">Complimentary Express Shipping across India • 7-Day Doorstep Returns</span>
                  </div>
                </div>

                {/* SECTION 10: NEW DROPS STOREFRONT TOGGLE */}
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
                  <div>
                    <label htmlFor="newDropToggle" className="text-white font-bold uppercase text-[11px] block cursor-pointer">
                      FEATURE IN &quot;NEW DROPS&quot; SECTION
                    </label>
                    <span className="text-[10px] text-neutral-500">
                      When checked, this garment appears in the homepage New Drops carousel.
                    </span>
                  </div>
                  <input
                    id="newDropToggle"
                    type="checkbox"
                    checked={isNewProduct}
                    onChange={(e) => setIsNewProduct(e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-snake-green focus:ring-snake-green focus:ring-offset-0 accent-snake-green cursor-pointer"
                  />
                </div>
              </div>

              {/* FOOTER: ALWAYS PINNED VISIBLE AT BOTTOM */}
              <div className="shrink-0 border-t border-neutral-800 px-6 py-4 flex items-center justify-between bg-[#0e0e0e] z-10 shadow-2xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-neutral-800 text-neutral-300 rounded hover:text-white hover:border-neutral-600 uppercase tracking-wider text-xs transition-colors"
                >
                  CANCEL
                </button>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-[11px] text-neutral-500">
                    Real-time storefront sync active
                  </span>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-snake-green text-black font-bold uppercase rounded hover:bg-white transition-all shadow-[0_0_20px_rgba(4,252,33,0.4)] flex items-center gap-2 cursor-pointer text-xs tracking-wider"
                  >
                    <Check size={16} />
                    <span>{editingProductId ? 'UPDATE & PUBLISH' : 'PUBLISH TO LIVE STOREFRONT'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
