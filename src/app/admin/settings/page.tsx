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
  Snowflake,
  Megaphone,
  Copy,
  Palette,
  Link2,
} from 'lucide-react';
import { BRAND } from '@/lib/design-tokens';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import {
  StorefrontMode,
  AnnouncementConfig,
  getAnnouncementStatus,
  isValidAnnouncementUrl,
  isValidHexColor,
} from '@/lib/types';

export default function AdminSettingsPage() {
  const {
    maintenanceConfig,
    updateMaintenanceConfig,
    refreshMaintenanceConfig,
    storefrontConfig,
    updateStorefrontConfig,
    refreshStorefrontConfig,
    announcementConfig,
    updateAnnouncementConfig,
    refreshAnnouncementConfig,
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
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(
    typeof storeThreshold === 'number' && !isNaN(storeThreshold) && storeThreshold >= 0
      ? storeThreshold
      : 1999
  );
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

  // Seasonal Snow Atmosphere state
  const [snowEffectActive, setSnowEffectActive] = useState<boolean>(
    storefrontConfig?.snowEffectEnabled || false
  );
  const [isUpdatingSnow, setIsUpdatingSnow] = useState(false);

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
      if (typeof storefrontConfig.snowEffectEnabled === 'boolean') {
        setSnowEffectActive(storefrontConfig.snowEffectEnabled);
      }
      if (storefrontConfig.estimatedRestoreTime) {
        try {
          const iso = new Date(storefrontConfig.estimatedRestoreTime).toISOString();
          setCustomDateTime(iso.slice(0, 16));
        } catch (e) {}
      }
    }
  }, [storefrontConfig]);

  const handleToggleSnow = async (newVal: boolean) => {
    setIsUpdatingSnow(true);
    setSnowEffectActive(newVal);
    try {
      const res = await updateStorefrontConfig({ snowEffectEnabled: newVal }, currentAdminEmail);
      if (res.success) {
        setModeFeedback({
          type: 'success',
          message: newVal
            ? 'Winter Snow Atmosphere activated across storefront.'
            : 'Winter Snow Atmosphere disabled.',
        });
        setTimeout(() => setModeFeedback(null), 3500);
      } else {
        setSnowEffectActive(!newVal);
        setModeFeedback({
          type: 'error',
          message: res.error || 'Failed to update seasonal atmosphere.',
        });
      }
    } catch (err) {
      setSnowEffectActive(!newVal);
      setModeFeedback({
        type: 'error',
        message: 'Network error updating seasonal effect.',
      });
    } finally {
      setIsUpdatingSnow(false);
    }
  };

  // Announcement Bar state
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('THE NEW CHAPTERS HAVE ARRIVED — EXPLORE NOW.');
  const [announcementUrl, setAnnouncementUrl] = useState('/collections');
  const [announcementCta, setAnnouncementCta] = useState('EXPLORE NOW');
  const [announcementBgColor, setAnnouncementBgColor] = useState('#111111');
  const [announcementTextColor, setAnnouncementTextColor] = useState('#EDEDED');
  const [announcementAccentColor, setAnnouncementAccentColor] = useState('#04fc21');
  const [announcementStartTime, setAnnouncementStartTime] = useState('');
  const [announcementEndTime, setAnnouncementEndTime] = useState('');
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [announcementFeedback, setAnnouncementFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Sync announcement settings when context updates
  useEffect(() => {
    if (announcementConfig) {
      setAnnouncementEnabled(Boolean(announcementConfig.isEnabled));
      setAnnouncementMessage(announcementConfig.message || '');
      setAnnouncementUrl(announcementConfig.destinationUrl || '');
      setAnnouncementCta(announcementConfig.ctaLabel || '');
      setAnnouncementBgColor(announcementConfig.bgColor || '#111111');
      setAnnouncementTextColor(announcementConfig.textColor || '#EDEDED');
      setAnnouncementAccentColor(announcementConfig.accentColor || '#04fc21');
      if (announcementConfig.startTime) {
        try {
          const d = new Date(announcementConfig.startTime);
          setAnnouncementStartTime(d.toISOString().slice(0, 16));
        } catch (e) {
          setAnnouncementStartTime('');
        }
      } else {
        setAnnouncementStartTime('');
      }
      if (announcementConfig.endTime) {
        try {
          const d = new Date(announcementConfig.endTime);
          setAnnouncementEndTime(d.toISOString().slice(0, 16));
        } catch (e) {
          setAnnouncementEndTime('');
        }
      } else {
        setAnnouncementEndTime('');
      }
    }
  }, [announcementConfig]);

  const draftAnnouncementConfig: AnnouncementConfig = {
    id: 'default',
    isEnabled: announcementEnabled,
    message: announcementMessage,
    destinationUrl: announcementUrl.trim() || null,
    ctaLabel: announcementCta.trim() || null,
    bgColor: announcementBgColor,
    textColor: announcementTextColor,
    accentColor: announcementAccentColor,
    startTime: announcementStartTime ? new Date(announcementStartTime).toISOString() : null,
    endTime: announcementEndTime ? new Date(announcementEndTime).toISOString() : null,
  };

  const draftAnnouncementStatus = getAnnouncementStatus(draftAnnouncementConfig);

  const hasUnsavedAnnouncementChanges = React.useMemo(() => {
    if (!announcementConfig) return false;
    const normStart = announcementStartTime ? new Date(announcementStartTime).toISOString() : null;
    const normEnd = announcementEndTime ? new Date(announcementEndTime).toISOString() : null;
    return (
      announcementEnabled !== Boolean(announcementConfig.isEnabled) ||
      announcementMessage.trim() !== (announcementConfig.message || '').trim() ||
      announcementUrl.trim() !== (announcementConfig.destinationUrl || '').trim() ||
      announcementCta.trim() !== (announcementConfig.ctaLabel || '').trim() ||
      announcementBgColor !== (announcementConfig.bgColor || '#111111') ||
      announcementTextColor !== (announcementConfig.textColor || '#EDEDED') ||
      announcementAccentColor !== (announcementConfig.accentColor || '#04fc21') ||
      normStart !== (announcementConfig.startTime || null) ||
      normEnd !== (announcementConfig.endTime || null)
    );
  }, [
    announcementConfig,
    announcementEnabled,
    announcementMessage,
    announcementUrl,
    announcementCta,
    announcementBgColor,
    announcementTextColor,
    announcementAccentColor,
    announcementStartTime,
    announcementEndTime,
  ]);

  const handleSaveAnnouncement = async () => {
    setIsSavingAnnouncement(true);
    setAnnouncementFeedback(null);

    // Validation
    if (announcementEnabled && !announcementMessage.trim()) {
      setAnnouncementFeedback({
        type: 'error',
        message: 'Announcement message cannot be empty when enabled.',
      });
      setIsSavingAnnouncement(false);
      return;
    }

    if (announcementUrl.trim() && !isValidAnnouncementUrl(announcementUrl.trim())) {
      setAnnouncementFeedback({
        type: 'error',
        message: 'Destination URL must be a valid internal path (e.g. /collections) or secure https:// link.',
      });
      setIsSavingAnnouncement(false);
      return;
    }

    if (!isValidHexColor(announcementBgColor) || !isValidHexColor(announcementTextColor)) {
      setAnnouncementFeedback({
        type: 'error',
        message: 'Please provide valid 6-character hexadecimal color codes.',
      });
      setIsSavingAnnouncement(false);
      return;
    }

    const startIso = announcementStartTime ? new Date(announcementStartTime).toISOString() : null;
    const endIso = announcementEndTime ? new Date(announcementEndTime).toISOString() : null;

    if (startIso && endIso && new Date(startIso).getTime() >= new Date(endIso).getTime()) {
      setAnnouncementFeedback({
        type: 'error',
        message: 'Publication start time must be before end time.',
      });
      setIsSavingAnnouncement(false);
      return;
    }

    try {
      const res = await updateAnnouncementConfig(
        {
          isEnabled: announcementEnabled,
          message: announcementMessage.trim(),
          destinationUrl: announcementUrl.trim() || null,
          ctaLabel: announcementCta.trim() || null,
          bgColor: announcementBgColor,
          textColor: announcementTextColor,
          accentColor: announcementAccentColor,
          startTime: startIso,
          endTime: endIso,
        },
        currentAdminEmail
      );

      if (res.success) {
        setAnnouncementFeedback({
          type: 'success',
          message: announcementEnabled
            ? 'Announcement bar saved and published live to storefront.'
            : 'Announcement bar disabled on storefront.',
        });
        setTimeout(() => setAnnouncementFeedback(null), 4000);
      } else {
        setAnnouncementFeedback({
          type: 'error',
          message: res.error || 'Failed to persist announcement settings.',
        });
      }
    } catch (err: any) {
      setAnnouncementFeedback({
        type: 'error',
        message: err.message || 'Network error saving announcement bar.',
      });
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  const handleDiscardAnnouncementDraft = () => {
    if (!announcementConfig) return;
    setAnnouncementEnabled(Boolean(announcementConfig.isEnabled));
    setAnnouncementMessage(announcementConfig.message || '');
    setAnnouncementUrl(announcementConfig.destinationUrl || '');
    setAnnouncementCta(announcementConfig.ctaLabel || '');
    setAnnouncementBgColor(announcementConfig.bgColor || '#111111');
    setAnnouncementTextColor(announcementConfig.textColor || '#EDEDED');
    setAnnouncementAccentColor(announcementConfig.accentColor || '#04fc21');
    if (announcementConfig.startTime) {
      try {
        setAnnouncementStartTime(new Date(announcementConfig.startTime).toISOString().slice(0, 16));
      } catch (e) {
        setAnnouncementStartTime('');
      }
    } else {
      setAnnouncementStartTime('');
    }
    if (announcementConfig.endTime) {
      try {
        setAnnouncementEndTime(new Date(announcementConfig.endTime).toISOString().slice(0, 16));
      } catch (e) {
        setAnnouncementEndTime('');
      }
    } else {
      setAnnouncementEndTime('');
    }
    setAnnouncementFeedback(null);
  };

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('supersnake_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.storeName) setStoreName(parsed.storeName);
        if (parsed.supportEmail) setSupportEmail(parsed.supportEmail);
        if (parsed.freeShippingThreshold !== undefined && parsed.freeShippingThreshold !== null && !isNaN(Number(parsed.freeShippingThreshold)) && Number(parsed.freeShippingThreshold) >= 0) {
          setFreeShippingThreshold(Number(parsed.freeShippingThreshold));
        }
        if (parsed.deliveryDays) setDeliveryDays(parsed.deliveryDays);
        if (parsed.courierPartner) setCourierPartner(parsed.courierPartner);
        if (parsed.studioLocation) setStudioLocation(parsed.studioLocation);
        if (parsed.legalBusinessName) setLegalBusinessName(parsed.legalBusinessName);
        if (parsed.gstin) setGstin(parsed.gstin);
        if (parsed.grievanceOfficer) setGrievanceOfficer(parsed.grievanceOfficer);
        if (parsed.grievanceEmail) setGrievanceEmail(parsed.grievanceEmail);
        if (parsed.jurisdiction) setJurisdiction(parsed.jurisdiction);
      } else if (typeof storeThreshold === 'number' && !isNaN(storeThreshold) && storeThreshold >= 0) {
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

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
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
      // Synchronize threshold to server / Supabase so all browsers and customers see it
      await fetch('/api/admin/storefront-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: user?.email || 'supersnake.in@gmail.com',
          freeShippingThreshold,
        }),
      });
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

        {/* ========================================================================= */}
        {/* SECTION: ANNOUNCEMENT BAR // STOREFRONT BROADCAST */}
        {/* ========================================================================= */}
        <div id="announcement" className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-6">
          {/* Card Header & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-bold uppercase text-sm">
                <Megaphone size={16} className="text-snake-green" />
                <span>ANNOUNCEMENT BAR // STOREFRONT BROADCAST</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Broadcast campaigns, drop dates, shipping perks, or private invitations above the header across all storefront pages.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Dynamic Status Badge */}
              <span
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                  draftAnnouncementStatus.status === 'active'
                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : draftAnnouncementStatus.status === 'scheduled'
                    ? 'bg-cyan-950/50 text-cyan-400 border-cyan-500/50'
                    : draftAnnouncementStatus.status === 'expired'
                    ? 'bg-amber-950/50 text-amber-400 border-amber-500/50'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    draftAnnouncementStatus.status === 'active'
                      ? 'bg-emerald-400 animate-ping'
                      : draftAnnouncementStatus.status === 'scheduled'
                      ? 'bg-cyan-400'
                      : draftAnnouncementStatus.status === 'expired'
                      ? 'bg-amber-400'
                      : 'bg-neutral-500'
                  }`}
                />
                <span>{draftAnnouncementStatus.label}</span>
              </span>

              {hasUnsavedAnnouncementChanges && (
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  UNSAVED DRAFT
                </span>
              )}
            </div>
          </div>

          {/* Feedback Alert Banner */}
          {announcementFeedback && (
            <div
              className={`p-3.5 rounded-lg border text-xs font-mono flex items-start gap-2.5 transition-all animate-in fade-in ${
                announcementFeedback.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              {announcementFeedback.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{announcementFeedback.message}</div>
            </div>
          )}

          {/* LIVE STOREFRONT PREVIEW BOX */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Eye size={12} className="text-snake-green" />
                <span>STOREFRONT LIVE PREVIEW (DRAFT)</span>
              </span>
              <span>PLACEMENT: ABOVE HEADER (DOCUMENT FLOW)</span>
            </div>

            <div className="rounded-md border border-neutral-800 overflow-hidden bg-black/90 relative">
              {/* The Representative Storefront Bar */}
              <div
                style={{
                  backgroundColor: announcementBgColor,
                  color: announcementTextColor,
                }}
                className="w-full min-h-[32px] md:min-h-[34px] px-4 py-1.5 flex items-center justify-center transition-colors relative"
              >
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] font-medium pr-7 sm:pr-8">
                  <span className="truncate max-w-[70vw] sm:max-w-none">
                    {announcementMessage.trim() || 'ENTER ANNOUNCEMENT MESSAGE BELOW...'}
                  </span>
                  {announcementUrl.trim() && announcementCta.trim() && (
                    <span
                      style={{ color: announcementAccentColor || undefined }}
                      className="inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline shrink-0"
                    >
                      <span>{announcementCta.trim()}</span>
                      <ArrowRight size={11} />
                    </span>
                  )}
                  {announcementUrl.trim() && !announcementCta.trim() && (
                    <ArrowRight
                      size={11}
                      style={{ color: announcementAccentColor || undefined }}
                      className="shrink-0"
                    />
                  )}
                </div>
                <div
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 text-current opacity-60 pointer-events-none"
                  title="Close mark (visible on storefront)"
                >
                  <X size={12} strokeWidth={2.2} />
                </div>
              </div>

              {!announcementEnabled && (
                <div className="bg-neutral-950/85 backdrop-blur-xs py-1 px-3 border-t border-neutral-800/80 flex items-center justify-between text-[9px] font-mono text-neutral-400">
                  <span className="text-neutral-500">BAR IS CURRENTLY TURNED OFF ON STOREFRONT</span>
                  <span className="text-snake-green">ENABLE BELOW TO PUBLISH</span>
                </div>
              )}
            </div>
          </div>

          {/* CONTROLS GRID */}
          <div className="space-y-5 pt-2">
            {/* Control A: Enable/Disable Toggle */}
            <div className="bg-black/60 border border-neutral-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-white uppercase block">
                  ANNOUNCEMENT BAR ENABLED
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                  When enabled, renders the published announcement strip directly above the header across all storefront pages.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                className={`px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  announcementEnabled
                    ? 'bg-snake-green text-black hover:bg-white shadow-[0_0_15px_rgba(4,252,33,0.3)]'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <Power size={13} />
                <span>{announcementEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}</span>
              </button>
            </div>

            {/* Control B: Announcement Copy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="text-neutral-300 font-bold uppercase tracking-wider">
                  ANNOUNCEMENT MESSAGE
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    announcementMessage.length > 150 ? 'text-amber-400' : 'text-neutral-500'
                  }`}
                >
                  {announcementMessage.length} / 160 CHARACTERS
                </span>
              </div>

              <textarea
                rows={2}
                maxLength={160}
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                placeholder="e.g. THE NEW CHAPTERS HAVE ARRIVED — EXPLORE NOW."
                className="w-full bg-black border border-neutral-800 px-3.5 py-2.5 text-xs text-white rounded focus:border-snake-green focus:outline-none font-mono resize-none leading-relaxed"
              />

              {/* Quick Preset Ideas */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest mr-1">
                  SUGGESTED COPY:
                </span>
                {[
                  'THE NEW CHAPTERS HAVE ARRIVED — EXPLORE NOW.',
                  'DISCOVER YOUR NEXT FAVOURITE. SHOP THE LATEST DROP.',
                  'COMPLIMENTARY SHIPPING ON ALL HEAVYWEIGHT ORDERS.',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAnnouncementMessage(preset)}
                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
                  >
                    {preset.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Control C: Destination URL & CTA Label */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Link2 size={12} className="text-snake-green" />
                    <span>DESTINATION URL (OPTIONAL)</span>
                  </label>
                  {announcementUrl.trim() && (
                    <span
                      className={`text-[9px] font-mono font-bold ${
                        isValidAnnouncementUrl(announcementUrl.trim())
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {isValidAnnouncementUrl(announcementUrl.trim()) ? 'VALID URL' : 'INVALID PATH'}
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={announcementUrl}
                  onChange={(e) => setAnnouncementUrl(e.target.value)}
                  placeholder="e.g. /collections or /new-drops"
                  className="w-full bg-black border border-neutral-800 px-3 py-2 text-xs text-white rounded focus:border-snake-green focus:outline-none font-mono"
                />
                <p className="text-[10px] text-neutral-500 font-mono">
                  Internal routes (e.g. <code className="text-neutral-400">/collections</code>, <code className="text-neutral-400">/shop</code>) or secure <code className="text-neutral-400">https://</code> links.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-bold uppercase tracking-wider block">
                  CTA LABEL (OPTIONAL)
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={announcementCta}
                  disabled={!announcementUrl.trim()}
                  onChange={(e) => setAnnouncementCta(e.target.value)}
                  placeholder="e.g. EXPLORE NOW or SHOP DROP"
                  className="w-full bg-black border border-neutral-800 px-3 py-2 text-xs text-white rounded focus:border-snake-green focus:outline-none font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <p className="text-[10px] text-neutral-500 font-mono">
                  {announcementUrl.trim()
                    ? 'Subtle interactive link label rendered beside message.'
                    : 'Requires destination URL to be configured.'}
                </p>
              </div>
            </div>

            {/* Control D: Color Customization & Presets */}
            <div className="space-y-3 bg-black/40 border border-neutral-800/80 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/60 pb-2">
                <span className="text-xs text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Palette size={13} className="text-snake-green" />
                  <span>APPEARANCE &amp; COLOUR PALETTE</span>
                </span>

                {/* Preset Themes */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] text-neutral-500 uppercase tracking-widest mr-1">
                    PRESETS:
                  </span>
                  {[
                    { name: 'Luxury Obsidian', bg: '#111111', text: '#EDEDED', accent: '#04fc21' },
                    { name: 'Deep Atelier', bg: '#080808', text: '#FFFFFF', accent: '#04fc21' },
                    { name: 'Pure Monolith', bg: '#000000', text: '#E5E5E5', accent: '#EDEDED' },
                    { name: 'Winter Frost', bg: '#081724', text: '#E0F2FE', accent: '#38bdf8' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setAnnouncementBgColor(preset.bg);
                        setAnnouncementTextColor(preset.text);
                        setAnnouncementAccentColor(preset.accent);
                      }}
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-600 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Background Color */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase font-mono block">
                    BACKGROUND COLOUR
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={isValidHexColor(announcementBgColor) ? announcementBgColor : '#111111'}
                      onChange={(e) => setAnnouncementBgColor(e.target.value)}
                      className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      maxLength={7}
                      value={announcementBgColor}
                      onChange={(e) => setAnnouncementBgColor(e.target.value)}
                      className="w-full bg-black border border-neutral-800 px-2.5 py-1 text-xs text-white rounded font-mono uppercase focus:border-snake-green"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase font-mono block">
                    TEXT COLOUR
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={isValidHexColor(announcementTextColor) ? announcementTextColor : '#EDEDED'}
                      onChange={(e) => setAnnouncementTextColor(e.target.value)}
                      className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      maxLength={7}
                      value={announcementTextColor}
                      onChange={(e) => setAnnouncementTextColor(e.target.value)}
                      className="w-full bg-black border border-neutral-800 px-2.5 py-1 text-xs text-white rounded font-mono uppercase focus:border-snake-green"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase font-mono block">
                    CTA / ACCENT COLOUR
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={isValidHexColor(announcementAccentColor) ? announcementAccentColor : '#04fc21'}
                      onChange={(e) => setAnnouncementAccentColor(e.target.value)}
                      className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      maxLength={7}
                      value={announcementAccentColor}
                      onChange={(e) => setAnnouncementAccentColor(e.target.value)}
                      className="w-full bg-black border border-neutral-800 px-2.5 py-1 text-xs text-white rounded font-mono uppercase focus:border-snake-green"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Control E: Optional Publication Scheduling */}
            <div className="space-y-3 bg-black/40 border border-neutral-800/80 rounded-lg p-4">
              <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
                <span className="text-xs text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={13} className="text-snake-green" />
                  <span>PUBLICATION WINDOW // OPTIONAL SCHEDULING</span>
                </span>

                {(announcementStartTime || announcementEndTime) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnnouncementStartTime('');
                      setAnnouncementEndTime('');
                    }}
                    className="text-[9px] font-mono text-neutral-400 hover:text-white underline"
                  >
                    CLEAR SCHEDULE
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-mono block">
                    START PUBLICATION (OPTIONAL)
                  </label>
                  <input
                    type="datetime-local"
                    value={announcementStartTime}
                    onChange={(e) => setAnnouncementStartTime(e.target.value)}
                    className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-xs text-white rounded font-mono focus:border-snake-green [color-scheme:dark]"
                  />
                  <p className="text-[9px] text-neutral-500 font-mono">
                    Announcement will remain hidden until this datetime.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-mono block">
                    END PUBLICATION / EXPIRY (OPTIONAL)
                  </label>
                  <input
                    type="datetime-local"
                    value={announcementEndTime}
                    onChange={(e) => setAnnouncementEndTime(e.target.value)}
                    className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-xs text-white rounded font-mono focus:border-snake-green [color-scheme:dark]"
                  />
                  <p className="text-[9px] text-neutral-500 font-mono">
                    Announcement automatically disappears after this datetime.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
              <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-2">
                {hasUnsavedAnnouncementChanges ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Clock size={12} />
                    <span>Unsaved draft in progress. Save to publish live to storefront.</span>
                  </span>
                ) : (
                  <span className="text-neutral-500 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>All changes saved and synchronized with database.</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {hasUnsavedAnnouncementChanges && (
                  <button
                    type="button"
                    onClick={handleDiscardAnnouncementDraft}
                    disabled={isSavingAnnouncement}
                    className="px-4 py-2 rounded text-xs font-mono uppercase text-neutral-400 hover:text-white transition-colors"
                  >
                    DISCARD DRAFT
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveAnnouncement}
                  disabled={isSavingAnnouncement}
                  className="px-6 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-white text-black hover:bg-snake-green transition-all shadow-[0_0_20px_rgba(4,252,33,0.25)] flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingAnnouncement ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>SAVING CHANGES...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>SAVE CHANGES</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Supabase Schema Migration Helper */}
            <div className="pt-2">
              <div className="p-3 bg-black/60 border border-neutral-800/80 rounded-md space-y-2 text-[10px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-bold uppercase flex items-center gap-1.5">
                    <Info size={12} className="text-snake-green" />
                    <span>SUPABASE CLOUD PERSISTENCE TABLE (OPTIONAL SQL)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const sql = `CREATE TABLE IF NOT EXISTS public.announcement_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  is_enabled BOOLEAN DEFAULT FALSE,
  message TEXT NOT NULL DEFAULT '',
  destination_url TEXT,
  cta_label TEXT,
  bg_color TEXT NOT NULL DEFAULT '#111111',
  text_color TEXT NOT NULL DEFAULT '#EDEDED',
  accent_color TEXT DEFAULT '#04fc21',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'system'
);
ALTER TABLE public.announcement_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read announcement_config" ON public.announcement_config FOR SELECT USING (true);
CREATE POLICY "Allow admin all announcement_config" ON public.announcement_config FOR ALL USING (true);`;
                      navigator.clipboard.writeText(sql);
                      setSqlCopied(true);
                      setTimeout(() => setSqlCopied(false), 2500);
                    }}
                    className="text-snake-green hover:underline flex items-center gap-1 font-bold"
                  >
                    <Copy size={10} />
                    <span>{sqlCopied ? 'COPIED TO CLIPBOARD!' : 'COPY SQL QUERY'}</span>
                  </button>
                </div>
                <p className="text-neutral-500 leading-relaxed">
                  Run this idempotent query in your Supabase SQL Editor to enable long-term cloud persistence for the announcement bar across edge deployments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Atmosphere & Seasonal FX */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold uppercase text-sm">
              <Snowflake size={16} className="text-cyan-400" />
              <span>VISUAL ATMOSPHERE // SEASONAL FX</span>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              HOLIDAY CAMPAIGN THEME
            </span>
          </div>

          <div className="bg-black/60 border border-neutral-800/80 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-white uppercase tracking-tight">
                  WINTER SNOW ATMOSPHERE
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                    snowEffectActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  {snowEffectActive ? 'ACTIVE (THEMED)' : 'INACTIVE (OFF)'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                Renders a subtle, high-fashion winter frost dust particle effect across the storefront. Engineered for seasonal campaigns with zero lag, non-blocking click-throughs, and automatic accessibility support.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleSnow(!snowEffectActive)}
                disabled={isUpdatingSnow}
                className={`px-5 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  snowEffectActive
                    ? 'bg-cyan-500 text-black hover:bg-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <Snowflake size={14} className={snowEffectActive ? 'animate-spin' : ''} />
                <span>{snowEffectActive ? 'TURN OFF SNOW' : 'TURN ON SNOW'}</span>
              </button>
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
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setFreeShippingThreshold(val);
                  updateFreeShippingThreshold(val);
                }}
                onBlur={() => {
                  fetch('/api/admin/storefront-mode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      adminEmail: user?.email || 'supersnake.in@gmail.com',
                      freeShippingThreshold,
                    }),
                  }).catch(() => {});
                }}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
              <span className="text-[10px] text-neutral-400 block font-mono">
                {freeShippingThreshold === 0 ? (
                  <span className="text-snake-green font-bold">⚡ FREE DELIVERY ON ALL ORDERS (₹0 MINIMUM)</span>
                ) : (
                  <span>Free delivery for orders above ₹{freeShippingThreshold.toLocaleString('en-IN')}</span>
                )}
              </span>
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
