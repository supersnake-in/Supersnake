import { NextResponse } from 'next/server';
import { fetchStorefrontConfigFromSupabase } from '@/lib/supabase/db';
import { StorefrontConfig, StorefrontMode } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_CONFIG: StorefrontConfig = {
  id: 'default',
  storefrontMode: 'PRE_LAUNCH',
  launchDate: '2026-10-14',
  launchTime: '10:00',
  launchTimezone: 'IST',
  automaticLaunch: false,
  preLaunchProductLimit: 6,
  maintenanceMessage:
    'We are calibrating the atelier for our next heavyweight drop. The portal will resume normal operations shortly.',
  estimatedRestoreTime: null,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

/**
 * Check if the current time has passed the configured launch datetime
 */
function isPastLaunchDate(launchDate: string, launchTime: string): boolean {
  try {
    const combined = `${launchDate}T${launchTime || '00:00'}:00+05:30`;
    const targetMs = new Date(combined).getTime();
    if (!isNaN(targetMs)) {
      return Date.now() >= targetMs;
    }
  } catch (e) {}
  return false;
}

export async function GET() {
  let config: StorefrontConfig | null = null;
  try {
    config = await fetchStorefrontConfigFromSupabase();
  } catch (e) {}

  const currentConfig: StorefrontConfig = config || { ...DEFAULT_CONFIG };

  // Automatic launch check
  let effectiveMode: StorefrontMode = currentConfig.storefrontMode;
  if (
    effectiveMode === 'PRE_LAUNCH' &&
    currentConfig.automaticLaunch &&
    isPastLaunchDate(currentConfig.launchDate, currentConfig.launchTime)
  ) {
    effectiveMode = 'LIVE';
  }

  return NextResponse.json(
    {
      ...currentConfig,
      storefrontMode: effectiveMode,
      configuredMode: currentConfig.storefrontMode,
      freeShippingThreshold: typeof currentConfig.freeShippingThreshold === 'number'
        ? currentConfig.freeShippingThreshold
        : 1999,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    }
  );
}
