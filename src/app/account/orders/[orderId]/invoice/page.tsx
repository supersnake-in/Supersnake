'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, Package } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Order } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import OrderInvoice from '@/components/invoice/OrderInvoice';

export default function DedicatedInvoicePage() {
  const params = useParams();
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

        const { data } = await query.maybeSingle();

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

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (isFetching && !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-snake-green border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          GENERATING SECURE INVOICE...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center space-y-4">
        <Package size={32} className="mx-auto text-neutral-600" />
        <h2 className="text-xl font-display font-medium text-white">INVOICE NOT AVAILABLE</h2>
        <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
          The requested order invoice ({orderId}) could not be located.
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

  return (
    <div className="bg-[#050505] text-white min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 print:bg-white print:text-black print:p-0 print:m-0 print:min-h-0">
      {/* Top Controls (Hidden during print) */}
      <div className="max-w-[210mm] mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden border-b border-white/10 pb-4">
        <Link
          href={`/account/orders/${order.orderNumber || order.id}`}
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO ORDER DETAILS</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-[#121212] hover:bg-white hover:text-black border border-white/10 text-neutral-300 rounded text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
            title="Download PDF via browser print dialog"
          >
            <Download size={13} />
            <span>DOWNLOAD PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-white text-black hover:bg-snake-green border border-white/10 rounded text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 font-semibold"
          >
            <Printer size={13} />
            <span>PRINT INVOICE</span>
          </button>
        </div>
      </div>

      {/* Invoice Container */}
      <div
        id="supersnake-invoice"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl rounded-sm border border-neutral-200 overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none print:w-full"
      >
        <OrderInvoice order={order} />
      </div>
    </div>
  );
}
