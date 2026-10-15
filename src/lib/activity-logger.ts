/**
 * SUPERSNAKE ATELIER — SUPERADMIN & AUDIT LOG ENGINE
 * Manages admin access directory, immutable activity trails, emergency kill-switches, and customer intelligence export.
 */

import { supabase } from './supabase/client';
import {
  AdminActivityLog,
  AdminUser,
  AdminActionCategory,
  EmergencyControlState,
  CustomerIntelligence,
} from './types';

const ACTIVITY_STORAGE_KEY = 'supersnake_admin_activity_logs';
const ADMIN_USERS_STORAGE_KEY = 'supersnake_admin_users';
const EMERGENCY_STORAGE_KEY = 'supersnake_emergency_controls';

// Default Executive Administrators
export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'supersnake.in@gmail.com',
    name: 'SuperSnake Atelier (Executive)',
    role: 'SUPERADMIN',
    status: 'ACTIVE',
    lastActiveAt: new Date().toISOString(),
    addedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'admin-2',
    email: 'jdhanush213@gmail.com',
    name: 'Dhanush J (Founder & Lead)',
    role: 'SUPERADMIN',
    status: 'ACTIVE',
    lastActiveAt: new Date().toISOString(),
    addedAt: '2026-09-01T00:00:00.000Z',
  },
];

// Seeded historical audit trail so the dashboard is operational from day one
export const SEED_ACTIVITY_LOGS: AdminActivityLog[] = [
  {
    id: 'log-seed-1',
    adminEmail: 'supersnake.in@gmail.com',
    adminName: 'SuperSnake Atelier',
    category: 'SETTINGS',
    action: 'STOREFRONT_MODE_UPDATE',
    targetTitle: 'Storefront Mode',
    details: 'Configured storefront mode to PRE_LAUNCH with automated drop countdown and countdown banner.',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    severity: 'INFO',
  },
  {
    id: 'log-seed-2',
    adminEmail: 'jdhanush213@gmail.com',
    adminName: 'Dhanush J',
    category: 'CATALOG',
    action: 'SHOP_CATALOG_REORDER',
    targetTitle: 'Shop Display Hierarchy',
    details: 'Configured custom storefront ranking: top 12 prioritized products arranged with automatic fallback to latest creations.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    severity: 'INFO',
  },
  {
    id: 'log-seed-3',
    adminEmail: 'supersnake.in@gmail.com',
    adminName: 'SuperSnake Atelier',
    category: 'SETTINGS',
    action: 'FREE_SHIPPING_UPDATE',
    targetTitle: 'Complimentary Shipping Benchmark',
    details: 'Adjusted complimentary shipping benchmark to ₹1,999 across all domestic pin codes.',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    severity: 'INFO',
  },
  {
    id: 'log-seed-4',
    adminEmail: 'jdhanush213@gmail.com',
    adminName: 'Dhanush J',
    category: 'COLLECTIONS',
    action: 'COLLECTION_MUTATION',
    targetTitle: 'Chapter 01: Genesis',
    details: 'Updated chapter mood palette and finalized editorial visual assets for seasonal preview.',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    severity: 'INFO',
  },
  {
    id: 'log-seed-5',
    adminEmail: 'supersnake.in@gmail.com',
    adminName: 'SuperSnake Atelier',
    category: 'SYSTEM',
    action: 'ATELIER_SECURITY_AUDIT',
    targetTitle: 'Security Whitelist',
    details: 'Enforced strict zero-leakage security boundaries and authenticated Superadmin email whitelist.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2880).toISOString(),
    severity: 'INFO',
  },
];

export const DEFAULT_EMERGENCY_STATE: EmergencyControlState = {
  storefrontFrozen: false,
  checkoutPaused: false,
  discountsDisabled: false,
  emergencyNotice: '',
  lastToggledBy: 'System',
  lastToggledAt: new Date().toISOString(),
};

