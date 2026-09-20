'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  RotateCcw,
  HelpCircle,
  Package,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';
import { OrderStatus } from '@/lib/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrderById } = useStore();
  const orderId = params?.orderId as string;
  const order = getOrderById(orderId);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Manufacturing defect or seam flaw');
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  if (!order) {
    return (
      <div className="bg-[#0a0a0a] border border-white/10 p-12 text-center space-y-4 rounded-sm">
        <Package size={32} className="mx-auto text-neutral-600" />
        <h2 className="text-xl font-display font-medium text-white">ORDER NOT FOUND</h2>
        <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
          The requested order ({orderId}) does not exist or has been removed from this profile.
        </p>
        <Link
          href="/account/orders"
          className="inline-block mt-4 px-6 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-widest font-semibold hover:bg-snake-green transition-colors"
        >
          BACK TO ALL ORDERS
        </Link>
      </div>
    );
  }

  const statusSteps: OrderStatus[] = [
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const currentStepIndex = statusSteps.indexOf(order.status);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReturnSubmitted(true);
    setTimeout(() => {
      setReturnModalOpen(false);
      setReturnSubmitted(false);
    }, 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO ORDERS</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-[#121212] hover:bg-white hover:text-black border border-white/10 text-white rounded text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <Printer size={13} />
            <span>PRINT INVOICE</span>
          </button>
          <button
            onClick={() => setReturnModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#121212] hover:border-snake-green hover:text-snake-green border border-white/10 text-neutral-300 rounded text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <AlertCircle size={13} />
            <span>REPORT DEFECT</span>
          </button>
        </div>
      </div>

      {/* Order Header Summary */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
              ORDER SPECIFICATION
            </span>
            <h1 className="text-2xl font-display font-medium text-white">
              {order.orderNumber}
            </h1>
            <p className="text-xs font-mono text-neutral-400">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">TOTAL AMOUNT</span>
            <span className="text-2xl font-display font-medium text-white">
              {formatPrice(order.total)}
            </span>
            <span className="text-[10px] font-mono text-neutral-500 block">
              via {order.payment.method.toUpperCase()} ({order.payment.status.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">
            FULFILLMENT PIPELINE
          </span>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {statusSteps.map((step, idx) => {
              const isPast = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={step} className="space-y-2 text-center">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isPast
                        ? 'bg-snake-green shadow-[0_0_8px_rgba(4,252,33,0.5)]'
                        : 'bg-white/10'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono uppercase block ${
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
        </div>
      </div>

      {/* Tracking Card */}
      {order.tracking && (
        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-4">
          <div className="flex items-center gap-3">
            <Truck size={20} className="text-snake-green" />
            <div>
              <h3 className="text-sm font-display font-medium text-white">
                EXPRESS SHIPMENT VIA {order.tracking.carrier.toUpperCase()}
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Waybill #{order.tracking.trackingNumber} • Est. Delivery: {order.tracking.estimatedDelivery}
              </p>
            </div>
          </div>

          {order.tracking.updates && order.tracking.updates.length > 0 && (
            <div className="pl-6 border-l border-white/10 space-y-3 pt-2">
              {order.tracking.updates.map((update, i) => (
                <div key={i} className="text-xs font-mono space-y-0.5">
                  <p className="text-white font-medium">{update.status}</p>
                  <p className="text-[10px] text-neutral-500">
                    {update.location} • {update.timestamp}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items & Financial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-4">
          <h3 className="text-sm font-display font-medium text-white border-b border-white/10 pb-3 uppercase tracking-wider">
            GARMENTS IN SHIPMENT ({order.items.length})
          </h3>
          <div className="divide-y divide-white/5">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-20 bg-neutral-900 border border-white/10 shrink-0 overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-medium text-white">
                      {item.productName}
                    </h4>
                    <p className="text-xs font-mono text-neutral-400 mt-1">
                      Color: {item.color} | Size: {item.size}
                    </p>
                    <p className="text-[11px] font-mono text-neutral-500">
                      Quantity: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono text-sm text-white">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address & Payment Info */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider">
              <MapPin size={14} className="text-snake-green" />
              <span>DELIVERY DESTINATION</span>
            </div>
            <div className="text-xs font-mono text-neutral-300 space-y-1">
              <p className="text-white font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              {order.shippingAddress.landmark && <p>{order.shippingAddress.landmark}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
              <p className="text-neutral-500 pt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-neutral-400 uppercase tracking-wider pb-2 border-b border-white/10">
              <CreditCard size={14} className="text-snake-green" />
              <span>BILLING LEDGER</span>
            </div>
            <div className="space-y-2 text-neutral-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-snake-green">
                  <span>Voucher Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Courier</span>
                <span className="text-white">
                  {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Integrated GST (12%)</span>
                <span className="text-white">{formatPrice(order.tax)}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-semibold text-white">
                <span>Total Paid</span>
                <span className="text-white">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Help button */}
          <div className="p-4 bg-[#121212] border border-white/5 rounded-sm flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-neutral-400">
              <HelpCircle size={14} />
              <span>Need help with this order?</span>
            </div>
            <Link
              href={`/contact?order=${order.orderNumber}`}
              className="text-snake-green hover:underline uppercase text-[11px]"
            >
              CONCIERGE →
            </Link>
          </div>
        </div>
      </div>

      {/* Defect / Damage Report Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/15 p-6 md:p-8 rounded-sm max-w-md w-full space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
                DEFECT RESOLUTION PROTOCOL
              </span>
              <h3 className="text-lg font-display font-medium text-white">
                REPORT DEFECT OR DAMAGE
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Order {order.orderNumber}
              </p>
            </div>

            {returnSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 size={32} className="text-snake-green mx-auto" />
                <p className="text-sm font-display text-white">CLAIM REGISTERED</p>
                <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                  Our concierge team will review your report and reach out within 48 hours to coordinate inspection, replacement, or resolution.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    Nature of Defect / Issue
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-[#121212] border border-white/15 px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                  >
                    <option value="Manufacturing defect or seam flaw">Manufacturing defect or seam flaw</option>
                    <option value="Transit damage or package breach">Transit damage / packaging breach</option>
                    <option value="Incorrect garment or size delivered">Incorrect item or size delivered</option>
                    <option value="Fabric irregularity">Significant fabric irregularity</option>
                    <option value="Other quality concern">Other quality concern</option>
                  </select>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/10 rounded text-[11px] font-mono text-neutral-400 space-y-1.5 leading-relaxed">
                  <p>
                    SuperSnake operates a strict defect-only resolution policy. Ordinary returns for change of mind or sizing are not supported.
                  </p>
                  <p className="text-neutral-500">
                    Claims require photographic evidence sent to our concierge team. Please consult our{' '}
                    <Link href="/returns" className="text-snake-green hover:underline" target="_blank">
                      Returns &amp; Defects Policy
                    </Link>.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReturnModalOpen(false)}
                    className="w-1/2 py-2.5 border border-white/20 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-snake-green hover:bg-white text-black font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    SUBMIT CLAIM
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
