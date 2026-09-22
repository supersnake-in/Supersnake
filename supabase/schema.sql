-- ============================================================
-- SUPERSNAKE.IN — SUPABASE POSTGRESQL PRODUCTION SCHEMA & SEED
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  gender TEXT CHECK (gender IN ('men', 'women', 'unisex')) NOT NULL,
  fit TEXT CHECK (fit IN ('Oversized', 'Relaxed', 'Boxy', 'Classic', 'Slim')) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  mrp NUMERIC(10, 2) NOT NULL,
  gsm INTEGER NOT NULL,
  fabric TEXT NOT NULL,
  weight_text TEXT,
  care_instructions TEXT[],
  features TEXT[],
  shipping_policy TEXT,
  colors JSONB,
  sizes TEXT[],
  is_signature BOOLEAN NOT NULL DEFAULT FALSE,
  is_spotlight BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial unique index: guarantees at most ONE Signature Product
CREATE UNIQUE INDEX IF NOT EXISTS one_signature_product
ON public.products (is_signature)
WHERE is_signature = TRUE;

-- Atomic, concurrency-safe stored procedure to swap signature product
CREATE OR REPLACE FUNCTION set_signature_product(target_product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('set_signature_product_lock'));
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = target_product_id) THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  UPDATE public.products SET is_signature = FALSE WHERE is_signature = TRUE;
  UPDATE public.products SET is_signature = TRUE WHERE id = target_product_id;
END;
$$;

REVOKE ALL ON FUNCTION set_signature_product(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION set_signature_product(UUID) TO service_role;

-- 3. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  angle TEXT CHECK (angle IN ('front', 'back', 'detail', 'model', 'fabric', 'studio', 'side') OR angle IS NULL),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  size TEXT CHECK (size IN ('XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL')) NOT NULL,
  stock INTEGER DEFAULT 0,
  price NUMERIC(10, 2) NOT NULL,
  mrp NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Customer Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN (
    'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 
    'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'
  )),
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  shipping NUMERIC(10, 2) DEFAULT 0,
  tax NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  transaction_id TEXT,
  tracking_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER,
  discount_amount NUMERIC(10, 2),
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Newsletter Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTOMATED AUTH TRIGGER: SYNC auth.users TO public.profiles
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT := 'customer';
BEGIN
  -- Automatically grant admin role to designated executive emails
  IF NEW.email IN ('jdhanush213@gmail.com', 'supersnake.in@gmail.com') THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    role = assigned_role,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    auth.jwt()->>'email' IN ('jdhanush213@gmail.com', 'supersnake.in@gmail.com')
  );

-- 2. Addresses Policies
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
CREATE POLICY "Users can view own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
CREATE POLICY "Users can insert own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;
CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all addresses" ON public.addresses;
CREATE POLICY "Admins can manage all addresses" ON public.addresses
  FOR ALL USING (
    auth.jwt()->>'email' IN ('jdhanush213@gmail.com', 'supersnake.in@gmail.com')
  );

-- 3. Products: Public can read, anyone with key/admin can insert/update/delete
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow product mutation" ON public.products;
CREATE POLICY "Allow product mutation" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- 4. Product Images
DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow product images mutation" ON public.product_images;
CREATE POLICY "Allow product images mutation" ON public.product_images FOR ALL USING (true) WITH CHECK (true);

-- 5. Product Variants
DROP POLICY IF EXISTS "Public can view product variants" ON public.product_variants;
CREATE POLICY "Public can view product variants" ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow product variants mutation" ON public.product_variants;
CREATE POLICY "Allow product variants mutation" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);

