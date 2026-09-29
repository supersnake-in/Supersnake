'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Package,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/design-tokens';
import { PreBookingStatus } from '@/lib/types';

const STATUS_BADGES: Record<
  PreBookingStatus,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  CONFIRMED: {
    label: 'RESERVATION CONFIRMED',
    bg: 'bg-snake-green/15',
    text: 'text-snake-green',
    border: 'border-snake-green/40',
    desc: 'Your exclusive garment is secured. Concierge will contact you prior to official launch.',
  },
  CONTACTED: {
    label: 'CONCIERGE ENGAGED',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    desc: 'Atelier concierge has reviewed your reservation and sent allocation milestones.',
  },
  CONVERTED_TO_ORDER: {
    label: 'CONVERTED TO ORDER',
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    border: 'border-purple-500/40',
    desc: 'Dispatched or ready for fulfillment under regular order pipeline.',
  },
  CANCELLED: {
    label: 'CANCELLED',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/40',
    desc: 'This pre-booking reservation was cancelled.',
  },
};

export default function CustomerPreBookingsPage() {
  const { preBookings, storefrontConfig } = useStore();
  const { user, profile } = useAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Match customer bookings by authenticated email or phone, or show localStorage stored ones
  const userBookings = useMemo(() => {
    const userEmail = (user?.email || profile?.email || '').toLowerCase().trim();
    const userPhone = (profile?.phone || '').replace(/[^0-9]/g, '');

    if (!userEmail && !userPhone) {
      // If guest, show all in store for this session or return preBookings
      return preBookings;
    }

    return preBookings.filter((b) => {
      const bEmail = b.customerEmail.toLowerCase().trim();
      const bPhone = b.customerPhone.replace(/[^0-9]/g, '');
      return (userEmail && bEmail === userEmail) || (userPhone && bPhone === userPhone);
    });
  }, [preBookings, user?.email, profile?.email, profile?.phone]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isPreLaunch = storefrontConfig?.storefrontMode === 'PRE_LAUNCH';

  return (
    <div className="space-y-8 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-snake-green/5 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] text-snake-green rounded font-semibold">
            <Sparkles size={12} />
            <span>EXCLUSIVE DROP RESERVATIONS</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight uppercase">
            MY PRE-BOOKINGS
          </h2>
          <p className="text-neutral-400 max-w-xl leading-relaxed text-xs">
            Review your secured pieces from the SuperSnake First Drop. Zero advance payment was required.
            When the collection officially drops, you receive priority air dispatch.
          </p>
        </div>
      </div>

      {/* Official Drop Intel Strip */}
      {storefrontConfig?.launchDate && (
        <div className="p-4 bg-snake-green/5 border border-snake-green/30 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Clock size={16} className="text-snake-green flex-shrink-0" />
            <div>
              <span className="text-white font-bold uppercase tracking-wider block">
                OFFICIAL DROP DATE: {storefrontConfig.launchDate} • {storefrontConfig.launchTime || '10:00 AM'}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                All pre-booked pieces are guaranteed studio allocation on launch day.
              </span>
            </div>
          </div>

          <Link
            href="/#countdown"
            className="px-3.5 py-1.5 bg-black border border-white/20 hover:border-snake-green text-snake-green hover:text-white rounded uppercase text-[10px] tracking-wider font-bold transition-all self-start sm:self-auto"
          >
            VIEW COUNTDOWN
          </Link>
        </div>
      )}

      {/* Pre-Bookings List */}
      {userBookings.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/10 p-12 text-center rounded-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-500">
            <Calendar size={22} className="text-snake-green" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-display font-bold uppercase text-white tracking-tight">
              NO PRE-BOOKINGS ON RECORD
            </h3>
            <p className="text-neutral-400 max-w-md mx-auto leading-relaxed text-xs">
              You haven&apos;t reserved any garments from our upcoming drop yet. Explore the limited First Drop pieces open for pre-booking.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/#pre-book-grid"
              className="inline-flex items-center gap-2 px-6 py-3 bg-snake-green hover:bg-white text-black font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(4,252,33,0.25)]"
            >
              <span>EXPLORE THE FIRST DROP</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {userBookings.map((b) => {
            const badge = STATUS_BADGES[b.status] || STATUS_BADGES.CONFIRMED;
            return (
              <div
                key={b.id}
                className="bg-[#0a0a0a] border border-white/10 rounded-sm p-5 md:p-6 space-y-5 hover:border-white/20 transition-all relative overflow-hidden"
              >
                {/* Top Status & Reference Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                      REFERENCE CODE:
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-white tracking-widest text-sm bg-white/5 px-2.5 py-1 rounded border border-white/10">
                      <span>{b.referenceCode}</span>
                      <button
                        onClick={() => handleCopy(b.referenceCode)}
                        className="text-neutral-400 hover:text-snake-green transition-colors"
                        title="Copy Reference"
                      >
                        {copiedCode === b.referenceCode ? (
                          <Check size={12} className="text-snake-green" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Garment Details & Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Product Details (8 cols) */}
                  <div className="md:col-span-8 flex items-start gap-4">
                    {b.productImage ? (
                      <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-white/10">
                        <Image
                          src={b.productImage}
                          alt={b.productName}
                          fill
                          sizes="120px"
                          unoptimized={Boolean(b.productImage.startsWith('data:') || b.productImage.startsWith('blob:'))}
                          className="object-cover"
                        />
                      </div>
                    ) : null}

                    <div className="space-y-1.5">
                      <span className="text-[9px] text-snake-green uppercase tracking-widest font-bold block">
                        FIRST DROP // RESERVATION
                      </span>
                      <h4 className="text-base sm:text-lg font-display font-bold uppercase text-white tracking-tight">
                        {b.productName}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 text-neutral-300 text-xs pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/30"
                            style={{ backgroundColor: b.colorHex }}
                          />
                          <span>{b.colorName}</span>
                        </span>
                        <span>•</span>
                        <span className="text-snake-green font-bold">SIZE: {b.size}</span>
                        <span>•</span>
                        <span>QTY: {b.quantity}</span>
                      </div>

                      <div className="text-xs font-bold text-white pt-1 flex flex-wrap items-center gap-2">
                        <span>AMOUNT: {formatPrice(b.totalPrice || b.productPrice * b.quantity)}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                            b.paymentStatus === 'Paid'
                              ? 'bg-snake-green/20 text-snake-green border border-snake-green/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {b.paymentStatus === 'Paid' ? '● PAID ONLINE' : '● PAY ON DELIVERY'}
                        </span>
                      </div>
                      {b.razorpayPaymentId && (
                        <div className="text-[10px] text-neutral-500 font-mono">
                          TXN REF: {b.razorpayPaymentId}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Destination (4 cols) */}
                  <div className="md:col-span-4 p-4 bg-black/60 border border-white/5 rounded space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-neutral-400 font-semibold uppercase text-[10px]">
                      <MapPin size={12} className="text-snake-green" />
                      <span>PRIORITY DISPATCH DESTINATION</span>
                    </div>
                    <p className="font-bold text-white">{b.customerName}</p>
                    <p className="text-neutral-400 truncate">{b.city}, {b.state}</p>
                    <p className="text-neutral-500 text-[10px]">PIN: {b.pincode}</p>
                  </div>
                </div>

                {/* Status Guidance & Support */}
                <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-neutral-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-snake-green flex-shrink-0" />
                    <span>{badge.desc}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/product/${b.productSlug}`}
                      className="text-neutral-300 hover:text-white uppercase font-bold flex items-center gap-1 transition-colors text-[10px]"
                    >
                      <span>VIEW PIECE</span>
                      <ExternalLink size={11} />
                    </Link>

                    <a
                      href={`mailto:concierge@supersnake.in?subject=Pre-Booking%20Inquiry%20${b.referenceCode}`}
                      className="text-snake-green hover:underline uppercase font-bold text-[10px]"
                    >
                      CONTACT CONCIERGE →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
