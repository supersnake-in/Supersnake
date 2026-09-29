'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Truck,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
  AlertTriangle,
  Power,
  ExternalLink,
  RefreshCw,
  X,
  ShieldAlert,
  Info,
  Calendar,
  Globe,
  Layers,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { BRAND } from '@/lib/design-tokens';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { StorefrontMode } from '@/lib/types';

export default function AdminSettingsPage() {
  const {
    maintenanceConfig,
    updateMaintenanceConfig,
    refreshMaintenanceConfig,
    storefrontConfig,
    updateStorefrontConfig,
    refreshStorefrontConfig,
    products,
    preBookings,
    freeShippingThreshold: storeThreshold,
    updateFreeShippingThreshold,
  } = useStore();
  const { user, profile } = useAuth();
  const currentAdminEmail = user?.email || profile?.email || 'supersnake.in@gmail.com';

  // Standard Store Settings state
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState(BRAND.name);
  const [supportEmail, setSupportEmail] = useState('support@supersnake.in');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(storeThreshold || 1999);
  const [deliveryDays, setDeliveryDays] = useState('4-7 Business Days');
  const [courierPartner, setCourierPartner] = useState('Authorised Courier Partners');
  const [studioLocation, setStudioLocation] = useState('Bengaluru, Karnataka, India');
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [grievanceOfficer, setGrievanceOfficer] = useState('');
  const [grievanceEmail, setGrievanceEmail] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [adminPin, setAdminPin] = useState('••••');

  // Storefront Mode & Pre-Launch state
  const [storefrontMode, setStorefrontMode] = useState<StorefrontMode>(
    storefrontConfig?.storefrontMode || 'LIVE'
  );
  const [launchDate, setLaunchDate] = useState(storefrontConfig?.launchDate || '2026-10-14');
  const [launchTime, setLaunchTime] = useState(storefrontConfig?.launchTime || '10:00 AM');
  const [launchTimezone, setLaunchTimezone] = useState(storefrontConfig?.launchTimezone || 'Asia/Kolkata (IST)');
  const [automaticLaunch, setAutomaticLaunch] = useState(storefrontConfig?.automaticLaunch ?? true);
  const [preLaunchProductLimit, setPreLaunchProductLimit] = useState<number>(
    storefrontConfig?.preLaunchProductLimit || 6
  );
  const [modeConfirmModal, setModeConfirmModal] = useState<StorefrontMode | null>(null);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const [modeFeedback, setModeFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Maintenance Mode sub-state
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    storefrontConfig?.maintenanceMessage ||
      maintenanceConfig?.maintenanceMessage ||
      'We are currently enhancing our digital atelier to elevate your experience. SuperSnake will return shortly.'
  );
  const [durationPreset, setDurationPreset] = useState<'none' | '15m' | '30m' | '1h' | '2h' | '4h' | 'custom'>('none');
  const [customDateTime, setCustomDateTime] = useState('');
  const [confirmModal, setConfirmModal] = useState<'enable' | 'disable' | null>(null);
  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);
  const [maintenanceFeedback, setMaintenanceFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Sync storefront settings when context updates
  useEffect(() => {
    if (storefrontConfig) {
      if (storefrontConfig.storefrontMode) setStorefrontMode(storefrontConfig.storefrontMode);
      if (storefrontConfig.launchDate) setLaunchDate(storefrontConfig.launchDate);
      if (storefrontConfig.launchTime) setLaunchTime(storefrontConfig.launchTime);
      if (storefrontConfig.launchTimezone) setLaunchTimezone(storefrontConfig.launchTimezone);
      if (typeof storefrontConfig.automaticLaunch === 'boolean') {
        setAutomaticLaunch(storefrontConfig.automaticLaunch);
      }
      if (storefrontConfig.preLaunchProductLimit) {
        setPreLaunchProductLimit(storefrontConfig.preLaunchProductLimit);
      }
      if (storefrontConfig.maintenanceMessage) {
        setMaintenanceMessage(storefrontConfig.maintenanceMessage);
      }
      if (storefrontConfig.estimatedRestoreTime) {
        try {
          const iso = new Date(storefrontConfig.estimatedRestoreTime).toISOString();
          setCustomDateTime(iso.slice(0, 16));
        } catch (e) {}
      }
    }
  }, [storefrontConfig]);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('supersnake_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.storeName) setStoreName(parsed.storeName);
        if (parsed.supportEmail) setSupportEmail(parsed.supportEmail);
        if (parsed.freeShippingThreshold) setFreeShippingThreshold(Number(parsed.freeShippingThreshold));
        if (parsed.deliveryDays) setDeliveryDays(parsed.deliveryDays);
        if (parsed.courierPartner) setCourierPartner(parsed.courierPartner);
        if (parsed.studioLocation) setStudioLocation(parsed.studioLocation);
        if (parsed.legalBusinessName) setLegalBusinessName(parsed.legalBusinessName);
        if (parsed.gstin) setGstin(parsed.gstin);
        if (parsed.grievanceOfficer) setGrievanceOfficer(parsed.grievanceOfficer);
        if (parsed.grievanceEmail) setGrievanceEmail(parsed.grievanceEmail);
        if (parsed.jurisdiction) setJurisdiction(parsed.jurisdiction);
      } else if (storeThreshold) {
        setFreeShippingThreshold(storeThreshold);
      }
    } catch (e) {}
  }, [storeThreshold]);

  const calculateTargetRestoreTime = (): string | null => {
    if (durationPreset === 'none') return null;
    if (durationPreset === 'custom') {
      return customDateTime ? new Date(customDateTime).toISOString() : null;
    }
    const minutesMap: Record<string, number> = {
      '15m': 15,
      '30m': 30,
      '1h': 60,
      '2h': 120,
      '4h': 240,
    };
    const addMinutes = minutesMap[durationPreset] || 60;
    return new Date(Date.now() + addMinutes * 60 * 1000).toISOString();
  };

  const handleSwitchMode = async (targetMode: StorefrontMode) => {
    setIsUpdatingMode(true);
    setModeFeedback(null);

    const calculatedTime = targetMode === 'MAINTENANCE' ? calculateTargetRestoreTime() : null;

    try {
      const result = await updateStorefrontConfig(
        {
          storefrontMode: targetMode,
          launchDate: launchDate.trim(),
          launchTime: launchTime.trim(),
          launchTimezone: launchTimezone.trim(),
          automaticLaunch,
          preLaunchProductLimit: Number(preLaunchProductLimit) || 6,
          maintenanceMessage: maintenanceMessage.trim() || undefined,
          estimatedRestoreTime: calculatedTime,
        },
        currentAdminEmail
      );

      if (result.success) {
        setStorefrontMode(targetMode);
        setModeFeedback({
          type: 'success',
          message:
            targetMode === 'PRE_LAUNCH'
              ? 'PRE-LAUNCH MODE ACTIVATED: Exclusive drop hero, countdown ticker & pre-booking collection are now live.'
              : targetMode === 'LIVE'
              ? 'STOREFRONT IS LIVE: Unrestricted public shopping access restored. Bag and checkout operational.'
              : 'MAINTENANCE MODE ENGAGED: Customer traffic is now intercepted to holding screen.',
        });
        setModeConfirmModal(null);
      } else {
        setModeFeedback({
          type: 'error',
          message: result.error || 'Failed to update storefront mode.',
        });
      }
    } catch (err: any) {
      setModeFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsUpdatingMode(false);
      setTimeout(() => setModeFeedback(null), 5000);
    }
  };

  const handleSaveLaunchSettings = async () => {
    setIsUpdatingMode(true);
    setModeFeedback(null);

    try {
      const result = await updateStorefrontConfig(
        {
          launchDate: launchDate.trim(),
          launchTime: launchTime.trim(),
          launchTimezone: launchTimezone.trim(),
          automaticLaunch,
          preLaunchProductLimit: Number(preLaunchProductLimit) || 6,
        },
        currentAdminEmail
      );

      if (result.success) {
        setModeFeedback({
          type: 'success',
          message: 'Official launch schedule and product limits saved successfully.',
        });
      } else {
        setModeFeedback({
          type: 'error',
          message: result.error || 'Failed to update launch schedule.',
        });
      }
    } catch (err: any) {
      setModeFeedback({
        type: 'error',
        message: err.message || 'Failed to save launch settings.',
      });
    } finally {
      setIsUpdatingMode(false);
      setTimeout(() => setModeFeedback(null), 4000);
    }
  };

  const handleSaveMaintenanceDetails = async () => {
    setIsUpdatingMode(true);
    setModeFeedback(null);

    const calculatedTime = calculateTargetRestoreTime();

    try {
      const result = await updateStorefrontConfig(
        {
          maintenanceMessage: maintenanceMessage.trim(),
          estimatedRestoreTime: calculatedTime,
        },
        currentAdminEmail
      );

      if (result.success) {
        setModeFeedback({
          type: 'success',
          message: 'Maintenance holding message and duration updated successfully.',
        });
      } else {
        setModeFeedback({
          type: 'error',
          message: result.error || 'Failed to update details.',
        });
      }
    } catch (err: any) {
      setModeFeedback({
        type: 'error',
        message: err.message || 'Failed to update maintenance details.',
      });
    } finally {
      setIsUpdatingMode(false);
      setTimeout(() => setModeFeedback(null), 4000);
    }
  };

  const handlePresetSelect = (preset: string) => {
    setMaintenanceMessage(preset);
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateFreeShippingThreshold(freeShippingThreshold);
    try {
      localStorage.setItem(
        'supersnake_settings',
        JSON.stringify({
          storeName,
          supportEmail,
          freeShippingThreshold,
          deliveryDays,
          courierPartner,
          studioLocation,
          legalBusinessName,
          gstin,
          grievanceOfficer,
          grievanceEmail,
          jurisdiction,
        })
      );
    } catch (err) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isMaintenanceActive = storefrontMode === 'MAINTENANCE';
  const isPreLaunchActive = storefrontMode === 'PRE_LAUNCH';
  const isLiveActive = storefrontMode === 'LIVE';
  const preLaunchProductsCount = products.filter((p) => p.preLaunchEnabled).length;

  return (
    <div className="space-y-8 font-mono max-w-4xl pb-16">
      {/* Page Title */}
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
          ATELIER STORE SETTINGS
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage storefront launch controls, pre-booking limits, branding, shipping thresholds, and concierge logistics.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: STOREFRONT MODE & LAUNCH CONTROLLER (COMMAND CENTER) */}
      {/* ========================================================================= */}
      <div
        className={`bg-[#0d0d0d] border rounded-lg p-6 space-y-6 transition-all duration-300 relative overflow-hidden ${
          isMaintenanceActive
            ? 'border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
            : isPreLaunchActive
            ? 'border-snake-green/60 shadow-[0_0_35px_rgba(4,252,33,0.12)] ring-1 ring-snake-green/40'
            : 'border-neutral-800/80 hover:border-neutral-700'
        }`}
      >
        {/* Subtle accent ambient glow */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-opacity ${
            isMaintenanceActive
              ? 'bg-amber-500/10 opacity-100'
              : isPreLaunchActive
              ? 'bg-snake-green/10 opacity-100'
              : 'bg-emerald-500/5 opacity-40'
          }`}
        />

        {/* Card Header & Global Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-bold uppercase text-sm">
              <Sliders
                size={18}
                className={
                  isMaintenanceActive
                    ? 'text-amber-400 animate-pulse'
                    : isPreLaunchActive
                    ? 'text-snake-green animate-pulse'
                    : 'text-emerald-400'
                }
              />
              <span className="tracking-wide">STOREFRONT MODE &amp; LAUNCH CONTROLLER</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Control the customer-facing experience across Pre-Launch exclusivity, unrestricted Live access, or Maintenance holding.
            </p>
          </div>

          {/* Current Status Badge */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider ${
                isMaintenanceActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : isPreLaunchActive
                  ? 'bg-snake-green/15 text-snake-green border-snake-green/40 shadow-[0_0_12px_rgba(4,252,33,0.2)]'
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isMaintenanceActive
                    ? 'bg-amber-400 animate-ping'
                    : isPreLaunchActive
                    ? 'bg-snake-green animate-ping'
                    : 'bg-emerald-400'
                }`}
              />
              <span>
                {isMaintenanceActive
                  ? 'MODE: MAINTENANCE (LOCKED)'
                  : isPreLaunchActive
                  ? 'MODE: PRE-LAUNCH (ACTIVE)'
                  : 'MODE: LIVE STORE (UNRESTRICTED)'}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {modeFeedback && (
          <div
            className={`p-3.5 rounded text-xs flex items-center justify-between gap-3 border ${
              modeFeedback.type === 'success'
                ? 'bg-snake-green/10 border-snake-green/40 text-snake-green'
                : 'bg-red-500/10 border-red-500/40 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {modeFeedback.type === 'success' ? (
                <Check size={16} className="flex-shrink-0" />
              ) : (
                <AlertTriangle size={16} className="flex-shrink-0" />
              )}
              <span>{modeFeedback.message}</span>
            </div>
            <button
              onClick={() => setModeFeedback(null)}
              className="text-neutral-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 3-WAY MUTUALLY EXCLUSIVE STOREFRONT MODES */}
        <div className="space-y-2">
          <label className="text-neutral-400 uppercase text-[10px] tracking-wider font-semibold block">
            SELECT STOREFRONT MODE (AUTHORITATIVE STATE)
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Mode 1: PRE-LAUNCH */}
            <div
              onClick={() => {
                if (storefrontMode !== 'PRE_LAUNCH') {
                  setModeConfirmModal('PRE_LAUNCH');
                }
              }}
              className={`p-4 rounded-lg border cursor-pointer transition-all relative flex flex-col justify-between ${
                isPreLaunchActive
                  ? 'bg-snake-green/10 border-snake-green shadow-[0_0_20px_rgba(4,252,33,0.15)] ring-1 ring-snake-green'
                  : 'bg-black/60 border-neutral-800 hover:border-neutral-600 hover:bg-white/[0.02]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className={isPreLaunchActive ? 'text-snake-green' : 'text-neutral-400'} />
                    <span className={`font-bold uppercase text-xs ${isPreLaunchActive ? 'text-white' : 'text-neutral-300'}`}>
                      PRE-LAUNCH
                    </span>
                  </div>
                  {isPreLaunchActive && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-snake-green text-black uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Campaign hero, official launch countdown ticker, and exclusive pre-booking collection (max {preLaunchProductLimit} pieces).
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between text-[10px]">
                <span className="text-neutral-500">Live Bag: Disabled</span>
                <span className="text-snake-green font-semibold">Pre-Booking: ON</span>
              </div>
            </div>

            {/* Mode 2: LIVE */}
            <div
              onClick={() => {
                if (storefrontMode !== 'LIVE') {
                  setModeConfirmModal('LIVE');
                }
              }}
              className={`p-4 rounded-lg border cursor-pointer transition-all relative flex flex-col justify-between ${
                isLiveActive
                  ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500'
                  : 'bg-black/60 border-neutral-800 hover:border-neutral-600 hover:bg-white/[0.02]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className={isLiveActive ? 'text-emerald-400' : 'text-neutral-400'} />
                    <span className={`font-bold uppercase text-xs ${isLiveActive ? 'text-white' : 'text-neutral-300'}`}>
                      LIVE STORE
                    </span>
                  </div>
                  {isLiveActive && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-black uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Unrestricted public access. Normal browsing across all categories, instant add to bag, and direct checkout.
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-semibold">Full Catalog: Active</span>
                <span className="text-neutral-500">Direct Buy: ON</span>
              </div>
            </div>

            {/* Mode 3: MAINTENANCE */}
            <div
              onClick={() => {
                if (storefrontMode !== 'MAINTENANCE') {
                  setModeConfirmModal('MAINTENANCE');
                }
              }}
              className={`p-4 rounded-lg border cursor-pointer transition-all relative flex flex-col justify-between ${
                isMaintenanceActive
                  ? 'bg-amber-950/30 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500'
                  : 'bg-black/60 border-neutral-800 hover:border-neutral-600 hover:bg-white/[0.02]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className={isMaintenanceActive ? 'text-amber-400' : 'text-neutral-400'} />
                    <span className={`font-bold uppercase text-xs ${isMaintenanceActive ? 'text-white' : 'text-neutral-300'}`}>
                      MAINTENANCE
                    </span>
                  </div>
                  {isMaintenanceActive && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-black uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Storefront locked at Edge layer. All customer visits redirect to holding screen with HTTP 503.
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between text-[10px]">
                <span className="text-amber-400 font-semibold">Public: Intercepted</span>
                <span className="text-neutral-500">Admin: Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRE-LAUNCH STATUS SUMMARY TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Tile 1: Status */}
          <div className="p-3.5 bg-black border border-neutral-800 rounded-lg space-y-1">
            <span className="text-[9px] text-neutral-500 uppercase block">STORE STATUS</span>
            <span className="text-xs font-bold text-white block uppercase truncate">
              {storefrontMode.replace('_', '-')}
            </span>
            <div className="pt-1">
              {isPreLaunchActive ? (
                <Link
                  href="/pre-launch"
                  target="_blank"
                  className="text-[10px] text-snake-green hover:underline flex items-center gap-1"
                >
                  <span>Preview Drop</span>
                  <ExternalLink size={10} />
                </Link>
              ) : isMaintenanceActive ? (
                <Link
                  href="/maintenance"
                  target="_blank"
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Preview Lock</span>
                  <ExternalLink size={10} />
                </Link>
              ) : (
                <Link
                  href="/"
                  target="_blank"
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>View Live</span>
                  <ExternalLink size={10} />
                </Link>
              )}
            </div>
          </div>

          {/* Tile 2: Pre-Launch Products */}
          <div className="p-3.5 bg-black border border-neutral-800 rounded-lg space-y-1">
            <span className="text-[9px] text-neutral-500 uppercase block">DROP GARMENTS</span>
            <span className="text-xs font-bold text-white block">
              <span className="text-snake-green">{preLaunchProductsCount}</span> / {preLaunchProductLimit} PIECES
            </span>
            <div className="pt-1">
              <Link
                href="/admin/products"
                className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <span>Edit Drop</span>
                <ArrowRight size={10} />
              </Link>
            </div>
          </div>

          {/* Tile 3: Pre-Bookings */}
          <div className="p-3.5 bg-black border border-neutral-800 rounded-lg space-y-1">
            <span className="text-[9px] text-neutral-500 uppercase block">PRE-BOOKINGS</span>
            <span className="text-xs font-bold text-white block">
              <span className="text-snake-green">{preBookings.length}</span> RESERVED
            </span>
            <div className="pt-1">
              <Link
                href="/admin/pre-bookings"
                className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight size={10} />
              </Link>
            </div>
          </div>

          {/* Tile 4: Official Drop Date */}
          <div className="p-3.5 bg-black border border-neutral-800 rounded-lg space-y-1">
            <span className="text-[9px] text-neutral-500 uppercase block">OFFICIAL LAUNCH</span>
            <span className="text-xs font-bold text-white block truncate">
              {launchDate}
            </span>
            <span className="text-[10px] text-neutral-500 block truncate">
              {launchTime} {launchTimezone.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* LAUNCH CONFIGURATION PANEL (DATE, TIME, TIMEZONE, AUTO-LAUNCH & LIMITS) */}
        <div className="p-5 bg-neutral-950 border border-neutral-800/80 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-snake-green" />
              <span className="text-white font-bold uppercase text-xs">
                OFFICIAL DROP CALENDAR &amp; PRE-LAUNCH PARAMETERS
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">
              Synchronized with edge countdown ticker
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Launch Date */}
            <div className="space-y-1.5">
              <label className="text-neutral-400 uppercase text-[10px] font-semibold block">
                LAUNCH DATE
              </label>
              <input
                type="date"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none font-mono"
              />
            </div>

            {/* Launch Time */}
            <div className="space-y-1.5">
              <label className="text-neutral-400 uppercase text-[10px] font-semibold block">
                LAUNCH TIME
              </label>
              <input
                type="text"
                value={launchTime}
                onChange={(e) => setLaunchTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none font-mono"
              />
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="text-neutral-400 uppercase text-[10px] font-semibold block">
                TIMEZONE
              </label>
              <select
                value={launchTimezone}
                onChange={(e) => setLaunchTimezone(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none font-mono cursor-pointer"
              >
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT)</option>
                <option value="Asia/Dubai (GST)">Asia/Dubai (GST)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Max Pre-Launch Products Limit */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  MAX PRE-LAUNCH PRODUCTS (LIMIT)
                </label>
                <span className="text-[10px] text-neutral-500">Default: 6</span>
              </div>
              <input
                type="number"
                min={1}
                max={20}
                value={preLaunchProductLimit}
                onChange={(e) => setPreLaunchProductLimit(Number(e.target.value))}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none font-mono"
              />
              <span className="text-[10px] text-neutral-500 block">
                Enforced in Products catalog when toggling garments into the Pre-Launch drop.
              </span>
            </div>

            {/* Automatic Launch Switch */}
            <div className="space-y-1.5 flex flex-col justify-between">
              <div className="p-3 bg-black border border-neutral-800 rounded flex items-center justify-between">
                <div>
                  <label htmlFor="autoLaunchToggle" className="text-white font-bold uppercase text-[11px] block cursor-pointer">
                    AUTOMATIC STORE TRANSITION
                  </label>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    Automatically flip store to LIVE mode when countdown hits zero.
                  </span>
                </div>
                <input
                  id="autoLaunchToggle"
                  type="checkbox"
                  checked={automaticLaunch}
                  onChange={(e) => setAutomaticLaunch(e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-snake-green focus:ring-snake-green focus:ring-offset-0 accent-snake-green cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Save Launch Schedule Trigger */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveLaunchSettings}
              disabled={isUpdatingMode}
              className="px-5 py-2.5 bg-snake-green hover:bg-white text-black font-bold uppercase text-xs rounded transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdatingMode ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Check size={13} />
              )}
              <span>SAVE LAUNCH PARAMETERS</span>
            </button>
          </div>
        </div>

        {/* MAINTENANCE HOLDING SCREEN SUB-PANEL */}
        <div className="p-5 bg-neutral-950 border border-neutral-800/80 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-400" />
              <span className="text-white font-bold uppercase text-xs">
                MAINTENANCE HOLDING SCREEN CONFIGURATION
              </span>
            </div>
            <span className="text-[10px] text-neutral-500">
              Active only when mode is MAINTENANCE
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-neutral-400 uppercase text-[10px] font-semibold block">
              PUBLIC HOLDING MESSAGE
            </label>
            <textarea
              rows={2}
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Enter message for customers..."
              className="w-full bg-black border border-neutral-800 p-3 text-white rounded text-xs focus:border-snake-green focus:outline-none font-mono leading-relaxed"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-neutral-500 uppercase">PRESETS:</span>
              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    'We are currently enhancing our digital atelier to elevate your experience. SuperSnake will return shortly.'
                  )
                }
                className="text-[10px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1 rounded text-neutral-300 hover:text-white transition-colors"
              >
                Scheduled Atelier Upgrade
              </button>
              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    'The atelier is temporarily locked in preparation for an exclusive heavyweight drop. Inventory access will open momentarily.'
                  )
                }
                className="text-[10px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1 rounded text-neutral-300 hover:text-white transition-colors"
              >
                Private Drop Curation
              </button>
              <button
                type="button"
                onClick={() =>
                  handlePresetSelect(
                    'Undergoing routine security calibration and payment gateway optimization. Check back shortly.'
                  )
                }
                className="text-[10px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1 rounded text-neutral-300 hover:text-white transition-colors"
              >
                Security Calibration
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-neutral-400 uppercase text-[10px] font-semibold block">
                ESTIMATED RESTORATION DURATION
              </label>
              <select
                value={durationPreset}
                onChange={(e: any) => setDurationPreset(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
              >
                <option value="none">None / Indefinite (Statement only)</option>
                <option value="15m">+15 Minutes (Rapid update)</option>
                <option value="30m">+30 Minutes (Standard maintenance)</option>
                <option value="1h">+1 Hour (Drop preparation)</option>
                <option value="2h">+2 Hours (Extended curation)</option>
                <option value="4h">+4 Hours (Major overhaul)</option>
                <option value="custom">Custom Date &amp; Time</option>
              </select>
            </div>

            {durationPreset === 'custom' && (
              <div className="space-y-1.5">
                <label className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  CUSTOM RESTORATION TIMESTAMP
                </label>
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveMaintenanceDetails}
              disabled={isUpdatingMode}
              className="px-4 py-2 border border-neutral-700 hover:border-snake-green text-neutral-300 hover:text-snake-green rounded text-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={12} className={isUpdatingMode ? 'animate-spin' : ''} />
              <span>UPDATE HOLDING DETAILS</span>
            </button>
          </div>
        </div>

        {/* Audit Trail & Safeguard Footer */}
        <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-neutral-500">
          <div className="flex items-center gap-2">
            <Info size={13} className="text-neutral-400" />
            <span>
              Configured by:{' '}
              <strong className="text-neutral-300">
                {storefrontConfig?.updatedBy || maintenanceConfig?.updatedBy || currentAdminEmail}
              </strong>{' '}
              {storefrontConfig?.updatedAt && (
                <span>
                  ({new Date(storefrontConfig.updatedAt).toLocaleString('en-IN')})
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldCheck size={13} className="text-snake-green" />
            <span>Edge Middleware active • Admin routes (/admin/*) are bypass-exempt</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONFIRMATION MODALS (FOR SWITCHING MODES) */}
      {/* ========================================================================= */}
      {modeConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-lg max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-full flex-shrink-0 ${
                  modeConfirmModal === 'MAINTENANCE'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : modeConfirmModal === 'PRE_LAUNCH'
                    ? 'bg-snake-green/20 text-snake-green border border-snake-green/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {modeConfirmModal === 'MAINTENANCE' ? (
                  <ShieldAlert size={24} />
                ) : modeConfirmModal === 'PRE_LAUNCH' ? (
                  <Calendar size={24} />
                ) : (
                  <Globe size={24} />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-display font-bold uppercase text-white tracking-tight">
                  {modeConfirmModal === 'MAINTENANCE'
                    ? 'ENABLE GLOBAL MAINTENANCE MODE?'
                    : modeConfirmModal === 'PRE_LAUNCH'
                    ? 'ACTIVATE PRE-LAUNCH DROP MODE?'
                    : 'SWITCH STOREFRONT TO FULL LIVE MODE?'}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                  {modeConfirmModal === 'MAINTENANCE' ? (
                    <>
                      All public customer traffic (<code>/</code>, <code>/shop</code>, <code>/cart</code>,{' '}
                      <code>/checkout</code>, etc.) will be immediately blocked at the Next.js Edge layer.
                      Customers will see the private curation holding screen. Admin portal routes (/admin) remain online.
                    </>
                  ) : modeConfirmModal === 'PRE_LAUNCH' ? (
                    <>
                      Storefront root (<code>/</code>) will present the campaign hero, live countdown ticker, and
                      the exclusive First Drop pre-booking collection. Live shopping routes (<code>/shop</code>, <code>/cart</code>, <code>/checkout</code>)
                      will gracefully redirect to <code>/pre-launch</code>.
                    </>
                  ) : (
                    <>
                      Full unrestricted public access will be granted. The pre-launch holding/countdown experience
                      will deactivate, and customers will be able to browse the entire catalog, add items to bag, and complete purchases.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="p-3 bg-black border border-neutral-800/80 rounded text-[11px] text-neutral-400 space-y-1">
              <div className="text-neutral-300 font-bold uppercase text-[10px]">
                ADMINISTRATOR CONFIRMATION
              </div>
              <div>Admin Identity: <strong className="text-white">{currentAdminEmail}</strong></div>
              <div>Target Storefront Mode: <strong className="text-snake-green">{modeConfirmModal}</strong></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModeConfirmModal(null)}
                disabled={isUpdatingMode}
                className="px-4 py-2.5 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white rounded text-xs uppercase font-bold transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode(modeConfirmModal)}
                disabled={isUpdatingMode}
                className={`px-5 py-2.5 rounded text-xs uppercase font-bold transition-colors flex items-center gap-2 disabled:opacity-50 ${
                  modeConfirmModal === 'MAINTENANCE'
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : modeConfirmModal === 'PRE_LAUNCH'
                    ? 'bg-snake-green hover:bg-white text-black shadow-[0_0_15px_rgba(4,252,33,0.3)]'
                    : 'bg-emerald-500 hover:bg-white text-black'
                }`}
              >
                {isUpdatingMode ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>
                  {isUpdatingMode
                    ? 'SWITCHING MODE...'
                    : modeConfirmModal === 'MAINTENANCE'
                    ? 'CONFIRM MAINTENANCE'
                    : modeConfirmModal === 'PRE_LAUNCH'
                    ? 'CONFIRM PRE-LAUNCH'
                    : 'CONFIRM GO LIVE'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: GENERAL ATELIER SETTINGS */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveGeneralSettings} className="space-y-6 text-xs">
        {/* Brand & Atelier Profile */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-neutral-800 pb-2">
            <Store size={16} className="text-snake-green" />
            <span>BRAND &amp; CONCIERGE PROFILE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">BRAND IDENTITY</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">CUSTOMER SUPPORT EMAIL</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-neutral-400 uppercase">ATELIER STUDIO LOCATION</label>
              <input
                type="text"
                value={studioLocation}
                onChange={(e) => setStudioLocation(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Fulfillment Rules */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-neutral-800 pb-2">
            <Truck size={16} className="text-snake-green" />
            <span>SHIPPING &amp; LOGISTICS POLICIES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">FREE SHIPPING THRESHOLD (₹)</label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">TRANSIT TIMELINE</label>
              <input
                type="text"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">LOGISTICS PARTNER</label>
              <input
                type="text"
                value={courierPartner}
                onChange={(e) => setCourierPartner(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
          </div>
        </div>

        {/* Legal & Grievance Disclosures */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-neutral-800 pb-2">
            <ShieldCheck size={16} className="text-snake-green" />
            <span>LEGAL &amp; GRIEVANCE DISCLOSURES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">LEGAL BUSINESS ENTITY NAME</label>
              <input
                type="text"
                value={legalBusinessName}
                onChange={(e) => setLegalBusinessName(e.target.value)}
                placeholder="e.g. SuperSnake Apparel Private Limited"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">GSTIN (TAX IDENTIFIER)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 29ABCDE1234F1Z5"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">GRIEVANCE OFFICER NAME</label>
              <input
                type="text"
                value={grievanceOfficer}
                onChange={(e) => setGrievanceOfficer(e.target.value)}
                placeholder="Designated Officer Name"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">GRIEVANCE EMAIL ADDRESS</label>
              <input
                type="email"
                value={grievanceEmail}
                onChange={(e) => setGrievanceEmail(e.target.value)}
                placeholder="support@supersnake.in"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-neutral-400 uppercase">LEGAL JURISDICTION / REGISTERED OFFICE</label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka, India"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
          </div>
        </div>

        {/* Atelier Security */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-neutral-800 pb-2">
            <ShieldCheck size={16} className="text-snake-green" />
            <span>ATELIER SECURITY &amp; ACCESS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">ADMIN PASSCODE</label>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
              <span className="text-[10px] text-neutral-500 block">
                Protects `/admin` actions and inventory updates.
              </span>
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">SECURITY STATUS</label>
              <div className="px-3 py-2 bg-black border border-neutral-800 rounded text-neutral-300 flex items-center justify-between">
                <span>Hardened (Zero Key Exposure)</span>
                <span className="w-2 h-2 rounded-full bg-snake-green animate-pulse" />
              </div>
              <span className="text-[10px] text-neutral-500 block">
                All API keys &amp; secrets are isolated server-side.
              </span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-between items-center pt-2">
          {saved && (
            <span className="text-snake-green flex items-center gap-1 font-bold">
              <Check size={14} /> SETTINGS SAVED TO ATELIER
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-3 bg-snake-green text-black font-bold uppercase rounded hover:bg-white transition-colors"
          >
            SAVE STORE SETTINGS
          </button>
        </div>
      </form>
    </div>
  );
}