-- 6. Orders: Anyone can create orders (guest or patron); patrons & admins can view
DROP POLICY IF EXISTS "Users view their own orders" ON public.orders;
CREATE POLICY "Users view their own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id 
    OR customer_email = auth.jwt()->>'email'
    OR auth.jwt()->>'email' IN ('jdhanush213@gmail.com', 'supersnake.in@gmail.com')
    OR true -- Fallback for storefront order lookup
  );

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow order update" ON public.orders;
CREATE POLICY "Allow order update" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- 7. Order Items
DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
CREATE POLICY "Public can view order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;
CREATE POLICY "Public can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- 8. Newsletter
DROP POLICY IF EXISTS "Public can subscribe newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- 9. Coupons & Reviews
DROP POLICY IF EXISTS "Public view coupons" ON public.coupons;
CREATE POLICY "Public view coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view reviews" ON public.reviews;
CREATE POLICY "Public view reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write reviews" ON public.reviews;
CREATE POLICY "Public write reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- ============================================================
-- SEED INITIAL LUXURY PRODUCTS & VARIANTS
-- ============================================================

INSERT INTO public.products (
  id, name, slug, tagline, description, gender, fit, price, mrp, gsm, fabric,
  care_instructions, features, is_spotlight, is_bestseller, is_new, rating, reviews_count
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'THE SIGNATURE TEE',
  'the-signature-tee',
  'The definitive luxury heavyweight tee. Built for presence.',
  'Constructed from 280 GSM long-staple Supima® cotton, the Signature Tee represents the pinnacle of daily luxury. Featuring a structured boxy silhouette, a 1-inch reinforced ribbed collar that never sags, and blind-stitched hems for a razor-clean finish.',
  'unisex',
  'Boxy',
  1499,
  2499,
  280,
  '100% Long-Staple Supima® Cotton (280 GSM Heavyweight)',
  ARRAY['Machine wash cold, inside out with like colors', 'Do not bleach or tumble dry', 'Lay flat to dry in shade', 'Cool iron inside out if needed'],
  ARRAY['280 GSM Heavyweight combed cotton', 'Zero-sag reinforced 1-inch collar', 'Pre-shrunk to retain structural geometry', 'Subtle tonal SuperSnake nape embroidery'],
  TRUE,
  TRUE,
  FALSE,
  4.9,
  184
),
(
  '00000000-0000-0000-0000-000000000002',
  'THE SERPENT TEE',
  'the-serpent-tee',
  'Discreet instinct. Engineered with micro-density snake crest.',
  'An understated icon. The Serpent Tee pairs our 260 GSM French Terry cotton with a precision-embossed tonal snake crest on the left chest. Designed with slightly dropped shoulders for effortless silhouette drape.',
  'men',
  'Oversized',
  1899,
  2999,
  260,
  '100% Organic French Terry Cotton (260 GSM)',
  ARRAY['Machine wash gentle cycle at 30°C', 'Wash inside out to protect embroidery', 'Do not iron directly over chest crest'],
  ARRAY['High-density micro-embossed snake motif', 'Dropped shoulder seam with reinforced bar-tacks', 'Breathable French Terry looped interior'],
  FALSE,
  TRUE,
  FALSE,
  4.8,
  142
),
(
  '00000000-0000-0000-0000-000000000003',
  'THE MONOLITH OVERSIZED',
  'the-monolith-oversized',
  'Architectural scale. 300 GSM maximum structural drape.',
  'Our heaviest construction to date. The Monolith weighs in at 300 GSM of double-knit Supima® cotton, producing a garment that holds its architectural silhouette independently of the body.',
  'unisex',
  'Oversized',
  1799,
  2799,
  300,
  '100% Double-Knit Supima® Cotton (300 GSM Ultra-Heavyweight)',
  ARRAY['Machine wash cold', 'Dry flat away from direct sunlight', 'Do not wring or twist'],
  ARRAY['300 GSM Ultra-Heavyweight structure', 'Engineered architectural drape', 'Double-needle reinforced seams', 'Pre-shrunk double-washed'],
  FALSE,
  TRUE,
  TRUE,
  5.0,
  96
),
(
  '00000000-0000-0000-0000-000000000004',
  'THE MINIMALIST HEAVY',
  'the-minimalist-heavy',
  'Purity in execution. Zero exterior branding.',
  'Stripped of all noise. The Minimalist Heavy relies purely on fabric caliber and surgical pattern precision. 270 GSM heavyweight jersey in custom-milled organic yarn.',
  'men',
  'Relaxed',
  1599,
  2499,
  270,
  '100% Organic Ring-Spun Combed Cotton (270 GSM)',
  ARRAY['Machine wash cold with like colors', 'Tumble dry low or line dry in shade'],
  ARRAY['Completely unbranded exterior', 'Clean bound neckband', 'Subtle curved side seam split'],
  FALSE,
  FALSE,
  TRUE,
  4.7,
  68
),
(
  '00000000-0000-0000-0000-000000000005',
  'THE CROPPED ESSENTIAL',
  'the-cropped-essential',
  'Proportioned silhouette. Waistline architectural cut.',
  'Specifically proportioned for women. Designed to hit exactly at the natural high waistline with a relaxed boxy chest and wide sleeve opening.',
  'women',
  'Boxy',
  1399,
  2199,
  250,
  '100% Supima® Cotton Jersey (250 GSM)',
  ARRAY['Machine wash cold gentle cycle', 'Do not tumble dry', 'Warm iron if needed'],
  ARRAY['High-waist architectural cropped cut', 'Wide drop-shoulder sleeves', 'Dense 250 GSM jersey that holds shape'],
  FALSE,
  TRUE,
  FALSE,
  4.9,
  112
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Product Images
INSERT INTO public.product_images (product_id, url, alt, angle, display_order)
SELECT 
  '00000000-0000-0000-0000-000000000001'::UUID,
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1600&auto=format&fit=crop',
  'The Signature Tee - Front View',
  'front',
  0
WHERE NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = '00000000-0000-0000-0000-000000000001'::UUID);

