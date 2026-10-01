import crypto from 'crypto';

interface OtpRecord {
  phone: string;
  hashedCode: string;
  salt: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

// In-memory records (in production with multiple pods, can be backed by Redis / Supabase KV)
// Global variable ensures persistence during server hot reloads
const globalStore = global as unknown as {
  __phoneVerificationStore?: Map<string, OtpRecord>;
  __phoneRateLimitStore?: Map<string, RateLimitRecord>;
};

if (!globalStore.__phoneVerificationStore) {
  globalStore.__phoneVerificationStore = new Map<string, OtpRecord>();
}

if (!globalStore.__phoneRateLimitStore) {
  globalStore.__phoneRateLimitStore = new Map<string, RateLimitRecord>();
}

const otpMap = globalStore.__phoneVerificationStore;
const rateLimitMap = globalStore.__phoneRateLimitStore;

const COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const OTP_EXPIRY_MINUTES = 10;

/**
 * Standardize phone number into E.164 format (+91XXXXXXXXXX for India)
 */
export function normalizePhoneNumber(raw: string): { e164: string; formatted: string; isValid: boolean } {
  if (!raw) return { e164: '', formatted: '', isValid: false };

  const digits = raw.replace(/\D/g, '');

  if (digits.length === 10) {
    return {
      e164: `+91${digits}`,
      formatted: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
      isValid: /^[6-9]\d{9}$/.test(digits),
    };
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    const local = digits.slice(2);
    return {
      e164: `+${digits}`,
      formatted: `+91 ${local.slice(0, 5)} ${local.slice(5)}`,
      isValid: /^[6-9]\d{9}$/.test(local),
    };
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    const local = digits.slice(1);
    return {
      e164: `+91${local}`,
      formatted: `+91 ${local.slice(0, 5)} ${local.slice(5)}`,
      isValid: /^[6-9]\d{9}$/.test(local),
    };
  }

  return { e164: `+${digits}`, formatted: `+${digits}`, isValid: digits.length >= 10 && digits.length <= 15 };
}

/**
 * Hash verification code with salt
 */
function hashOtp(code: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(code.trim()).digest('hex');
}

/**
 * Rate limit check
 */
export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number; error?: string } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.windowStart > 60 * 60 * 1000) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS_PER_HOUR) {
    const remainingTimeMs = record.windowStart + 60 * 60 * 1000 - now;
    const remainingMinutes = Math.ceil(remainingTimeMs / 60000);
    return {
      allowed: false,
      retryAfter: Math.ceil(remainingTimeMs / 1000),
      error: `Verification rate limit reached. Please wait ${remainingMinutes} minute(s) before requesting again.`,
    };
  }

  record.count += 1;
  return { allowed: true };
}

/**
 * Store an authoritative OTP challenge
 */
export function storeOtpChallenge(
  key: string,
  phone: string,
  code: string
): { success: boolean; error?: string; cooldownSeconds?: number } {
  const now = Date.now();
  const existing = otpMap.get(key);

  if (existing) {
    const elapsedSeconds = (now - existing.lastSentAt) / 1000;
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(COOLDOWN_SECONDS - elapsedSeconds);
      return {
        success: false,
        error: `Please wait ${waitTime} second(s) before requesting a new code.`,
        cooldownSeconds: waitTime,
      };
    }
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hashedCode = hashOtp(code, salt);

  otpMap.set(key, {
    phone,
    hashedCode,
    salt,
    expiresAt: now + OTP_EXPIRY_MINUTES * 60 * 1000,
    attempts: 0,
    lastSentAt: now,
  });

  return { success: true };
}

/**
 * Validate an OTP challenge
 */
export function verifyOtpChallenge(
  key: string,
  code: string
): { success: boolean; phone?: string; error?: string } {
  const now = Date.now();
  const record = otpMap.get(key);

  if (!record) {
    return {
      success: false,
      error: 'No active verification code found. Please request a new code.',
    };
  }

  if (now > record.expiresAt) {
    otpMap.delete(key);
    return {
      success: false,
      error: 'Verification code has expired. Please request a new code.',
    };
  }

  record.attempts += 1;

  if (record.attempts > MAX_VERIFY_ATTEMPTS) {
    otpMap.delete(key);
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Please request a new code.',
    };
  }

  const computedHash = hashOtp(code, record.salt);
  if (computedHash !== record.hashedCode) {
    const remaining = MAX_VERIFY_ATTEMPTS - record.attempts;
    return {
      success: false,
      error: `Invalid code. ${remaining} attempt(s) remaining.`,
    };
  }

  // Verified! Invalidate challenge
  const verifiedPhone = record.phone;
  otpMap.delete(key);

  return {
    success: true,
    phone: verifiedPhone,
  };
}
