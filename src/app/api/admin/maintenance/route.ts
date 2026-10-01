import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/security';
import {
  fetchMaintenanceConfigFromSupabase,
  updateMaintenanceConfigInSupabase,
} from '@/lib/supabase/db';
import { MaintenanceConfig } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_CONFIG: MaintenanceConfig = {
  maintenanceMode: false,
  maintenanceMessage:
    'We are calibrating the atelier for our next heavyweight drop. The portal will resume normal operations shortly.',
  estimatedRestoreTime: null,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

// In-memory cache for fast Edge / API response
let cachedConfig: MaintenanceConfig = { ...DEFAULT_CONFIG };
let cacheTimestamp = 0;

/**
 * GET: Retrieve current maintenance configuration
 */
export async function GET() {
  const now = Date.now();
  // Cache for 30 seconds to protect database under bursts
  if (now - cacheTimestamp < 30000 && cacheTimestamp > 0) {
    return NextResponse.json(cachedConfig, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  }

  const dbConfig = await fetchMaintenanceConfigFromSupabase();
  if (dbConfig) {
    cachedConfig = dbConfig;
    cacheTimestamp = now;
  }

  return NextResponse.json(cachedConfig, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}

/**
 * POST: Update maintenance configuration (Authorized Admins Only)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { maintenanceMode, maintenanceMessage, estimatedRestoreTime, adminEmail } = body;

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

    const updates: Partial<MaintenanceConfig> = {};
    if (typeof maintenanceMode === 'boolean') {
      updates.maintenanceMode = maintenanceMode;
    }
    if (typeof maintenanceMessage === 'string' && maintenanceMessage.trim()) {
      updates.maintenanceMessage = maintenanceMessage.trim();
    }
    if (estimatedRestoreTime !== undefined) {
      updates.estimatedRestoreTime = estimatedRestoreTime || null;
    }

    // Persist to Supabase
    const success = await updateMaintenanceConfigInSupabase(updates, adminEmail.trim().toLowerCase());

    // Update in-memory server cache immediately
    cachedConfig = {
      ...cachedConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail.trim().toLowerCase(),
    };
    cacheTimestamp = Date.now();

    return NextResponse.json(
      {
        success,
        config: cachedConfig,
        message: updates.maintenanceMode
          ? 'Maintenance mode enabled. Storefront is now protected.'
          : 'Maintenance mode disabled. Storefront access restored.',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (err: any) {
    console.error('Error updating maintenance mode:', err);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: err.message || 'Failed to update maintenance configuration.',
      },
      { status: 500 }
    );
  }
}
