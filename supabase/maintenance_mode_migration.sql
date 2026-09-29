-- ============================================================
-- SUPERSNAKE.IN — GLOBAL MAINTENANCE MODE MIGRATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.maintenance_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  maintenance_message TEXT DEFAULT 'We are calibrating the atelier for our next heavyweight drop. The portal will resume normal operations shortly.',
  estimated_restore_time TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'system'
);

-- Seed default configuration if not exists
INSERT INTO public.maintenance_config (
  id,
  maintenance_mode,
  maintenance_message,
  estimated_restore_time,
  updated_at,
  updated_by
)
VALUES (
  'default',
  FALSE,
  'We are calibrating the atelier for our next heavyweight drop. The portal will resume normal operations shortly.',
  NULL,
  NOW(),
  'system'
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.maintenance_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for edge middleware, customer storefront, and API checks)
DROP POLICY IF EXISTS "Allow public read maintenance_config" ON public.maintenance_config;
CREATE POLICY "Allow public read maintenance_config"
ON public.maintenance_config
FOR SELECT
TO public
USING (true);

-- Allow updates (for admin portal and service role)
DROP POLICY IF EXISTS "Allow update maintenance_config" ON public.maintenance_config;
CREATE POLICY "Allow update maintenance_config"
ON public.maintenance_config
FOR ALL
TO public
USING (true)
WITH CHECK (true);

GRANT ALL ON TABLE public.maintenance_config TO anon, authenticated, service_role;
