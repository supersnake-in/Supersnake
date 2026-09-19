'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Heart,
  Share2,
  ShieldCheck,
  RotateCcw,
  Truck,
  ChevronDown,
  Star,
  Check,
  Ruler,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { getProductBySlug, PRODUCTS } from '@/lib/data/products';
import { useStore } from '@/lib/store';
import { formatPrice, BRAND } from '@/lib/design-tokens';
import { Size, ProductImage } from '@/lib/types';
import { SizeGuideModal } from '@/components/product/SizeGuideModal';
import { ProductCard } from '@/components/product/ProductCard';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { products, addToCart, isInWishlist, toggleWishlist } = useStore();
  const product = products.find((p) => p.slug === params.slug) || getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: 'Obsidian Black', hex: '#0a0a0a' });
  const [selectedSize, setSelectedSize] = useState<Size>(product.sizes[2] || product.sizes[0] || 'L');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Accordion open states
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    fabric: true,
    care: false,
    shipping: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isFavorited = isInWishlist(product.id);

  const handleAddToBag = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    router.push('/checkout');
  };

  const activeImage = product.images[activeImageIndex] || product.images[0];
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="bg-black text-white min-h-screen pt-28 pb-24 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-neutral-500 mb-8 uppercase">
          <Link href="/" className="hover:text-white transition-colors">HOME</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-white transition-colors">T-SHIRTS</Link>
          <span>/</span>
          <Link href={`/${product.gender}`} className="hover:text-white transition-colors">{product.gender}</Link>
          <span>/</span>
          <span className="text-neutral-300 font-semibold">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* ============================================================
              LEFT: MASSIVE IMAGE GALLERY
              ============================================================ */}
          <div className="lg:col-span-7 space-y-4">
            {/* Active Hero Image with Zoom trigger */}
            <div className="relative aspect-[4/5] w-full rounded bg-[#0c0c0c] border border-white/10 overflow-hidden group">
              <Image
                src={activeImage.url}
                alt={activeImage.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Angle Tag */}
              <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-widest text-neutral-300 uppercase">
                {product.gsm} GSM • {activeImage.angle || 'STUDIO'}
              </div>

              {/* Lightbox Expander */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-neutral-300 hover:text-white hover:border-snake-green transition-all"
                aria-label="View Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-square rounded overflow-hidden bg-neutral-900 border transition-all ${
                    activeImageIndex === idx
                      ? 'border-snake-green ring-1 ring-snake-green scale-[1.02]'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ============================================================
              RIGHT: STICKY PRODUCT INFORMATION
              ============================================================ */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-8">
            {/* Title, Category & Pricing */}
            <div className="space-y-3 border-b border-white/10 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-mega text-snake-green uppercase">
                  {product.gender.toUpperCase()} • {product.fit.toUpperCase()} FIT
                </span>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`flex items-center gap-1.5 text-xs font-mono tracking-wider transition-colors ${
                    isFavorited ? 'text-snake-green' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Heart size={15} className={isFavorited ? 'fill-snake-green' : ''} />
                  <span>{isFavorited ? 'SAVED' : 'SAVE FOR LATER'}</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-tight text-white">
                {product.name}
              </h1>

              {/* Price & Rating */}
              <div className="flex items-baseline gap-4 pt-1">
                <span className="font-mono text-2xl font-bold text-white">
                  {formatPrice(product.price)}
                </span>
                <span className="font-mono text-sm text-neutral-500 line-through">
                  {formatPrice(product.mrp)}
                </span>
                <span className="px-2 py-0.5 bg-snake-green/10 border border-snake-green/30 text-snake-green font-mono text-[10px] tracking-wider uppercase">
                  SAVE {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 pt-1 text-xs font-mono text-neutral-400">
                <div className="flex text-snake-green">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className="fill-snake-green" />
                  ))}
                </div>
                <span>{product.rating}</span>
                <span>•</span>
                <span className="underline">{product.reviewsCount} atelier reviews</span>
              </div>
            </div>

            {/* Description & Features */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-mono text-neutral-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono tracking-wider">
                <span className="text-neutral-400 uppercase">COLOR:</span>
                <span className="text-white font-semibold uppercase">{selectedColor.name}</span>
              </div>
              <div className="flex gap-3">
                {product.colors.map((color) => {
                  const isSelected = selectedColor.name === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-9 h-9 rounded-full border transition-all p-0.5 flex items-center justify-center ${
                        isSelected
                          ? 'border-snake-green scale-110'
                          : 'border-white/20 hover:border-white/60'
                      }`}
                      title={color.name}
                    >
                      <span
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono tracking-wider">
                <span className="text-neutral-400 uppercase">SIZE:</span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-snake-green hover:underline flex items-center gap-1 uppercase"
                >
                  <Ruler size={13} />
                  <span>SIZE GUIDE</span>
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-xs font-mono border rounded transition-all ${
                        isSelected
                          ? 'border-snake-green bg-snake-green/10 text-white font-bold'
                          : 'border-white/15 text-neutral-400 hover:border-white/40 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-white/20 rounded bg-neutral-950 px-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-neutral-400 hover:text-white px-2 py-3"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs text-white px-2 min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-neutral-400 hover:text-white px-2 py-3"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add To Bag */}
                <button
                  onClick={handleAddToBag}
                  className="flex-1 py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold hover:bg-white transition-all duration-300 uppercase shadow-[0_0_20px_rgba(4,252,33,0.3)]"
                >
                  ADD TO BAG
                </button>
              </div>

              {/* Buy Now Direct */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 border border-white/20 hover:border-snake-green text-white hover:text-snake-green font-mono text-xs tracking-widest uppercase transition-all"
              >
                BUY NOW DIRECT →
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/10 text-center text-[10px] font-mono text-neutral-400">
              <div className="flex flex-col items-center gap-1.5">
                <Truck size={16} className="text-snake-green" />
                <span>FREE EXPRESS DELIVERY</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RotateCcw size={16} className="text-snake-green" />
                <span>7-DAY EASY RETURNS</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck size={16} className="text-snake-green" />
                <span>VERIFIED AUTHENTIC</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="space-y-2 border-b border-white/10 pb-6 text-xs font-mono">
              {/* Accordion 1: Fabric & Fit */}
              <div className="border border-white/10 rounded overflow-hidden">
                <button
                  onClick={() => toggleAccordion('fabric')}
                  className="w-full p-4 flex justify-between items-center text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-semibold text-white uppercase">FABRIC & SPECIFICATIONS</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      openAccordions.fabric ? 'rotate-180 text-snake-green' : 'text-neutral-500'
                    }`}
                  />
                </button>
                {openAccordions.fabric && (
                  <div className="p-4 pt-0 space-y-2 text-neutral-400 border-t border-white/5">
                    <p><span className="text-white">Fabric:</span> {product.fabric}</p>
                    <p><span className="text-white">Weight:</span> {product.gsm} GSM Heavyweight Jersey</p>
                    <ul className="list-disc list-inside space-y-1 pt-1">
                      {product.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 2: Care Instructions */}
              <div className="border border-white/10 rounded overflow-hidden">
                <button
                  onClick={() => toggleAccordion('care')}
                  className="w-full p-4 flex justify-between items-center text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-semibold text-white uppercase">CRAFTSMANSHIP & CARE</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      openAccordions.care ? 'rotate-180 text-snake-green' : 'text-neutral-500'
                    }`}
                  />
                </button>
                {openAccordions.care && (
                  <div className="p-4 pt-0 space-y-1.5 text-neutral-400 border-t border-white/5">
                    {product.careInstructions.map((c, i) => (
                      <p key={i}>• {c}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div className="border border-white/10 rounded overflow-hidden">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full p-4 flex justify-between items-center text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-semibold text-white uppercase">COMPLIMENTARY SHIPPING & RETURNS</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      openAccordions.shipping ? 'rotate-180 text-snake-green' : 'text-neutral-500'
                    }`}
                  />
                </button>
                {openAccordions.shipping && (
                  <div className="p-4 pt-0 space-y-2 text-neutral-400 border-t border-white/5">
                    <p>
                      Orders placed before 2:00 PM IST dispatch the same business day from our Bengaluru studio via Blue Dart Air Express. Delivery within 2–4 business days across India.
                    </p>
                    <p>
                      Enjoy a hassle-free 7-day return or exchange window. Free doorstep pickup available in all major metro cities.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            RELATED PRODUCTS
            ============================================================ */}
        <div className="mt-32 border-t border-white/10 pt-16 space-y-10">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
                CURATED COMPANIONS
              </span>
              <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight text-white">
                YOU MIGHT ALSO SEEK
              </h3>
            </div>
            <Link
              href="/shop"
              className="text-xs font-mono tracking-widest text-neutral-400 hover:text-white uppercase flex items-center gap-1.5"
            >
              VIEW ALL <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        fitType={product.fit}
      />

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative w-full max-w-4xl h-[85vh]">
            <Image
              src={activeImage.url}
              alt={activeImage.alt}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
