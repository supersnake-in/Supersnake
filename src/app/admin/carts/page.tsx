'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Mail,
  Phone,
  Copy,
  Check,
  Eye,
  RefreshCw,
  FileText,
  Package,
  X,
  Sparkles,
  MessageSquare,
  ArrowUpRight,
  Send,
  Tag,
  Flame,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { AbandonedCart, AbandonedCartStatus } from '@/lib/types';
import { formatPrice } from '@/lib/design-tokens';

const STATUS_OPTIONS: AbandonedCartStatus[] = [
  'Active',
  'Abandoned',
  'Contacted',
  'Recovered',
];

export default function AdminCartsPage() {
  const { abandonedCarts, updateAbandonedCartStatus, refreshAbandonedCarts } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form states inside modal
  const [currentStatus, setCurrentStatus] = useState<AbandonedCartStatus>('Abandoned');
  const [adminNotes, setAdminNotes] = useState('');
  const [discountCode, setDiscountCode] = useState('VIP10');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync latest abandoned carts from Supabase on mount
  React.useEffect(() => {
    refreshAbandonedCarts();
  }, [refreshAbandonedCarts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAbandonedCarts();
    setIsRefreshing(false);
  };

  const handleOpenDrawer = (cart: AbandonedCart) => {
    setSelectedCart(cart);
    setCurrentStatus(cart.status);
    setAdminNotes(cart.notes || '');
    setDiscountCode(cart.discountOffered || 'VIP10');
    setSaveSuccess(false);
  };

  const handleSaveStatus = async () => {
    if (!selectedCart) return;
    setIsSaving(true);
    try {
      const ok = await updateAbandonedCartStatus(
        selectedCart.id,
        currentStatus,
        adminNotes.trim() || undefined,
        discountCode.trim() || undefined
      );
      if (ok) {
        setSaveSuccess(true);
        setSelectedCart((prev) =>
          prev
            ? {
                ...prev,
                status: currentStatus,
                notes: adminNotes.trim() || undefined,
                discountOffered: discountCode.trim() || undefined,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to update cart status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Outreach copywriting generators
  const getOutreachSubject = (cart: AbandonedCart) => {
    const firstItem = cart.items[0];
    const itemTitle = firstItem ? firstItem.productName : 'SuperSnake Atelier Pieces';
    return `Your reserved pieces: ${itemTitle} in your SuperSnake bag`;
  };

  const getOutreachPitch = (cart: AbandonedCart, code: string) => {
    const firstItem = cart.items[0];
    const itemDesc = firstItem
      ? `${firstItem.productName} (Size ${firstItem.size})`
      : 'your reserved items';

    return `Hello ${cart.customerName || 'there'},

We noticed you reserved the ${itemDesc} in your SuperSnake atelier bag!

Because each 280 GSM heavyweight piece is crafted in limited small-batch studio runs, sizes frequently sell out.

As an atelier courtesy, you can use private code "${code}" for an exclusive 10% privilege on your order:

👉 Return to bag & checkout: https://supersnake.in/bag

If you need any sizing advice or have questions about our Supima® cotton construction, simply reply directly to this message.

Warm regards,
SuperSnake India Atelier
Bengaluru, India
support@supersnake.in`;
  };

  const handleCopyPitch = () => {
    if (!selectedCart) return;
    const pitch = getOutreachPitch(selectedCart, discountCode);
    navigator.clipboard.writeText(pitch);
    setCopiedField('pitch');
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Filtered carts
  const filteredCarts = useMemo(() => {
    return abandonedCarts.filter((cart) => {
      // Status filter
      if (statusFilter !== 'all' && cart.status !== statusFilter) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = cart.customerName.toLowerCase().includes(q);
        const matchesEmail = cart.customerEmail.toLowerCase().includes(q);
        const matchesPhone = (cart.customerPhone || '').toLowerCase().includes(q);
        const matchesItems = cart.items.some(
          (it) =>
            it.productName.toLowerCase().includes(q) ||
            it.size.toLowerCase().includes(q) ||
            it.colorName.toLowerCase().includes(q)
        );
        return matchesName || matchesEmail || matchesPhone || matchesItems;
      }

      return true;
    });
  }, [abandonedCarts, statusFilter, search]);

  // Aggregate Metrics
  const openCarts = abandonedCarts.filter((c) => c.status === 'Active' || c.status === 'Abandoned');
  const totalOpenValue = openCarts.reduce((sum, c) => sum + (c.subtotal || 0), 0);
  const contactedCount = abandonedCarts.filter((c) => c.status === 'Contacted').length;
  const recoveredCarts = abandonedCarts.filter((c) => c.status === 'Recovered');
  const recoveredValue = recoveredCarts.reduce((sum, c) => sum + (c.subtotal || 0), 0);
  const recoveryRate =
    abandonedCarts.length > 0
      ? Math.round((recoveredCarts.length / abandonedCarts.length) * 100)
      : 0;

  // Format relative time helper
  const getRelativeTime = (timestamp?: string) => {
    if (!timestamp) return 'Recently';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart size={22} className="text-snake-green" />
            <h1 className="text-2xl font-display font-bold uppercase tracking-tight text-white">
              ABANDONED & ACTIVE CARTS
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time patron cart tracking, drop-off recovery, and direct 1-click outreach.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-xs text-neutral-300 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh carts from Supabase"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>SYNC CARTS</span>
          </button>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-snake-green text-black hover:bg-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
          >
            <span>ATELIER ORDERS</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Value */}
        <div className="p-5 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-2 relative overflow-hidden">
          <span className="text-[11px] tracking-wider text-neutral-400 uppercase block">
            UNCONVERTED CART VALUE
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400 tracking-tight">
              {formatPrice(totalOpenValue)}
            </span>
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
              <Flame size={13} />
              <span>{openCarts.length} open</span>
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 block">
            Potential gross sales in active bags
          </span>
        </div>

        {/* Total Tracked Carts */}
        <div className="p-5 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-2">
          <span className="text-[11px] tracking-wider text-neutral-400 uppercase block">
            TOTAL TRACKED PATRONS
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white tracking-tight">
              {abandonedCarts.length}
            </span>
            <span className="text-xs text-snake-green font-bold">
              Live Stream
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 block">
            Identified customers with bag activity
          </span>
        </div>

        {/* Contacted Patrons */}
        <div className="p-5 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-2">
          <span className="text-[11px] tracking-wider text-neutral-400 uppercase block">
            OUTREACH SENT
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-sky-400 tracking-tight">
              {contactedCount}
            </span>
            <span className="text-xs text-sky-400 font-bold">
              WhatsApp / Email
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 block">
            Patrons nudged with courtesy perks
          </span>
        </div>

        {/* Recovered Value */}
        <div className="p-5 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-2">
          <span className="text-[11px] tracking-wider text-neutral-400 uppercase block">
            RECOVERED REVENUE
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-snake-green tracking-tight">
              {formatPrice(recoveredValue)}
            </span>
            <span className="text-xs text-snake-green font-bold">
              {recoveryRate}% win rate
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 block">
            {recoveredCarts.length} converted transactions
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patron, email, phone, or garment..."
            className="w-full bg-[#0d0d0d] border border-neutral-800 rounded pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-snake-green focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Active', 'Abandoned', 'Contacted', 'Recovered'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded text-xs uppercase font-bold tracking-wider transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Carts Table */}
      <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">PATRON & CONTACT</th>
                <th className="py-3 px-4">RESERVED GARMENTS (BAG)</th>
                <th className="py-3 px-4">BAG TOTAL</th>
                <th className="py-3 px-4">LAST ACTIVE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredCarts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-500">
                    <ShoppingCart size={32} className="mx-auto mb-2 opacity-30 text-neutral-400" />
                    <p className="text-xs uppercase font-bold text-neutral-400">NO CARTS FOUND</p>
                    <p className="text-[11px] text-neutral-600 mt-1 max-w-sm mx-auto">
                      As soon as customers log in, sign up, or fill in contact details on checkout with garments in their bag, they stream here live.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCarts.map((cart) => {
                  const cleanPhone = (cart.customerPhone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr key={cart.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Patron Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-white block font-bold">
                            {cart.customerName || 'Anonymous Patron'}
                          </span>
                          <span className="text-[11px] text-neutral-400 block font-mono">
                            {cart.customerEmail}
                          </span>
                          {cart.customerPhone && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                              <Phone size={10} />
                              <span>{cart.customerPhone}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
                            {cart.items.slice(0, 3).map((it, idx) => (
                              <div
                                key={idx}
                                className="relative w-8 h-10 rounded bg-neutral-900 border border-neutral-700 overflow-hidden flex-shrink-0"
                              >
                                {it.imageUrl ? (
                                  <Image
                                    src={it.imageUrl}
                                    alt={it.productName}
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-neutral-500 font-bold">
                                    TEE
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="truncate">
                            <span className="text-white block text-xs truncate">
                              {cart.items.map((it) => it.productName).join(', ') || 'Custom Garment'}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono block">
                              {cart.items.map((it) => `${it.quantity}x [${it.size}]`).join(' • ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {formatPrice(cart.subtotal)}
                        <span className="text-[10px] text-neutral-500 block font-normal">
                          {cart.itemCount} {cart.itemCount === 1 ? 'unit' : 'units'}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock size={11} className="text-neutral-500" />
                          <span>{getRelativeTime(cart.lastActiveAt)}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {cart.status === 'Active' && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] uppercase font-bold tracking-wider inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ACTIVE
                          </span>
                        )}
                        {cart.status === 'Abandoned' && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] uppercase font-bold tracking-wider inline-flex items-center gap-1">
                            <Flame size={10} />
                            ABANDONED
                          </span>
                        )}
                        {cart.status === 'Contacted' && (
                          <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded text-[9px] uppercase font-bold tracking-wider inline-flex items-center gap-1">
                            <MessageSquare size={10} />
                            CONTACTED
                          </span>
                        )}
                        {cart.status === 'Recovered' && (
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-[9px] uppercase font-bold tracking-wider inline-flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            RECOVERED
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDrawer(cart)}
                          className="px-3 py-1.5 bg-snake-green hover:bg-white text-black font-bold rounded text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                        >
                          <span>REACH OUT</span>
                          <ArrowUpRight size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OUTREACH & CART INSPECTION DRAWER */}
      {selectedCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="bg-[#0e0e0e] border-l border-neutral-800 w-full max-w-xl h-full flex flex-col justify-between text-xs overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between flex-shrink-0 bg-neutral-950">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-snake-green">
                    ATELIER RECOVERY SUITE
                  </span>
                  <span className="text-[10px] text-neutral-500">•</span>
                  <span className="text-[10px] text-neutral-400">
                    Active: {getRelativeTime(selectedCart.lastActiveAt)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight mt-0.5">
                  {selectedCart.customerName || 'Anonymous Patron'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCart(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Patron Contact Card */}
              <div className="p-4 bg-neutral-950 border border-neutral-800/80 rounded-lg space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                  PATRON DOSSIER
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">EMAIL ADDRESS</span>
                    <div className="flex items-center gap-1.5 text-white font-mono mt-0.5">
                      <span className="truncate">{selectedCart.customerEmail}</span>
                      <button
                        onClick={() => handleCopy(selectedCart.customerEmail, 'email')}
                        className="text-neutral-500 hover:text-white"
                        title="Copy email"
                      >
                        {copiedField === 'email' ? <Check size={11} className="text-snake-green" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-500 block">PHONE CONTACT</span>
                    <div className="flex items-center gap-1.5 text-white font-mono mt-0.5">
                      <span>{selectedCart.customerPhone || 'Not provided'}</span>
                      {selectedCart.customerPhone && (
                        <button
                          onClick={() => handleCopy(selectedCart.customerPhone || '', 'phone')}
                          className="text-neutral-500 hover:text-white"
                          title="Copy phone"
                        >
                          {copiedField === 'phone' ? <Check size={11} className="text-snake-green" /> : <Copy size={11} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bag Contents Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                    GARMENTS IN BAG ({selectedCart.itemCount})
                  </span>
                  <span className="text-xs font-bold text-white">
                    Subtotal: {formatPrice(selectedCart.subtotal)}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedCart.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg flex items-center gap-3.5"
                    >
                      <div className="relative w-12 h-14 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-neutral-800">
                        {it.imageUrl ? (
                          <Image
                            src={it.imageUrl}
                            alt={it.productName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500 font-bold">
                            TEE
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-white truncate uppercase">
                            {it.productName}
                          </h4>
                          <span className="text-xs font-bold text-white whitespace-nowrap">
                            {formatPrice(it.price * it.quantity)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                          <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-snake-green font-bold">
                            SIZE: {it.size}
                          </span>
                          <span>COLOR: {it.colorName}</span>
                          <span>QTY: {it.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Click Multi-Channel Outreach Suite */}
              <div className="p-4 bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-snake-green" />
                    <span className="text-xs uppercase font-bold text-white tracking-wider">
                      1-CLICK OUTREACH CHANNELS
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-neutral-400">Coupon:</span>
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      className="bg-black border border-neutral-700 px-2 py-0.5 rounded text-[10px] text-snake-green font-mono font-bold w-16 text-center uppercase"
                      title="Courtesy coupon code to include in pitch"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400">
                  Pre-fills high-converting luxury copy with the patron&apos;s name, reserved garments, limited-batch scarcity reminder, and your courtesy code.
                </p>

                {(() => {
                  const subject = getOutreachSubject(selectedCart);
                  const pitchBody = getOutreachPitch(selectedCart, discountCode);
                  const cleanPhone = (selectedCart.customerPhone || '').replace(/[^0-9]/g, '');

                  return (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        {/* WhatsApp Web / Direct */}
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(
                              pitchBody
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded text-xs font-bold transition-all text-center"
                            title="Open WhatsApp chat with pre-filled luxury recovery message"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp Chat</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-600 cursor-not-allowed text-center"
                            title="No phone number provided by customer"
                          >
                            <MessageSquare size={13} />
                            <span>No Phone Saved</span>
                          </button>
                        )}

                        {/* Gmail Web Compose */}
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                            selectedCart.customerEmail
                          )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(pitchBody)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded text-xs font-bold transition-all text-center"
                          title="Open Gmail Web compose tab with pre-drafted recovery email"
                        >
                          <Mail size={13} />
                          <span>Gmail Web</span>
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Native Mail Client */}
                        <a
                          href={`mailto:${selectedCart.customerEmail}?subject=${encodeURIComponent(
                            subject
                          )}&body=${encodeURIComponent(pitchBody)}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-white text-neutral-300 hover:text-black border border-neutral-700 rounded text-[11px] font-bold transition-all text-center"
                          title="Open default system mail client"
                        >
                          <ExternalLink size={12} />
                          <span>Mail App</span>
                        </a>

                        {/* Copy Pitch to Clipboard */}
                        <button
                          type="button"
                          onClick={handleCopyPitch}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded text-[11px] font-mono transition-all text-center"
                          title="Copy outreach pitch text to clipboard"
                        >
                          {copiedField === 'pitch' ? (
                            <>
                              <Check size={12} className="text-snake-green" />
                              <span className="text-snake-green font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Pitch</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Status Update & Internal Notes */}
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                  ATELIER STATUS & CRM NOTES
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1">
                      CART STATUS
                    </label>
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value as AbandonedCartStatus)}
                      className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-xs text-white font-bold uppercase focus:border-snake-green focus:outline-none cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1">
                      OFFERED PERK
                    </label>
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="e.g. VIP10, FREE SHIPPING"
                      className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-xs text-white uppercase focus:border-snake-green focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 uppercase block mb-1">
                    INTERNAL ATELIER NOTES
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Spoke to patron on WhatsApp regarding fit recommendations..."
                    className="w-full bg-black border border-neutral-700 rounded p-2.5 text-xs text-white placeholder-neutral-600 focus:border-snake-green focus:outline-none font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between flex-shrink-0">
              {saveSuccess ? (
                <span className="text-xs text-snake-green font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>UPDATES SAVED TO DATABASE</span>
                </span>
              ) : (
                <span className="text-[10px] text-neutral-500">
                  Last updated: {selectedCart.updatedAt ? new Date(selectedCart.updatedAt).toLocaleTimeString() : 'Never'}
                </span>
              )}

              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={isSaving}
                className="px-5 py-2 bg-snake-green hover:bg-white text-black text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>SAVING...</span>
                  </>
                ) : (
                  <span>SAVE UPDATES</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
