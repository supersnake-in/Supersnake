import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/security';
import { updateStorefrontConfigInSupabase, fetchStorefrontConfigFromSupabase } from '@/lib/supabase/db';
import { StorefrontConfig, StorefrontMode } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      storefrontMode,
      launchDate,
      launchTime,
      launchTimezone,
      automaticLaunch,
      preLaunchProductLimit,
      maintenanceMessage,
      estimatedRestoreTime,
      adminEmail,
    } = body;

    // Verify authorized administrator identity
    if (!adminEmail || !isAuthorizedAdmin(adminEmail)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Unauthorized personnel. Admin atelier credentials required.',
        },
        { status: 403 }
      );
    }

    const updates: Partial<StorefrontConfig> = {};

    if (storefrontMode && ['PRE_LAUNCH', 'LIVE', 'MAINTENANCE'].includes(storefrontMode)) {
      updates.storefrontMode = storefrontMode as StorefrontMode;
    }
    if (typeof launchDate === 'string' && launchDate.trim()) {
      updates.launchDate = launchDate.trim();
    }
    if (typeof launchTime === 'string' && launchTime.trim()) {
      updates.launchTime = launchTime.trim();
    }
    if (typeof launchTimezone === 'string' && launchTimezone.trim()) {
      updates.launchTimezone = launchTimezone.trim();
    }
    if (typeof automaticLaunch === 'boolean') {
      updates.automaticLaunch = automaticLaunch;
    }
    if (typeof preLaunchProductLimit === 'number' && preLaunchProductLimit > 0) {
      updates.preLaunchProductLimit = preLaunchProductLimit;
    }
    if (typeof maintenanceMessage === 'string') {
      updates.maintenanceMessage = maintenanceMessage.trim();
    }
    if (estimatedRestoreTime !== undefined) {
      updates.estimatedRestoreTime = estimatedRestoreTime || null;
    }

    const success = await updateStorefrontConfigInSupabase(updates, adminEmail.trim().toLowerCase());
    const updated = await fetchStorefrontConfigFromSupabase();

    return NextResponse.json(
      {
        success,
        config: updated,
        message: `Storefront mode updated to ${updates.storefrontMode || updated?.storefrontMode}.`,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (err: any) {
    console.error('Error updating storefront mode:', err);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: err.message || 'Failed to update storefront mode.',
      },
      { status: 500 }
    );
  }
}
