import { NextResponse } from 'next/server';
import { fetchAnnouncementConfigFromSupabase, DEFAULT_ANNOUNCEMENT_CONFIG } from '@/lib/supabase/db';
import { isAnnouncementActive } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const config = await fetchAnnouncementConfigFromSupabase(true);
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          config: null,
          isPublished: false,
          error: 'Announcement config unavailable',
        },
        {
          status: 503,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }

    const isPublished = isAnnouncementActive(config);

    // Sanitize public payload: strip admin identity and metadata
    const publicPayload = {
      id: config.id,
      isEnabled: config.isEnabled,
      isPublished,
      message: config.message,
      destinationUrl: config.destinationUrl || null,
      ctaLabel: config.ctaLabel || null,
      bgColor: config.bgColor,
      textColor: config.textColor,
      accentColor: config.accentColor || null,
      startTime: config.startTime || null,
      endTime: config.endTime || null,
    };

    return NextResponse.json(
      {
        success: true,
        config: publicPayload,
        isPublished,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        config: null,
        isPublished: false,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
