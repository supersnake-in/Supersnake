import { NextResponse } from 'next/server';
import { fetchMaintenanceConfigFromSupabase } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let cachedConfig = {
  maintenanceMode: false,
  maintenanceMessage:
    'We are calibrating the atelier for our next heavyweight drop. The portal will resume normal operations shortly.',
  estimatedRestoreTime: null as string | null,
};
let lastFetch = 0;

export async function GET() {
  const now = Date.now();
  if (now - lastFetch < 2000 && lastFetch > 0) {
    return NextResponse.json(cachedConfig, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  }

  try {
    const config = await fetchMaintenanceConfigFromSupabase();
    if (config) {
      cachedConfig = {
        maintenanceMode: config.maintenanceMode,
        maintenanceMessage: config.maintenanceMessage,
        estimatedRestoreTime: config.estimatedRestoreTime,
      };
      lastFetch = now;
    }
  } catch (e) {
    // Keep cached
  }

  return NextResponse.json(cachedConfig, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    },
  });
}
