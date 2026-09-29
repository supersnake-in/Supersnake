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

  const [step, setStep] = useState<'review' | 'details' | 'success'>('review');
  const [customerName, setCustomerName] = useState(profile?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || profile?.email || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<PreBooking | null>(null);

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
  const totalAmount = unitPrice * quantity;
  const launchDateText = storefrontConfig?.launchDate
    ? new Date(storefrontConfig.launchDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '14 OCTOBER 2026';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !customerEmail.includes('@')) {
      setErrorMsg('Please enter a valid customer name and email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/pre-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          colorName: selectedColor.name,
          quantity,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone.trim() || undefined,
          shippingAddress: street.trim()
            ? {
                street: street.trim(),
                city: city.trim(),
                state: stateName.trim(),
                postalCode: pincode.trim(),
                country: 'India',
              }
            : undefined,
          paymentStatus: 'Reservation',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Failed to submit pre-booking. Please retry.');
        setIsSubmitting(false);
        return;
      }

      if (data.success && data.booking) {
        // Also sync to client store context
        await createPreBooking(data.booking);
        setConfirmedBooking(data.booking);
        setStep('success');
      } else {
        throw new Error('Pre-booking transmission interrupted.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network transmission interrupted. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const productImage = product.images?.[0]?.url || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans selection:bg-snake-green selection:text-black">
      <div className="relative bg-[#0c0c0c] border border-white/10 rounded-lg max-w-xl w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-neutral-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* STEP 1 & 2: PRE-BOOKING FORM */}
        {step !== 'success' ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1.5 border-b border-white/[0.08] pb-4">
              <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase block">
                FIRST DROP // EXCLUSIVE RESERVATION
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-white">
                PRE-BOOK YOUR PIECE
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                Official launch on <strong className="text-white">{launchDateText}</strong>. Secure your allocation before public release.
              </p>
            </div>

            {/* Selected Garment Review Card */}
            <div className="flex gap-4 p-4 rounded bg-black/60 border border-white/[0.08]">
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
                <span className="text-white font-bold uppercase block">{product.name}</span>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: selectedColor.hex }} />
                    <span>{selectedColor.name}</span>
                  </span>
                  <span>•</span>
                  <span>SIZE: <strong className="text-white">{selectedSize}</strong></span>
                  <span>•</span>
                  <span>QTY: <strong className="text-white">{quantity}</strong></span>
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-snake-green font-bold text-sm">{formatPrice(totalAmount)}</span>
                  <span className="text-[10px] text-neutral-500 line-through">{formatPrice(product.mrp * quantity)}</span>
                </div>
              </div>
            </div>

            {/* Customer Details Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 uppercase text-[10px]">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Vikramaditya Rao"
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white rounded focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 uppercase text-[10px]">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white rounded focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-neutral-400 uppercase text-[10px]">PHONE NUMBER (FOR DISPATCH SMS)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white rounded focus:border-snake-green focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-neutral-400 uppercase text-[10px]">DELIVERY ADDRESS / PINCODE (OPTIONAL)</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Apartment, Street, City, Pincode"
                    className="w-full bg-black border border-white/10 px-3 py-2.5 text-white rounded focus:border-snake-green focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-500 block">
                    You can confirm or update your shipping address closer to the launch date.
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Guarantees */}
              <div className="p-3 bg-black/60 border border-white/[0.06] rounded flex items-center justify-between text-[10px] text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-snake-green" />
                  <span>Guaranteed First Drop Allocation</span>
                </span>
                <span>Zero Immediate Charges</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-snake-green hover:bg-white text-black font-bold uppercase tracking-wider rounded transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(4,252,33,0.3)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>CONFIRM PRE-BOOKING</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 3: SUCCESS STATE */
          <div className="text-center space-y-6 py-4 animate-in fade-in duration-300 font-mono">
            <div className="w-14 h-14 rounded-full bg-snake-green/15 border border-snake-green text-snake-green mx-auto flex items-center justify-center">
              <Check size={28} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] tracking-widest text-snake-green uppercase block">
                RESERVATION CONFIRMED
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white tracking-tight">
                YOU&apos;RE IN.
              </h2>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                Your SuperSnake pre-booking has been locked in. You are guaranteed an allocation from the First Drop.
              </p>
            </div>

            {/* Reference Badge Card */}
            <div className="p-4 bg-black border border-white/10 rounded space-y-2 max-w-sm mx-auto text-left text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-[10px] text-neutral-500 uppercase">PRE-BOOKING ID</span>
                <span className="font-bold text-snake-green">{confirmedBooking?.bookingNumber}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-neutral-400 pt-1">
                <span>GARMENT:</span>
                <span className="text-white font-semibold">{product.name}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-neutral-400">
                <span>SPECIFICATION:</span>
                <span className="text-white">{selectedSize} // {selectedColor.name}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-neutral-400">
                <span>OFFICIAL LAUNCH:</span>
                <span className="text-white">{launchDateText}</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500">
              A confirmation transmission has been recorded for <strong className="text-neutral-300">{customerEmail}</strong>.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-snake-green text-black font-bold uppercase text-xs rounded transition-colors"
              >
                CONTINUE EXPLORING
              </button>
              <Link
                href="/account/pre-bookings"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 border border-white/20 hover:border-white text-white font-bold uppercase text-xs rounded transition-colors"
              >
                VIEW MY PRE-BOOKINGS
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