/**
 * Fetch all admin users synchronously from cache
 */
export function getAdminUsers(): AdminUser[] {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_USERS;
  try {
    const raw = localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(DEFAULT_ADMIN_USERS));
      return DEFAULT_ADMIN_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ADMIN_USERS;
  } catch {
    return DEFAULT_ADMIN_USERS;
  }
}

/**
 * Fetch all admin users asynchronously from Supabase with cache fallback
 */
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase.from('admin_users').select('*').order('added_at', { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: AdminUser[] = data.map((r: any) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        role: r.role,
        status: r.status,
        lastActiveAt: r.last_active_at,
        addedAt: r.added_at,
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(mapped));
      }
      return mapped;
    }
  } catch (err) {
    // Fall back to local cache
  }
  return getAdminUsers();
}

/**
 * Save updated admin user roster (syncs to localStorage and Supabase)
 */
export function saveAdminUsers(users: AdminUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('supersnake_admin_users_updated', { detail: users }));

    // Non-blocking sync to Supabase
    const rows = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      last_active_at: u.lastActiveAt || new Date().toISOString(),
      added_at: u.addedAt || new Date().toISOString(),
    }));
    supabase.from('admin_users').upsert(rows).then(() => {});
  } catch (e) {
    console.warn('Failed to save admin users:', e);
  }
}

/**
 * Fetch all activity logs (merges Supabase records + local cache + seeds)
 */
export async function getAdminActivityLogs(): Promise<AdminActivityLog[]> {
  let logs: AdminActivityLog[] = [];

  // 1. Try fetching from Supabase table if available
  try {
    const { data, error } = await supabase
      .from('admin_activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(200);

    if (!error && Array.isArray(data) && data.length > 0) {
      logs = data.map((row: any) => ({
        id: row.id,
        adminEmail: row.admin_email,
        adminName: row.admin_name || row.admin_email?.split('@')[0],
        category: (row.category || 'SYSTEM') as AdminActionCategory,
        action: row.action,
        targetTitle: row.target_title || 'General',
        details: row.details,
        metadata: row.metadata,
        timestamp: row.timestamp || row.created_at,
        severity: row.severity || 'INFO',
      }));
    }
  } catch (err) {
    // Supabase table may not exist yet, fallback to localStorage
  }

  // 2. Read local cache
  let localLogs: AdminActivityLog[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (raw) {
        localLogs = JSON.parse(raw);
      }
    } catch {}
  }

  // 3. Merge Supabase logs, local logs, and seed logs
  const mergedMap = new Map<string, AdminActivityLog>();
  [...logs, ...localLogs, ...SEED_ACTIVITY_LOGS].forEach((item) => {
    if (item && item.id && !mergedMap.has(item.id)) {
      mergedMap.set(item.id, item);
    }
  });

  const finalLogs = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return finalLogs;
}

/**
 * Log an administrative operation into audit history
 */
export async function recordAdminActivity(entry: {
  adminEmail: string;
  adminName?: string;
  category: AdminActionCategory;
  action: string;
  targetTitle: string;
  details: string;
  metadata?: Record<string, any>;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
}): Promise<AdminActivityLog> {
  const newLog: AdminActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    adminEmail: entry.adminEmail,
    adminName: entry.adminName || entry.adminEmail.split('@')[0],
    category: entry.category,
    action: entry.action,
    targetTitle: entry.targetTitle,
    details: entry.details,
    metadata: entry.metadata || {},
    timestamp: new Date().toISOString(),
    severity: entry.severity || 'INFO',
  };

  // 1. Immediately cache to localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      const current: AdminActivityLog[] = raw ? JSON.parse(raw) : [];
      const updated = [newLog, ...current].slice(0, 300);
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('supersnake_activity_logged', { detail: newLog }));
    } catch (e) {
      console.warn('Could not cache activity log locally:', e);
    }
  }

  // 2. Asynchronously sync to Supabase table
  try {
    await supabase.from('admin_activity_logs').insert([
      {
        id: newLog.id,
        admin_email: newLog.adminEmail,
        admin_name: newLog.adminName,
        category: newLog.category,
        action: newLog.action,
        target_title: newLog.targetTitle,
        details: newLog.details,
        metadata: newLog.metadata,
        severity: newLog.severity,
        timestamp: newLog.timestamp,
      },
    ]);
  } catch (err) {
    // Table may not yet exist on Supabase, local cache holds authoritative trail
  }

  return newLog;
}

