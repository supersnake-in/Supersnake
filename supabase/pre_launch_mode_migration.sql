-- ============================================================
-- SUPERSNAKE.IN — PRE-LAUNCH MODE & PRODUCT PRE-BOOKING MIGRATION
-- ============================================================

-- 1. Create or alter storefront_config table (Unified Storefront Controller)
CREATE TABLE IF NOT EXISTS public.storefront_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  storefront_mode TEXT NOT NULL DEFAULT 'PRE_LAUNCH', -- 'PRE_LAUNCH' | 'LIVE' | 'MAINTENANCE'
  launch_date TEXT DEFAULT '2026-10-14',
  launch_time TEXT DEFAULT '10:00',
  launch_timezone TEXT DEFAULT 'IST',
  automatic_launch BOOLEAN DEFAULT FALSE,
  pre_launch_product_limit INT DEFAULT 6,
  maintenance_message TEXT DEFAULT 'We are calibrating the atelier for our next heavyweight drop. The portal will resume normal operations shortly.',
  estimated_restore_time TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'system'
);

-- Seed default configuration if empty
INSERT INTO public.storefront_config (
  id,
  storefront_mode,
  launch_date,
  launch_time,
  launch_timezone,
  automatic_launch,
  pre_launch_product_limit,
  maintenance_message,
  estimated_restore_time,
  updated_at,
  updated_by
)
VALUES (
  'default',
  'PRE_LAUNCH',
  '2026-10-14',
  '10:00',
  'IST',
  FALSE,
  6,
  'We are calibrating the atelier for our next heavyweight drop. The portal will resume normal operations shortly.',
  NULL,
  NOW(),
  'system'
)
ON CONFLICT (id) DO UPDATE SET
  storefront_mode = EXCLUDED.storefront_mode,
  launch_date = COALESCE(public.storefront_config.launch_date, EXCLUDED.launch_date),
  launch_time = COALESCE(public.storefront_config.launch_time, EXCLUDED.launch_time),
  launch_timezone = COALESCE(public.storefront_config.launch_timezone, EXCLUDED.launch_timezone),
  pre_launch_product_limit = COALESCE(public.storefront_config.pre_launch_product_limit, EXCLUDED.pre_launch_product_limit);

-- Enable RLS & Policies for storefront_config
ALTER TABLE public.storefront_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read storefront_config" ON public.storefront_config;
CREATE POLICY "Allow public read storefront_config"
ON public.storefront_config
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow all update storefront_config" ON public.storefront_config;
CREATE POLICY "Allow all update storefront_config"
ON public.storefront_config
FOR ALL
TO public
USING (true)
WITH CHECK (true);

GRANT ALL ON TABLE public.storefront_config TO anon, authenticated, service_role;

-- 2. Add pre_launch_enabled to products table if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'pre_launch_enabled'
  ) THEN
    ALTER TABLE public.products ADD COLUMN pre_launch_enabled BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'max_pre_bookings'
  ) THEN
    ALTER TABLE public.products ADD COLUMN max_pre_bookings INT DEFAULT NULL;
  END IF;
END $$;

-- 3. Create Pre-Bookings Table
CREATE TABLE IF NOT EXISTS public.pre_bookings (
  id TEXT PRIMARY KEY,
  booking_number TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_image TEXT,
  color_name TEXT NOT NULL,
  color_hex TEXT,
  size TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Reservation', -- 'Paid' | 'Pending' | 'Reservation' | 'Pending (COD)'
  payment_method TEXT DEFAULT 'razorpay',             -- 'razorpay' | 'cod'
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  paid_at TIMESTAMPTZ,
  booking_status TEXT NOT NULL DEFAULT 'Confirmed',   -- 'Confirmed' | 'Payment Pending' | 'Cancelled' | 'Converted to Order' | 'Fulfilled'
  shipping_address JSONB,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure payment columns exist on pre_bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pre_bookings' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.pre_bookings ADD COLUMN payment_method TEXT DEFAULT 'razorpay';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pre_bookings' AND column_name = 'razorpay_payment_id'
  ) THEN
    ALTER TABLE public.pre_bookings ADD COLUMN razorpay_payment_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pre_bookings' AND column_name = 'razorpay_order_id'
  ) THEN
    ALTER TABLE public.pre_bookings ADD COLUMN razorpay_order_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pre_bookings' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE public.pre_bookings ADD COLUMN paid_at TIMESTAMPTZ;
  END IF;
END $$;

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_pre_bookings_email ON public.pre_bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_pre_bookings_product ON public.pre_bookings(product_id);
CREATE INDEX IF NOT EXISTS idx_pre_bookings_status ON public.pre_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_pre_bookings_created ON public.pre_bookings(created_at DESC);

-- Enable RLS & Policies for pre_bookings
ALTER TABLE public.pre_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert pre_bookings" ON public.pre_bookings;
CREATE POLICY "Allow public insert pre_bookings"
ON public.pre_bookings
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select pre_bookings" ON public.pre_bookings;
CREATE POLICY "Allow public select pre_bookings"
ON public.pre_bookings
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow public update pre_bookings" ON public.pre_bookings;
CREATE POLICY "Allow public update pre_bookings"
ON public.pre_bookings
FOR ALL
TO public
USING (true)
WITH CHECK (true);

GRANT ALL ON TABLE public.pre_bookings TO anon, authenticated, service_role;
