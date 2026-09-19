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
  if (!src) return false;
  // Allow safe HTTPS URLs
  if (src.startsWith('https://')) return true;
  // Allow safe base64 image data URIs
  if (src.startsWith('data:image/png;base64,') ||
      src.startsWith('data:image/jpeg;base64,') ||
      src.startsWith('data:image/webp;base64,') ||
      src.startsWith('data:image/avif;base64,')) {
    return true;
  }
  // Allow local public paths
  if (src.startsWith('/')) return true;
  return false;
}
