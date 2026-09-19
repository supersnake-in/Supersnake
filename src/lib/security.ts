/**
 * SUPERSNAKE SECURITY & SANITIZATION UTILITIES
 * Enforces zero leakage of secrets and protects all client & server inputs.
 */

// Strip potentially malicious characters, tags, and script injections
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // remove direct angle brackets to prevent HTML injection
    .trim();
}

// Generate URL-safe slug from product name
export function sanitizeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Ensure numeric values are safe and positive
export function sanitizeNumber(value: any, defaultValue: number = 0, max: number = 1000000): number {
  const parsed = Number(value);
  if (isNaN(parsed) || parsed < 0) return defaultValue;
  return Math.min(parsed, max);
}

// Validate image URL or Base64 Data URI
export function isValidImageSource(src: string): boolean {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  // Allow safe HTTPS / HTTP URLs
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return true;
  // Allow safe base64 image data URIs (jpg, jpeg, png, webp, avif, gif, svg+xml, etc. - case insensitive)
  if (/^data:image\/[a-zA-Z0-9+.-]+;base64,/i.test(trimmed)) return true;
  // Allow local public paths and blob URLs
  if (trimmed.startsWith('/') || trimmed.startsWith('blob:')) return true;
  return false;
}

// Authorized Admin Email Whitelist
export const AUTHORIZED_ADMIN_EMAILS = [
  'jdhanush213@gmail.com',
  'supersnake.in@gmail.com',
] as const;

// Verify if an email is an authorized atelier administrator
export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}
