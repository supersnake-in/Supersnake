-- ============================================================
-- SUPERSNAKE.IN — THEME-BASED COLLECTION SERIES SCHEMA & SEED
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  badge TEXT,
  artwork_mood TEXT,
  fabric_specs TEXT,
  hero_image TEXT,
  card_image TEXT,
  mood_palette JSONB DEFAULT '[]'::jsonb,
  accent_color TEXT DEFAULT '#04fc21',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Collection Foreign Keys & Slugs to Products Table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS collection_slug TEXT,
  ADD COLUMN IF NOT EXISTS collection_name TEXT;

-- 3. Row Level Security Policies
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active collections
CREATE POLICY "Public can view active collections"
  ON public.collections
  FOR SELECT
  USING (true);

-- Allow admins and service role full mutation access
CREATE POLICY "Admins have full access to collections"
  ON public.collections
  FOR ALL
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Seed Initial Collection Universe Series
INSERT INTO public.collections (
  id,
  name,
  slug,
  badge,
  tagline,
  description,
  artwork_mood,
  fabric_specs,
  hero_image,
  card_image,
  mood_palette,
  accent_color,
  display_order,
  is_active,
  is_featured
) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'THE BLACK PANTHER',
  'the-black-panther',
  'CHAPTER 01 // SHADOW PREDATOR',
  'Power, stealth, and feline elegance engineered in deep shadow tones.',
  'Inspired by the raw power, stealth, confidence, and quiet elegance of the panther. The Black Panther series explores nocturnal dominance through rich obsidian and mineral charcoal fabrics, precision tonal high-density embroidery, and restrained neon-green signature accents. Every garment embodies a predator’s calculated grace—unspoken authority, tailored monolithic drape, and uncompromising tactile presence.',
  'Subtle panther chest crest, micro-embossed feline silhouette, tonal neck embroidery, restrained neon-green bar-tacks.',
  '280–300 GSM Heavyweight Supima® Cotton & French Terry, Preshrunk Boxy Contour.',
  '/hero2.png',
  '/men-collection.png',
  '[{"name":"Obsidian Black","hex":"#0a0a0a"},{"name":"Panther Charcoal","hex":"#1c1c1c"},{"name":"Shadow Mineral","hex":"#2b2b2b"},{"name":"Restrained Venom","hex":"#04fc21"}]'::jsonb,
  '#04fc21',
  1,
  TRUE,
  TRUE
),
(
  'a0000000-0000-0000-0000-000000000002',
  'THE ROYALS',
  'the-royals',
  'CHAPTER 02 // IMPERIAL ARCHIVE',
  'Heritage, prestige, and timeless luxury. Sovereignty in pure heavyweight drape.',
  'Inspired by dynastic heritage, sovereign prestige, and timeless aristocratic luxury. The Royals series marries classical heraldic emblems with ultra-refined typography, creating an aura of supreme status without gaudy ostentation. Tailored in deep royal hues with subtle metallic and tonal threadwork, this chapter is designed for those who command respect through restraint.',
  'Refined serif typography, sovereign serpent crest with imperial crown emblem, gilded tonal embroidery, bespoke heritage interior neck tape.',
  '280 GSM Compact Supima® Combed Cotton, Zero-Sag Ribbed Collar, Architectural Dropped Shoulders.',
  '/brand-pillar-fabric.png',
  '/signature-tee-spotlight.png',
  '[{"name":"Midnight Navy","hex":"#0d1527"},{"name":"Imperial Gold","hex":"#c5a059"},{"name":"Vintage Burgundy","hex":"#3b1219"},{"name":"Bone Ivory","hex":"#e6dfd5"}]'::jsonb,
  '#c5a059',
  2,
  TRUE,
  TRUE
),
(
  'a0000000-0000-0000-0000-000000000003',
  'THE SERPENT',
  'the-serpent',
  'CHAPTER 03 // PRIMAL IDENTITY',
  'Instinct, mystery, and metamorphosis. The core pulse of SUPER SNAKE.',
  'Centred on instinct, mystery, transformation, and our foundational snake identity. The Serpent series translates the hypnotic poise and lethal strike of the viper into distinctive graphic language, micro-textured reptilian scale motifs, and signature neon-green accents. It is the purest visual manifestation of wearing your instinct.',
  'Micro-density tactile snake crest, coiled serpent spine back placement, emerald and venom green contrast bar-tacks.',
  '260–280 GSM Organic French Terry & Heavy Jersey, Reinforced Bar-Tacks, Pre-Enzyme Wash.',
  '/hero-object-supersnake-tee.png',
  '/hero2.png',
  '[{"name":"Venom Green","hex":"#04fc21"},{"name":"Obsidian Black","hex":"#0a0a0a"},{"name":"Serpent Emerald","hex":"#0d381e"},{"name":"Smoked Ash","hex":"#383838"}]'::jsonb,
  '#04fc21',
  3,
  TRUE,
  TRUE
),
(
  'a0000000-0000-0000-0000-000000000004',
  'THE AURA',
  'the-aura',
  'CHAPTER 04 // QUIET LUXURY',
  'Radical minimalism, clean silhouettes, and whispered sophistication.',
  'A study in quiet luxury, architectural minimalism, and supreme everyday wearability. The Aura series strips away exterior distraction to focus purely on tactile excellence, flawless tailoring, unbleached organic textures, and microscopic branding. Designed to be felt before it is seen.',
  'Invisible Japanese blind hems, tone-on-tone micro-branding at nape, zero-exterior stitch noise.',
  '240–280 GSM Unbleached Organic Supima® Cotton, Ultra-Soft Silicone Wash, Fluid Relaxed Silhouette.',
  '/brand-pillar-fit.png',
  '/women-collection.png',
  '[{"name":"Chalk White","hex":"#f2f2f2"},{"name":"Bone Ivory","hex":"#e6dfd5"},{"name":"Misty Oat","hex":"#cfc6b8"},{"name":"Quiet Clay","hex":"#8a7d6d"}]'::jsonb,
  '#e6dfd5',
  4,
  TRUE,
  TRUE
),
(
  'a0000000-0000-0000-0000-000000000005',
  'THE NOCTURNE',
  'the-nocturne',
  'CHAPTER 05 // CINEMATIC NIGHT',
  'Darker cinematic artistry, nocturnal mood, and stark architectural contrasts.',
  'Built around a darker, cinematic aesthetic with moody graphics and carefully controlled contrasts. The Nocturne series evokes urban neon-lit solitude, reflections across damp asphalt, and raw underground energy. Finished with specialized mineral washes and deconstructed laser-cut accents.',
  'Cinematic chiaroscuro back prints, distressed acid wash textures, subtle violet undertones, controlled raw-edge hems.',
  '300 GSM Heavyweight Loopback Cotton, Acid Mineral Wash, Over-Dyed Black.',
  '/brand-pillar-finish.png',
  '/community-supersnake.png',
  '[{"name":"Acid Charcoal","hex":"#1e1e1e"},{"name":"Nocturne Violet","hex":"#1e142e"},{"name":"Electric Cyan","hex":"#00e5ff"},{"name":"Deep Pitch","hex":"#050505"}]'::jsonb,
  '#00e5ff',
  5,
  TRUE,
  TRUE
),
(
  'a0000000-0000-0000-0000-000000000006',
  'THE SIGNATURE',
  'the-signature',
  'THE CORE FOUNDATION // DAILY LUXURY',
  'Our permanent core collection featuring timeless SUPER SNAKE essentials.',
  'The immortal cornerstone of SUPER SNAKE. Featuring the exact, uncompromised master brand symbol and engineered around the demands of daily life. The Signature collection showcases our heavyweight 280 GSM Supima® cotton, 1-inch zero-sag reinforced collar, and tailored boxy architecture. Timeless essentials built to wear forever.',
  'The pristine original SUPER SNAKE master symbol, signature neon-green accent label, embroidered serpent monogram.',
  '280 GSM 100% Long-Staple Supima® Combed Cotton, Zero-Sag Collar, Twin-Needle Reinforcement.',
  '/signature-tee-spotlight.png',
  '/hero-object-supersnake-tee.png',
  '[{"name":"Obsidian Black","hex":"#0a0a0a"},{"name":"Chalk White","hex":"#f2f2f2"},{"name":"Washed Charcoal","hex":"#262626"},{"name":"Signature Green","hex":"#04fc21"}]'::jsonb,
  '#04fc21',
  6,
  TRUE,
  TRUE
),
(
  'a0000000-0000-0000-0000-000000000007',
  'SS MOTORS',
  'ss-motors',
  'SPECIALIZED LINE // VELOCITY LAB',
  'Aerodynamic precision, automotive culture, and track-engineered aesthetic.',
  'Where high-performance automotive engineering converges with luxury streetwear. The SS Motors specialized capsule draws inspiration from aggressive aerodynamic splitters, carbon fiber textures, racing telemetry, and automotive proportions. Engineered for those who move at high velocity.',
  'Precision racing telemetry numbers, carbon weave print accents, aerodynamic sleeve split graphics, high-speed typography.',
  '290 GSM Compact Aero-Knit Cotton, Reinforced Shoulder Webbing, Low-Drag Collar.',
  '/hero2.png',
  '/men-collection.png',
  '[{"name":"Carbon Black","hex":"#121212"},{"name":"Racing Silver","hex":"#d4d4d4"},{"name":"Telemetry Red","hex":"#e50914"},{"name":"Asphalt Grey","hex":"#404040"}]'::jsonb,
  '#e50914',
  7,
  TRUE,
  FALSE
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  badge = EXCLUDED.badge,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  artwork_mood = EXCLUDED.artwork_mood,
  fabric_specs = EXCLUDED.fabric_specs,
  hero_image = EXCLUDED.hero_image,
  card_image = EXCLUDED.card_image,
  mood_palette = EXCLUDED.mood_palette,
  accent_color = EXCLUDED.accent_color,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  updated_at = NOW();

-- Assign existing products to their corresponding collection series
UPDATE public.products SET
  collection_slug = 'the-signature',
  collection_name = 'THE SIGNATURE'
WHERE slug = 'the-signature-tee';

UPDATE public.products SET
  collection_slug = 'the-serpent',
  collection_name = 'THE SERPENT'
WHERE slug IN ('the-serpent-tee', 'the-venom-edition');

UPDATE public.products SET
  collection_slug = 'the-nocturne',
  collection_name = 'THE NOCTURNE'
WHERE slug IN ('the-monolith-oversized', 'the-shadow-raw-hem');

UPDATE public.products SET
  collection_slug = 'the-aura',
  collection_name = 'THE AURA'
WHERE slug IN ('the-chalk-minimalist', 'the-kinetic-silk-cotton');

UPDATE public.products SET
  collection_slug = 'the-royals',
  collection_name = 'THE ROYALS'
WHERE slug = 'the-meridian-cropped';
