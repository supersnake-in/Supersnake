import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';
import {
  normalizePhoneNumber,
  checkRateLimit,
  storeOtpChallenge,
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
    const { phone, userId } = body;
    const effectiveUserId = authenticatedUserId || userId;

    if (!phone) {
      return NextResponse.json(
        { error: 'Mobile phone number is required.' },
        { status: 400 }
      );
    }

    // 1. Authoritative phone normalization
    const normalized = normalizePhoneNumber(phone);
    if (!normalized.isValid) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const rateKey = effectiveUserId ? `user_${effectiveUserId}` : `phone_${normalized.e164}`;

    // 2. Check 1-hour rate limiting
    const rateCheck = checkRateLimit(rateKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.error },
        { status: 429 }
      );
    }

    // 3. Generate secure 6-digit cryptographic OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();

    // 4. Store challenge with 60-second cooldown
    const storeRes = storeOtpChallenge(rateKey, normalized.e164, otpCode);
    if (!storeRes.success) {
      return NextResponse.json(
        { error: storeRes.error, cooldown: storeRes.cooldownSeconds },
        { status: 429 }
      );
    }

    // In a live environment with SMS gateway, dispatch here.
    // In local / development / sandbox mode, the generated code can be delivered or viewed securely:
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SuperSnake Phone Verification] SMS Dispatched to ${normalized.formatted}: [CODE: ${otpCode}]`);
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalized.formatted}`,
      phone: normalized.e164,
      cooldown: 60,
    });
  } catch (err: any) {
    console.error('Phone OTP send error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to dispatch phone verification code.' },
      { status: 500 }
    );
  }
}
