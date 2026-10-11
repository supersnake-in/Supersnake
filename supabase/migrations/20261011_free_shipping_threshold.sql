-- ============================================================
-- SUPERSNAKE.IN — FREE SHIPPING THRESHOLD MIGRATION
-- Adds persistent free_shipping_threshold column to storefront_config
-- ============================================================

ALTER TABLE public.storefront_config 
ADD COLUMN IF NOT EXISTS free_shipping_threshold NUMERIC DEFAULT 1999;

-- Set initial default threshold to 1999 if null
UPDATE public.storefront_config 
SET free_shipping_threshold = 1999 
WHERE free_shipping_threshold IS NULL;
