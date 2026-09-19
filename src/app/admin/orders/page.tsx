'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { OrderStatus, Order } from '@/lib/types';
import { formatPrice } from '@/lib/design-tokens';
import { Search, Filter, CheckCircle2, Truck, Package, Clock, XCircle } from 'lucide-react';

export default function AdminOrdersPage() {
  const { orders } = useStore();
  const [ordersList, setOrdersList] = useState<Order[]>(orders);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  React.useEffect(() => {
    setOrdersList(orders);
  }, [orders]);

  const statuses: OrderStatus[] = [
    'Pending',
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

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrdersList((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filtered = ordersList.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (ord.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (ord.customer?.email || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || ord.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
            ORDER FULFILLMENT PIPELINE
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Track, dispatch, and manage client orders across India.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-300">
            TOTAL ORDERS: <strong className="text-white">{ordersList.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer, or email..."
            className="w-full bg-[#0d0d0d] border border-neutral-800 rounded px-3 py-2 pl-9 text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500">FILTER STATUS:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0d0d0d] border border-neutral-800 text-neutral-300 rounded px-3 py-2 focus:outline-none focus:border-snake-green"
          >
            <option value="all">ALL STATUSES</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">ORDER #</th>
              <th className="py-3 px-4">DATE</th>
              <th className="py-3 px-4">CUSTOMER</th>
              <th className="py-3 px-4">ITEMS</th>
              <th className="py-3 px-4">TOTAL</th>
              <th className="py-3 px-4">PAYMENT</th>
              <th className="py-3 px-4">WORKFLOW STATUS</th>
              <th className="py-3 px-4 text-right">INSPECT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-neutral-500">
                  <p className="text-xs uppercase font-bold text-neutral-400">NO ATELIER ORDERS FOUND</p>
                  <p className="text-[11px] text-neutral-600 mt-1">
                    Real orders placed by customers on SUPERSNAKE.IN will stream here in real time.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{ord.orderNumber}</td>
                  <td className="py-3 px-4 text-neutral-400">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white block font-semibold">{ord.customer?.name || 'Customer'}</span>
                    <span className="text-[10px] text-neutral-500">{ord.customer?.phone || '—'}</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-300">
                    {(ord.items || []).map((it) => `${it.quantity}x ${it.size}`).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-white font-bold">{formatPrice(ord.total)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 rounded text-[9px] uppercase font-semibold text-snake-green">
                      PAID (ONLINE)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                      className="bg-black border border-neutral-700 text-xs px-2.5 py-1 rounded text-white focus:border-snake-green cursor-pointer uppercase font-semibold"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-white hover:text-black rounded text-[10px] uppercase font-bold text-neutral-300 transition-colors"
                    >
                      VIEW
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-lg p-6 sm:p-8 max-w-2xl w-full space-y-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold uppercase text-white">
                  ORDER: {selectedOrder.orderNumber}
                </h3>
                <span className="text-[10px] text-neutral-400">
                  Placed: {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded">
              <div>
                <span className="text-neutral-500 uppercase block text-[10px]">CLIENT</span>
                <p className="text-white font-bold">{selectedOrder.customer.name}</p>
                <p className="text-neutral-400">{selectedOrder.customer.email}</p>
                <p className="text-neutral-400">{selectedOrder.customer.phone}</p>
              </div>
              <div>
                <span className="text-neutral-500 uppercase block text-[10px]">SHIPPING ADDRESS</span>
                <p className="text-white">{selectedOrder.shippingAddress.street}</p>
                <p className="text-neutral-400">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                  {selectedOrder.shippingAddress.postalCode}
                </p>
              </div>
            </div>

            {/* Itemized list */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase text-neutral-400 tracking-wider">GARMENTS</span>
              <div className="divide-y divide-neutral-800 border border-neutral-800 rounded overflow-hidden">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 bg-neutral-950 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white uppercase">{it.productName}</p>
                      <p className="text-[11px] text-neutral-400">
                        Color: {it.color} • Size: {it.size} • Qty: {it.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-white">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status change action in modal */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-3">
                <span className="text-neutral-400 uppercase">UPDATE WORKFLOW:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="bg-black border border-neutral-700 text-xs px-3 py-1.5 rounded text-white font-bold uppercase"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-snake-green text-black font-bold uppercase rounded hover:bg-white transition-colors"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
