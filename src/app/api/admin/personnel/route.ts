import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { AdminUser, AdminRole } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Default Executive Administrators
const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'supersnake.in@gmail.com',
    name: 'SuperSnake Atelier (Admin)',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastActiveAt: new Date().toISOString(),
    addedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'admin-2',
    email: 'jdhanush213@gmail.com',
    name: 'Dhanush J (Founder & Superadmin)',
    role: 'SUPERADMIN',
    status: 'ACTIVE',
    lastActiveAt: new Date().toISOString(),
    addedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'admin-3',
    email: 'jdhanush2103@gmail.com',
    name: 'DhanushJ2103 (Co-Admin)',
    role: 'CO_ADMIN',
    status: 'ACTIVE',
    lastActiveAt: new Date().toISOString(),
    addedAt: '2026-10-15T00:00:00.000Z',
  },
];

// Server-side in-memory cache to sync across devices even if Supabase SQL migration is pending
let serverAdminsCache: AdminUser[] = [...INITIAL_ADMINS];

/**
 * GET: Retrieve all registered administrative personnel
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('added_at', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      serverAdminsCache = data.map((r: any) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        role: r.role as AdminRole,
        status: r.status,
        lastActiveAt: r.last_active_at,
        addedAt: r.added_at,
      }));
    }
  } catch (err) {
    // Graceful fallback to server in-memory cache
  }

  return NextResponse.json(
    { success: true, admins: serverAdminsCache },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

/**
 * POST: Add or update personnel in the directory
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, users } = body;

    const listToSave: AdminUser[] = users || (user ? [user] : []);
    if (listToSave.length === 0) {
      return NextResponse.json({ error: 'No user data provided' }, { status: 400 });
    }

    // Merge into server cache
    listToSave.forEach((u) => {
      const cleanEmail = u.email.trim().toLowerCase();
      const idx = serverAdminsCache.findIndex((e) => e.email.toLowerCase() === cleanEmail);
      const entry: AdminUser = {
        ...u,
        email: cleanEmail,
      };
      if (idx >= 0) {
        serverAdminsCache[idx] = { ...serverAdminsCache[idx], ...entry };
      } else {
        serverAdminsCache.push(entry);
      }
    });

    // Asynchronously upsert to Supabase admin_users table
    try {
      const rows = listToSave.map((u) => ({
        id: u.id,
        email: u.email.trim().toLowerCase(),
        name: u.name,
        role: u.role,
        status: u.status,
        last_active_at: u.lastActiveAt || new Date().toISOString(),
        added_at: u.addedAt || new Date().toISOString(),
      }));
      await supabase.from('admin_users').upsert(rows);
    } catch (dbErr) {
      console.warn('Supabase admin_users upsert notice:', dbErr);
    }

    return NextResponse.json({ success: true, admins: serverAdminsCache });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