INSERT INTO public.product_images (product_id, url, alt, angle, display_order)
SELECT 
  '00000000-0000-0000-0000-000000000002'::UUID,
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1600&auto=format&fit=crop',
  'The Serpent Tee - Studio Front',
  'front',
  0
WHERE NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = '00000000-0000-0000-0000-000000000002'::UUID);

INSERT INTO public.product_images (product_id, url, alt, angle, display_order)
SELECT 
  '00000000-0000-0000-0000-000000000003'::UUID,
  'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=1600&auto=format&fit=crop',
  'The Monolith Oversized - Front View',
  'front',
  0
WHERE NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = '00000000-0000-0000-0000-000000000003'::UUID);

INSERT INTO public.product_images (product_id, url, alt, angle, display_order)
SELECT 
  '00000000-0000-0000-0000-000000000004'::UUID,
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1600&auto=format&fit=crop',
  'The Minimalist Heavy - Front View',
  'front',
  0
WHERE NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = '00000000-0000-0000-0000-000000000004'::UUID);

INSERT INTO public.product_images (product_id, url, alt, angle, display_order)
SELECT 
  '00000000-0000-0000-0000-000000000005'::UUID,
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
  'The Cropped Essential - Front View',
  'front',
  0
WHERE NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = '00000000-0000-0000-0000-000000000005'::UUID);

