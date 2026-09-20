'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Package, Truck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('razorpay_payment_id');
  const { getOrderById, updateOrder, clearCart } = useStore();

  const order = orderId ? getOrderById(orderId) : null;

  React.useEffect(() => {
    clearCart();

    if (orderId && paymentId && order && order.payment?.status !== 'paid') {
      updateOrder(orderId, {
        status: 'Confirmed',
        payment: {
          ...order.payment,
          status: 'paid',
          transactionId: paymentId,
          paidAt: new Date().toISOString(),
        },
      });
    }
  }, [orderId, paymentId, order, updateOrder, clearCart]);

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-10">
        {/* Celebration Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-snake-green/10 border border-snake-green/30 text-snake-green mb-2">
            <CheckCircle2 size={32} />
          </div>
          <span className="block text-[10px] font-mono tracking-mega text-snake-green uppercase">
            ATELIER ORDER CONFIRMED
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tight text-white">
            WEAR YOUR INSTINCT.
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-400">
            Thank you for your acquisition. Your garments have entered tailoring and preparation at our Bengaluru studio.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#0c0c0c] border border-white/10 rounded-lg p-6 sm:p-8 space-y-6 text-xs font-mono">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <span className="text-neutral-500 uppercase block text-[10px]">ORDER NUMBER</span>
              <span className="text-white font-bold text-sm tracking-wider">
                {order ? order.orderNumber : (orderId || 'PENDING')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 uppercase block text-[10px]">ESTIMATED ARRIVAL</span>
              <span className="text-snake-green font-semibold">
                {order?.tracking?.estimatedDelivery || 'Within 2–4 Business Days'}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3 py-2">
            <p className="text-[10px] tracking-widest text-neutral-400 uppercase">LOGISTICS STATUS</p>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-3 bg-neutral-900 border border-snake-green/40 rounded text-snake-green space-y-1">
                <CheckCircle2 size={16} className="mx-auto" />
                <p className="font-bold">CONFIRMED</p>
              </div>
              <div className="p-3 bg-neutral-900 border border-white/10 rounded text-neutral-400 space-y-1">
                <Package size={16} className="mx-auto text-neutral-500" />
                <p>PROCESSING</p>
              </div>
              <div className="p-3 bg-neutral-900 border border-white/10 rounded text-neutral-400 space-y-1">
                <Truck size={16} className="mx-auto text-neutral-500" />
                <p>AIR EXPRESS</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order && (
            <div className="pt-4 border-t border-white/10 space-y-1">
              <span className="text-[10px] tracking-widest text-neutral-500 uppercase">DISPATCHING TO</span>
              <p className="text-white font-semibold">{order.shippingAddress.fullName}</p>
              <p className="text-neutral-400">
                {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/account"
            className="flex-1 py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white transition-colors text-center flex items-center justify-center gap-2"
          >
            VIEW ORDER IN ACCOUNT <ArrowRight size={14} />
          </Link>
          <Link
            href="/shop"
            className="py-4 px-8 border border-white/20 text-neutral-300 font-mono text-xs tracking-widest uppercase hover:border-white hover:text-white transition-colors text-center"
          >
            CONTINUE BROWSING
          </Link>
        </div>

        {/* Customer Care Directives */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-neutral-500">
          <Link href="/shipping" className="hover:text-white transition-colors">
            Shipping &amp; Delivery
          </Link>
          <span>•</span>
          <Link href="/returns" className="hover:text-white transition-colors">
            Returns &amp; Defects
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-black text-white min-h-screen pt-32 text-center font-mono text-xs text-neutral-500">
          LOADING CONFIRMATION...
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
