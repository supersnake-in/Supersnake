'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Order } from '@/lib/types';
import { formatPrice, BRAND } from '@/lib/design-tokens';

interface OrderInvoiceProps {
  order: Order;
  className?: string;
}

export default function OrderInvoice({ order, className = '' }: OrderInvoiceProps) {
  const [storeSettings, setStoreSettings] = useState<{
    storeName?: string;
    legalBusinessName?: string;
    supportEmail?: string;
    studioLocation?: string;
  }>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('supersnake_settings');
      if (saved) {
        setStoreSettings(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  if (!order) return null;

  // Format Invoice Number systematically
  const invoiceNumber = order.orderNumber
    ? order.orderNumber.startsWith('SS-')
      ? order.orderNumber.replace(/^SS-/, 'SS-INV-')
      : `SS-INV-${order.orderNumber}`
    : 'SS-INV-2026-0001';

  // Format Invoice Date
  const invoiceDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  // Calculate subtotal if not present
  const itemsSubtotal =
    order.subtotal && order.subtotal > 0
      ? order.subtotal
      : (order.items || []).reduce(
          (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
          0
        );

  const customerName =
    order.customer?.name || order.shippingAddress?.fullName || 'Valued Patron';
  const customerEmail = order.customer?.email || '';
  const customerPhone =
    order.customer?.phone || order.shippingAddress?.phone || '';

  // Actual configured business information with graceful fallbacks
  const sellerLegalName =
    storeSettings.legalBusinessName || BRAND.legalName || 'SuperSnake Apparel India Pvt Ltd';
  const sellerLocation =
    storeSettings.studioLocation || 'Bengaluru, Karnataka 560094, India';
  const sellerEmail =
    storeSettings.supportEmail || BRAND.contact.support || 'support@supersnake.in';

  return (
    <div
      className={`bg-white text-black font-sans antialiased text-[13px] leading-relaxed select-text print:w-full print:max-w-none print:m-0 print:p-0 ${className}`}
      style={{
        width: '100%',
        maxWidth: '210mm',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <div className="p-8 sm:p-12 print:p-0 space-y-6 sm:space-y-8 print:space-y-5">
        {/* TWO-COLUMN HEADER: Brand & Seller Left, INVOICE + Meta Right */}
        <header className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start border-b border-neutral-900/15 pb-6">
          {/* Left Column: SuperSnake Branding & Seller Information */}
          <div className="space-y-3 font-sans">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 shrink-0">
                <Image
                  src="/logo.png"
                  alt="SuperSnake"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-wider text-black block leading-none">
                  {BRAND.name}
                </span>
                <span className="text-[9px] font-mono tracking-[0.25em] text-neutral-500 uppercase block mt-0.5">
                  {BRAND.tagline}
                </span>
              </div>
            </div>

            <div className="text-xs text-neutral-700 font-sans space-y-0.5 pt-1">
              <p className="font-semibold text-black">{sellerLegalName}</p>
              <p className="whitespace-pre-line text-neutral-600">{sellerLocation}</p>
              <p className="text-neutral-500 pt-0.5">
                {sellerEmail} · supersnake.in
              </p>
            </div>
          </div>

          {/* Right Column: Elegant INVOICE Title & Compact Metadata Block */}
          <div className="text-left sm:text-right space-y-2">
            <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-black leading-none uppercase">
              INVOICE
            </h1>

            <div className="pt-1 font-mono text-[11px] text-neutral-600 space-y-1 inline-block text-left sm:text-right">
              <p>
                <span className="text-neutral-400 uppercase">Invoice No.</span>{' '}
                <span className="text-black font-semibold">{invoiceNumber}</span>
              </p>
              <p>
                <span className="text-neutral-400 uppercase">Invoice Date:</span>{' '}
                <span className="text-black font-medium">{invoiceDate}</span>
              </p>
              <p>
                <span className="text-neutral-400 uppercase">Order No.:</span>{' '}
                <span className="text-black font-medium">{order.orderNumber}</span>
              </p>
              <p>
                <span className="text-neutral-400 uppercase">Payment Status:</span>{' '}
                <span className="text-black font-semibold uppercase tracking-wider">
                  {order.payment?.status === 'paid' || !order.payment?.status ? 'Paid' : order.payment.status}
                </span>
              </p>
            </div>
          </div>
        </header>

        {/* CUSTOMER & DELIVERY ADDRESS SECTION */}
        <section className="pt-1">
          <div className="space-y-1.5 font-sans">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
              BILLING &amp; DELIVERY ADDRESS
            </span>
            <p className="font-semibold text-black text-sm">{customerName}</p>
            {order.shippingAddress?.street && (
              <p className="text-neutral-700 text-xs">{order.shippingAddress.street}</p>
            )}
            {order.shippingAddress?.landmark && (
              <p className="text-neutral-700 text-xs">{order.shippingAddress.landmark}</p>
            )}
            {(order.shippingAddress?.city || order.shippingAddress?.state || order.shippingAddress?.postalCode) && (
              <p className="text-neutral-700 text-xs">
                {[
                  order.shippingAddress.city,
                  order.shippingAddress.state,
                  order.shippingAddress.postalCode ? `- ${order.shippingAddress.postalCode}` : '',
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            {(customerEmail || customerPhone) && (
              <p className="text-neutral-500 text-xs pt-0.5">
                {[customerPhone, customerEmail].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </section>

        {/* LINE ITEMS TABLE */}
        <section className="pt-2">
          <div className="border-b border-black pb-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
              ITEMS
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                <th className="py-2.5 font-normal">PRODUCT</th>
                <th className="py-2.5 font-normal">DETAILS</th>
                <th className="py-2.5 font-normal text-center">QTY</th>
                <th className="py-2.5 font-normal text-right">PRICE</th>
                <th className="py-2.5 font-normal text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {(order.items || []).map((item, idx) => (
                <tr key={idx} className="align-middle">
                  <td className="py-3 pr-4 font-medium text-black">
                    {item.productName}
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-neutral-600">
                    {[item.color, item.size ? `Size ${item.size}` : ''].filter(Boolean).join(' · ')}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-xs text-neutral-800">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-xs text-neutral-800">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 pl-2 text-right font-mono text-xs font-medium text-black">
                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* FINANCIAL SUMMARY & PAYMENT SECTION */}
        <section className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-8 items-start border-t border-neutral-200">
          {/* Payment Information Left */}
          <div className="space-y-1.5 font-sans">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
              PAYMENT
            </span>
            <p className="text-xs text-neutral-800">
              <span className="text-neutral-400">Status:</span>{' '}
              <span className="font-semibold text-black">
                {order.payment?.status === 'paid' || !order.payment?.status ? 'Paid' : order.payment.status}
              </span>
            </p>
            <p className="text-xs text-neutral-800">
              <span className="text-neutral-400">Method:</span>{' '}
              <span className="font-medium capitalize text-black">
                {order.payment?.method || 'Razorpay'}
              </span>
            </p>
            {order.payment?.transactionId && (
              <p className="text-xs text-neutral-800 font-mono">
                <span className="text-neutral-400 font-sans">Transaction ID:</span>{' '}
                <span className="text-black">{order.payment.transactionId}</span>
              </p>
            )}
          </div>

          {/* Pricing Ledger Right — strictly NO tax lines */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1 text-neutral-700">
              <span>{(order.items || []).length > 1 ? 'Product Total' : 'Product Price'}</span>
              <span className="font-medium text-black">{formatPrice(itemsSubtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between py-1 text-neutral-700">
                <span>Discount</span>
                <span className="font-medium text-black">-{formatPrice(order.discount)}</span>
              </div>
            )}

            <div className="flex justify-between py-1 text-neutral-700">
              <span>Shipping</span>
              <span className="font-medium text-black">
                {order.shipping === 0 || !order.shipping ? 'FREE' : formatPrice(order.shipping)}
              </span>
            </div>

            <div className="pt-2 border-t-2 border-black flex justify-between items-baseline font-sans">
              <span className="font-display font-bold text-sm uppercase tracking-wider text-black">
                TOTAL PAID
              </span>
              <span className="font-mono text-lg font-bold text-black">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </section>

        {/* REBALANCED ELEGANT FOOTER */}
        <footer className="pt-10 sm:pt-16 mt-8 sm:mt-12 border-t border-neutral-200 text-center space-y-1.5 font-sans">
          <p className="font-mono text-[11px] uppercase tracking-widest text-black font-semibold">
            SUPERSNAKE — WEAR YOUR INSTINCT.
          </p>
          <p className="text-[11px] text-neutral-500 font-mono">
            support@supersnake.in · supersnake.in
          </p>
          <p className="text-[10px] text-neutral-400 font-mono pt-2">
            This is a computer-generated invoice and does not require a signature.
          </p>
        </footer>
      </div>
    </div>
  );
}