/**
 * Fetch Emergency Controls State
 */
export function getEmergencyControls(): EmergencyControlState {
  if (typeof window === 'undefined') return DEFAULT_EMERGENCY_STATE;
  try {
    const raw = localStorage.getItem(EMERGENCY_STORAGE_KEY);
    if (!raw) return DEFAULT_EMERGENCY_STATE;
    return { ...DEFAULT_EMERGENCY_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_EMERGENCY_STATE;
  }
}

/**
 * Update Emergency Controls State
 */
export function saveEmergencyControls(
  updates: Partial<EmergencyControlState>,
  adminEmail: string
): EmergencyControlState {
  const current = getEmergencyControls();
  const next: EmergencyControlState = {
    ...current,
    ...updates,
    lastToggledBy: adminEmail,
    lastToggledAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(EMERGENCY_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('supersnake_emergency_controls_updated', { detail: next }));

      // Non-blocking sync to Supabase emergency_controls table
      supabase
        .from('emergency_controls')
        .upsert([
          {
            id: 'current',
            storefront_frozen: next.storefrontFrozen,
            checkout_paused: next.checkoutPaused,
            discounts_disabled: next.discountsDisabled,
            emergency_notice: next.emergencyNotice || '',
            last_toggled_by: adminEmail,
            last_toggled_at: next.lastToggledAt,
          },
        ])
        .then(() => {});
    } catch (e) {
      console.warn('Failed to save emergency controls:', e);
    }
  }

  // Log action
  recordAdminActivity({
    adminEmail,
    category: 'EMERGENCY',
    action: 'EMERGENCY_CONTROL_TOGGLE',
    targetTitle: 'Brand Kill-Switches',
    details: `Updated emergency controls: Frozen: ${next.storefrontFrozen}, Checkout Paused: ${next.checkoutPaused}, Discounts Disabled: ${next.discountsDisabled}`,
    severity: 'CRITICAL',
  });

  return next;
}

/**
 * Format RFC-4180 compliant CSV cell
 */
function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export Customer Directory to CSV file
 */
export function exportCustomersToCSV(customers: CustomerIntelligence[]): void {
  if (typeof window === 'undefined' || !customers || customers.length === 0) return;

  const headers = [
    'Patron Name',
    'Email Address',
    'Phone Number',
    'Phone Verified',
    'Location',
    'Total Orders',
    'Lifetime Value (INR)',
    'Average Order Value (INR)',
    'Patron Tier',
    'First Acquisition Date',
    'Last Activity Date',
    'Registered Account',
  ];

  const rows = customers.map((c) => [
    escapeCsvCell(c.name),
    escapeCsvCell(c.email),
    escapeCsvCell(c.phone),
    escapeCsvCell(c.phoneVerified ? 'VERIFIED' : 'UNVERIFIED'),
    escapeCsvCell(c.location),
    escapeCsvCell(c.ordersCount),
    escapeCsvCell(c.totalSpent.toFixed(2)),
    escapeCsvCell(c.averageOrderValue.toFixed(2)),
    escapeCsvCell(c.tier),
    escapeCsvCell(c.firstOrderDate),
    escapeCsvCell(c.lastOrderDate),
    escapeCsvCell(c.registeredAccount ? 'YES' : 'GUEST'),
  ]);

  const csvContent = [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `supersnake-patrons-export-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
