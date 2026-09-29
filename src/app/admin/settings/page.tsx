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
} from 'lucide-react';
import { BRAND } from '@/lib/design-tokens';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

export default function AdminSettingsPage() {
  const {
    maintenanceConfig,
    updateMaintenanceConfig,
    refreshMaintenanceConfig,
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

  // Maintenance Mode state
  const [maintenanceMessage, setMaintenanceMessage] = useState(
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

  // Sync maintenance settings when store context updates
  useEffect(() => {
    if (maintenanceConfig) {
      if (maintenanceConfig.maintenanceMessage) {
        setMaintenanceMessage(maintenanceConfig.maintenanceMessage);
      }
      if (maintenanceConfig.estimatedRestoreTime) {
        try {
          const iso = new Date(maintenanceConfig.estimatedRestoreTime).toISOString();
          // Format for datetime-local: YYYY-MM-DDTHH:mm
          setCustomDateTime(iso.slice(0, 16));
        } catch (e) {}
      }
    }
  }, [maintenanceConfig]);

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

  const handleToggleMaintenance = async (targetMode: boolean) => {
    setIsUpdatingMaintenance(true);
    setMaintenanceFeedback(null);

    const calculatedTime = targetMode ? calculateTargetRestoreTime() : null;

    try {
      const result = await updateMaintenanceConfig(
        {
          maintenanceMode: targetMode,
          maintenanceMessage: maintenanceMessage.trim() || undefined,
          estimatedRestoreTime: calculatedTime,
        },
        currentAdminEmail
      );

      if (result.success) {
        setMaintenanceFeedback({
          type: 'success',
          message: targetMode
            ? 'STOREFRONT LOCKED: Global Maintenance Mode successfully activated.'
            : 'STOREFRONT RESTORED: Maintenance Mode deactivated. Public access live.',
        });
        setConfirmModal(null);
      } else {
        setMaintenanceFeedback({
          type: 'error',
          message: result.error || 'Failed to update maintenance mode.',
        });
      }
    } catch (err: any) {
      setMaintenanceFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsUpdatingMaintenance(false);
      setTimeout(() => setMaintenanceFeedback(null), 5000);
    }
  };

  const handleSaveMaintenanceDetails = async () => {
    setIsUpdatingMaintenance(true);
    setMaintenanceFeedback(null);

    const calculatedTime = calculateTargetRestoreTime();

    try {
      const result = await updateMaintenanceConfig(
        {
          maintenanceMessage: maintenanceMessage.trim(),
          estimatedRestoreTime: calculatedTime,
        },
        currentAdminEmail
      );

      if (result.success) {
        setMaintenanceFeedback({
          type: 'success',
          message: 'Maintenance holding message and timeline updated successfully.',
        });
      } else {
        setMaintenanceFeedback({
          type: 'error',
          message: result.error || 'Failed to update details.',
        });
      }
    } catch (err: any) {
      setMaintenanceFeedback({
        type: 'error',
        message: err.message || 'Failed to update maintenance details.',
      });
    } finally {
      setIsUpdatingMaintenance(false);
      setTimeout(() => setMaintenanceFeedback(null), 5000);
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

  const isMaintenanceActive = Boolean(maintenanceConfig?.maintenanceMode);

  return (
    <div className="space-y-8 font-mono max-w-4xl pb-16">
      {/* Page Title */}
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
          ATELIER STORE SETTINGS
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage storefront lockdown controls, branding, shipping thresholds, and concierge logistics.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: GLOBAL MAINTENANCE MODE CONTROLLER (COMMAND CARD) */}
      {/* ========================================================================= */}
      <div
        className={`bg-[#0d0d0d] border rounded-lg p-6 space-y-6 transition-all duration-300 relative overflow-hidden ${
          isMaintenanceActive
            ? 'border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
            : 'border-neutral-800/80 hover:border-neutral-700'
        }`}
      >
        {/* Subtle accent glow */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-opacity ${
            isMaintenanceActive ? 'bg-amber-500/10 opacity-100' : 'bg-snake-green/5 opacity-40'
          }`}
        />

        {/* Card Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-bold uppercase text-sm">
              <Power
                size={18}
                className={isMaintenanceActive ? 'text-amber-400 animate-pulse' : 'text-snake-green'}
              />
              <span className="tracking-wide">GLOBAL MAINTENANCE MODE CONTROLLER</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              When enabled, Next.js Edge Middleware intercepts all customer URLs to the private atelier holding page.
            </p>
          </div>

          {/* Current Status Pill */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider ${
                isMaintenanceActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-950/40 text-snake-green border-snake-green/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isMaintenanceActive ? 'bg-amber-400 animate-ping' : 'bg-snake-green'
                }`}
              />
              <span>{isMaintenanceActive ? 'LOCKED // UNDER MAINTENANCE' : 'OPERATIONAL // STOREFRONT LIVE'}</span>
            </div>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {maintenanceFeedback && (
          <div
            className={`p-3.5 rounded text-xs flex items-center justify-between gap-3 border ${
              maintenanceFeedback.type === 'success'
                ? 'bg-snake-green/10 border-snake-green/40 text-snake-green'
                : 'bg-red-500/10 border-red-500/40 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {maintenanceFeedback.type === 'success' ? (
                <Check size={16} className="flex-shrink-0" />
              ) : (
                <AlertTriangle size={16} className="flex-shrink-0" />
              )}
              <span>{maintenanceFeedback.message}</span>
            </div>
            <button
              onClick={() => setMaintenanceFeedback(null)}
              className="text-neutral-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Master Action Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-black border border-neutral-800">
          <div className="space-y-1">
            <span className="text-white font-bold text-xs uppercase tracking-wider block">
              {isMaintenanceActive ? 'STOREFRONT IS CURRENTLY LOCKED' : 'STOREFRONT IS LIVE TO THE PUBLIC'}
            </span>
            <span className="text-[11px] text-neutral-400 block">
              {isMaintenanceActive
                ? 'All customer visits (/, /shop, /cart, /checkout, etc.) are blocked at the edge with HTTP 307 + 503.'
                : 'Customers can browse collections, place orders, and manage accounts normally.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/maintenance"
              target="_blank"
              className="px-3.5 py-2 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white rounded text-xs inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>PREVIEW HOLDING PAGE</span>
              <ExternalLink size={13} />
            </Link>

            {isMaintenanceActive ? (
              <button
                type="button"
                onClick={() => setConfirmModal('disable')}
                disabled={isUpdatingMaintenance}
                className="px-5 py-2.5 bg-snake-green hover:bg-white text-black font-bold uppercase text-xs rounded transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                <Power size={14} />
                <span>RESTORE PUBLIC ACCESS</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmModal('enable')}
                disabled={isUpdatingMaintenance}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase text-xs rounded transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                <Power size={14} />
                <span>ACTIVATE MAINTENANCE MODE</span>
              </button>
            )}
          </div>
        </div>

        {/* Customization Details (Message & Restoration Window) */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-neutral-300 uppercase text-xs font-semibold">
                PUBLIC HOLDING MESSAGE
              </label>
              <span className="text-[10px] text-neutral-500">
                Displayed prominently to customers on `/maintenance`
              </span>
            </div>
            <textarea
              rows={3}
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
                Security &amp; System Calibration
              </button>
            </div>
          </div>

          {/* Restoration Window & Countdown Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-neutral-300 uppercase text-xs font-semibold block">
                ESTIMATED RESTORATION DURATION
              </label>
              <select
                value={durationPreset}
                onChange={(e: any) => setDurationPreset(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded text-xs focus:border-snake-green focus:outline-none"
              >
                <option value="none">None / Indefinite (Temporary statement)</option>
                <option value="15m">+15 Minutes (Rapid update)</option>
                <option value="30m">+30 Minutes (Standard maintenance)</option>
                <option value="1h">+1 Hour (Drop preparation)</option>
                <option value="2h">+2 Hours (Extended curation)</option>
                <option value="4h">+4 Hours (Major overhaul)</option>
                <option value="custom">Custom Date &amp; Time (Scheduled window)</option>
              </select>
            </div>

            {durationPreset === 'custom' && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="text-neutral-300 uppercase text-xs font-semibold block">
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

          {/* If maintenance is active, allow updating message & duration in-flight */}
          {isMaintenanceActive && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveMaintenanceDetails}
                disabled={isUpdatingMaintenance}
                className="px-4 py-2 border border-neutral-700 hover:border-snake-green text-neutral-300 hover:text-snake-green rounded text-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={isUpdatingMaintenance ? 'animate-spin' : ''} />
                <span>UPDATE HOLDING DETAILS</span>
              </button>
            </div>
          )}
        </div>

        {/* Audit Trail & Safeguard Footer */}
        <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-neutral-500">
          <div className="flex items-center gap-2">
            <Info size={13} className="text-neutral-400" />
            <span>
              Last updated by:{' '}
              <strong className="text-neutral-300">
                {maintenanceConfig?.updatedBy || 'admin'}
              </strong>{' '}
              {maintenanceConfig?.updatedAt && (
                <span>
                  ({new Date(maintenanceConfig.updatedAt).toLocaleString('en-IN')})
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldCheck size={13} className="text-snake-green" />
            <span>Admin routes (/admin/*) remain 100% accessible at all times</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONFIRMATION MODALS */}
      {/* ========================================================================= */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-lg max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-full flex-shrink-0 ${
                  confirmModal === 'enable'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-snake-green/20 text-snake-green border border-snake-green/30'
                }`}
              >
                {confirmModal === 'enable' ? <ShieldAlert size={24} /> : <Power size={24} />}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-display font-bold uppercase text-white tracking-tight">
                  {confirmModal === 'enable'
                    ? 'LOCK STOREFRONT UNDER MAINTENANCE?'
                    : 'RESTORE PUBLIC STOREFRONT ACCESS?'}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {confirmModal === 'enable' ? (
                    <>
                      You are about to activate <strong>Global Maintenance Mode</strong>. All
                      customer-facing pages (<code>/</code>, <code>/shop</code>, <code>/cart</code>,{' '}
                      <code>/checkout</code>, <code>/account</code>, etc.) will be immediately locked
                      at the server middleware layer. Customers will see your private curation holding
                      screen. Customer API routes will return <code>503 Service Unavailable</code>.
                    </>
                  ) : (
                    <>
                      You are about to deactivate Maintenance Mode. Full public access will be
                      immediately restored for all customers across all storefront routes.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="p-3 bg-black border border-neutral-800/80 rounded text-[11px] text-neutral-400 space-y-1">
              <div className="text-neutral-300 font-bold uppercase text-[10px]">
                SAFETY CONFIRMATION
              </div>
              <div>Admin Identity: <strong className="text-white">{currentAdminEmail}</strong></div>
              <div>Admin Portal (/admin): <strong className="text-snake-green">Remains fully online</strong></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                disabled={isUpdatingMaintenance}
                className="px-4 py-2.5 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white rounded text-xs uppercase font-bold transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>

              {confirmModal === 'enable' ? (
                <button
                  type="button"
                  onClick={() => handleToggleMaintenance(true)}
                  disabled={isUpdatingMaintenance}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded text-xs uppercase font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdatingMaintenance ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Power size={14} />
                  )}
                  <span>{isUpdatingMaintenance ? 'LOCKING ATELIER...' : 'CONFIRM LOCKDOWN'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleMaintenance(false)}
                  disabled={isUpdatingMaintenance}
                  className="px-5 py-2.5 bg-snake-green hover:bg-white text-black rounded text-xs uppercase font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdatingMaintenance ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Power size={14} />
                  )}
                  <span>{isUpdatingMaintenance ? 'RESTORING...' : 'CONFIRM & RESTORE ACCESS'}</span>
                </button>
              )}
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
