import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/security';
import {
  updateAnnouncementConfigInSupabase,
  fetchAnnouncementConfigFromSupabase,
  DEFAULT_ANNOUNCEMENT_CONFIG,
} from '@/lib/supabase/db';
import {
  AnnouncementConfig,
  isValidAnnouncementUrl,
  isValidHexColor,
  sanitizeAnnouncementMessage,
} from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      adminEmail,
      isEnabled,
      message,
      destinationUrl,
      ctaLabel,
      bgColor,
      textColor,
      accentColor,
      startTime,
      endTime,
    } = body;

    // 1. Verify authorized administrator identity
    if (!adminEmail || !isAuthorizedAdmin(adminEmail)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Unauthorized personnel. Admin atelier credentials required.',
        },
        { status: 403 }
      );
    }

    const updates: Partial<AnnouncementConfig> = {};

    // 2. Validate enabled state
    if (typeof isEnabled === 'boolean') {
      updates.isEnabled = isEnabled;
    }

    // 3. Validate and sanitize message
    if (typeof message === 'string') {
      const sanitized = sanitizeAnnouncementMessage(message);
      updates.message = sanitized;
    }

    // 4. Validate destination URL
    if (destinationUrl !== undefined) {
      if (destinationUrl === null || destinationUrl === '') {
        updates.destinationUrl = null;
      } else if (typeof destinationUrl === 'string') {
        const trimmed = destinationUrl.trim();
        if (!isValidAnnouncementUrl(trimmed)) {
          return NextResponse.json(
            {
              error: 'Invalid Destination URL',
              message:
                'Destination URL must be a valid internal path (e.g. /collections, /shop, /new-drops) or secure https:// link.',
            },
            { status: 400 }
          );
        }
        updates.destinationUrl = trimmed;
      }
    }

    // 5. Validate CTA label
    if (ctaLabel !== undefined) {
      if (ctaLabel === null || ctaLabel === '') {
        updates.ctaLabel = null;
      } else if (typeof ctaLabel === 'string') {
        updates.ctaLabel = ctaLabel.trim().slice(0, 30);
      }
    }

    // 6. Validate hex colors
    if (bgColor !== undefined) {
      if (typeof bgColor !== 'string' || !isValidHexColor(bgColor)) {
        return NextResponse.json(
          {
            error: 'Invalid Color',
            message: 'Background color must be a valid hexadecimal value (e.g. #111111).',
          },
          { status: 400 }
        );
      }
      updates.bgColor = bgColor.trim();
    }

    if (textColor !== undefined) {
      if (typeof textColor !== 'string' || !isValidHexColor(textColor)) {
        return NextResponse.json(
          {
            error: 'Invalid Color',
            message: 'Text color must be a valid hexadecimal value (e.g. #EDEDED).',
          },
          { status: 400 }
        );
      }
      updates.textColor = textColor.trim();
    }

    if (accentColor !== undefined) {
      if (accentColor === null || accentColor === '') {
        updates.accentColor = null;
      } else if (typeof accentColor === 'string') {
        if (!isValidHexColor(accentColor)) {
          return NextResponse.json(
            {
              error: 'Invalid Color',
              message: 'Accent color must be a valid hexadecimal value (e.g. #04fc21).',
            },
            { status: 400 }
          );
        }
        updates.accentColor = accentColor.trim();
      }
    }

    // 7. Validate scheduling datetime
    if (startTime !== undefined) {
      if (startTime === null || startTime === '') {
        updates.startTime = null;
      } else {
        const ms = new Date(startTime).getTime();
        if (isNaN(ms)) {
          return NextResponse.json(
            {
              error: 'Invalid Date',
              message: 'Publication start time must be a valid ISO 8601 datetime.',
            },
            { status: 400 }
          );
        }
        updates.startTime = new Date(ms).toISOString();
      }
    }

    if (endTime !== undefined) {
      if (endTime === null || endTime === '') {
        updates.endTime = null;
      } else {
        const ms = new Date(endTime).getTime();
        if (isNaN(ms)) {
          return NextResponse.json(
            {
              error: 'Invalid Date',
              message: 'Publication end time must be a valid ISO 8601 datetime.',
            },
            { status: 400 }
          );
        }
        updates.endTime = new Date(ms).toISOString();
      }
    }

    // Check that start time is before end time if both are set
    if (updates.startTime && updates.endTime) {
      if (new Date(updates.startTime).getTime() >= new Date(updates.endTime).getTime()) {
        return NextResponse.json(
          {
            error: 'Invalid Date Range',
            message: 'Publication start time must be before publication end time.',
          },
          { status: 400 }
        );
      }
    }

    // 8. Persist to Supabase
    const success = await updateAnnouncementConfigInSupabase(
      updates,
      adminEmail.trim().toLowerCase()
    );
    const updated = await fetchAnnouncementConfigFromSupabase(true);

    const effectiveConfig = {
      ...(DEFAULT_ANNOUNCEMENT_CONFIG),
      ...(updated || {}),
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail.trim().toLowerCase(),
    };

    return NextResponse.json(
      {
        success: true,
        persistedToDb: success,
        config: effectiveConfig,
        message: 'Announcement bar settings saved and published.',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (err: any) {
    console.error('Error saving announcement bar settings:', err);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: err.message || 'Failed to update announcement configuration.',
      },
      { status: 500 }
    );
  }
}
