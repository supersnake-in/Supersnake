import { NextResponse } from 'next/server';
import { verifyTwilioPhoneOtp } from '@/lib/twilio';
import { normalizePhoneNumber } from '@/lib/phone-utils';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code, userId } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone number and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const normalized = normalizePhoneNumber(phone);
    const result = await verifyTwilioPhoneOtp(normalized, code);

    if (!result.success || !result.verified) {
      return NextResponse.json(
        { error: result.error || 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // If userId is provided, update public.profiles
    if (userId) {
      try {
        await supabase
          .from('profiles')
          .update({
            phone: normalized,
            phone_verified: true,
            phone_verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      } catch (dbErr) {
        console.warn('Profile phone verification update warning:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      phone: normalized,
      message: 'Phone number successfully verified.',
    });
  } catch (err: any) {
    console.error('Phone OTP Verify API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
