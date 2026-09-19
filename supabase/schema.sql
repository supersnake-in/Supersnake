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
  fit TEXT CHECK (fit IN ('Oversized', 'Relaxed', 'Boxy', 'Classic')) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  mrp NUMERIC(10, 2) NOT NULL,
  gsm INTEGER NOT NULL,
  fabric TEXT NOT NULL,
  care_instructions TEXT[],
  features TEXT[],
  is_spotlight BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  angle TEXT CHECK (angle IN ('front', 'back', 'detail', 'model', 'fabric')),
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
  size TEXT CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')) NOT NULL,
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

-- Products: Public can read, anyone with key/admin can insert/update/delete
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow product mutation" ON public.products;
CREATE POLICY "Allow product mutation" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Product Images: Public can read, anyone with key/admin can insert/update/delete
DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow product images mutation" ON public.product_images;
CREATE POLICY "Allow product images mutation" ON public.product_images FOR ALL USING (true) WITH CHECK (true);

-- Product Variants: Public can read, anyone with key/admin can insert/update/delete
DROP POLICY IF EXISTS "Public can view product variants" ON public.product_variants;
CREATE POLICY "Public can view product variants" ON public.product_variants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow product variants mutation" ON public.product_variants;
CREATE POLICY "Allow product variants mutation" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);

-- Orders: Public can create, users/admin can view
DROP POLICY IF EXISTS "Users view their own orders" ON public.orders;
CREATE POLICY "Users view their own orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow order update" ON public.orders;
CREATE POLICY "Allow order update" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- Order Items
DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
CREATE POLICY "Public can view order items" ON public.order_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;
CREATE POLICY "Public can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Newsletter
DROP POLICY IF EXISTS "Public can subscribe newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Coupons & Reviews
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
ON CONFLICT (sku) DO NOTHING;

