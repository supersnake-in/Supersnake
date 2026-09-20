-- ============================================================
-- SUPERSNAKE.IN — SIGNATURE PRODUCT SYSTEM MIGRATION
-- ============================================================

-- 1. Add is_signature column to products table if not already present
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_signature BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. One-time legacy migration seeding (migration-only use of is_spotlight)
DO $$
DECLARE
  target_id UUID;
BEGIN
  -- Only execute if products exist and no product is currently marked as signature
  IF EXISTS (SELECT 1 FROM public.products) AND NOT EXISTS (SELECT 1 FROM public.products WHERE is_signature = TRUE) THEN
    -- A. Check if an existing product was marked with legacy is_spotlight
    SELECT id INTO target_id FROM public.products WHERE is_spotlight = TRUE LIMIT 1;
    
    -- B. Otherwise, select the earliest created active product
    IF target_id IS NULL THEN
      SELECT id INTO target_id FROM public.products ORDER BY created_at ASC LIMIT 1;
    END IF;
    
    -- C. Designate the chosen product as the initial Signature Product
    IF target_id IS NOT NULL THEN
      UPDATE public.products SET is_signature = TRUE WHERE id = target_id;
    END IF;
  END IF;
END $$;

-- 3. Enforce maximum of ONE Signature Product at the database level
CREATE UNIQUE INDEX IF NOT EXISTS one_signature_product
ON public.products (is_signature)
WHERE is_signature = TRUE;

-- 4. Concurrency-safe atomic stored procedure to swap signature product
CREATE OR REPLACE FUNCTION set_signature_product(target_product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Serialize concurrent signature update operations across admins
  PERFORM pg_advisory_xact_lock(hashtext('set_signature_product_lock'));

  -- Verify that the target product exists
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = target_product_id) THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Atomic swap: clear existing signature product, then assign to target
  UPDATE public.products SET is_signature = FALSE WHERE is_signature = TRUE;
  UPDATE public.products SET is_signature = TRUE WHERE id = target_product_id;
END;
$$;

-- 5. Security hardening: restrict execution to service_role / server
REVOKE ALL ON FUNCTION set_signature_product(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION set_signature_product(UUID) TO service_role;
