'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Truck,
  Search,
  ArrowRight,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { OrderStatus, Order, PreBooking, PreBookingStatus } from '@/lib/types';
import { formatPrice } from '@/lib/design-tokens';

// Stepper Milestones for Regular Orders
const ORDER_STEPS: OrderStatus[] = [
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

// Stepper Milestones for Exclusive Pre-Bookings
const PRE_BOOKING_STAGES: {
  statusKey: PreBookingStatus;
  title: string;
  subtitle: string;
}[] = [
  {
    statusKey: 'CONFIRMED',
    title: 'Reservation Confirmed',
    subtitle: 'Paid via Razorpay // Serial locked in atelier register',
  },
  {
    statusKey: 'PRODUCTION',
    title: 'Atelier Tailoring',
    subtitle: 'Garment crafted with quality audit & hand-finishing',
  },
  {
    statusKey: 'IN_TRANSIT',
    title: 'Priority Air Express',
    subtitle: 'Dispatched with express courier airbill',
  },
  {
    statusKey: 'DELIVERED',
    title: 'Delivered to Patron',
    subtitle: 'Safely handed over to customer coordinates',
  },
];

function TrackOrderInner() {
  const searchParams = useSearchParams();
  const { orders, preBookings, storefrontConfig } = useStore();

  const initialCode =
    searchParams.get('ref') ||
    searchParams.get('order') ||
    searchParams.get('code') ||
    searchParams.get('q') ||
    '';
  const initialIdentifier =
    searchParams.get('email') || searchParams.get('phone') || '';

  const [referenceInput, setReferenceInput] = useState(initialCode);
  const [identifierInput, setIdentifierInput] = useState(initialIdentifier);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [foundType, setFoundType] = useState<'PRE_BOOKING' | 'ORDER' | null>(null);
  const [foundPreBooking, setFoundPreBooking] = useState<PreBooking | null>(null);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);

  // Format Launch Date for Pre-Booking Dispatch target
  const launchDateText = useMemo(() => {
    const dStr = storefrontConfig?.launchDate || '2026-10-14';
    try {
      const d = new Date(`${dStr}T00:00:00+05:30`);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).toUpperCase();
      }
    } catch {}
    return '14 OCTOBER 2026';
  }, [storefrontConfig?.launchDate]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Authoritative Search Executor
  const executeSearch = async (codeToSearch: string, idToSearch: string) => {
    const cleanCode = codeToSearch.trim().toLowerCase();
    const cleanId = idToSearch.trim().toLowerCase();

    if (!cleanCode && !cleanId) return;

    setIsLoading(true);
    setSearched(true);

    try {
      // 1. Check local preBookings store first
      let matchedPreBooking = preBookings.find((pb) => {
        const codeMatches =
          !cleanCode ||
          pb.bookingNumber?.toLowerCase() === cleanCode ||
          pb.referenceCode?.toLowerCase() === cleanCode ||
          pb.id?.toLowerCase() === cleanCode ||
          pb.razorpayPaymentId?.toLowerCase() === cleanCode;

        const idMatches =
          !cleanId ||
          pb.customerEmail?.toLowerCase() === cleanId ||
          pb.customerPhone?.replace(/\D/g, '').includes(cleanId.replace(/\D/g, ''));

        return codeMatches && (cleanCode ? true : idMatches);
      });

      // 2. Query /api/pre-booking for real-time database record
      if (!matchedPreBooking && (cleanCode || cleanId)) {
        try {
          const queryParams = new URLSearchParams();
          if (cleanCode) queryParams.set('code', cleanCode);
          if (cleanId) {
            if (cleanId.includes('@')) queryParams.set('email', cleanId);
            else queryParams.set('phone', cleanId);
          }
          const res = await fetch(`/api/pre-booking?${queryParams.toString()}`);
          if (res.ok) {
            const data = await res.json();
            if (data.booking) {
              matchedPreBooking = data.booking;
            } else if (Array.isArray(data.bookings) && data.bookings.length > 0) {
              matchedPreBooking = data.bookings[0];
            }
          }
        } catch (fetchErr) {
          console.warn('Live pre-booking API lookup fallback:', fetchErr);
        }
      }

      if (matchedPreBooking) {
        setFoundType('PRE_BOOKING');
        setFoundPreBooking(matchedPreBooking);
        setFoundOrder(null);
        setIsLoading(false);
        return;
      }

      // 3. Search Regular Orders
      const matchedOrder = orders.find((o) => {
        const numMatches =
          !cleanCode ||
          o.orderNumber?.toLowerCase() === cleanCode ||
          o.id?.toLowerCase() === cleanCode;

        const idMatches =
          !cleanId ||
          o.customer?.email?.toLowerCase() === cleanId ||
          o.customer?.phone?.replace(/\D/g, '').includes(cleanId.replace(/\D/g, ''));

        return numMatches && (cleanCode ? true : idMatches);
      });

      if (matchedOrder) {
        setFoundType('ORDER');
        setFoundOrder(matchedOrder);
        setFoundPreBooking(null);
        setIsLoading(false);
        return;
      }

      // 4. Nothing located
      setFoundType(null);
      setFoundPreBooking(null);
      setFoundOrder(null);
    } catch (err) {
      console.error('Error during shipment lookup:', err);
      setFoundType(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-track if URL query parameters exist on mount
  useEffect(() => {
    if (initialCode || initialIdentifier) {
      executeSearch(initialCode, initialIdentifier);
    }
  }, []); // Run on mount

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(referenceInput, identifierInput);
  };

  // Calculate Pre-Booking Active Step Index (0 to 3)
  const preBookingStageIndex = useMemo(() => {
    if (!foundPreBooking) return 0;
    const st = foundPreBooking.status;
    if (st === 'CONFIRMED' || st === 'CONTACTED') return 0;
    if (st === 'PRODUCTION') return 1;
    if (st === 'IN_TRANSIT') return 2;
    if (st === 'DELIVERED' || st === 'CONVERTED_TO_ORDER') return 3;
    if (st === 'CANCELLED') return -1;
    return 0;
  }, [foundPreBooking]);

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-4 sm:px-6 md:px-12 font-sans selection:bg-snake-green selection:text-black">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-snake-green animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase font-semibold">
              ATELIER LOGISTICS RADAR
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            TRACK YOUR SHIPMENT
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Live fulfillment milestones direct from our atelier register, tailoring workshop, and priority air express network.
          </p>
        </div>

        {/* Tracking Search Form */}
        <div className="bg-[#0a0a0a] border border-white/10 p-5 md:p-8 rounded-lg shadow-xl">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                  Reference or Order # *
                </label>
                <input
                  type="text"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  required={!identifierInput}
                  placeholder="e.g. SS-PB-2026-1049 or SS-2026-1049"
                  className="w-full min-h-[48px] bg-[#121212] border border-white/15 px-4 py-3 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors rounded"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                  Email or Phone (Optional)
                </label>
                <input
                  type="text"
                  value={identifierInput}
                  onChange={(e) => setIdentifierInput(e.target.value)}
                  placeholder="e.g. patron@supersnake.in or 98765..."
                  className="w-full min-h-[48px] bg-[#121212] border border-white/15 px-4 py-3 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors rounded"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-bold active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 group mt-2 rounded disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>TRANSMITTING QUERY...</span>
                </span>
              ) : (
                <>
                  <span>TRACK RESERVATION / SHIPMENT</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* RESULTS SECTION */}
        {searched && !isLoading && (
          <>
            {/* ========================================================
                A: PRE-BOOKING TRACKING RADAR
                ======================================================== */}
            {foundType === 'PRE_BOOKING' && foundPreBooking && (
              <div className="bg-[#0a0a0a] border border-snake-green/40 p-5 md:p-8 rounded-lg space-y-6 shadow-[0_0_30px_rgba(4,252,33,0.06)] animate-in fade-in duration-300">
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-snake-green animate-pulse" />
                      <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase font-bold">
                        EXCLUSIVE FIRST DROP // PRE-BOOKING RADAR
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-white tracking-tight">
                        {foundPreBooking.bookingNumber || foundPreBooking.referenceCode}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleCopy(foundPreBooking.bookingNumber || foundPreBooking.referenceCode)}
                        className="p-1 text-neutral-400 hover:text-snake-green transition-colors"
                        title="Copy Reference Code"
                      >
                        {copiedText === (foundPreBooking.bookingNumber || foundPreBooking.referenceCode) ? (
                          <Check size={14} className="text-snake-green" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-neutral-400">
                      Patron Allocation: <strong className="text-white">{foundPreBooking.customerName}</strong>
                    </p>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <span className="text-[10px] font-mono text-neutral-500 block uppercase">
                      OFFICIAL DISPATCH WINDOW
                    </span>
                    <span className="text-base sm:text-lg font-display font-bold text-snake-green font-mono">
                      {launchDateText}
                    </span>
                  </div>
                </div>

                {/* Cancelled Alert if applicable */}
                {foundPreBooking.status === 'CANCELLED' && (
                  <div className="p-4 bg-red-950/40 border border-red-500/40 rounded text-red-300 font-mono text-xs space-y-1">
                    <div className="font-bold flex items-center gap-2">
                      <AlertCircle size={15} />
                      <span>PRE-BOOKING CANCELLED</span>
                    </div>
                    <p className="text-neutral-400 text-[11px]">
                      This pre-booking reservation was cancelled. If you requested a refund, our concierge has initiated gateway reconciliation.
                    </p>
                  </div>
                )}

                {/* Stepper Milestones */}
                {foundPreBooking.status !== 'CANCELLED' && (
                  <div className="space-y-4 py-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                      <span>FULFILLMENT MILESTONES</span>
                      <span className="text-snake-green font-bold">
                        STAGE {preBookingStageIndex + 1} OF {PRE_BOOKING_STAGES.length}
                      </span>
                    </div>

                    {/* Desktop Horizontal Stepper */}
                    <div className="hidden sm:grid sm:grid-cols-4 gap-3">
                      {PRE_BOOKING_STAGES.map((stage, idx) => {
                        const isPast = preBookingStageIndex > idx;
                        const isCurrent = preBookingStageIndex === idx;
                        return (
                          <div key={stage.title} className="space-y-2.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                isCurrent
                                  ? 'bg-snake-green shadow-[0_0_10px_rgba(4,252,33,0.7)]'
                                  : isPast
                                  ? 'bg-snake-green'
                                  : 'bg-white/10'
                              }`}
                            />
                            <div className="space-y-0.5">
                              <span
                                className={`text-[10px] font-mono uppercase block font-bold ${
                                  isCurrent
                                    ? 'text-snake-green'
                                    : isPast
                                    ? 'text-white'
                                    : 'text-neutral-600'
                                }`}
                              >
                                {idx + 1}. {stage.title}
                              </span>
                              <p className="text-[9px] font-mono text-neutral-500 leading-tight">
                                {stage.subtitle}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Vertical Stepper */}
                    <div className="sm:hidden space-y-5 py-2 pl-2">
                      {PRE_BOOKING_STAGES.map((stage, idx) => {
                        const isPast = preBookingStageIndex > idx;
                        const isCurrent = preBookingStageIndex === idx;
                        const isLast = idx === PRE_BOOKING_STAGES.length - 1;

                        return (
                          <div key={stage.title} className="flex items-start gap-3.5 relative">
                            {!isLast && (
                              <div
                                className={`absolute left-[11px] top-5 bottom-[-20px] w-[2px] ${
                                  preBookingStageIndex > idx ? 'bg-snake-green' : 'bg-white/10'
                                }`}
                              />
                            )}

                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 font-mono text-[10px] font-bold ${
                                isCurrent
                                  ? 'bg-snake-green text-black ring-4 ring-snake-green/20'
                                  : isPast
                                  ? 'bg-snake-green text-black'
                                  : 'bg-[#1a1a1a] border border-white/20 text-neutral-600'
                              }`}
                            >
                              {isPast ? <Check size={12} className="stroke-[3]" /> : idx + 1}
                            </div>

                            <div className="flex-1 pb-1">
                              <p
                                className={`text-xs font-mono uppercase tracking-wider font-bold ${
                                  isCurrent
                                    ? 'text-snake-green'
                                    : isPast
                                    ? 'text-white'
                                    : 'text-neutral-500'
                                }`}
                              >
                                {stage.title}
                              </p>
                              <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                                {stage.subtitle}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Garment Snapshot Card */}
                <div className="p-4 bg-black border border-white/10 rounded-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    {foundPreBooking.productImage && (
                      <div className="relative w-16 h-20 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-white/10">
                        <Image
                          src={foundPreBooking.productImage}
                          alt={foundPreBooking.productName}
                          fill
                          sizes="100px"
                          unoptimized={Boolean(foundPreBooking.productImage.startsWith('data:') || foundPreBooking.productImage.startsWith('blob:'))}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-1 font-mono text-xs">
                      <span className="font-bold text-white uppercase text-sm block">
                        {foundPreBooking.productName}
                      </span>
                      <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20 inline-block"
                          style={{ backgroundColor: foundPreBooking.colorHex || '#0a0a0a' }}
                        />
                        <span>{foundPreBooking.colorName}</span>
                        <span>•</span>
                        <span className="text-snake-green font-bold">SIZE {foundPreBooking.size}</span>
                        <span>•</span>
                        <span>QTY: {foundPreBooking.quantity}</span>
                      </div>
                      <div className="pt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="text-snake-green font-bold">
                          {formatPrice(foundPreBooking.totalPrice || foundPreBooking.productPrice * foundPreBooking.quantity)}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-snake-green/20 text-snake-green border border-snake-green/40">
                          ● PAID VIA RAZORPAY
                        </span>
                      </div>
                    </div>
                  </div>

                  {foundPreBooking.razorpayPaymentId && (
                    <div className="text-left sm:text-right font-mono text-xs space-y-0.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 w-full sm:w-auto">
                      <span className="text-[9px] text-neutral-500 uppercase block">GATEWAY PAYMENT ID</span>
                      <span className="text-white font-mono text-[11px] block truncate max-w-[200px]">
                        {foundPreBooking.razorpayPaymentId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Logistics & Priority Delivery Destination Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  {/* Carrier & Tracking */}
                  <div className="p-4 bg-black border border-white/10 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-snake-green">
                      <Truck size={14} />
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        AIR LOGISTICS DISPATCH
                      </span>
                    </div>
                    <div className="space-y-1 text-neutral-300">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">CARRIER:</span>
                        <span className="text-white font-semibold">
                          {foundPreBooking.carrierName || 'Air Express Courier'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">AIRBILL #:</span>
                        <span className="text-white font-mono">
                          {foundPreBooking.trackingNumber || 'Pending Atelier Dispatch'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">TARGET:</span>
                        <span className="text-snake-green font-semibold">{launchDateText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="p-4 bg-black border border-white/10 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-snake-green">
                      <MapPin size={14} />
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        DELIVERY COORDINATES
                      </span>
                    </div>
                    <div className="space-y-0.5 text-neutral-300 text-[11px]">
                      <p className="font-bold text-white">{foundPreBooking.customerName}</p>
                      <p>{foundPreBooking.streetAddress || 'Address on file'}</p>
                      {foundPreBooking.postOffice && (
                        <p className="text-neutral-400">Area: {foundPreBooking.postOffice}</p>
                      )}
                      <p>{foundPreBooking.city}, {foundPreBooking.state}</p>
                      <p className="text-snake-green font-bold">PIN: {foundPreBooking.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Concierge Support Footer */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                  <span className="text-neutral-400 text-center sm:text-left text-[11px]">
                    Need to modify address coordinates before launch dispatch?
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:concierge@supersnake.in?subject=Address%20Update%20Pre-Booking%20${foundPreBooking.bookingNumber || foundPreBooking.referenceCode}`}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-[10px] font-bold uppercase transition-colors border border-white/15 flex items-center gap-1.5"
                    >
                      <Mail size={11} />
                      <span>MAIL ATELIER</span>
                    </a>
                    <Link
                      href="/account/pre-bookings"
                      className="px-3 py-1.5 bg-snake-green/15 hover:bg-snake-green text-snake-green hover:text-black rounded text-[10px] font-bold uppercase transition-colors border border-snake-green/40 flex items-center gap-1.5 font-bold"
                    >
                      <span>MY RESERVATIONS</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                B: REGULAR ORDER SHIPMENT RADAR
                ======================================================== */}
            {foundType === 'ORDER' && foundOrder && (
              <div className="bg-[#0a0a0a] border border-white/10 p-5 md:p-8 rounded-lg space-y-6 shadow-xl animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
                      LIVE STATUS
                    </span>
                    <h3 className="text-xl font-display font-medium text-white">
                      ORDER {foundOrder.orderNumber}
                    </h3>
                    <p className="text-xs font-mono text-neutral-400">
                      Carrier: {foundOrder.tracking?.carrier || 'Express Courier'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-mono text-neutral-500 block uppercase">
                      ESTIMATED ARRIVAL
                    </span>
                    <span className="text-lg font-display font-medium text-snake-green">
                      {foundOrder.tracking?.estimatedDelivery || 'Within 4–7 Business Days'}
                    </span>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="space-y-3 py-2">
                  <div className="hidden sm:grid sm:grid-cols-6 gap-2">
                    {ORDER_STEPS.map((step, idx) => {
                      const currentIdx = ORDER_STEPS.indexOf(foundOrder.status);
                      const isPast = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;
                      return (
                        <div key={step} className="space-y-2 text-center">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              isPast ? 'bg-snake-green' : 'bg-white/10'
                            }`}
                          />
                          <span
                            className={`text-[9px] font-mono uppercase block ${
                              isCurrent
                                ? 'text-snake-green font-bold'
                                : isPast
                                ? 'text-white'
                                : 'text-neutral-600'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="sm:hidden space-y-4 py-2 pl-2">
                    {ORDER_STEPS.map((step, idx) => {
                      const currentIdx = ORDER_STEPS.indexOf(foundOrder.status);
                      const isPast = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;
                      const isLast = idx === ORDER_STEPS.length - 1;

                      return (
                        <div key={step} className="flex items-start gap-4 relative">
                          {!isLast && (
                            <div
                              className={`absolute left-[9px] top-4 bottom-[-16px] w-[2px] ${
                                currentIdx > idx ? 'bg-snake-green' : 'bg-white/10'
                              }`}
                            />
                          )}

                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                              isCurrent
                                ? 'bg-snake-green text-black ring-4 ring-snake-green/20'
                                : isPast
                                ? 'bg-snake-green text-black'
                                : 'bg-[#1a1a1a] border border-white/20 text-neutral-600'
                            }`}
                          >
                            {isPast ? (
                              <CheckCircle2 size={12} className="stroke-[3]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                            )}
                          </div>

                          <div className="flex-1 pb-1">
                            <p
                              className={`text-xs font-mono uppercase tracking-wider ${
                                isCurrent
                                  ? 'text-snake-green font-bold'
                                  : isPast
                                  ? 'text-white font-medium'
                                  : 'text-neutral-500'
                              }`}
                            >
                              {step}
                            </p>
                            {isCurrent && (
                              <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                                Current stage • Updated in real-time
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Waybill info */}
                <div className="p-4 bg-[#121212] border border-white/5 rounded-sm flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-neutral-400">Waybill / Airbill: </span>
                    <span className="text-white font-medium">
                      {foundOrder.tracking?.trackingNumber || 'Pending Courier Scan'}
                    </span>
                  </div>
                  <Link
                    href={`/account/orders/${foundOrder.id}`}
                    className="text-snake-green hover:underline text-[11px] uppercase"
                  >
                    FULL RECEIPT →
                  </Link>
                </div>
              </div>
            )}

            {/* ========================================================
                C: NO SHIPMENT LOCATED
                ======================================================== */}
            {foundType === null && (
              <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-lg text-center space-y-4 animate-in fade-in duration-300">
                <AlertCircle size={32} className="mx-auto text-neutral-500" />
                <h3 className="text-base font-display font-medium text-white uppercase">
                  NO ACTIVE SHIPMENT LOCATED
                </h3>
                <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto leading-relaxed">
                  We could not find an active reservation or order matching &quot;{referenceInput || identifierInput}&quot;. Please verify your booking reference code (e.g. SS-PB-2026-XXXX) or email address.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/account/pre-bookings"
                    className="px-5 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-wider font-semibold transition-colors rounded"
                  >
                    CHECK MY PRE-BOOKINGS
                  </Link>
                  <Link
                    href="/contact"
                    className="px-5 py-2.5 border border-white/20 hover:border-snake-green hover:text-snake-green text-white font-mono text-xs uppercase tracking-wider transition-colors rounded"
                  >
                    CONTACT ATELIER SUPPORT
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-snake-green border-t-transparent rounded-full animate-spin" />
            <span>INITIALIZING ATELIER RADAR...</span>
          </div>
        </div>
      }
    >
      <TrackOrderInner />
    </Suspense>
  );
}
