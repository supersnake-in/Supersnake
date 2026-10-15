'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldAlert,
  Users,
  Activity,
  FileSpreadsheet,
  Phone,
  Mail,
  MessageCircle,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  Download,
  RefreshCw,
  ArrowUpRight,
  UserPlus,
  Trash2,
  Settings,
  Flame,
  Zap,
  ShoppingBag,
  ExternalLink,
  Crown,
  Key,
  BadgeCheck,
  Ban,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/design-tokens';
import { isSuperAdmin, SUPERADMIN_EMAILS } from '@/lib/security';
import {
  AdminUser,
  AdminActivityLog,
  AdminRole,
  AdminActionCategory,
  EmergencyControlState,
  CustomerIntelligence,
} from '@/lib/types';
import {
  getAdminUsers,
  fetchAdminUsers,
  saveAdminUsers,
  getAdminActivityLogs,
  recordAdminActivity,
  getEmergencyControls,
  saveEmergencyControls,
  exportCustomersToCSV,
} from '@/lib/activity-logger';

export default function SuperadminPage() {
  const { user, profile, isAdmin } = useAuth();
  const currentEmail = (user?.email || profile?.email || '').trim().toLowerCase();
  const isAuthorizedSuperadmin = isSuperAdmin(currentEmail);

  const {
    orders,
    products,
    storefrontConfig,
    updateStorefrontConfig,
    maintenanceConfig,
    updateMaintenanceConfig,
  } = useStore();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'audit' | 'admins' | 'customers' | 'emergency'>('audit');

  // Activity Logs State
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [logSearch, setLogSearch] = useState('');
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('ALL');

  // Admin Personnel State
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('CO_ADMIN');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminActionFeedback, setAdminActionFeedback] = useState<string | null>(null);

  // Emergency Controls State
  const [emergencyControls, setEmergencyControls] = useState<EmergencyControlState>(getEmergencyControls());
  const [isUpdatingEmergency, setIsUpdatingEmergency] = useState(false);
  const [emergencyModal, setEmergencyModal] = useState<'freeze_store' | 'pause_checkout' | 'disable_coupons' | null>(null);

  // Customer Intelligence Filters
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerTierFilter, setCustomerTierFilter] = useState<'ALL' | 'VIP' | 'ELITE' | 'MEMBER'>('ALL');
  const [onlyVerifiedPhone, setOnlyVerifiedPhone] = useState(false);

  // Load Initial Data
  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const fetched = await getAdminActivityLogs();
      setLogs(fetched);
    } catch (e) {
      console.warn('Error loading logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
    setAdmins(getAdminUsers());
    fetchAdminUsers().then((res) => {
      if (res && res.length > 0) setAdmins(res);
    });
    setEmergencyControls(getEmergencyControls());

    // Listen for custom broadcast events
    const handleActivityLogged = () => {
      loadLogs();
    };
    const handleEmergencyUpdated = (e: any) => {
      if (e.detail) setEmergencyControls(e.detail);
    };
    const handleAdminsUpdated = (e: any) => {
      if (e.detail) setAdmins(e.detail);
    };

    window.addEventListener('supersnake_activity_logged', handleActivityLogged);
    window.addEventListener('supersnake_emergency_controls_updated', handleEmergencyUpdated);
    window.addEventListener('supersnake_admin_users_updated', handleAdminsUpdated);

    return () => {
      window.removeEventListener('supersnake_activity_logged', handleActivityLogged);
      window.removeEventListener('supersnake_emergency_controls_updated', handleEmergencyUpdated);
      window.removeEventListener('supersnake_admin_users_updated', handleAdminsUpdated);
    };
  }, []);

  // Compute Enriched Customer Intelligence
  const customerList: CustomerIntelligence[] = useMemo(() => {
    const map = new Map<string, CustomerIntelligence>();

    orders.forEach((o) => {
      const email = o.customer?.email?.trim().toLowerCase();
      if (!email) return;

      const orderTotal = Number(o.total) || 0;
      const orderDate = (o.createdAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
      const city = o.shippingAddress?.city || '';
      const state = o.shippingAddress?.state || '';
      const loc = city && state ? `${city}, ${state}` : city || state || 'India';
      const phone = o.customer?.phone || o.shippingAddress?.phone || '—';

      if (map.has(email)) {
        const existing = map.get(email)!;
        existing.ordersCount += 1;
        existing.totalSpent += orderTotal;
        existing.averageOrderValue = existing.totalSpent / existing.ordersCount;
        existing.tier =
          existing.totalSpent >= 5000 ? 'VIP INSTINCT' : existing.totalSpent >= 2500 ? 'ELITE' : 'MEMBER';
        if (orderDate < existing.firstOrderDate) {
          existing.firstOrderDate = orderDate;
        }
        if (orderDate > existing.lastOrderDate) {
          existing.lastOrderDate = orderDate;
        }
        if (phone && phone !== '—' && existing.phone === '—') {
          existing.phone = phone;
        }
      } else {
        map.set(email, {
          id: `cust-${email}`,
          name: o.customer?.name || 'Customer',
          email: o.customer?.email || email,
          phone: phone,
          location: loc,
          ordersCount: 1,
          totalSpent: orderTotal,
          averageOrderValue: orderTotal,
          tier: orderTotal >= 5000 ? 'VIP INSTINCT' : orderTotal >= 2500 ? 'ELITE' : 'MEMBER',
          firstOrderDate: orderDate,
          lastOrderDate: orderDate,
          registeredAccount: true,
          phoneVerified: Boolean(o.phoneVerified),
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customerList.filter((c) => {
      const q = customerSearch.toLowerCase().trim();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q);

      const matchesTier =
        customerTierFilter === 'ALL' ||
        (customerTierFilter === 'VIP' && c.tier === 'VIP INSTINCT') ||
        (customerTierFilter === 'ELITE' && c.tier === 'ELITE') ||
        (customerTierFilter === 'MEMBER' && c.tier === 'MEMBER');

      const matchesVerified = !onlyVerifiedPhone || c.phoneVerified;

      return matchesQuery && matchesTier && matchesVerified;
    });
  }, [customerList, customerSearch, customerTierFilter, onlyVerifiedPhone]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = logSearch.toLowerCase().trim();
      const matchesQuery =
        !q ||
        log.targetTitle.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.adminEmail.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q);

      const matchesCategory =
        logCategoryFilter === 'ALL' || log.category === logCategoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [logs, logSearch, logCategoryFilter]);

  // Executive Financial & System KPIs
  const totalGMV = useMemo(() => {
    return orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  }, [orders]);

  const vipPatronsCount = useMemo(() => {
    return customerList.filter((c) => c.tier === 'VIP INSTINCT').length;
  }, [customerList]);

  // Handle Adding Admin
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      setAdminActionFeedback('Please provide a valid email address.');
      return;
    }

    const cleanEmail = newAdminEmail.trim().toLowerCase();
    if (admins.some((a) => a.email.toLowerCase() === cleanEmail)) {
      setAdminActionFeedback('This administrator already exists in the directory.');
      return;
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      email: cleanEmail,
      name: newAdminName.trim() || cleanEmail.split('@')[0],
      role: newAdminRole,
      status: 'ACTIVE',
      lastActiveAt: new Date().toISOString(),
      addedAt: new Date().toISOString(),
    };

    const updated = [...admins, newAdmin];
    setAdmins(updated);
    saveAdminUsers(updated);

    recordAdminActivity({
      adminEmail: currentEmail,
      category: 'SYSTEM',
      action: 'ADMIN_INVITED',
      targetTitle: cleanEmail,
      details: `Added new personnel '${newAdmin.name}' with role '${newAdminRole}'.`,
      severity: 'WARNING',
    });

    setNewAdminEmail('');
    setNewAdminName('');
    setShowAddAdminModal(false);
    setAdminActionFeedback('Personnel successfully added to Atelier Directory.');
    setTimeout(() => setAdminActionFeedback(null), 4000);
  };

  // Handle Removing Admin
  const handleRemoveAdmin = (adminId: string, email: string) => {
    if (SUPERADMIN_EMAILS.some((se) => se.toLowerCase() === email.toLowerCase())) {
      alert('Default Executive Superadmins cannot be removed.');
      return;
    }
    if (!confirm(`Are you sure you want to revoke atelier privileges for ${email}?`)) {
      return;
    }

    const updated = admins.filter((a) => a.id !== adminId);
    setAdmins(updated);
    saveAdminUsers(updated);

    recordAdminActivity({
      adminEmail: currentEmail,
      category: 'SYSTEM',
      action: 'ADMIN_REVOKED',
      targetTitle: email,
      details: `Revoked administrative privileges for '${email}'.`,
      severity: 'WARNING',
    });
  };

  // Handle Toggling Emergency Controls
  const toggleEmergencyControl = async (key: keyof EmergencyControlState) => {
    setIsUpdatingEmergency(true);
    try {
      const nextVal = !emergencyControls[key];
      const updated = saveEmergencyControls({ [key]: nextVal }, currentEmail);
      setEmergencyControls(updated);

      // If toggling storefront frozen, also sync storefrontConfig & maintenanceConfig
      if (key === 'storefrontFrozen') {
        await updateMaintenanceConfig(
          {
            maintenanceMode: nextVal,
            maintenanceMessage: nextVal
              ? 'EMERGENCY SHUTDOWN: The SuperSnake digital atelier has been locked by Superadmin executive controls for security verification.'
              : 'Enhancements complete.',
          },
          currentEmail
        );
        await updateStorefrontConfig(
          {
            storefrontMode: nextVal ? 'MAINTENANCE' : 'LIVE',
          },
          currentEmail
        );
      }
    } finally {
      setIsUpdatingEmergency(false);
      setEmergencyModal(null);
    }
  };

  // Unauthorized Superadmin Block
  if (!isAuthorizedSuperadmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 font-mono">
        <div className="max-w-md space-y-4 border border-red-900/50 bg-red-950/20 p-8 rounded-lg">
          <ShieldAlert size={48} className="mx-auto text-red-500 animate-pulse" />
          <h1 className="text-xl font-bold uppercase tracking-widest text-red-400">
            LEVEL 0 // SUPERADMIN PRIVILEGES REQUIRED
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The Superadmin Command Center is restricted strictly to executive owners. Your current administrative account (<strong>{currentEmail || 'guest'}</strong>) does not have executive Superadmin clearance.
          </p>
          <div className="pt-4 flex justify-center">
            <Link
              href="/admin"
              className="px-6 py-2.5 bg-neutral-900 border border-neutral-700 hover:border-snake-green text-white text-xs uppercase tracking-widest transition-colors"
            >
              ← RETURN TO STANDARD ADMIN
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono text-xs">
      {/* Executive Command Header */}
      <div className="border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded bg-snake-green/10 border border-snake-green/40 text-snake-green text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
              <Crown size={12} /> LEVEL 0 // EXECUTIVE SUPERADMIN
            </span>
            <span className="text-neutral-500 text-[10px]">AUTH: {currentEmail}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight text-white">
            SUPERADMIN COMMAND CENTER
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Personnel Governance • Immutable Audit Trails • Customer Master Directory • Emergency Kill-Switches
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCustomersToCSV(customerList)}
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 border border-neutral-700 hover:border-snake-green text-white rounded font-bold uppercase text-[11px] transition-all"
            title="Download full customer directory to CSV"
          >
            <Download size={14} className="text-snake-green" />
            <span>EXPORT PATRONS (CSV)</span>
          </button>

          <button
            onClick={loadLogs}
            className="p-2 bg-neutral-900 border border-neutral-800 hover:border-white text-neutral-400 hover:text-white rounded transition-colors"
            title="Refresh audit feed"
          >
            <RefreshCw size={14} className={isLoadingLogs ? 'animate-spin text-snake-green' : ''} />
          </button>
        </div>
      </div>

      {/* Emergency Kill-Switches Banner */}
      <div className="bg-[#0e0e0e] border border-red-900/40 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-xs tracking-wider">
            <Flame size={16} className="text-red-500 animate-pulse" />
            <span>HIGH-STAKES BRAND EMERGENCY KILL-SWITCHES</span>
          </div>
          <span className="text-[10px] text-neutral-500">
            LAST MODIFIED: {emergencyControls.lastToggledBy} ({new Date(emergencyControls.lastToggledAt || '').toLocaleTimeString()})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Switch 1: Storefront Lock */}
          <div
            className={`p-4 rounded border transition-colors flex flex-col justify-between gap-3 ${
              emergencyControls.storefrontFrozen || maintenanceConfig?.maintenanceMode
                ? 'bg-red-950/20 border-red-500/50'
                : 'bg-neutral-900/60 border-neutral-800'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                  <Lock size={13} className="text-red-400" />
                  STOREFRONT FREEZE
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    emergencyControls.storefrontFrozen || maintenanceConfig?.maintenanceMode
                      ? 'bg-red-500 text-black'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {emergencyControls.storefrontFrozen || maintenanceConfig?.maintenanceMode ? 'ACTIVE' : 'NOMINAL'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Immediately redirects all public traffic to the private maintenance lock screen.
              </p>
            </div>
            <button
              onClick={() => toggleEmergencyControl('storefrontFrozen')}
              disabled={isUpdatingEmergency}
              className={`w-full py-2 px-3 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                emergencyControls.storefrontFrozen || maintenanceConfig?.maintenanceMode
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-300 border border-neutral-700'
              }`}
            >
              {emergencyControls.storefrontFrozen || maintenanceConfig?.maintenanceMode
                ? 'UNLOCK STOREFRONT'
                : 'ENGAGE EMERGENCY LOCK'}
            </button>
          </div>

          {/* Switch 2: Checkout Freeze */}
          <div
            className={`p-4 rounded border transition-colors flex flex-col justify-between gap-3 ${
              emergencyControls.checkoutPaused
                ? 'bg-amber-950/20 border-amber-500/50'
                : 'bg-neutral-900/60 border-neutral-800'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-400" />
                  CHECKOUT PAUSE
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    emergencyControls.checkoutPaused
                      ? 'bg-amber-400 text-black'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {emergencyControls.checkoutPaused ? 'PAUSED' : 'ACTIVE'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Temporarily pauses Razorpay payment capture if payment gateway has an ongoing outage.
              </p>
            </div>
            <button
              onClick={() => toggleEmergencyControl('checkoutPaused')}
              disabled={isUpdatingEmergency}
              className={`w-full py-2 px-3 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                emergencyControls.checkoutPaused
                  ? 'bg-amber-400 hover:bg-amber-300 text-black'
                  : 'bg-neutral-800 hover:bg-amber-950 hover:text-amber-300 text-neutral-300 border border-neutral-700'
              }`}
            >
              {emergencyControls.checkoutPaused ? 'RESUME CHECKOUT' : 'PAUSE PAYMENTS'}
            </button>
          </div>

          {/* Switch 3: Discounts Shutoff */}
          <div
            className={`p-4 rounded border transition-colors flex flex-col justify-between gap-3 ${
              emergencyControls.discountsDisabled
                ? 'bg-red-950/20 border-red-500/50'
                : 'bg-neutral-900/60 border-neutral-800'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                  <Ban size={13} className="text-red-400" />
                  DISCOUNT KILL-SWITCH
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    emergencyControls.discountsDisabled
                      ? 'bg-red-500 text-black'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {emergencyControls.discountsDisabled ? 'SHUTDOWN' : 'NOMINAL'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Instantly shuts off and invalidates all coupons storewide in case of coupon leak.
              </p>
            </div>
            <button
              onClick={() => toggleEmergencyControl('discountsDisabled')}
              disabled={isUpdatingEmergency}
              className={`w-full py-2 px-3 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                emergencyControls.discountsDisabled
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-300 border border-neutral-700'
              }`}
            >
              {emergencyControls.discountsDisabled ? 'RESTORE COUPONS' : 'SHUT OFF COUPONS'}
            </button>
          </div>
        </div>
      </div>

      {/* Executive KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0d0d0d] border border-neutral-800 p-4 rounded-lg space-y-1">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">GROSS GMV (LIFETIME)</span>
          <span className="text-xl md:text-2xl font-bold text-white block">{formatPrice(totalGMV)}</span>
          <span className="text-[10px] text-snake-green">From {orders.length} placed transactions</span>
        </div>

        <div className="bg-[#0d0d0d] border border-neutral-800 p-4 rounded-lg space-y-1">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">UNIQUE PATRONS</span>
          <span className="text-xl md:text-2xl font-bold text-white block">{customerList.length}</span>
          <span className="text-[10px] text-neutral-400">{vipPatronsCount} VIP Instinct tier patrons</span>
        </div>

        <div className="bg-[#0d0d0d] border border-neutral-800 p-4 rounded-lg space-y-1">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">ACTIVE PERSONNEL</span>
          <span className="text-xl md:text-2xl font-bold text-white block">{admins.length} Admins</span>
          <span className="text-[10px] text-neutral-400">
            {admins.filter((a) => a.role === 'SUPERADMIN').length} Executive Superadmin
          </span>
        </div>

        <div className="bg-[#0d0d0d] border border-neutral-800 p-4 rounded-lg space-y-1">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">AUDIT TRAIL EVENTS</span>
          <span className="text-xl md:text-2xl font-bold text-white block">{logs.length} Recorded</span>
          <span className="text-[10px] text-snake-green flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-snake-green animate-pulse" />
            Live Event Stream
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-800 flex items-center gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold uppercase transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-snake-green text-white bg-neutral-900/40'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Activity size={14} className={activeTab === 'audit' ? 'text-snake-green' : ''} />
          <span>Live Activity Audit Trail ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold uppercase transition-colors whitespace-nowrap ${
            activeTab === 'admins'
              ? 'border-snake-green text-white bg-neutral-900/40'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Shield size={14} className={activeTab === 'admins' ? 'text-snake-green' : ''} />
          <span>Admin Personnel & Roles ({admins.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold uppercase transition-colors whitespace-nowrap ${
            activeTab === 'customers'
              ? 'border-snake-green text-white bg-neutral-900/40'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Users size={14} className={activeTab === 'customers' ? 'text-snake-green' : ''} />
          <span>Customer Master Directory ({customerList.length})</span>
        </button>
      </div>

      {/* TAB 1: LIVE ACTIVITY AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0d0d0d] p-3.5 border border-neutral-800/80 rounded-lg">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search audit trail by product, admin, action, or details..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
              {['ALL', 'CATALOG', 'SETTINGS', 'ORDERS', 'EMERGENCY', 'COLLECTIONS', 'SYSTEM'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLogCategoryFilter(cat)}
                  className={`px-2.5 py-1.5 rounded uppercase font-bold tracking-wider transition-colors whitespace-nowrap ${
                    logCategoryFilter === cat
                      ? 'bg-snake-green text-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-12 text-center text-neutral-500 space-y-2">
              <Activity size={32} className="mx-auto text-neutral-600" />
              <p className="font-bold uppercase text-white">NO AUDIT LOGS MATCHING CRITERIA</p>
              <p className="text-[11px]">Any admin modifications or catalog actions will appear here in real time.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map((log) => {
                const isCritical = log.severity === 'CRITICAL';
                const isWarning = log.severity === 'WARNING';
                return (
                  <div
                    key={log.id}
                    className={`bg-[#0d0d0d] border rounded-lg p-4 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                      isCritical
                        ? 'border-red-900/60 bg-red-950/10'
                        : isWarning
                        ? 'border-amber-900/40'
                        : 'border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                            isCritical
                              ? 'bg-red-500 text-black'
                              : isWarning
                              ? 'bg-amber-400 text-black'
                              : 'bg-neutral-800 text-snake-green border border-snake-green/30'
                          }`}
                        >
                          {log.action}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 text-[9px] uppercase border border-neutral-800">
                          {log.category}
                        </span>

                        <strong className="text-white text-xs tracking-tight">
                          {log.targetTitle}
                        </strong>
                      </div>

                      <p className="text-neutral-300 text-xs leading-relaxed font-sans font-normal">
                        {log.details}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 pt-1">
                        <span>OPERATOR: <strong className="text-neutral-300">{log.adminEmail}</strong></span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-neutral-500 whitespace-nowrap self-start">
                      <span className="px-2 py-1 bg-neutral-900/80 rounded border border-neutral-800">
                        {log.id.slice(0, 14)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADMIN PERSONNEL & ROLES */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d0d] p-4 border border-neutral-800/80 rounded-lg">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                ATELIER ADMINISTRATIVE ROSTER
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Manage executive superadmins, store managers, and fulfillment personnel.
              </p>
            </div>

            <button
              onClick={() => setShowAddAdminModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-snake-green text-black rounded font-bold uppercase text-[11px] hover:bg-white transition-colors"
            >
              <UserPlus size={14} />
              <span>INVITE PERSONNEL</span>
            </button>
          </div>

          {adminActionFeedback && (
            <div className="p-3 bg-neutral-900 border border-snake-green/40 text-snake-green rounded text-xs flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>{adminActionFeedback}</span>
            </div>
          )}

          {/* Add Admin Modal */}
          {showAddAdminModal && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                    <UserPlus size={16} className="text-snake-green" />
                    INVITE ATELIER PERSONNEL
                  </h3>
                  <button
                    onClick={() => setShowAddAdminModal(false)}
                    className="text-neutral-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddAdmin} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-neutral-400 uppercase text-[10px] tracking-wider mb-1">
                      Personnel Full Name
                    </label>
                    <input
                      type="text"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 uppercase text-[10px] tracking-wider mb-1">
                      Email Address (Must match login identity)
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="alex@supersnake.in"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 uppercase text-[10px] tracking-wider mb-1">
                      Role Designation & Permissions
                    </label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-white focus:outline-none focus:border-snake-green"
                    >
                      <option value="CO_ADMIN">CO-ADMIN (Restricted: Products, Collections, Inventory & Orders only)</option>
                      <option value="ADMIN">ATELIER ADMIN (Standard: All admin tools except Superadmin)</option>
                      <option value="SUPPORT_LEAD">SUPPORT & LOGISTICS (Orders & Shipping only)</option>
                      <option value="SUPERADMIN">SUPERADMIN (Executive Control, Kill-Switches, Full Clearance)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddAdminModal(false)}
                      className="px-4 py-2 text-neutral-400 hover:text-white"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-snake-green text-black font-bold uppercase rounded hover:bg-white transition-colors"
                    >
                      ADD PERSONNEL
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Admins Table */}
          <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">PERSONNEL</th>
                  <th className="py-3 px-4">ROLE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">LAST ACTIVITY</th>
                  <th className="py-3 px-4">CLEARANCE</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {admins.map((adm) => {
                  const isPrimarySuper = SUPERADMIN_EMAILS.some(
                    (se) => se.toLowerCase() === adm.email.toLowerCase()
                  );
                  const isCoAdminRole = adm.role === 'CO_ADMIN' || adm.role === 'STORE_MANAGER';
                  return (
                    <tr key={adm.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-snake-green font-bold text-xs uppercase">
                            {adm.name.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{adm.name}</span>
                            <span className="text-[11px] text-neutral-400 block">{adm.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            adm.role === 'SUPERADMIN'
                              ? 'bg-snake-green/15 text-snake-green border border-snake-green/30'
                              : isCoAdminRole
                              ? 'bg-amber-950/40 text-amber-300 border border-amber-500/40'
                              : adm.role === 'ADMIN'
                              ? 'bg-blue-950/40 text-blue-400 border border-blue-500/30'
                              : 'bg-purple-950/40 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {isCoAdminRole ? 'CO-ADMIN' : adm.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-[10px] text-snake-green">
                          <span className="w-1.5 h-1.5 rounded-full bg-snake-green animate-pulse" />
                          {adm.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                        {new Date(adm.lastActiveAt || adm.addedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                        {isPrimarySuper ? (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Crown size={12} /> LEVEL 0 OWNER
                          </span>
                        ) : isCoAdminRole ? (
                          <span className="text-amber-300 font-mono text-[10px] font-bold">
                            PRODUCTS & ORDERS
                          </span>
                        ) : (
                          <span>OPERATIONAL</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isPrimarySuper ? (
                          <span className="text-neutral-600 text-[10px] italic">Permanent Lead</span>
                        ) : (
                          <button
                            onClick={() => handleRemoveAdmin(adm.id, adm.email)}
                            className="p-1.5 text-neutral-500 hover:text-red-400 rounded transition-colors"
                            title="Revoke admin access"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER MASTER DIRECTORY */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0d0d0d] p-3.5 border border-neutral-800/80 rounded-lg">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customers by name, email, phone number, city, or state..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded p-1 text-[10px]">
                {(['ALL', 'VIP', 'ELITE', 'MEMBER'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setCustomerTierFilter(tier)}
                    className={`px-2 py-1 rounded font-bold uppercase transition-colors ${
                      customerTierFilter === tier
                        ? 'bg-snake-green text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setOnlyVerifiedPhone(!onlyVerifiedPhone)}
                className={`px-3 py-1.5 rounded border text-[10px] font-bold uppercase transition-colors flex items-center gap-1.5 ${
                  onlyVerifiedPhone
                    ? 'bg-snake-green/10 border-snake-green text-snake-green'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <BadgeCheck size={12} />
                <span>Verified Phones Only</span>
              </button>

              <button
                onClick={() => exportCustomersToCSV(filteredCustomers)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-bold uppercase text-[10px] rounded hover:bg-snake-green transition-colors"
              >
                <Download size={12} />
                <span>EXPORT CSV ({filteredCustomers.length})</span>
              </button>
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-16 text-center text-neutral-500 space-y-2">
              <Users size={36} className="mx-auto text-neutral-600" />
              <p className="font-bold uppercase text-white">NO PATRONS MATCH CURRENT FILTERS</p>
              <p className="text-[11px]">Try adjusting the search query or tier filters above.</p>
            </div>
          ) : (
            <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">PATRON & CONTACT</th>
                    <th className="py-3 px-4">LOCATION</th>
                    <th className="py-3 px-4">ORDERS</th>
                    <th className="py-3 px-4">TOTAL SPENT (LTV)</th>
                    <th className="py-3 px-4">AVG BASKET</th>
                    <th className="py-3 px-4">PATRON TIER</th>
                    <th className="py-3 px-4">LAST ORDER</th>
                    <th className="py-3 px-4 text-right">VIP CONCIERGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredCustomers.map((c) => {
                    const cleanPhone = c.phone.replace(/[^0-9]/g, '');
                    const waLink =
                      cleanPhone.length >= 10
                        ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
                            `Hello ${c.name}, this is the SuperSnake Concierge. We are reaching out regarding your recent atelier experience.`
                          )}`
                        : null;

                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-white block text-sm">{c.name}</span>
                            <div className="flex items-center gap-2 text-neutral-400 text-[11px] mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail size={11} className="text-neutral-500" />
                                {c.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mt-0.5">
                              <span className="flex items-center gap-1 text-snake-green">
                                <Phone size={11} />
                                {c.phone}
                              </span>
                              {c.phoneVerified && (
                                <span className="text-[9px] text-snake-green flex items-center gap-0.5" title="Verified Mobile">
                                  <BadgeCheck size={11} /> Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-neutral-300 text-[11px]">
                          {c.location}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-white">
                          {c.ordersCount} {c.ordersCount === 1 ? 'order' : 'orders'}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-snake-green text-sm">
                          {formatPrice(c.totalSpent)}
                        </td>

                        <td className="py-3.5 px-4 text-neutral-300">
                          {formatPrice(c.averageOrderValue)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              c.tier === 'VIP INSTINCT'
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                : c.tier === 'ELITE'
                                ? 'bg-blue-400/20 text-blue-300 border border-blue-400/40'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {c.tier}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                          {c.lastOrderDate}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded bg-emerald-950/40 border border-emerald-600/40 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
                                title="Open WhatsApp Concierge chat"
                              >
                                <MessageCircle size={14} />
                              </a>
                            )}
                            <a
                              href={`mailto:${c.email}?subject=SuperSnake%20Atelier%20Private%20Communication`}
                              className="p-1.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-white transition-colors"
                              title="Send Email"
                            >
                              <Mail size={14} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
