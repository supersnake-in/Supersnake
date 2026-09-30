'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Search,
  Check,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  X,
  Filter,
  ArrowRight,
  ShieldCheck,
  Copy,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { PreBooking, PreBookingStatus } from '@/lib/types';
import { formatPrice } from '@/lib/design-tokens';

const STATUS_CONFIG: Record<
  PreBookingStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  CONFIRMED: {
    label: 'CONFIRMED',
    bg: 'bg-snake-green/15',
    text: 'text-snake-green',
    border: 'border-snake-green/40',
  },
  PRODUCTION: {
    label: 'IN PRODUCTION',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
  },
  IN_TRANSIT: {
    label: 'IN TRANSIT',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-400',
    border: 'border-cyan-500/40',
  },
  DELIVERED: {
    label: 'DELIVERED',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
  },
  CONTACTED: {
    label: 'CONTACTED',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
  },
  CONVERTED_TO_ORDER: {
    label: 'CONVERTED TO ORDER',
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    border: 'border-purple-500/40',
  },
  CANCELLED: {
    label: 'CANCELLED',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/40',
  },
};

export default function AdminPreBookingsPage() {
  const { preBookings, updatePreBookingStatus, refreshPreBookings, storefrontConfig } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeModalBooking, setActiveModalBooking] = useState<PreBooking | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [carrierNameInput, setCarrierNameInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Filtered Pre-Bookings
  const filteredBookings = useMemo(() => {
    return preBookings.filter((b) => {
      const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        b.referenceCode.toLowerCase().includes(query) ||
        b.customerName.toLowerCase().includes(query) ||
        b.customerEmail.toLowerCase().includes(query) ||
        b.customerPhone.includes(query) ||
        b.productName.toLowerCase().includes(query) ||
        b.city.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [preBookings, selectedStatus, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = preBookings.length;
    const confirmed = preBookings.filter((b) => b.status === 'CONFIRMED').length;
    const production = preBookings.filter((b) => b.status === 'PRODUCTION').length;
    const inTransit = preBookings.filter((b) => b.status === 'IN_TRANSIT').length;
    const delivered = preBookings.filter((b) => b.status === 'DELIVERED').length;
    const contacted = preBookings.filter((b) => b.status === 'CONTACTED').length;
    const converted = preBookings.filter((b) => b.status === 'CONVERTED_TO_ORDER').length;
    const paidCount = preBookings.filter((b) => b.paymentStatus === 'Paid').length;
    const totalValue = preBookings.reduce((sum, b) => sum + (b.totalPrice || b.productPrice * b.quantity), 0);
    const paidValue = preBookings
      .filter((b) => b.paymentStatus === 'Paid')
      .reduce((sum, b) => sum + (b.totalPrice || b.productPrice * b.quantity), 0);

    return { total, confirmed, production, inTransit, delivered, contacted, converted, paidCount, totalValue, paidValue };
  }, [preBookings]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (
    id: string,
    newStatus: PreBookingStatus,
    notes?: string,
    carrierName?: string,
    trackingNumber?: string
  ) => {
    setIsUpdating(id);
    try {
      const success = await updatePreBookingStatus(id, newStatus, notes, undefined, carrierName, trackingNumber);
      if (success) {
        setNotification(`STATUS UPDATED TO "${newStatus}"`);
        if (activeModalBooking && activeModalBooking.id === id) {
          setActiveModalBooking({
            ...activeModalBooking,
            status: newStatus,
            bookingStatus: newStatus,
            adminNotes: notes !== undefined ? notes : activeModalBooking.adminNotes,
            carrierName: carrierName !== undefined ? carrierName : activeModalBooking.carrierName,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : activeModalBooking.trackingNumber,
          });
        }
      } else {
        alert('Failed to update pre-booking status.');
      }
    } catch (e: any) {
      alert(e.message || 'Error occurred while updating status.');
    } finally {
      setIsUpdating(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-snake-green animate-pulse" />
            <span className="text-[10px] text-snake-green uppercase tracking-widest font-bold">
              EXCLUSIVE FIRST DROP PIPELINE
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
            PRE-LAUNCH RESERVATIONS
          </h1>
          <p className="text-neutral-400 mt-0.5 text-xs">
            Review, prioritize, and manage customer product reservations placed during Pre-Launch Mode.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pre-launch"
            target="_blank"
            className="px-3.5 py-2 border border-neutral-700 hover:border-snake-green text-neutral-300 hover:text-white rounded flex items-center gap-1.5 transition-colors uppercase tracking-wider text-[11px]"
          >
            <span>PREVIEW PRE-LAUNCH STOREFRONT</span>
            <ExternalLink size={12} />
          </Link>

          <button
            onClick={() => refreshPreBookings()}
            className="p-2 border border-neutral-800 hover:border-neutral-600 rounded text-neutral-400 hover:text-white transition-colors"
            title="Refresh Pre-Bookings"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green rounded flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check size={14} />
            <span className="font-bold">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-neutral-400 hover:text-white">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Executive Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        <div className="p-3.5 bg-[#0d0d0d] border border-neutral-800 rounded-lg space-y-1">
          <span className="text-[9px] text-neutral-500 uppercase block font-semibold">TOTAL RESERVED</span>
          <span className="text-xl font-display font-bold text-white block">
            {metrics.total}
          </span>
          <span className="text-[9px] text-neutral-500 block truncate">All reservations</span>
        </div>

        <div className="p-3.5 bg-[#0d0d0d] border border-snake-green/30 rounded-lg space-y-1">
          <span className="text-[9px] text-snake-green uppercase block font-semibold">PAID ONLINE</span>
          <span className="text-xl font-display font-bold text-snake-green block">
            {metrics.paidCount}
          </span>
          <span className="text-[9px] text-snake-green/80 block truncate">{formatPrice(metrics.paidValue)} captured</span>
        </div>

        <div className="p-3.5 bg-[#0d0d0d] border border-neutral-800 rounded-lg space-y-1">
          <span className="text-[9px] text-white uppercase block font-semibold">CONFIRMED</span>
          <span className="text-xl font-display font-bold text-white block">
            {metrics.confirmed}
          </span>
          <span className="text-[9px] text-neutral-500 block truncate">Serial locked</span>
        </div>

        <div className="p-3.5 bg-[#0d0d0d] border border-amber-500/30 rounded-lg space-y-1">
          <span className="text-[9px] text-amber-400 uppercase block font-semibold">IN PRODUCTION</span>
          <span className="text-xl font-display font-bold text-amber-400 block">
            {metrics.production}
          </span>
          <span className="text-[9px] text-amber-400/80 block truncate">Atelier crafting</span>
        </div>

        <div className="p-3.5 bg-[#0d0d0d] border border-cyan-500/30 rounded-lg space-y-1">
          <span className="text-[9px] text-cyan-400 uppercase block font-semibold">IN TRANSIT</span>
          <span className="text-xl font-display font-bold text-cyan-400 block">
            {metrics.inTransit}
          </span>
          <span className="text-[9px] text-cyan-400/80 block truncate">Air dispatch</span>
        </div>

        <div className="p-3.5 bg-[#0d0d0d] border border-emerald-500/30 rounded-lg space-y-1">
          <span className="text-[9px] text-emerald-400 uppercase block font-semibold">DELIVERED</span>
          <span className="text-xl font-display font-bold text-emerald-400 block">
            {metrics.delivered}
          </span>
          <span className="text-[9px] text-emerald-400/80 block truncate">Handed to patron</span>
        </div>

        <div className="p-3.5 bg-[#0d0d0d] border border-neutral-800 rounded-lg space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[9px] text-neutral-400 uppercase block font-semibold">PIPELINE GMV</span>
          <span className="text-xl font-display font-bold text-white block truncate">
            {formatPrice(metrics.totalValue)}
          </span>
          <span className="text-[9px] text-neutral-500 block truncate">Gross reserved</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d0d0d] border border-neutral-800/80 p-3 rounded-lg">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SS-PB code, customer name, email, phone, city..."
            className="w-full bg-black border border-neutral-800 rounded px-3 py-2 pl-9 text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green text-xs font-mono"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={13} className="text-neutral-400" />
          <span className="text-neutral-400 text-[11px] uppercase">STATUS:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-black border border-neutral-800 text-neutral-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-snake-green cursor-pointer uppercase font-mono"
          >
            <option value="ALL">ALL ({preBookings.length})</option>
            <option value="CONFIRMED">CONFIRMED ({metrics.confirmed})</option>
            <option value="PRODUCTION">IN PRODUCTION ({metrics.production})</option>
            <option value="IN_TRANSIT">IN TRANSIT ({metrics.inTransit})</option>
            <option value="DELIVERED">DELIVERED ({metrics.delivered})</option>
            <option value="CONTACTED">CONTACTED ({metrics.contacted})</option>
            <option value="CONVERTED_TO_ORDER">CONVERTED ({metrics.converted})</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Pre-Bookings Table */}
      <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">REFERENCE</th>
              <th className="py-3 px-4">GARMENT &amp; VARIANT</th>
              <th className="py-3 px-4">PATRON CONTACT</th>
              <th className="py-3 px-4">PAYMENT</th>
              <th className="py-3 px-4">DESTINATION</th>
              <th className="py-3 px-4">TIMESTAMP</th>
              <th className="py-3 px-4 text-center">STATUS</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-mono">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-neutral-500">
                  <div className="max-w-sm mx-auto space-y-2">
                    <Calendar size={28} className="mx-auto text-neutral-600 mb-2" />
                    <p className="text-xs uppercase font-bold text-neutral-400">NO PRE-BOOKINGS FOUND</p>
                    <p className="text-[11px] text-neutral-500">
                      {searchQuery
                        ? 'No reservations match your search query.'
                        : 'Customer pre-bookings placed during Pre-Launch Mode will be catalogued here.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => {
                const statusCfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.CONFIRMED;
                return (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Reference Code */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white tracking-wider">
                          {b.referenceCode}
                        </span>
                        <button
                          onClick={() => handleCopy(b.referenceCode, b.id)}
                          className="text-neutral-500 hover:text-snake-green transition-colors"
                          title="Copy Reference Code"
                        >
                          {copiedId === b.id ? <Check size={12} className="text-snake-green" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <span className="text-[10px] text-neutral-500 block">
                        QTY: {b.quantity} • {formatPrice(b.totalPrice || b.productPrice * b.quantity)}
                      </span>
                    </td>

                    {/* Garment & Variant */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        {b.productImage ? (
                          <div className="relative w-10 h-12 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-neutral-800">
                            <Image
                              src={b.productImage}
                              alt={b.productName}
                              fill
                              sizes="50px"
                              unoptimized={Boolean(b.productImage.startsWith('data:') || b.productImage.startsWith('blob:'))}
                              className="object-cover"
                            />
                          </div>
                        ) : null}
                        <div>
                          <span className="font-bold text-white block uppercase truncate max-w-[180px]">
                            {b.productName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block"
                              style={{ backgroundColor: b.colorHex }}
                            />
                            <span>{b.colorName}</span>
                            <span>•</span>
                            <span className="text-snake-green font-bold">SIZE {b.size}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Patron Contact */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block truncate max-w-[180px]">
                        {b.customerName}
                      </span>
                      <a
                        href={`mailto:${b.customerEmail}?subject=SuperSnake%20Pre-Booking%20${b.referenceCode}&body=Dear%20${encodeURIComponent(b.customerName)},%0D%0A%0D%0AThank%20you%20for%20reserving%20the%20${encodeURIComponent(b.productName)}%20(Ref:%20${b.referenceCode})%20during%20the%20SuperSnake%20Pre-Launch.`}
                        className="text-[10px] text-neutral-400 hover:text-snake-green transition-colors flex items-center gap-1 truncate max-w-[180px]"
                      >
                        <Mail size={10} />
                        <span className="truncate">{b.customerEmail}</span>
                      </a>
                      <a
                        href={`tel:${b.customerPhone}`}
                        className="text-[10px] text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Phone size={10} />
                        <span>{b.customerPhone}</span>
                      </a>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-snake-green/20 text-snake-green border border-snake-green/40">
                        ● PAID VIA RAZORPAY
                      </span>
                      {b.razorpayPaymentId && (
                        <span className="text-[9px] text-neutral-500 block font-mono mt-0.5 truncate max-w-[120px]">
                          {b.razorpayPaymentId}
                        </span>
                      )}
                    </td>

                    {/* Destination */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-neutral-300">
                        <MapPin size={11} className="text-snake-green flex-shrink-0" />
                        <span className="truncate max-w-[140px] font-semibold">{b.city}, {b.state}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block truncate max-w-[140px]">
                        PIN: {b.pincode}{b.postOffice ? ` • ${b.postOffice}` : ''}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-400 text-[10px]">
                      <div>{new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="text-neutral-500">{new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    {/* Status with Inline Dropdown */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <select
                        value={b.status}
                        disabled={isUpdating === b.id}
                        onChange={(e) => handleStatusChange(b.id, e.target.value as PreBookingStatus)}
                        className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border cursor-pointer ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} focus:outline-none`}
                      >
                        <option value="CONFIRMED" className="bg-black text-snake-green">CONFIRMED</option>
                        <option value="PRODUCTION" className="bg-black text-amber-400">IN PRODUCTION</option>
                        <option value="IN_TRANSIT" className="bg-black text-cyan-400">IN TRANSIT</option>
                        <option value="DELIVERED" className="bg-black text-emerald-400">DELIVERED</option>
                        <option value="CONTACTED" className="bg-black text-blue-400">CONTACTED</option>
                        <option value="CONVERTED_TO_ORDER" className="bg-black text-purple-300">CONVERTED</option>
                        <option value="CANCELLED" className="bg-black text-red-400">CANCELLED</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setActiveModalBooking(b);
                          setAdminNotesInput(b.adminNotes || '');
                          setCarrierNameInput(b.carrierName || '');
                          setTrackingNumberInput(b.trackingNumber || '');
                        }}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 rounded text-[10px] font-bold uppercase transition-colors"
                      >
                        VIEW VOUCHER
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL & VOUCHER MODAL */}
      {activeModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-lg max-w-xl w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] text-snake-green uppercase tracking-widest font-bold block">
                  PATRON RESERVATION VOUCHER
                </span>
                <h3 className="text-lg font-display font-bold uppercase text-white tracking-tight">
                  {activeModalBooking.referenceCode}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/track-order?ref=${encodeURIComponent(activeModalBooking.bookingNumber || activeModalBooking.referenceCode)}`}
                  target="_blank"
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-snake-green border border-snake-green/30 hover:border-snake-green rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-1.5"
                  title="Preview Customer Tracking Radar"
                >
                  <span>LIVE TRACKING RADAR</span>
                  <ExternalLink size={11} />
                </Link>
                <button
                  onClick={() => setActiveModalBooking(null)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded border border-neutral-800 hover:border-neutral-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Garment Details Card */}
            <div className="p-4 bg-black border border-neutral-800 rounded-lg flex items-center gap-4">
              {activeModalBooking.productImage && (
                <div className="relative w-16 h-20 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-neutral-800">
                  <Image
                    src={activeModalBooking.productImage}
                    alt={activeModalBooking.productName}
                    fill
                    sizes="100px"
                    unoptimized={Boolean(activeModalBooking.productImage.startsWith('data:') || activeModalBooking.productImage.startsWith('blob:'))}
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-1 flex-1">
                <span className="font-bold text-white uppercase text-sm block">
                  {activeModalBooking.productName}
                </span>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 inline-block"
                    style={{ backgroundColor: activeModalBooking.colorHex }}
                  />
                  <span>{activeModalBooking.colorName}</span>
                  <span>•</span>
                  <span className="text-snake-green font-bold">SIZE: {activeModalBooking.size}</span>
                  <span>•</span>
                  <span>QTY: {activeModalBooking.quantity}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-xs font-mono font-bold text-white">
                    AMOUNT: {formatPrice(activeModalBooking.totalPrice || activeModalBooking.productPrice * activeModalBooking.quantity)}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-snake-green/20 text-snake-green border border-snake-green/40">
                    ● PAID VIA RAZORPAY
                  </span>
                </div>
                {activeModalBooking.razorpayPaymentId && (
                  <div className="text-[10px] text-neutral-400 font-mono">
                    GATEWAY TXN: <strong className="text-white">{activeModalBooking.razorpayPaymentId}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Customer & Delivery Address Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-black border border-neutral-800 rounded-lg space-y-2">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">PATRON INFORMATION</span>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-white">{activeModalBooking.customerName}</p>
                  <p className="text-neutral-400 truncate">{activeModalBooking.customerEmail}</p>
                  <p className="text-neutral-400">{activeModalBooking.customerPhone}</p>
                </div>
                <div className="pt-2 flex gap-2">
                  <a
                    href={`mailto:${activeModalBooking.customerEmail}?subject=SuperSnake%20Pre-Booking%20${activeModalBooking.referenceCode}`}
                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-1 border border-neutral-700"
                  >
                    <Mail size={10} /> Mail
                  </a>
                  <a
                    href={`https://wa.me/${activeModalBooking.customerPhone.replace(/[^0-9]/g, '')}?text=Dear%20${encodeURIComponent(activeModalBooking.customerName)},%20greeting%20from%20SuperSnake%20regarding%20your%20Pre-Booking%20(${activeModalBooking.referenceCode})`}
                    target="_blank"
                    className="px-2.5 py-1 bg-snake-green/10 hover:bg-snake-green/20 text-snake-green rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-1 border border-snake-green/30"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="p-4 bg-black border border-neutral-800 rounded-lg space-y-2">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">PRIORITY SHIPPING ADDRESS</span>
                <div className="space-y-1 text-xs text-neutral-300">
                  <p>{activeModalBooking.streetAddress || 'Not provided'}</p>
                  {activeModalBooking.postOffice && (
                    <p className="text-neutral-400">Area / PO: <span className="text-white font-semibold">{activeModalBooking.postOffice}</span></p>
                  )}
                  <p>{activeModalBooking.city}, {activeModalBooking.state}</p>
                  <p className="text-snake-green font-bold">PIN: {activeModalBooking.pincode}</p>
                </div>
              </div>
            </div>

            {/* Carrier & Tracking Logistics Coordinates */}
            <div className="p-4 bg-black border border-neutral-800 rounded-lg space-y-3">
              <span className="text-[10px] text-snake-green uppercase font-bold tracking-wider block">
                PRIORITY AIR LOGISTICS &amp; FULFILLMENT
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-neutral-400 uppercase font-semibold block">
                    CARRIER / COURIER PARTNER
                  </label>
                  <input
                    type="text"
                    value={carrierNameInput}
                    onChange={(e) => setCarrierNameInput(e.target.value)}
                    placeholder="e.g. BlueDart Express, Delhivery Air, DTDC"
                    className="w-full bg-[#121212] border border-neutral-800 rounded px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-snake-green"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-neutral-400 uppercase font-semibold block">
                    WAYBILL / TRACKING AIRBILL #
                  </label>
                  <input
                    type="text"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    placeholder="e.g. BLD-84918290 or AWB-990231"
                    className="w-full bg-[#121212] border border-neutral-800 rounded px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-snake-green"
                  />
                </div>
              </div>
            </div>

            {/* Admin Notes & Workflow */}
            <div className="space-y-2">
              <label className="text-neutral-400 uppercase text-[10px] font-semibold block">
                ADMIN CONCIERGE NOTES
              </label>
              <textarea
                rows={3}
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                placeholder="Add private concierge notes, order conversion status, or customer communication history..."
                className="w-full bg-black border border-neutral-800 p-3 text-white rounded text-xs focus:border-snake-green focus:outline-none font-mono"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-neutral-500 uppercase mr-1">STATUS:</span>
                {(['CONFIRMED', 'PRODUCTION', 'IN_TRANSIT', 'DELIVERED', 'CONTACTED', 'CONVERTED_TO_ORDER', 'CANCELLED'] as PreBookingStatus[]).map((st) => {
                  const cfg = STATUS_CONFIG[st];
                  const isCurrent = activeModalBooking.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(activeModalBooking.id, st, adminNotesInput, carrierNameInput, trackingNumberInput)}
                      className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-all ${
                        isCurrent
                          ? 'bg-snake-green text-black border-snake-green shadow-[0_0_10px_rgba(4,252,33,0.3)]'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      {st === 'CONVERTED_TO_ORDER' ? 'CONVERTED' : cfg?.label || st}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handleStatusChange(activeModalBooking.id, activeModalBooking.status, adminNotesInput, carrierNameInput, trackingNumberInput)}
                className="px-4 py-2 bg-snake-green hover:bg-white text-black font-bold uppercase text-xs rounded transition-all shrink-0 text-center"
              >
                SAVE LOGISTICS &amp; CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
