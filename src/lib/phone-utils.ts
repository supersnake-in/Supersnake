/**
 * Phone number normalization and validation utilities for SuperSnake.
 * Enforces canonical E.164 format (+919876543210 for India).
 */

export function normalizePhoneNumber(rawPhone: string, defaultCountryCode = '91'): string {
  if (!rawPhone) return '';

  // Strip all non-digit characters except leading '+'
  const trimmed = rawPhone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (!digitsOnly) return '';

  // If already starts with '+', ensure format is '+[digits]'
  if (hasPlus) {
    return `+${digitsOnly}`;
  }

  // If 10 digits (standard Indian mobile format)
  if (digitsOnly.length === 10) {
    return `+${defaultCountryCode}${digitsOnly}`;
  }

  // If 11 digits starting with '0' (trunk prefix in India/UK)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `+${defaultCountryCode}${digitsOnly.slice(1)}`;
  }

  // If 12 digits starting with country code (e.g. 919876543210)
  if (digitsOnly.length === 12 && digitsOnly.startsWith(defaultCountryCode)) {
    return `+${digitsOnly}`;
  }

  // Default: prepend '+' to digits
  return `+${digitsOnly}`;
}

export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // Basic E.164 validation: '+' followed by 10 to 15 digits
  return /^\+[1-9]\d{9,14}$/.test(normalized);
}

export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return '';

  // Format Indian numbers for elegant presentation: +91 98765 43210
  if (normalized.startsWith('+91') && normalized.length === 13) {
    const main = normalized.slice(3);
    return `+91 ${main.slice(0, 5)} ${main.slice(5)}`;
  }

  return normalized;
}

export function maskPhoneNumber(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized || normalized.length < 6) return phone;

  const prefix = normalized.slice(0, 3); // e.g. +91
  const last3 = normalized.slice(-3);
  return `${prefix} ••••• ••${last3}`;
}
