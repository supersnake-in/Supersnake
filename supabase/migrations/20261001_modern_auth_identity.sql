-- ============================================================
-- SUPERSNAKE.IN — MODERN LOW-FRICTION AUTHENTICATION & IDENTITY
-- Migration: 20261001_modern_auth_identity.sql
-- ============================================================

-- 1. Extend public.profiles with modern identity and phone verification columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS phone_verification_method TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Ensure default false on existing nulls
UPDATE public.profiles
SET phone_verified = FALSE
WHERE phone_verified IS NULL;

-- 2. Extend public.orders to record authoritative phone verification state at order creation
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- 3. Passkey UI Metadata Table
-- IMPORTANT: This table only stores patron-facing UI metadata (e.g. friendly name, last used timestamp).
-- WebAuthn credentials, challenges, and public/private keys are handled exclusively by Supabase Auth (GoTrue).
CREATE TABLE IF NOT EXISTS public.user_passkeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credential_id TEXT NOT NULL,
  friendly_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_passkeys_user_id ON public.user_passkeys(user_id);

-- RLS for user_passkeys
ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patrons can view own passkey metadata" ON public.user_passkeys;
CREATE POLICY "Patrons can view own passkey metadata" ON public.user_passkeys
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patrons can insert own passkey metadata" ON public.user_passkeys;
CREATE POLICY "Patrons can insert own passkey metadata" ON public.user_passkeys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patrons can update own passkey metadata" ON public.user_passkeys;
CREATE POLICY "Patrons can update own passkey metadata" ON public.user_passkeys
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patrons can delete own passkey metadata" ON public.user_passkeys;
CREATE POLICY "Patrons can delete own passkey metadata" ON public.user_passkeys
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Corrected Automated Auth Trigger: handle_new_user()
-- CRITICAL CORRECTIONS:
--  a) last_login_at is NOT updated here because this trigger only runs upon user creation.
--     last_login_at is authoritatively recorded server-side during session touch.
--  b) avatar_url is extracted from Google / OAuth metadata (avatar_url or picture).
--  c) phone_verified defaults to FALSE. It is only set to TRUE via server-side verification.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT := 'customer';
  extracted_avatar TEXT := NULL;
  extracted_phone TEXT := NULL;
BEGIN
  -- Automatically grant admin role to designated executive emails
  IF NEW.email IN ('jdhanush213@gmail.com', 'supersnake.in@gmail.com') THEN
    assigned_role := 'admin';
  END IF;

  extracted_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  extracted_phone := NEW.raw_user_meta_data->>'phone';

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    avatar_url,
    phone_verified,
    phone_verified_at,
    phone_verification_method,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    extracted_phone,
    extracted_avatar,
    FALSE,
    NULL,
    NULL,
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
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
