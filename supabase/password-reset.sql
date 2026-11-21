-- Forgot-password by SMS code. Run once in the Supabase SQL editor. Safe to run again.
--
-- Flow (see api/password-reset.ts)
--   1. Person enters their mobile number on a login page.
--   2. The server finds the account, texts a 6-digit code and stores only a HASH of it here.
--   3. Person types the code. If it matches (and is fresh, unused, under 5 tries) the server
--      signs them in and the app opens a "set new password" box on their dashboard.
--
-- This is deliberately NOT the public otp_verifications table: that one can be read with the
-- public key, which would let anyone read a code and take over an account. This table has
-- row-level security switched on and NO policies, so only the server (service role) can touch it.

CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_reset_otps_phone_idx ON public.password_reset_otps (phone, created_at DESC);
CREATE INDEX IF NOT EXISTS password_reset_otps_expires_idx ON public.password_reset_otps (expires_at);

ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;
-- No policies on purpose. Nobody but the service role can read or write this table.
REVOKE ALL ON public.password_reset_otps FROM anon, authenticated;

-- Optional tidy-up, can be called now and then
CREATE OR REPLACE FUNCTION public.cleanup_password_reset_otps()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.password_reset_otps WHERE expires_at < now() - interval '1 day';
$$;
REVOKE ALL ON FUNCTION public.cleanup_password_reset_otps() FROM anon, authenticated, public;
