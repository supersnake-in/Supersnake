-- ============================================================
-- SUPERSNAKE.IN — SUPERADMIN & AUDIT LOG MIGRATION
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  emergency_notice TEXT,
  last_toggled_by TEXT,
  last_toggled_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row if not exists
INSERT INTO public.emergency_controls (id, storefront_frozen, checkout_paused, discounts_disabled, emergency_notice)
VALUES ('current', FALSE, FALSE, FALSE, '')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_controls ENABLE ROW LEVEL SECURITY;

-- Allow read/write for service_role and authenticated admins
CREATE POLICY "Admins can view and insert activity logs"
  ON public.admin_activity_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can read and update emergency controls"
  ON public.emergency_controls
  FOR ALL
  USING (true)
  WITH CHECK (true);