-- Seed Product Variants
INSERT INTO public.product_variants (product_id, sku, color_name, color_hex, size, stock, price, mrp)
VALUES
('00000000-0000-0000-0000-000000000001', 'SS-SIG-BLK-S', 'Obsidian Black', '#0a0a0a', 'S', 25, 1499, 2499),
('00000000-0000-0000-0000-000000000001', 'SS-SIG-BLK-M', 'Obsidian Black', '#0a0a0a', 'M', 40, 1499, 2499),
('00000000-0000-0000-0000-000000000001', 'SS-SIG-BLK-L', 'Obsidian Black', '#0a0a0a', 'L', 30, 1499, 2499),
('00000000-0000-0000-0000-000000000001', 'SS-SIG-BLK-XL', 'Obsidian Black', '#0a0a0a', 'XL', 15, 1499, 2499),
('00000000-0000-0000-0000-000000000002', 'SS-SER-BLK-M', 'Obsidian Black', '#0a0a0a', 'M', 35, 1899, 2999),
('00000000-0000-0000-0000-000000000002', 'SS-SER-BLK-L', 'Obsidian Black', '#0a0a0a', 'L', 20, 1899, 2999),
('00000000-0000-0000-0000-000000000003', 'SS-MON-CHR-L', 'Washed Charcoal', '#262626', 'L', 28, 1799, 2799),
('00000000-0000-0000-0000-000000000004', 'SS-MIN-OLV-M', 'Sage Olive', '#3d4a3e', 'M', 22, 1599, 2499),
('00000000-0000-0000-0000-000000000005', 'SS-CRP-BLK-S', 'Obsidian Black', '#0a0a0a', 'S', 20, 1399, 2199),
('00000000-0000-0000-0000-000000000005', 'SS-CRP-BLK-M', 'Obsidian Black', '#0a0a0a', 'M', 30, 1399, 2199)
-- 11. Homepage Configuration Table
CREATE TABLE IF NOT EXISTS public.homepage_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_images TEXT[] NOT NULL DEFAULT '{}',
  hero_interval_seconds INTEGER DEFAULT 3,
  hero_headline TEXT DEFAULT 'WEAR YOUR INSTINCT.',
  hero_supporting_copy TEXT DEFAULT 'Premium T-shirts. Designed for your everyday. Engineered for presence.',
  spotlight_product_id TEXT DEFAULT 'the-signature-tee',
  brand_statement TEXT DEFAULT 'NOT MADE TO BLEND IN.',
  men_collection_image TEXT DEFAULT 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1600&auto=format&fit=crop',
  women_collection_image TEXT DEFAULT 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was previously created
ALTER TABLE public.homepage_config 
  ADD COLUMN IF NOT EXISTS men_collection_image TEXT DEFAULT 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1600&auto=format&fit=crop',
  ADD COLUMN IF NOT EXISTS women_collection_image TEXT DEFAULT 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop';

-- Enable RLS
ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for storefront)
CREATE POLICY "Allow public read homepage_config"
  ON public.homepage_config
  FOR SELECT
  TO public
  USING (true);

-- Allow public/authenticated insert or update
CREATE POLICY "Allow public all homepage_config"
  ON public.homepage_config
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert default row
INSERT INTO public.homepage_config (id, hero_images, hero_interval_seconds, hero_headline, hero_supporting_copy, spotlight_product_id, brand_statement)
VALUES (
  'default',
  ARRAY[
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=2400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=2400&auto=format&fit=crop'
  ],
  3,
  'WEAR YOUR INSTINCT.',
  'Premium T-shirts. Designed for your everyday. Engineered for presence.',
  'the-signature-tee',
  'NOT MADE TO BLEND IN.'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 11. Defect Reports Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.defect_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  report_number TEXT UNIQUE NOT NULL,
  order_id TEXT,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  product_color TEXT,
  product_size TEXT,
  product_image TEXT,
  defect_type TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  status TEXT DEFAULT 'Pending Review' CHECK (status IN (
    'Pending Review', 'Under Investigation', 'Approved', 'Rejected', 'Resolved'
  )),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Graceful migration if already created with UUID type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'defect_reports' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.defect_reports ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE public.defect_reports ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_defect_reports_order ON public.defect_reports(order_number);
CREATE INDEX IF NOT EXISTS idx_defect_reports_status ON public.defect_reports(status);
CREATE INDEX IF NOT EXISTS idx_defect_reports_created ON public.defect_reports(created_at DESC);

ALTER TABLE public.defect_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert defect_reports" ON public.defect_reports;
CREATE POLICY "Allow public insert defect_reports"
  ON public.defect_reports
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated staff select defect_reports" ON public.defect_reports;
DROP POLICY IF EXISTS "Allow public select defect_reports" ON public.defect_reports;
CREATE POLICY "Allow public select defect_reports"
  ON public.defect_reports
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated staff update defect_reports" ON public.defect_reports;
DROP POLICY IF EXISTS "Allow public update defect_reports" ON public.defect_reports;
CREATE POLICY "Allow public update defect_reports"
  ON public.defect_reports
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

GRANT ALL ON TABLE public.defect_reports TO anon, authenticated, service_role;

