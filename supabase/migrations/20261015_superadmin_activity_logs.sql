-- ============================================================
-- SUPERSNAKE.IN — SUPERADMIN, AUDIT LOG & EMERGENCY MIGRATION
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id TEXT PRIMARY KEY,
  admin_email TEXT NOT NULL,
  admin_name TEXT,
  category TEXT NOT NULL CHECK (category IN ('CATALOG', 'SETTINGS', 'ORDERS', 'DISCOUNTS', 'EMERGENCY', 'COLLECTIONS', 'SYSTEM')),
  action TEXT NOT NULL,
  target_title TEXT NOT NULL,
  details TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for timeline queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.admin_activity_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category ON public.admin_activity_logs (category);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_email ON public.admin_activity_logs (admin_email);

-- 2. Emergency Controls Table (Single-row configuration)
CREATE TABLE IF NOT EXISTS public.emergency_controls (
  id TEXT PRIMARY KEY DEFAULT 'current',
  storefront_frozen BOOLEAN DEFAULT FALSE,
  checkout_paused BOOLEAN DEFAULT FALSE,
  discounts_disabled BOOLEAN DEFAULT FALSE,
  emergency_notice TEXT DEFAULT '',
  last_toggled_by TEXT DEFAULT 'System',
  last_toggled_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row if not exists
INSERT INTO public.emergency_controls (id, storefront_frozen, checkout_paused, discounts_disabled, emergency_notice)
VALUES ('current', FALSE, FALSE, FALSE, '')
ON CONFLICT (id) DO NOTHING;

-- 3. Admin Users / Personnel Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPERADMIN', 'ADMIN', 'CO_ADMIN', 'STORE_MANAGER', 'SUPPORT_LEAD')),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INVITED', 'SUSPENDED')),
  avatar_url TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Administrators (jdhanush213@gmail.com as sole Superadmin, supersnake.in@gmail.com as Admin)
INSERT INTO public.admin_users (id, email, name, role, status)
VALUES 
  ('admin-1', 'supersnake.in@gmail.com', 'SuperSnake Atelier (Admin)', 'ADMIN', 'ACTIVE'),
  ('admin-2', 'jdhanush213@gmail.com', 'Dhanush J (Founder & Superadmin)', 'SUPERADMIN', 'ACTIVE')
ON CONFLICT (email) DO UPDATE SET 
  role = EXCLUDED.role,
  name = EXCLUDED.name;

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Safe re-runnable RLS Policies
DROP POLICY IF EXISTS "Allow all for admin_activity_logs" ON public.admin_activity_logs;
CREATE POLICY "Allow all for admin_activity_logs"
  ON public.admin_activity_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for emergency_controls" ON public.emergency_controls;
CREATE POLICY "Allow all for emergency_controls"
  ON public.emergency_controls
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for admin_users" ON public.admin_users;
CREATE POLICY "Allow all for admin_users"
  ON public.admin_users
  FOR ALL
  USING (true)
  WITH CHECK (true);
