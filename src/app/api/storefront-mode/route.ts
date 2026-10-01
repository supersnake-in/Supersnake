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

let cachedConfig = { ...DEFAULT_CONFIG };
let lastFetch = 0;

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
  const now = Date.now();
  if (now - lastFetch > 30000 || lastFetch === 0) {
    try {
      const config = await fetchStorefrontConfigFromSupabase();
      if (config) {
        cachedConfig = config;
        lastFetch = now;
      }
    } catch (e) {}
  }

  // Automatic launch check
  let effectiveMode: StorefrontMode = cachedConfig.storefrontMode;
  if (
    effectiveMode === 'PRE_LAUNCH' &&
    cachedConfig.automaticLaunch &&
    isPastLaunchDate(cachedConfig.launchDate, cachedConfig.launchTime)
  ) {
    effectiveMode = 'LIVE';
  }

  return NextResponse.json(
    {
      ...cachedConfig,
      storefrontMode: effectiveMode,
      configuredMode: cachedConfig.storefrontMode,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    }
  );
}
