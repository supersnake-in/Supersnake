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

import { AdminRole, CO_ADMIN_PERMITTED_ROUTES } from './types';

// Authorized Admin Email Whitelist
export const AUTHORIZED_ADMIN_EMAILS = [
  'jdhanush213@gmail.com',
  'supersnake.in@gmail.com',
] as const;

// Executive Superadmin Email Whitelist (Exclusive to Lead Superadmin)
export const SUPERADMIN_EMAILS = [
  'jdhanush213@gmail.com',
] as const;

// Verify if an email is an authorized atelier administrator (including dynamic co-admins)
export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  
  // 1. Check permanent whitelists
  if (AUTHORIZED_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized)) {
    return true;
  }
  if (SUPERADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized)) {
    return true;
  }

  // 2. Check dynamic registered personnel in storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('supersnake_admin_users');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const match = parsed.find(
            (u: any) => u.email?.toLowerCase() === normalized && u.status === 'ACTIVE'
          );
          if (match) return true;
        }
      }
    } catch {}
  }

  return false;
}

// Verify if an email is the executive Superadmin
export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return SUPERADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

// Determine the operational role for a given administrator
export function getAdminRole(email?: string | null): AdminRole | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();

  // Primary Superadmin
  if (isSuperAdmin(normalized)) {
    return 'SUPERADMIN';
  }

  // Check dynamically registered personnel
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('supersnake_admin_users');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const match = parsed.find(
            (u: any) => u.email?.toLowerCase() === normalized && u.status === 'ACTIVE'
          );
          if (match && match.role) {
            return match.role as AdminRole;
          }
        }
      }
    } catch {}
  }

  // Fallback for permanent atelier administration
  if (normalized === 'supersnake.in@gmail.com') {
    return 'ADMIN';
  }

  return null;
}

// Verify if a given pathname is permitted for the specific role
export function isRoutePermittedForRole(pathname: string, role?: AdminRole | null): boolean {
  if (!role) return false;

  // Superadmin has universal clearance
  if (role === 'SUPERADMIN') return true;

  // Standard Admin has access to all admin routes except Superadmin Command
  if (role === 'ADMIN') {
    return pathname !== '/admin/superadmin' && !pathname.startsWith('/admin/superadmin/');
  }

  // Co-Admin has strictly scoped clearance: Products, Collections, Inventory, Orders
  if (role === 'CO_ADMIN' || role === 'STORE_MANAGER') {
    return CO_ADMIN_PERMITTED_ROUTES.some(
      (permittedRoute) => pathname === permittedRoute || pathname.startsWith(`${permittedRoute}/`)
    );
  }

  // Support Lead clearance: Orders and Pre-bookings
  if (role === 'SUPPORT_LEAD') {
    return pathname === '/admin/orders' || pathname.startsWith('/admin/orders/');
  }

  return false;
}
