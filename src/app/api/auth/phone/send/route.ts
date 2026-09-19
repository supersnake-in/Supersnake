import { NextResponse } from 'next/server';
import { sendTwilioPhoneOtp } from '@/lib/twilio';
import { isValidPhoneNumber, normalizePhoneNumber } from '@/lib/phone-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || !isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid mobile phone number with country code (e.g. +91 98765 43210).' },
        { status: 400 }
      );
    }

    const normalized = normalizePhoneNumber(phone);
    const result = await sendTwilioPhoneOtp(normalized);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS verification code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      phone: normalized,
      message: `Verification code dispatched to ${normalized}.`,
    });
  } catch (err: any) {
    console.error('Phone OTP Send API Error:', err);
    return NextResponse.json(
      { error: err.message || 'We could not send the verification code. Please try again.' },
      { status: 500 }
    );
  }
}
