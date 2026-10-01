import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import {
  normalizePhoneNumber,
  verifyOtpChallenge,
} from '@/lib/phone-verification-store';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    let authenticatedUserId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) {
        authenticatedUserId = user.id;
      }
    }

    const body = await request.json();
    const { phone, code, userId } = body;
    const effectiveUserId = authenticatedUserId || userId;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Please enter the 6-digit verification code.' },
        { status: 400 }
      );
    }

    const normalized = normalizePhoneNumber(phone || '');
    const rateKey = effectiveUserId ? `user_${effectiveUserId}` : `phone_${normalized.e164}`;

    // Validate code against authoritative challenge store
    const verifyResult = verifyOtpChallenge(rateKey, code.trim());
    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error },
        { status: 400 }
      );
    }

    const verifiedPhone = verifyResult.phone || normalized.e164;
    const verifiedAt = new Date().toISOString();

    // Authoritatively update database if authenticated user exists
    if (effectiveUserId) {
      try {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({
            phone: verifiedPhone,
            phone_verified: true,
            phone_verified_at: verifiedAt,
            phone_verification_method: 'sms_otp',
            updated_at: verifiedAt,
          })
          .eq('id', effectiveUserId);

        if (updateErr) {
          console.warn('Profile phone verification update warning:', updateErr.message);
        }
      } catch (dbErr) {
        console.warn('Database error while saving phone verification:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mobile number successfully verified.',
      phone: verifiedPhone,
      phoneVerified: true,
      phoneVerifiedAt: verifiedAt,
    });
  } catch (err: any) {
    console.error('Phone OTP verify error:', err);
    return NextResponse.json(
      { error: err.message || 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
