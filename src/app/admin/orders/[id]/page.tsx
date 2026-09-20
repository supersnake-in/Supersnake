'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Truck, Package, Check, Printer, Clock, MapPin, Mail, Phone, CreditCard } from 'lucide-react';
import { useStore } from '@/lib/store';
import { OrderStatus } from '@/lib/types';
import { formatPrice } from '@/lib/design-tokens';

const STATUS_OPTIONS: OrderStatus[] = [
  'Payment Pending',
  'Payment Failed',
  'Paid',
  'Verification Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
  'Refunded',
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const { orders } = useStore();

  const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  const [status, setStatus] = useState<OrderStatus>(order?.status || 'Confirmed');
  const [carrier, setCarrier] = useState(order?.tracking?.carrier || 'Express Courier');
  const [waybill, setWaybill] = useState(order?.tracking?.trackingNumber || '');
  const [phoneVerified, setPhoneVerified] = useState<boolean>(Boolean(order?.phoneVerified));
  const [verificationStatus, setVerificationStatus] = useState<'Pending' | 'Verified' | 'Unverified' | 'Unreachable'>(
    order?.verificationStatus || 'Pending'
  );
  const [verificationNotes, setVerificationNotes] = useState<string>(order?.verificationNotes || '');
  const [saved, setSaved] = useState(false);

  if (!order) {
    return (
      <div className="space-y-4 text-center py-20 font-sans">
        <h2 className="text-xl font-display font-medium text-white">ORDER NOT FOUND</h2>
        <p className="text-xs font-mono text-neutral-400">ID: {orderId}</p>
        <Link
          href="/admin/orders"
          className="inline-block px-6 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-wider font-semibold"
        >
          BACK TO ORDERS
        </Link>
      </div>
    );
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (order.tracking) {
      order.tracking.carrier = carrier;
      order.tracking.trackingNumber = waybill;
    }
    order.status = status;
    order.verificationNotes = verificationNotes;
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleVerifyPhone = (newVerifStatus: 'Verified' | 'Unverified' | 'Unreachable') => {
    setPhoneVerified(newVerifStatus === 'Verified');
    setVerificationStatus(newVerifStatus);
    order.phoneVerified = newVerifStatus === 'Verified';
    order.verificationStatus = newVerifStatus;
    order.verifiedAt = new Date().toISOString();
    order.verifiedBy = 'Admin Staff';
    order.verificationNotes = verificationNotes;
    if (newVerifStatus === 'Verified' && order.status === 'Verification Pending') {
      order.status = 'Confirmed';
      setStatus('Confirmed');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO ORDERS</span>
        </Link>

        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 bg-[#121212] hover:bg-white hover:text-black border border-white/10 text-white rounded text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
        >
          <Printer size={13} />
          <span>PRINT INVOICE</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
            FULFILLMENT RECORD
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-medium uppercase text-white">
            {order.orderNumber}
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            Placed {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block">SETTLED TOTAL</span>
          <span className="text-2xl font-display font-medium text-snake-green">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
          <Check size={16} />
          <span>Order fulfillment status & tracking updated.</span>
        </div>
      )}

      {/* Post-Order Phone Verification Card */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase block">
              STORE / CLIENT CONCIERGE PROTOCOL
            </span>
            <h3 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              POST-ORDER PHONE VERIFICATION (CALL VERIFICATION)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-[10px] font-mono uppercase font-bold rounded border ${
                phoneVerified
                  ? 'bg-snake-green/10 border-snake-green/40 text-snake-green'
                  : verificationStatus === 'Unreachable'
                  ? 'bg-orange-950/40 border-orange-800/40 text-orange-400'
                  : verificationStatus === 'Unverified'
                  ? 'bg-red-950/40 border-red-800/40 text-red-400'
                  : 'bg-amber-950/40 border-amber-800/40 text-amber-400'
              }`}
            >
              {phoneVerified
                ? 'PHONE VERIFIED'
                : verificationStatus === 'Unreachable'
                ? 'CALL UNREACHABLE'
                : verificationStatus === 'Unverified'
                ? 'CALL FAILED / INVALID'
                : 'VERIFICATION PENDING'}
            </span>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="p-3.5 bg-neutral-950 border border-neutral-800 text-xs font-mono rounded space-y-1">
          <p className="text-snake-green font-bold uppercase flex items-center gap-1.5">
            <span>🛡️</span> CRITICAL SECURITY DIRECTIVE
          </p>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            The customer must <strong>NEVER</strong> be asked for OTPs, PINs, CVVs, passwords, or bank details during the verification phone call. This call is strictly to confirm the delivery address and garment sizing prior to dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start text-xs font-mono">
          <div className="p-4 bg-neutral-950 border border-white/5 rounded space-y-1.5">
            <span className="text-[10px] text-neutral-500 uppercase block">PATRON PHONE NUMBER</span>
            <a
              href={`tel:${order.customer.phone}`}
              className="text-base font-bold text-white hover:text-snake-green transition-colors flex items-center gap-2 font-mono"
            >
              <Phone size={14} className="text-snake-green" />
              {order.customer.phone || 'No phone provided'}
            </a>
            <p className="text-[10px] text-neutral-500">Click number to initiate phone call from device.</p>
          </div>

          <div className="p-4 bg-neutral-950 border border-white/5 rounded space-y-1.5">
            <span className="text-[10px] text-neutral-500 uppercase block">VERIFICATION AUDIT</span>
            {order.verifiedAt ? (
              <div className="space-y-1 text-neutral-300 text-[11px]">
                <p>Status: <strong className="text-white">{order.verificationStatus}</strong></p>
                <p>Verified By: <strong className="text-white">{order.verifiedBy || 'Admin Staff'}</strong></p>
                <p>Time: <span className="text-neutral-400">{new Date(order.verifiedAt).toLocaleString('en-IN')}</span></p>
              </div>
            ) : (
              <p className="text-neutral-400 text-[11px]">No call verification record logged yet.</p>
            )}
          </div>

          <div className="p-4 bg-neutral-950 border border-white/5 rounded space-y-2">
            <span className="text-[10px] text-neutral-500 uppercase block">ACTIONS</span>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleVerifyPhone('Verified')}
                className="w-full py-2 bg-snake-green hover:bg-white text-black font-mono text-xs uppercase font-bold tracking-wider rounded transition-colors"
              >
                MARK AS PHONE VERIFIED
              </button>
              <button
                type="button"
                onClick={() => handleVerifyPhone('Unreachable')}
                className="w-full py-2 bg-neutral-900 hover:bg-orange-950 text-neutral-300 hover:text-orange-400 border border-white/10 hover:border-orange-800 font-mono text-xs uppercase font-bold tracking-wider rounded transition-colors"
              >
                FLAG AS UNREACHABLE
              </button>
              <button
                type="button"
                onClick={() => handleVerifyPhone('Unverified')}
                className="w-full py-2 bg-neutral-900 hover:bg-red-950 text-neutral-300 hover:text-red-400 border border-white/10 hover:border-red-800 font-mono text-xs uppercase font-bold tracking-wider rounded transition-colors"
              >
                FLAG UNVERIFIED / FAILED
              </button>
            </div>
          </div>
        </div>

        {/* Verification Notes */}
        <div className="space-y-1.5 text-xs font-mono">
          <label className="text-neutral-400 uppercase flex items-center justify-between">
            <span>VERIFICATION CALL NOTES</span>
            <span className="text-[10px] text-neutral-500">e.g. &quot;Customer confirmed size L and delivery landmark&quot;</span>
          </label>
          <textarea
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            rows={2}
            placeholder="Add internal notes from the customer verification call..."
            className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white rounded focus:outline-none focus:border-snake-green"
          />
        </div>
      </div>

      {/* Dispatch Controls Card */}
      <form onSubmit={handleUpdate} className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-6">
        <h3 className="text-xs font-mono text-snake-green uppercase tracking-wider border-b border-white/5 pb-2">
          DISPATCH & LOGISTICS CONTROL
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
              Pipeline Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
              Courier Carrier
            </label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
              Waybill / Tracking No.
            </label>
            <input
              type="text"
              value={waybill}
              onChange={(e) => setWaybill(e.target.value)}
              placeholder="e.g. BD-883910291"
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            UPDATE DISPATCH
          </button>
        </div>
      </form>

      {/* Two Column Layout: Customer & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Items */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-4">
          <h3 className="text-sm font-display font-medium text-white border-b border-white/10 pb-3 uppercase tracking-wider">
            GARMENTS ({order.items.length})
          </h3>
          <div className="divide-y divide-white/5">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-18 bg-neutral-900 border border-white/10 shrink-0 overflow-hidden">
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
                      {item.color} • SIZE {item.size} • QTY {item.quantity}
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

        {/* Customer & Address */}
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider border-b border-white/10 pb-2">
              PATRON PROFILE
            </h3>
            <div className="space-y-1.5 text-xs font-mono">
              <p className="text-white font-medium text-sm font-display">{order.customer.name}</p>
              <p className="text-neutral-400 flex items-center gap-2">
                <Mail size={13} /> {order.customer.email}
              </p>
              <p className="text-neutral-400 flex items-center gap-2">
                <Phone size={13} /> {order.customer.phone}
              </p>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
            <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider border-b border-white/10 pb-2">
              SHIPPING DESTINATION
            </h3>
            <div className="text-xs font-mono text-neutral-300 space-y-1">
              <p className="text-white font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              {order.shippingAddress.landmark && <p>{order.shippingAddress.landmark}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
