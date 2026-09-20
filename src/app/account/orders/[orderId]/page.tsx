'use client';

import React, { useState, useEffect } from 'react';
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
  HelpCircle,
  Package,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';
import { Order, OrderStatus } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrderById } = useStore();
  const orderId = params?.orderId as string;
  const storeOrder = getOrderById(orderId);
  const [asyncOrder, setAsyncOrder] = useState<Order | null>(null);
  const [isFetching, setIsFetching] = useState(!storeOrder);

  const order = storeOrder || asyncOrder;

  useEffect(() => {
    if (storeOrder) {
      setIsFetching(false);
      return;
    }

    let isMounted = true;
    const fetchDirectOrder = async () => {
      if (!orderId) {
        setIsFetching(false);
        return;
      }

      try {
        const clean = orderId.trim();
        const numOnly = clean.replace(/[^0-9]/g, '');

        let query = supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*)
          `);

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
        if (isUuid) {
          query = query.eq('id', clean);
        } else if (clean.startsWith('SS-')) {
          query = query.eq('order_number', clean);
        } else if (numOnly) {
          query = query.ilike('order_number', `%${numOnly}%`);
        } else {
          query = query.or(`order_number.ilike.%${clean}%,id.eq.${clean}`);
        }

        const { data, error } = await query.maybeSingle();

        if (data && isMounted) {
          const mappedOrder: Order = {
            id: data.id,
            orderNumber: data.order_number,
            createdAt: data.created_at,
            status: data.status,
            items: (data.items || []).map((it: any) => ({
              productId: it.product_id || '',
              productName: it.product_name,
              color: it.color,
              size: it.size,
              quantity: it.quantity,
              price: Number(it.price),
              imageUrl: it.image_url || '',
            })),
            subtotal: Number(data.subtotal),
            discount: Number(data.discount || 0),
            shipping: Number(data.shipping || 0),
            tax: Number(data.tax || 0),
            total: Number(data.total),
            customer: {
              name: data.customer_name,
              email: data.customer_email,
              phone: data.customer_phone,
            },
            shippingAddress: data.shipping_address || {},
            payment: {
              method: data.payment_method || 'razorpay',
              transactionId: data.transaction_id || '',
              status: data.payment_status || 'paid',
              paidAt: data.created_at,
            },
            tracking: data.tracking_info,
          };
          setAsyncOrder(mappedOrder);
        }
      } catch (err) {
        console.warn('Direct order fetch error:', err);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    fetchDirectOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId, storeOrder]);

  if (isFetching && !order) {
    return (
      <div className="bg-[#0a0a0a] border border-white/10 p-12 text-center space-y-4 rounded-sm">
        <div className="w-8 h-8 border-2 border-snake-green border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          RETRIEVING ATELIER ORDER ARCHIVE...
        </p>
      </div>
    );
  }

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
    </div>
  );
}
