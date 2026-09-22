-- ============================================================
-- SUPERSNAKE.IN — ABANDONED & ACTIVE CARTS TABLE MIGRATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Abandoned', 'Contacted', 'Recovered')),
  notes TEXT,
  discount_offered TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy lookups by customer email and status
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON public.abandoned_carts(customer_email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status ON public.abandoned_carts(status);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_updated ON public.abandoned_carts(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Allow public upsert/inserts for customer sessions (anon and authenticated)
CREATE POLICY "Allow public cart sync"
ON public.abandoned_carts
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions to anon and authenticated
GRANT ALL ON public.abandoned_carts TO anon, authenticated, service_role;
