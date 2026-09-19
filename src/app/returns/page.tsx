'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RotateCcw, CheckCircle2, ShieldCheck, Truck, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';

function ReturnsContent() {
  const searchParams = useSearchParams();
  const prefilledOrderId = searchParams.get('orderId') || '';
  const { orders } = useStore();

  const [orderNumber, setOrderNumber] = useState(prefilledOrderId);
  const [email, setEmail] = useState('');
  const [returnType, setReturnType] = useState<'exchange' | 'refund'>('exchange');
  const [reason, setReason] = useState('Size too large — exchange for smaller size');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNum = orderNumber.trim().toLowerCase();
    const matched = orders.find(
      (o) => o.orderNumber.toLowerCase() === cleanNum || o.id.toLowerCase() === cleanNum
    );

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
            PATRON ASSURANCE
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            RETURNS & EXCHANGES
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-400">
            We honor a 7-day complimentary return or size exchange window on all unworn pieces.
          </p>
        </div>

        {/* 4-Step Process */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <span className="text-xs font-mono text-snake-green">STEP 01</span>
            <h3 className="text-sm font-display font-medium text-white">SUBMIT REQUEST</h3>
            <p className="text-xs font-mono text-neutral-400">
              Enter your order number below to initiate a return or request an alternate size.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <span className="text-xs font-mono text-snake-green">STEP 02</span>
            <h3 className="text-sm font-display font-medium text-white">DOORSTEP PICKUP</h3>
            <p className="text-xs font-mono text-neutral-400">
              Blue Dart courier will arrive with return packaging within 24–48 hours.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <span className="text-xs font-mono text-snake-green">STEP 03</span>
            <h3 className="text-sm font-display font-medium text-white">INSPECTION</h3>
            <p className="text-xs font-mono text-neutral-400">
              Our atelier confirms original tags, unwashed status, and lack of wear.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <span className="text-xs font-mono text-snake-green">STEP 04</span>
            <h3 className="text-sm font-display font-medium text-white">SETTLEMENT</h3>
            <p className="text-xs font-mono text-neutral-400">
              Replacement dispatched immediately or refund issued to your source account.
            </p>
          </div>
        </div>

        {/* Interactive Return Request Form */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm">
          <div className="border-b border-white/10 pb-4 mb-6">
            <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
              SELF-SERVICE PORTAL
            </span>
            <h2 className="text-xl font-display font-medium text-white">
              REGISTER A RETURN OR EXCHANGE
            </h2>
          </div>

          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 size={40} className="text-snake-green mx-auto animate-pulse" />
              <h3 className="text-xl font-display font-medium text-white">
                RETURN REQUEST CONFIRMED
              </h3>
              <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto leading-relaxed">
                Your request for order <span className="text-white">{orderNumber}</span> has been logged with our Bengaluru logistics desk. A reverse pickup waybill has been scheduled with Blue Dart.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono uppercase tracking-wider rounded"
                >
                  START ANOTHER REQUEST
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    Order Number
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                    placeholder="e.g. SS-2026-1049"
                    className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    Email or Phone
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="patron@supersnake.in"
                    className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                  Resolution Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReturnType('exchange')}
                    className={`py-3 px-4 rounded-sm border text-xs font-mono uppercase tracking-wider text-center transition-all ${
                      returnType === 'exchange'
                        ? 'bg-neutral-900 border-snake-green text-snake-green font-bold'
                        : 'bg-[#121212] border-white/10 text-neutral-400 hover:border-white/30'
                    }`}
                  >
                    EXCHANGE FOR ANOTHER SIZE
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnType('refund')}
                    className={`py-3 px-4 rounded-sm border text-xs font-mono uppercase tracking-wider text-center transition-all ${
                      returnType === 'refund'
                        ? 'bg-neutral-900 border-snake-green text-snake-green font-bold'
                        : 'bg-[#121212] border-white/10 text-neutral-400 hover:border-white/30'
                    }`}
                  >
                    FULL REFUND TO SOURCE
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                  Primary Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                >
                  <option value="Size too large — exchange for smaller size">Size too large — request smaller size</option>
                  <option value="Size too small — exchange for larger size">Size too small — request larger size</option>
                  <option value="Fabric nuance differing from expectation">Fabric nuance differing from expectation</option>
                  <option value="Ordered multiple sizes for fitting">Ordered multiple sizes for fitting</option>
                  <option value="Manufacturing defect or stitch anomaly">Manufacturing defect or stitch anomaly</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'PROCESSING DISPATCH...'
                  ) : (
                    <>
                      <span>CONFIRM REVERSE PICKUP</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Condition Check */}
        <div className="border-t border-white/10 pt-8 text-xs font-mono text-neutral-500 space-y-2">
          <p className="text-white font-medium uppercase tracking-wider">RETURN CONDITIONS</p>
          <p>
            • Garments must be in original condition: unworn, unwashed, and odor-free.
          </p>
          <p>
            • All brand hangtags and protective satin labels must remain attached.
          </p>
          <p>
            • Items marked as Final Archive Drop are eligible for size exchange only.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReturnsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ReturnsContent />
    </Suspense>
  );
}
