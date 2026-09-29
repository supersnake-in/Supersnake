'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Package,
  CreditCard,
  Banknote,
  Minus,
  Plus,
  Copy,
} from 'lucide-react';
import { Product, Size, PreBooking } from '@/lib/types';
import { formatPrice } from '@/lib/design-tokens';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

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

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

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
      setErrorMsg('Please complete your full delivery coordinates (Street, City, State, and PIN code).');
      return;
    }

    if (pincode.replace(/\D/g, '').length !== 6) {
      setErrorMsg('Please enter a valid 6-digit postal PIN code.');
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
      country: 'India',
    };

    // ========================================================
    // A. CASH ON DELIVERY (PAY ON DELIVERY)
    // ========================================================
    if (paymentMethod === 'cod') {
      try {
        const res = await fetch('/api/pre-booking', {
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
            paymentStatus: 'Pending (COD)',
            paymentMethod: 'cod',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to submit pre-booking. Please retry.');
        }

        await createPreBooking(data.booking);
        setConfirmedBooking(data.booking);
        setStep('success');
      } catch (err: any) {
        setErrorMsg(err.message || 'Transmission interrupted. Please retry.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ========================================================
    // B. ONLINE PAYMENT VIA RAZORPAY
    // ========================================================
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Payment gateway failed to initialize. Please check your network connection.');
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

      // 2. Launch Razorpay Standard Checkout
      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TeKVwwxJXp1r5I',
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

                <div className="space-y-1">
                  <label className="text-neutral-400 uppercase text-[10px] block">CITY *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-neutral-400 uppercase text-[10px] block">STATE *</label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Karnataka"
                      className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-400 uppercase text-[10px] block">PIN CODE *</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="560001"
                      maxLength={6}
                      className="w-full bg-black border border-white/15 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 font-mono text-xs">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-semibold">
                PAYMENT DISCIPLINE
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Razorpay Online */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-3.5 rounded border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'bg-neutral-900 border-snake-green shadow-[0_0_12px_rgba(4,252,33,0.2)]'
                      : 'bg-black border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      <CreditCard size={15} className={paymentMethod === 'razorpay' ? 'text-snake-green' : 'text-neutral-400'} />
                      <span className="font-bold text-white text-xs">ONLINE PAYMENT</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-snake-green/20 text-snake-green font-bold">
                      INSTANT
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    Pay with UPI (GPay, PhonePe), Cards & NetBanking via Razorpay.
                  </p>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'cod'
                      ? 'bg-neutral-900 border-snake-green shadow-[0_0_12px_rgba(4,252,33,0.2)]'
                      : 'bg-black border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      <Banknote size={15} className={paymentMethod === 'cod' ? 'text-snake-green' : 'text-neutral-400'} />
                      <span className="font-bold text-white text-xs">PAY ON DELIVERY</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-bold">
                      COD
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    Book now, pay via cash or UPI when delivered at your doorstep.
                  </p>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded text-red-300 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {/* Guarantees */}
            <div className="p-3 bg-black/60 border border-white/[0.06] rounded flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-snake-green" />
                <span>Guaranteed Inaugural Drop Serial</span>
              </span>
              <span>Express Air Dispatch Included</span>
            </div>

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
                    <span>CONNECTING TO SECURE GATEWAY...</span>
                  </span>
                ) : paymentMethod === 'razorpay' ? (
                  <>
                    <span>PAY & CONFIRM PRE-BOOKING • {formatPrice(totalAmount)}</span>
                    <ArrowRight size={14} />
                  </>
                ) : (
                  <>
                    <span>CONFIRM PRE-BOOKING (PAY {formatPrice(totalAmount)} ON DELIVERY)</span>
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
                PRE-BOOKING SECURED & ALLOCATED
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white tracking-tight">
                ALLOCATION CONFIRMED.
              </h2>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                Your inaugural drop piece has been locked in our atelier register. Your serial number is reserved.
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
                  <span>AMOUNT:</span>
                  <span className="text-snake-green font-bold">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <span>PAYMENT DISCIPLINE:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      confirmedBooking?.paymentStatus === 'Paid'
                        ? 'bg-snake-green/20 text-snake-green border border-snake-green/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {confirmedBooking?.paymentStatus === 'Paid' ? '● PAID ONLINE' : '● CASH ON DELIVERY'}
                  </span>
                </div>
                {confirmedBooking?.razorpayPaymentId && (
                  <div className="flex justify-between text-[10px]">
                    <span>TRANSACTION REF:</span>
                    <span className="text-neutral-300 font-mono">{confirmedBooking.razorpayPaymentId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>DISPATCH TARGET:</span>
                  <span className="text-white">{launchDateText}</span>
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
