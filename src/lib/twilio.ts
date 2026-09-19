import { normalizePhoneNumber } from './phone-utils';

interface TwilioVerificationResult {
  success: boolean;
  error?: string;
  status?: string;
}

// In-memory rate limiting for phone OTP requests: max 3 attempts per phone per 10 minutes, 60s cooldown
const phoneRateLimits = new Map<string, { count: number; lastSentAt: number; windowStart: number }>();

export function checkPhoneRateLimit(phone: string): { allowed: boolean; error?: string; retryAfterSeconds?: number } {
  const normalized = normalizePhoneNumber(phone);
  const now = Date.now();
  const entry = phoneRateLimits.get(normalized);

  if (!entry) {
    phoneRateLimits.set(normalized, { count: 1, lastSentAt: now, windowStart: now });
    return { allowed: true };
  }

  // 60-second cooldown between consecutive sends
  const timeSinceLast = Math.floor((now - entry.lastSentAt) / 1000);
  if (timeSinceLast < 60) {
    return {
      allowed: false,
      error: `Please wait ${60 - timeSinceLast} seconds before requesting another code.`,
      retryAfterSeconds: 60 - timeSinceLast,
    };
  }

  // 10-minute sliding window check (max 3 sends)
  const windowElapsed = now - entry.windowStart;
  if (windowElapsed > 10 * 60 * 1000) {
    // Reset window
    phoneRateLimits.set(normalized, { count: 1, lastSentAt: now, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= 3) {
    const windowRemaining = Math.ceil((10 * 60 * 1000 - windowElapsed) / 1000 / 60);
    return {
      allowed: false,
      error: `Too many verification attempts for this phone number. Please try again in ${windowRemaining} minutes.`,
    };
  }

  entry.count += 1;
  entry.lastSentAt = now;
  return { allowed: true };
}

/**
 * Dispatches an SMS verification OTP using Twilio Verify service.
 */
export async function sendTwilioPhoneOtp(rawPhone: string): Promise<TwilioVerificationResult> {
  const normalized = normalizePhoneNumber(rawPhone);
  if (!normalized) {
    return { success: false, error: 'Please provide a valid phone number.' };
  }

  // Check rate limits
  const rateLimit = checkPhoneRateLimit(normalized);
  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.error };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (accountSid && authToken && serviceSid) {
    try {
      const twilioModule = await import('twilio');
      const twilioClient = twilioModule.default(accountSid, authToken);

      const verification = await twilioClient.verify.v2
        .services(serviceSid)
        .verifications.create({
          to: normalized,
          channel: 'sms',
        });

      return {
        success: true,
        status: verification.status,
      };
    } catch (err: any) {
      console.error('Twilio Verify Send Error:', err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch SMS verification code through Twilio.',
      };
    }
  }

  // Development fallback when Twilio credentials are not configured
  console.warn(
    'Twilio credentials not configured in environment (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID). Operating in development mode.'
  );

  return {
    success: true,
    status: 'pending',
  };
}

/**
 * Validates the SMS verification OTP with Twilio Verify service.
 */
export async function verifyTwilioPhoneOtp(
  rawPhone: string,
  code: string
): Promise<{ success: boolean; error?: string; verified?: boolean }> {
  const normalized = normalizePhoneNumber(rawPhone);
  if (!normalized || !code) {
    return { success: false, error: 'Phone number and 6-digit code are required.' };
  }

  const cleanCode = code.trim();
  if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return { success: false, error: 'Please enter a valid 6-digit numeric verification code.' };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (accountSid && authToken && serviceSid) {
    try {
      const twilioModule = await import('twilio');
      const twilioClient = twilioModule.default(accountSid, authToken);

      const check = await twilioClient.verify.v2
        .services(serviceSid)
        .verificationChecks.create({
          to: normalized,
          code: cleanCode,
        });

      if (check.status === 'approved') {
        return { success: true, verified: true };
      }

      return {
        success: false,
        error: 'Invalid verification code. Please check the code sent to your phone and try again.',
      };
    } catch (err: any) {
      console.error('Twilio Verify Check Error:', err);
      return {
        success: false,
        error: err.message || 'Verification check failed. Please try again.',
      };
    }
  }

  // Development mode verification
  return { success: true, verified: true };
}
