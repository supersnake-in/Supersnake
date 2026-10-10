import { NextResponse } from 'next/server';
import { fetchAnnouncementConfigFromSupabase, DEFAULT_ANNOUNCEMENT_CONFIG } from '@/lib/supabase/db';
import { isAnnouncementActive } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const config = await fetchAnnouncementConfigFromSupabase();
    const effective = config || DEFAULT_ANNOUNCEMENT_CONFIG;
    const isPublished = isAnnouncementActive(effective);

    // Sanitize public payload: strip admin identity and metadata
    const publicPayload = {
      id: effective.id,
      isEnabled: effective.isEnabled,
      isPublished,
      message: effective.message,
      destinationUrl: effective.destinationUrl || null,
      ctaLabel: effective.ctaLabel || null,
      bgColor: effective.bgColor,
      textColor: effective.textColor,
      accentColor: effective.accentColor || null,
      startTime: effective.startTime || null,
      endTime: effective.endTime || null,
    };

    return NextResponse.json(
      {
        success: true,
        config: publicPayload,
        isPublished,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        config: DEFAULT_ANNOUNCEMENT_CONFIG,
        isPublished: false,
      },
      { status: 500 }
    );
  }
}
