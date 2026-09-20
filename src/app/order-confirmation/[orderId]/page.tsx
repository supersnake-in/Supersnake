'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Package, Truck, Printer } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';
import OrderInvoice from '@/components/invoice/OrderInvoice';

export default function DynamicOrderConfirmationPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { getOrderById } = useStore();
  const order = getOrderById(orderId);

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <>
      <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col items-center font-sans screen-only print:hidden">
      <div className="max-w-2xl w-full space-y-10">
        {/* Celebration Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-snake-green/10 border border-snake-green/30 text-snake-green mb-2 animate-pulse">
            <CheckCircle2 size={36} />
          </div>
          <span className="block text-[10px] font-mono tracking-widest text-snake-green uppercase">
            ATELIER ORDER CONFIRMED
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            WEAR YOUR INSTINCT.
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-400">
            Thank you for your acquisition. Your order has entered tailoring and preparation at our Bengaluru studio.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 space-y-6 text-xs font-mono rounded-sm">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <span className="text-neutral-500 uppercase block text-[10px]">ORDER NUMBER</span>
              <span className="text-white font-semibold text-sm tracking-wider">
                {order ? order.orderNumber : orderId}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 uppercase block text-[10px]">ESTIMATED ARRIVAL</span>
              <span className="text-snake-green font-semibold">
                {order?.tracking?.estimatedDelivery || 'Within 4–7 Business Days'}
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

          {order && (
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-neutral-400">TOTAL AMOUNT</span>
              <span className="text-sm font-semibold text-white">
                {formatPrice(order.total)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Link
            href={`/account/orders/${orderId}`}
            className="flex-1 py-4 bg-snake-green hover:bg-white text-black font-mono text-xs tracking-widest font-semibold uppercase transition-colors text-center flex items-center justify-center gap-2"
          >
            VIEW ORDER IN ACCOUNT <ArrowRight size={14} />
          </Link>
          <button
            onClick={handlePrint}
            className="py-4 px-6 border border-white/20 text-neutral-300 font-mono text-xs tracking-widest uppercase hover:border-white hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={14} />
            <span>PRINT RECEIPT</span>
          </button>
        </div>
      </div>
    </div>

    {/* Print-only Dedicated Minimal A4 Invoice */}
    {order && (
      <div id="supersnake-invoice" className="hidden print:block">
        <OrderInvoice order={order} />
      </div>
    )}
  </>
  );
}
