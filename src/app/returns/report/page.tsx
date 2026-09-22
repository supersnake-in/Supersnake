'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  ArrowRight,
  ArrowLeft,
  Video,
  Image as ImageIcon,
  Check,
  ChevronDown,
  Clock,
  Sparkles,
  Package,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Order, OrderItem, Size } from '@/lib/types';
import { LEGAL_CONFIG, getLegalValue } from '@/lib/legal-config';

const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

const DEFECT_CATEGORIES = [
  'Fabric Tear or Hole',
  'Stitching or Seam Slippage',
  'Dye Staining or Discoloration',
  'Incorrect Garment / Size / Color Delivered',
  'Damaged in Transit / Crushed Packaging',
  'Collar Deformation or Structural Defect',
  'Missing Trim or Hardware',
  'Other Manufacturing Flaw',
];

const RESOLUTION_PREFERENCES = [
  'Priority Replacement Garment (Recommended)',
  'Full Refund to Original Payment Source',
  'Store Credit / Atelier Voucher',
];

function DefectReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlOrderNumber = searchParams.get('order') || '';

  const { orders, getOrderById, products, submitDefectReport } = useStore();

  // Step 1: Order & Contact
  const [orderNumber, setOrderNumber] = useState(urlOrderNumber);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);

  // Step 2: Product selection
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [manualProductName, setManualProductName] = useState('');
  const [manualProductColor, setManualProductColor] = useState('');
  const [manualProductSize, setManualProductSize] = useState<string>('L');

  // Step 3: Defect specifics
  const [defectType, setDefectType] = useState<string>(DEFECT_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [preferredResolution, setPreferredResolution] = useState<string>(RESOLUTION_PREFERENCES[0]);

  // Step 4: Media uploads
  const [images, setImages] = useState<{ dataUrl: string; name: string; size: number }[]>([]);
  const [video, setVideo] = useState<{ dataUrl: string; name: string; size: number } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<{
    reportNumber: string;
    productName: string;
    orderNumber: string;
    createdAt: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Lookup order automatically when orderNumber changes
  useEffect(() => {
    if (!orderNumber || orderNumber.trim().length < 3) {
      setMatchedOrder(null);
      return;
    }

    const found = getOrderById(orderNumber);
    if (found) {
      setMatchedOrder(found);
      if (found.customer) {
        if (!customerName) setCustomerName(found.customer.name || '');
        if (!customerEmail) setCustomerEmail(found.customer.email || '');
        if (!customerPhone) setCustomerPhone(found.customer.phone || '');
      }
      setSelectedItemIndex(0);
    } else {
      setMatchedOrder(null);
    }
  }, [orderNumber, getOrderById]);

  // Handle Photo upload with limit checks
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > MAX_IMAGE_COUNT) {
      setImageError(`You can upload a maximum of ${MAX_IMAGE_COUNT} images. Please remove excess photos.`);
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setImageError(`"${file.name}" exceeds the 10MB size limit. Please upload a smaller image.`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        setImageError(`"${file.name}" is not a supported image file.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImages((prev) => {
          if (prev.length >= MAX_IMAGE_COUNT) return prev;
          return [...prev, { dataUrl, name: file.name, size: file.size }];
        });
      };
      reader.readAsDataURL(file);
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageError(null);
  };

  // Handle Video upload with limit check
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setVideoError(`Video exceeds the 50MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please compress the video.`);
      return;
    }

    if (!file.type.startsWith('video/')) {
      setVideoError(`"${file.name}" is not a recognized video file format.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setVideo({ dataUrl, name: file.name, size: file.size });
    };
    reader.readAsDataURL(file);

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoError(null);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!orderNumber.trim()) {
      setFormError('Please enter your SuperSnake Order Number.');
      return;
    }
    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      setFormError('Please describe the defect with at least 15 characters.');
      return;
    }

    // Determine target product
    let finalProductName = '';
    let finalColor = '';
    let finalSize = '';
    let finalImage = '';
    let finalProductId = '';

    if (matchedOrder && matchedOrder.items && matchedOrder.items.length > 0) {
      const selectedItem = matchedOrder.items[selectedItemIndex] || matchedOrder.items[0];
      finalProductName = selectedItem.productName;
      finalColor = selectedItem.color;
      finalSize = selectedItem.size;
      finalImage = selectedItem.imageUrl;
      finalProductId = selectedItem.productId;
    } else {
      finalProductName = manualProductName.trim() || 'SuperSnake Garment';
      finalColor = manualProductColor.trim();
      finalSize = manualProductSize;
      const matchedCatalog = products.find(
        (p) => p.name.toLowerCase() === finalProductName.toLowerCase()
      );
      if (matchedCatalog) {
        finalImage = matchedCatalog.images[0]?.url || '';
        finalProductId = matchedCatalog.id;
      }
    }

    setIsSubmitting(true);

    try {
      const report = await submitDefectReport({
        orderId: matchedOrder?.id || orderNumber.trim(),
        orderNumber: orderNumber.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        productId: finalProductId,
        productName: finalProductName,
        productColor: finalColor,
        productSize: finalSize,
        productImage: finalImage,
        defectType,
        description: `[PREFERENCE: ${preferredResolution}]\n\n${description.trim()}`,
        images: images.map((img) => img.dataUrl),
        videoUrl: video?.dataUrl,
      });

      setSubmittedReport({
        reportNumber: report.reportNumber,
        productName: finalProductName,
        orderNumber: orderNumber.trim(),
        createdAt: report.createdAt,
      });
    } catch (err: any) {
      setFormError('Could not process report submission. Please try again or email support@supersnake.in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedReport) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-[#0a0a0a] border border-snake-green/40 p-8 sm:p-12 rounded-sm space-y-8 shadow-[0_0_50px_rgba(4,252,33,0.1)]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-snake-green/10 border border-snake-green text-snake-green flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(4,252,33,0.3)]">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase block">
                CLAIM TRANSMITTED TO ATELIER
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-medium text-white uppercase tracking-tight">
                DEFECT REPORT REGISTERED
              </h1>
            </div>

            <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Your defect report has been recorded in the atelier quality assurance system. Our specialists review all claims within 24–48 business hours.
            </p>
          </div>

          {/* Ticket Information Card */}
          <div className="bg-black/60 border border-white/10 p-6 rounded-sm space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-neutral-500 uppercase">TICKET NUMBER</span>
              <span className="text-snake-green font-bold tracking-widest text-sm sm:text-base">
                {submittedReport.reportNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <span className="text-neutral-500 block uppercase">ORDER REFERENCE</span>
                <span className="text-white font-medium">{submittedReport.orderNumber}</span>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase">GARMENT</span>
                <span className="text-white font-medium truncate block">{submittedReport.productName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase">STATUS</span>
                <span className="text-yellow-400 font-medium">Pending Review</span>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase">ESTIMATED ASSESSMENT</span>
                <span className="text-neutral-300">24–48 Business Hours</span>
              </div>
            </div>
          </div>

          {/* Protocol Steps Notice */}
          <div className="space-y-3 border-t border-white/10 pt-6 text-xs font-mono text-neutral-400">
            <div className="flex items-start gap-2.5">
              <Clock size={16} className="text-snake-green shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Next Steps:</strong> Once reviewed by our senior inspection team, you will receive an official email detailing the resolution protocol (such as doorstep reverse courier collection or immediate dispatch of an unblemished replacement).
              </p>
            </div>
          </div>

          {/* Return buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors text-center"
            >
              RETURN TO STOREFRONT
            </Link>
            <Link
              href="/returns"
              className="w-full sm:w-auto px-8 py-3.5 border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-widest transition-colors text-center"
            >
              READ RETURNS POLICY
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE FORM
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2">
          <Link
            href="/returns"
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase"
          >
            <ArrowLeft size={13} />
            <span>RETURNS & DEFECTS</span>
          </Link>
          <span className="text-neutral-600">•</span>
          <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
            FORMAL CLAIM
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-display font-medium uppercase tracking-tight text-white">
          REPORT A DAMAGED OR DEFECTIVE PRODUCT
        </h1>

        <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-2xl leading-relaxed">
          SuperSnake operates under strict atelier quality control. If a piece arrives damaged, flawed in construction, or compromised in courier transit, file your report below with photographic or video verification for swift remedy.
        </p>
      </div>

      {formError && (
        <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-sm text-red-200 text-xs font-mono flex items-center gap-3">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* ============================================================
            STEP 1: ORDER NUMBER & CUSTOMER IDENTIFICATION
            ============================================================ */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 rounded-sm space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-snake-green/10 border border-snake-green text-snake-green font-mono text-[11px] flex items-center justify-center font-bold">
                1
              </span>
              <h2 className="text-sm font-mono tracking-wider uppercase text-white font-semibold">
                ORDER & PATRON VERIFICATION
              </h2>
            </div>
            {matchedOrder && (
              <span className="px-2.5 py-0.5 bg-snake-green/10 border border-snake-green text-snake-green font-mono text-[10px] tracking-wider uppercase flex items-center gap-1.5">
                <Check size={12} />
                <span>ORDER VERIFIED</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-mono">
            {/* Order Number */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="order-number" className="text-neutral-300 uppercase tracking-wider block">
                ORDER NUMBER <span className="text-snake-green">*</span>
              </label>
              <input
                id="order-number"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. SS-2026-7471 or 7471"
                required
                className="w-full bg-black border border-white/20 focus:border-snake-green text-white px-4 py-3 rounded-sm outline-none transition-colors"
              />
              <p className="text-[10px] text-neutral-500">
                Found in your confirmation email, SMS update, or patron account archive.
              </p>
            </div>

            {/* Customer Name */}
            <div className="space-y-1.5">
              <label htmlFor="customer-name" className="text-neutral-300 uppercase tracking-wider block">
                FULL NAME <span className="text-snake-green">*</span>
              </label>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Patron Name"
                required
                className="w-full bg-black border border-white/20 focus:border-snake-green text-white px-4 py-3 rounded-sm outline-none transition-colors"
              />
            </div>

            {/* Customer Email */}
            <div className="space-y-1.5">
              <label htmlFor="customer-email" className="text-neutral-300 uppercase tracking-wider block">
                REGISTERED EMAIL <span className="text-snake-green">*</span>
              </label>
              <input
                id="customer-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="patron@example.com"
                required
                className="w-full bg-black border border-white/20 focus:border-snake-green text-white px-4 py-3 rounded-sm outline-none transition-colors"
              />
            </div>

            {/* Customer Phone */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="customer-phone" className="text-neutral-300 uppercase tracking-wider block">
                CONTACT PHONE NUMBER
              </label>
              <input
                id="customer-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-black border border-white/20 focus:border-snake-green text-white px-4 py-3 rounded-sm outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            STEP 2: DEFECTIVE PRODUCT SELECTION
            ============================================================ */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 rounded-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="w-5 h-5 rounded-full bg-snake-green/10 border border-snake-green text-snake-green font-mono text-[11px] flex items-center justify-center font-bold">
              2
            </span>
            <h2 className="text-sm font-mono tracking-wider uppercase text-white font-semibold">
              DEFECTIVE GARMENT SELECTION
            </h2>
          </div>

          {/* When an Order is Matched */}
          {matchedOrder && matchedOrder.items && matchedOrder.items.length > 0 ? (
            <div className="space-y-4">
              {matchedOrder.items.length > 1 ? (
                <div className="space-y-2">
                  <label htmlFor="item-select" className="text-xs font-mono text-neutral-300 uppercase tracking-wider block">
                    SELECT THE DEFECTIVE PIECE FROM ORDER ({matchedOrder.items.length} ITEMS):
                  </label>
                  <div className="relative">
                    <select
                      id="item-select"
                      value={selectedItemIndex}
                      onChange={(e) => setSelectedItemIndex(Number(e.target.value))}
                      className="w-full bg-black border border-white/20 focus:border-snake-green text-white px-4 py-3 rounded-sm font-mono text-xs outline-none transition-colors appearance-none pr-10 cursor-pointer"
                    >
                      {matchedOrder.items.map((it, idx) => (
                        <option key={idx} value={idx}>
                          {it.productName} — Color: {it.color} • Size: {it.size} (Qty: {it.quantity})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              ) : (
                <p className="text-xs font-mono text-neutral-400">
                  Item automatically detected from verified order #{matchedOrder.orderNumber}:
                </p>
              )}

              {/* Display Selected Product Preview */}
              {(() => {
                const item = matchedOrder.items[selectedItemIndex] || matchedOrder.items[0];
                return (
                  <div className="bg-black/60 border border-snake-green/30 p-4 rounded-sm flex items-center gap-4">
                    {item.imageUrl ? (
                      <div className="relative w-16 h-20 rounded bg-neutral-900 border border-white/10 overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-20 rounded bg-neutral-900 border border-white/10 flex items-center justify-center flex-shrink-0 text-neutral-600">
                        <Package size={20} />
                      </div>
                    )}
                    <div className="space-y-1 font-mono">
                      <span className="text-[10px] text-snake-green uppercase tracking-wider block">
                        AFFECTED PRODUCT
                      </span>
                      <h4 className="text-sm font-bold text-white uppercase">{item.productName}</h4>
                      <p className="text-xs text-neutral-400">
                        Color: <span className="text-white">{item.color}</span> • Size:{' '}
                        <span className="text-white">{item.size}</span> • Quantity:{' '}
                        <span className="text-white">{item.quantity}</span>
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Manual / Unmatched Order Fallback */
            <div className="space-y-4">
              <p className="text-xs font-mono text-neutral-400">
                {orderNumber.trim().length >= 4
                  ? 'Order details could not be matched automatically. Please specify the garment below:'
                  : 'Enter your garment details:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="sm:col-span-1 space-y-1.5">
                  <label htmlFor="manual-product" className="text-neutral-300 uppercase tracking-wider block">
                    PRODUCT NAME <span className="text-snake-green">*</span>
                  </label>
                  <input
                    id="manual-product"
                    type="text"
                    value={manualProductName}
                    onChange={(e) => setManualProductName(e.target.value)}
                    placeholder="e.g. THE SIGNATURE TEE"
                    required
                    className="w-full bg-black border border-white/20 focus:border-snake-green text-white px-4 py-3 rounded-sm outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="manual-color" className="text-neutral-300 uppercase tracking-wider block">
                    COLORWAY
                  </label>
                  <input
                    id="manual-color"
                    type="text"
                    value={manualProductColor}
                    onChange={(e) => setManualProductColor(e.target.value)}
                    placeholder="e.g. Obsidian Black"
                    className="w-full bg-black border border-white/20 focus:border-snake-green text-white px-4 py-3 rounded-sm outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="manual-size" className="text-neutral-300 uppercase tracking-wider block">
                    SIZE
                  </label>
                  <select
                    id="manual-size"
                    value={manualProductSize}
                    onChange={(e) => setManualProductSize(e.target.value)}
                    className="w-full bg-black border border-white/20 focus:border-snake-green text-white px-4 py-3 rounded-sm outline-none transition-colors appearance-none cursor-pointer"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            STEP 3: DEFECT TYPE & WRITTEN DESCRIPTION
            ============================================================ */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 rounded-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="w-5 h-5 rounded-full bg-snake-green/10 border border-snake-green text-snake-green font-mono text-[11px] flex items-center justify-center font-bold">
              3
            </span>
            <h2 className="text-sm font-mono tracking-wider uppercase text-white font-semibold">
              DEFECT NATURE & OBSERVATIONS
            </h2>
          </div>

          <div className="space-y-5 text-xs font-mono">
            {/* Defect Category */}
            <div className="space-y-1.5">
              <label htmlFor="defect-type" className="text-neutral-300 uppercase tracking-wider block">
                CLASSIFICATION OF ISSUE <span className="text-snake-green">*</span>
              </label>
              <div className="relative">
                <select
                  id="defect-type"
                  value={defectType}
                  onChange={(e) => setDefectType(e.target.value)}
                  className="w-full bg-black border border-white/20 focus:border-snake-green text-white px-4 py-3 rounded-sm outline-none transition-colors appearance-none pr-10 cursor-pointer"
                >
                  {DEFECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="defect-desc" className="text-neutral-300 uppercase tracking-wider block">
                DETAILED DEFECT DESCRIPTION <span className="text-snake-green">*</span>
              </label>
              <textarea
                id="defect-desc"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the defect in detail — where on the garment is it located, how was it noticed, and any relevant details..."
                required
                className="w-full bg-black border border-white/20 focus:border-snake-green text-white p-4 rounded-sm outline-none transition-colors leading-relaxed"
              />
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>Minimum 15 characters required.</span>
                <span>{description.length} characters</span>
              </div>
            </div>

            {/* Preferred Resolution */}
            <div className="space-y-1.5">
              <label htmlFor="resolution-pref" className="text-neutral-300 uppercase tracking-wider block">
                PREFERRED REMEDY IF CLAIM IS APPROVED
              </label>
              <div className="relative">
                <select
                  id="resolution-pref"
                  value={preferredResolution}
                  onChange={(e) => setPreferredResolution(e.target.value)}
                  className="w-full bg-black border border-white/20 focus:border-snake-green text-white px-4 py-3 rounded-sm outline-none transition-colors appearance-none pr-10 cursor-pointer"
                >
                  {RESOLUTION_PREFERENCES.map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            STEP 4: EVIDENCE UPLOADS (IMAGES & UNBOXING VIDEO)
            ============================================================ */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 rounded-sm space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-snake-green/10 border border-snake-green text-snake-green font-mono text-[11px] flex items-center justify-center font-bold">
                4
              </span>
              <h2 className="text-sm font-mono tracking-wider uppercase text-white font-semibold">
                PHOTOGRAPHIC &amp; VIDEO EVIDENCE
              </h2>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              {images.length}/{MAX_IMAGE_COUNT} Photos
            </span>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-white font-medium uppercase tracking-wider block">
                PHOTOGRAPHS OF DEFECT &amp; PACKAGING
              </span>
              <p className="text-[11px] font-mono text-neutral-400">
                Please attach clear photos of: (1) full flat-laid garment, (2) close-up macro of defect, and (3) outer courier packaging.
                <br />
                <span className="text-snake-green">Limit: Max {MAX_IMAGE_COUNT} photos • 10MB per image</span> (JPG, PNG, WEBP).
              </p>
            </div>

            {imageError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono rounded-sm flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-red-400" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Image Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded bg-neutral-900 border border-white/20 overflow-hidden group"
                >
                  <Image src={img.dataUrl} alt={img.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-[9px] font-mono text-neutral-300 truncate w-full mb-1">
                      {(img.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-500 active:scale-90 transition-transform"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload Trigger Button */}
              {images.length < MAX_IMAGE_COUNT && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="relative aspect-square rounded border-2 border-dashed border-white/20 hover:border-snake-green bg-neutral-950 hover:bg-neutral-900 transition-all flex flex-col items-center justify-center p-3 text-center group cursor-pointer"
                >
                  <Upload size={20} className="text-neutral-400 group-hover:text-snake-green mb-1 transition-colors" />
                  <span className="text-[10px] font-mono text-neutral-300 group-hover:text-white uppercase">
                    ADD PHOTO
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500">
                    &lt; 10MB
                  </span>
                </button>
              )}
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg,image/heic"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Unboxing Video Upload Area */}
          <div className="space-y-4 border-t border-white/10 pt-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white font-medium uppercase tracking-wider block">
                  UNBOXING VIDEO FOOTAGE
                </span>
                <span className="text-[9px] font-mono text-snake-green border border-snake-green/40 px-1.5 py-0.5 rounded-sm uppercase">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400">
                If available, an unboxing video accelerates transit dispute claims with couriers.
                <br />
                <span className="text-snake-green">Limit: Max 1 video • 50MB</span> (MP4, MOV, WEBM).
              </p>
            </div>

            {videoError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono rounded-sm flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-red-400" />
                <span>{videoError}</span>
              </div>
            )}

            {video ? (
              <div className="bg-black/70 border border-snake-green/40 p-4 rounded-sm space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-snake-green" />
                    <span className="text-white font-medium truncate max-w-xs">{video.name}</span>
                    <span className="text-neutral-500">({(video.size / (1024 * 1024)).toFixed(1)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
                    title="Remove video"
                  >
                    <X size={16} />
                  </button>
                </div>
                <video
                  src={video.dataUrl}
                  controls
                  className="w-full max-h-64 rounded bg-black border border-white/10"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full py-6 px-4 border-2 border-dashed border-white/20 hover:border-snake-green bg-neutral-950 hover:bg-neutral-900 transition-all rounded-sm flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <Video size={24} className="text-neutral-400 group-hover:text-snake-green mb-1.5 transition-colors" />
                <span className="text-xs font-mono text-neutral-300 group-hover:text-white uppercase font-medium">
                  UPLOAD UNBOXING VIDEO
                </span>
                <span className="text-[10px] font-mono text-neutral-500 mt-0.5">
                  MP4, MOV, or WEBM • Max 50MB
                </span>
              </button>
            )}

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* ============================================================
            SUBMISSION CONTROLS
            ============================================================ */}
        <div className="space-y-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-white active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(4,252,33,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>TRANSMITTING REPORT TO ATELIER...</span>
              </>
            ) : (
              <>
                <span>TRANSMIT DEFECT REPORT FOR ATELIER REVIEW</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

          <p className="text-center text-[10px] font-mono text-neutral-500">
            By submitting, you declare that all provided evidence is genuine and pertains directly to this order.
          </p>
        </div>
      </form>
    </div>
  );
}

export default function ReportDefectPage() {
  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-4 sm:px-6 md:px-12 selection:bg-snake-green selection:text-black">
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex flex-col items-center justify-center font-mono text-xs text-neutral-400">
            <div className="w-6 h-6 border-2 border-snake-green border-t-transparent rounded-full animate-spin mb-3" />
            <span>INITIALIZING ATELIER REPORTING PORTAL...</span>
          </div>
        }
      >
        <DefectReportForm />
      </Suspense>
    </div>
  );
}
