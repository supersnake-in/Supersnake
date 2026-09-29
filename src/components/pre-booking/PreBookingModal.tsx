'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Check,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Package,
  Minus,
  Plus,
  Copy,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { Product, Size, PreBooking } from '@/lib/types';
import { formatPrice } from '@/lib/design-tokens';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

interface PreBookingModalProps {
  product: Product;
  selectedColor: { name: string; hex: string };
  selectedSize: Size;
  quantity: number;
  isOpen: boolean;
  onClose: () => void;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const STANDARD_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function PreBookingModal({
  product,
  selectedColor,
  selectedSize,
  quantity,
  isOpen,
  onClose,
}: PreBookingModalProps) {
  const { storefrontConfig, createPreBooking } = useStore();
  const { user, profile } = useAuth();

  // Customization selection state
  const [currentColor, setCurrentColor] = useState<{ name: string; hex: string }>(
    selectedColor || product.colors[0] || { name: 'Obsidian Black', hex: '#0a0a0a' }
  );
  const [currentSize, setCurrentSize] = useState<Size>(
    selectedSize || product.sizes[2] || product.sizes[0] || 'L'
  );
  const [currentQty, setCurrentQty] = useState<number>(quantity || 1);

  // Patron & Shipping info
  const [customerName, setCustomerName] = useState(profile?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || profile?.email || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [postOffices, setPostOffices] = useState<Array<{ name: string; branchType?: string; deliveryStatus?: string }>>([]);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);

  // Modal flow state
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<PreBooking | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync inputs on open or prop change
  useEffect(() => {
    if (isOpen) {
      setCurrentColor(selectedColor || product.colors[0] || { name: 'Obsidian Black', hex: '#0a0a0a' });
      setCurrentSize(selectedSize || product.sizes[2] || product.sizes[0] || 'L');
      setCurrentQty(quantity || 1);
      setErrorMsg(null);
      setStep('form');
      setPostOffice('');
      setPostOffices([]);
      setPincodeMessage(null);
      setIsFetchingPincode(false);
      loadRazorpayScript();
    }
  }, [isOpen, selectedColor, selectedSize, quantity, product]);

  // Sync user details when authenticated
  useEffect(() => {
    if (user?.email && !customerEmail) setCustomerEmail(user.email);
    if (profile?.fullName && !customerName) setCustomerName(profile.fullName);
    if (profile?.phone && !customerPhone) setCustomerPhone(profile.phone);
  }, [user, profile]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const unitPrice = Number(product.price);
  const totalAmount = unitPrice * currentQty;
  const launchDateText = storefrontConfig?.launchDate
    ? new Date(storefrontConfig.launchDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '14 OCTOBER 2026';

  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : STANDARD_SIZES;
  const availableColors = product.colors && product.colors.length > 0 ? product.colors : [
    { name: 'Obsidian Black', hex: '#0a0a0a' }
  ];

  // Primary image
  const productImage = product.images?.[0]?.url || '';

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const lookupPincode = async (code: string) => {
    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setPostOffices([]);
      setPincodeMessage(null);
      return;
    }

    setIsFetchingPincode(true);
    setPincodeMessage(null);

    try {
      let data: any = null;
      try {
        const res = await fetch(`/api/pincode/${cleanCode}`);
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {}

      // Direct fallback if internal API route is unreachable
      if (!data || !data.success) {
        try {
          const directRes = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`);
          if (directRes.ok) {
            const directData = await directRes.json();
            if (Array.isArray(directData) && directData[0]?.Status === 'Success' && directData[0]?.PostOffice?.length) {
              const rawPOs = directData[0].PostOffice;
              data = {
                success: true,
                district: rawPOs[0].District || rawPOs[0].Division || '',
                state: rawPOs[0].State || '',
                postOffices: rawPOs.map((po: any) => ({
                  name: po.Name,
                  branchType: po.BranchType || '',
                  deliveryStatus: po.DeliveryStatus || '',
                })),
              };
            }
          }
        } catch (directErr) {}
      }

      if (data && data.success && Array.isArray(data.postOffices) && data.postOffices.length > 0) {
        const district = data.district || '';
        const fetchedState = data.state || '';
        const poList = data.postOffices;

        // Prioritize delivery post offices, then alphabetical
        const sortedPOs = [...poList].sort((a: any, b: any) => {
          if (a.deliveryStatus === 'Delivery' && b.deliveryStatus !== 'Delivery') return -1;
          if (a.deliveryStatus !== 'Delivery' && b.deliveryStatus === 'Delivery') return 1;
          return a.name.localeCompare(b.name);
        });

        setPostOffices(sortedPOs);
        if (district) setCity(district);
        if (fetchedState) setStateName(fetchedState);

        if (sortedPOs.length === 1) {
          setPostOffice(sortedPOs[0].name);
        } else {
          setPostOffice(sortedPOs[0]?.name || '');
        }

        if (poList.length > 1) {
          setPincodeMessage(`${poList.length} locations detected in PIN ${cleanCode}`);
        } else {
          setPincodeMessage('Postal location auto-detected');
        }
      } else {
        setPostOffices([]);
        setPincodeMessage('PIN code not found. You can enter details manually.');
      }
    } catch (error) {
      console.error('Failed to lookup PIN code:', error);
      setPincodeMessage(null);
    } finally {
      setIsFetchingPincode(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      lookupPincode(val);
    } else {
      if (postOffices.length > 0) setPostOffices([]);
      if (pincodeMessage) setPincodeMessage(null);
    }
  };

  const handlePayAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validate patron information
    const cleanName = customerName.trim();
    const cleanEmail = customerEmail.trim().toLowerCase();
    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Please enter your full patron name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address for your reservation voucher.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for dispatch updates.');
      return;
    }

    if (!street.trim() || !city.trim() || !stateName.trim() || !pincode.trim()) {
      setErrorMsg('Please complete your full delivery coordinates (Street, PIN code, City, and State).');
      return;
    }

    if (pincode.replace(/\D/g, '').length !== 6) {
      setErrorMsg('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    if (postOffices.length > 1 && !postOffice.trim()) {
      setErrorMsg('Please select your post office / area from the dropdown.');
      return;
    }

    setIsSubmitting(true);

    const shippingAddressPayload = {
      fullName: cleanName,
      phone: cleanPhone,
      street: street.trim(),
      city: city.trim(),
      state: stateName.trim(),
      postalCode: pincode.trim(),
      postOffice: postOffice.trim() || undefined,
      country: 'India',
    };

    // ========================================================
    // EXCLUSIVE ONLINE PAYMENT VIA RAZORPAY (NO COD)
    // ========================================================
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Payment gateway failed to initialize. Please check your network connection or disable ad-blockers.');
      }

      // 1. Create Razorpay order on server
      const amountInPaise = Math.round(totalAmount * 100);
      const tempBookingId = `PB-${Date.now().toString().slice(-6)}`;

      const createOrderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          isPreBooking: true,
          customer: {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
          },
          shippingAddress: shippingAddressPayload,
          items: [
            {
              productId: product.id,
              productName: product.name,
              color: currentColor.name,
              size: currentSize,
              quantity: currentQty,
              price: unitPrice,
              imageUrl: productImage,
            },
          ],
          orderId: tempBookingId,
        }),
      });

      if (!createOrderRes.ok) {
        const errJson = await createOrderRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to initialize payment session with server.');
      }

      const orderData = await createOrderRes.json();
      if (!orderData.order_id) {
        throw new Error('Order verification failed. Gateway order ID missing.');
      }

      // 2. Launch Razorpay Standard Checkout using authoritative live key
      const razorpayKey =
        orderData.key ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        'rzp_test_TeKVwwxJXp1r5I';

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'SuperSnake Atelier',
        description: `First Drop Pre-Booking: ${product.name} (${currentSize})`,
        order_id: orderData.order_id,
        prefill: {
          name: cleanName,
          email: cleanEmail,
          contact: cleanPhone,
        },
        theme: {
          color: '#04fc21',
          backdrop_color: 'rgba(0, 0, 0, 0.88)',
        },
        handler: async function (response: any) {
          try {
            // Confirm pre-booking with cryptographic payment tokens
            const bookRes = await fetch('/api/pre-booking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: product.id,
                size: currentSize,
                colorName: currentColor.name,
                colorHex: currentColor.hex,
                quantity: currentQty,
                customerName: cleanName,
                customerEmail: cleanEmail,
                customerPhone: cleanPhone,
                shippingAddress: shippingAddressPayload,
                paymentStatus: 'Paid',
                paymentMethod: 'razorpay',
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const bookData = await bookRes.json();
            if (bookData.success && bookData.booking) {
              await createPreBooking(bookData.booking);
              setConfirmedBooking(bookData.booking);
              setStep('success');
            } else {
              throw new Error(bookData.message || 'Payment confirmed, but reservation registration delayed.');
            }
          } catch (err: any) {
            setErrorMsg(err.message || 'Payment verification interrupted. Please contact client concierge.');
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setErrorMsg(resp?.error?.description || 'Payment was declined or cancelled. Please try again.');
        setIsSubmitting(false);
      });

      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to trigger payment gateway.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans selection:bg-snake-green selection:text-black">
      <div className="relative bg-[#090909] border border-white/10 rounded-lg max-w-xl w-full p-5 sm:p-8 space-y-6 text-white shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-neutral-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* STEP 1: FORM & SELECTION */}
        {step === 'form' ? (
          <form onSubmit={handlePayAndBook} className="space-y-6">
            {/* Header */}
            <div className="space-y-1.5 border-b border-white/[0.08] pb-4 pr-8">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-snake-green animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase block font-semibold">
                  FIRST DROP // PRE-BOOK & PAY
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-white">
                RESERVE & PAY FOR YOUR PIECE
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                Official release on <strong className="text-white">{launchDateText}</strong>. Secure your guaranteed piece now.
              </p>
            </div>

            {/* Garment Snapshot with Live Total */}
            <div className="p-4 rounded-md bg-black/60 border border-white/[0.08] space-y-4">
              <div className="flex gap-4 items-center">
                <div className="relative w-16 h-20 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-white/10">
                  {productImage ? (
                    <Image src={productImage} alt={product.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-600 font-mono">
                      NO IMAGE
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1 text-xs font-mono">
                  <span className="text-white font-bold uppercase block text-sm">{product.name}</span>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-snake-green font-bold text-base">{formatPrice(unitPrice)}</span>
                    {product.mrp && product.mrp > unitPrice && (
                      <span className="text-[10px] text-neutral-500 line-through">
                        {formatPrice(product.mrp)}
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400">/ unit</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 block">
                    TOTAL ALLOCATION: <strong className="text-white">{formatPrice(totalAmount)}</strong>
                  </span>
                </div>
              </div>

              {/* 1. REQUIRED COLOR SELECTOR */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400 uppercase">1. CHOOSE COLOR:</span>
                  <span className="text-white font-bold">{currentColor.name}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map((color) => {
                    const isSelected = currentColor.name === color.name;
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setCurrentColor(color)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-all ${
                          isSelected
                            ? 'bg-neutral-800 border-snake-green text-white shadow-[0_0_10px_rgba(4,252,33,0.25)]'
                            : 'bg-black/40 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[11px]">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. REQUIRED SIZE SELECTOR */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400 uppercase">2. CHOOSE SIZE:</span>
                  <span className="text-snake-green font-bold uppercase">SIZE {currentSize} SELECTED</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {STANDARD_SIZES.map((sizeOption) => {
                    const isAvailable = availableSizes.includes(sizeOption);
                    const isSelected = currentSize === sizeOption;
                    return (
                      <button
                        key={sizeOption}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setCurrentSize(sizeOption)}
                        className={`py-2 text-xs font-mono font-bold rounded border transition-all ${
                          isSelected
                            ? 'bg-snake-green text-black border-snake-green shadow-[0_0_12px_rgba(4,252,33,0.35)]'
                            : isAvailable
                            ? 'bg-black border-white/15 text-white hover:border-white/40'
                            : 'bg-neutral-900/50 border-white/5 text-neutral-600 cursor-not-allowed line-through'
                        }`}
                      >
                        {sizeOption}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. QUANTITY SELECTOR */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-neutral-400 uppercase">3. QUANTITY (MAX 5):</span>
                <div className="flex items-center border border-white/20 rounded bg-black">
                  <button
                    type="button"
                    onClick={() => setCurrentQty(Math.max(1, currentQty - 1))}
                    disabled={currentQty <= 1}
                    className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="px-3 font-bold text-white text-xs">{currentQty}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentQty(Math.min(5, currentQty + 1))}
                    disabled={currentQty >= 5}
                    className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Patron & Delivery Form */}
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-semibold">
                PATRON COORDINATES & SHIPPING
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 uppercase text-[10px] block">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Vikramaditya Rao"
                    className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 uppercase text-[10px] block">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-neutral-400 uppercase text-[10px] block">
                    MOBILE NUMBER (FOR DISPATCH SMS & WHATSAPP) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-neutral-400 uppercase text-[10px] block">STREET ADDRESS *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Flat / House / Suite, Street, Landmark"
                    className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
                  />
                </div>

                {/* PIN CODE INPUT with auto-lookup */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-neutral-400 uppercase text-[10px] flex items-center justify-between">
                    <span className="text-white font-semibold">PIN CODE *</span>
                    {isFetchingPincode ? (
                      <span className="text-[10px] text-snake-green font-mono flex items-center gap-1">
                        <Loader2 size={11} className="animate-spin" />
                        DETECTING DETAILS...
                      </span>
                    ) : pincodeMessage ? (
                      <span className={`text-[10px] font-mono ${postOffices.length > 0 ? 'text-snake-green' : 'text-neutral-400'}`}>
                        {pincodeMessage}
                      </span>
                    ) : (
                      <span className="text-[9px] text-neutral-500">AUTO-FILLS LOCATION DETAILS</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={pincode}
                    onChange={handlePincodeChange}
                    placeholder="e.g. 560094"
                    maxLength={6}
                    className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none font-mono"
                  />
                </div>

                {/* POST OFFICE / AREA (when multiple exist) */}
                {postOffices.length > 1 && (
                  <div className="space-y-1 sm:col-span-2 animate-fadeIn">
                    <label className="text-neutral-400 uppercase text-[10px] flex items-center justify-between">
                      <span className="text-white font-semibold">POST OFFICE / AREA *</span>
                      <span className="text-[9px] text-snake-green font-mono">
                        {postOffices.length} LOCATIONS IN THIS PIN CODE
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={postOffice}
                        onChange={(e) => setPostOffice(e.target.value)}
                        className="w-full bg-[#111] border border-snake-green/60 px-3 py-2 text-xs text-white rounded focus:outline-none focus:border-snake-green appearance-none pr-8 cursor-pointer font-mono"
                      >
                        <option value="" disabled className="bg-black text-neutral-500">
                          -- SELECT POST OFFICE / AREA --
                        </option>
                        {postOffices.map((po) => (
                          <option key={po.name} value={po.name} className="bg-neutral-900 text-white">
                            {po.name} {po.deliveryStatus ? `(${po.deliveryStatus})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-snake-green pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* POST OFFICE / AREA (when single post office detected) */}
                {postOffices.length === 1 && (
                  <div className="space-y-1 sm:col-span-2 animate-fadeIn">
                    <label className="text-neutral-400 uppercase text-[10px] flex items-center justify-between">
                      <span>POST OFFICE / AREA</span>
                      <span className="text-[9px] text-snake-green font-mono">AUTO-DETECTED</span>
                    </label>
                    <input
                      type="text"
                      value={postOffice}
                      onChange={(e) => setPostOffice(e.target.value)}
                      placeholder="Post Office name"
                      className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none font-mono"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-neutral-400 uppercase text-[10px] flex items-center justify-between">
                    <span>CITY / DISTRICT *</span>
                    {city && <span className="text-[9px] text-snake-green font-mono">AUTO-FILLED</span>}
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 uppercase text-[10px] flex items-center justify-between">
                    <span>STATE *</span>
                    {stateName && <span className="text-[9px] text-snake-green font-mono">AUTO-FILLED</span>}
                  </label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded text-red-300 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {/* Action CTA */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-snake-green hover:bg-white text-black font-mono font-bold uppercase tracking-wider rounded transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(4,252,33,0.3)] disabled:opacity-50 text-xs"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>CONNECTING TO RAZORPAY SECURE...</span>
                  </span>
                ) : (
                  <>
                    <span>PAY & SECURE PRE-BOOKING • {formatPrice(totalAmount)}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: SUCCESS STATE & RECEIPT */
          <div className="text-center space-y-6 py-2 animate-in fade-in duration-300 font-mono">
            <div className="w-14 h-14 rounded-full bg-snake-green/15 border border-snake-green text-snake-green mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(4,252,33,0.3)]">
              <Check size={28} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] tracking-widest text-snake-green uppercase block font-semibold">
                PAYMENT CONFIRMED // PRE-BOOKING SECURED
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white tracking-tight">
                ALLOCATION CONFIRMED.
              </h2>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                Your payment was received. Your inaugural drop piece has been locked in our atelier register with a reserved serial number.
              </p>
            </div>

            {/* Reference Voucher Card */}
            <div className="p-5 bg-black border border-white/10 rounded-lg space-y-3 max-w-md mx-auto text-left text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <span className="text-[9px] text-neutral-500 uppercase block">VOUCHER CODE</span>
                  <span className="font-bold text-snake-green text-sm">{confirmedBooking?.bookingNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => confirmedBooking?.bookingNumber && handleCopy(confirmedBooking.bookingNumber)}
                  className="px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:border-snake-green text-neutral-300 text-[10px] flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check size={11} className="text-snake-green" /> : <Copy size={11} />}
                  <span>{copiedCode ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <div className="space-y-1.5 text-[11px] text-neutral-400">
                <div className="flex justify-between">
                  <span>GARMENT:</span>
                  <span className="text-white font-semibold">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>SPECIFICATION:</span>
                  <span className="text-white">{currentSize} // {currentColor.name} (QTY: {currentQty})</span>
                </div>
                <div className="flex justify-between">
                  <span>AMOUNT PAID:</span>
                  <span className="text-snake-green font-bold">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <span>PAYMENT DISCIPLINE:</span>
                  <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-snake-green/20 text-snake-green border border-snake-green/40">
                    ● PAID ONLINE VIA RAZORPAY
                  </span>
                </div>
                {confirmedBooking?.razorpayPaymentId && (
                  <div className="flex justify-between text-[10px]">
                    <span>RAZORPAY PAYMENT ID:</span>
                    <span className="text-neutral-300 font-mono">{confirmedBooking.razorpayPaymentId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>DISPATCH TARGET:</span>
                  <span className="text-white">{launchDateText}</span>
                </div>
                <div className="flex justify-between">
                  <span>DESTINATION:</span>
                  <span className="text-white text-right truncate max-w-[220px]">
                    {postOffice ? `${postOffice}, ` : ''}{city}, {stateName} ({pincode})
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500">
              A digital receipt transmission has been recorded for <strong className="text-neutral-300">{customerEmail}</strong>.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-snake-green text-black font-bold uppercase text-xs rounded transition-colors"
              >
                CONTINUE BROWSING
              </button>
              <Link
                href="/account/pre-bookings"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 border border-white/20 hover:border-white text-white font-bold uppercase text-xs rounded transition-colors"
              >
                VIEW IN MY PRE-BOOKINGS
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
