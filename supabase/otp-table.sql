-- OTP Verification Table for SMS Auth
-- Run this in Supabase SQL Editor

-- Create OTP verifications table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  email TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone ON public.otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires ON public.otp_verifications(expires_at);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role bypasses RLS, so these are for anon/authenticated)
-- Allow insert (creating OTP)
CREATE POLICY "Allow insert OTP" ON public.otp_verifications
  FOR INSERT WITH CHECK (true);

-- Allow select for verification (checking OTP)
CREATE POLICY "Allow select OTP" ON public.otp_verifications
  FOR SELECT USING (true);

-- Allow update for marking as verified
CREATE POLICY "Allow update OTP" ON public.otp_verifications
  FOR UPDATE USING (true);

-- Function to clean up expired OTPs (optional, can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.otp_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RLS Bypass Functions for Auth Flow (SECURITY DEFINER)
-- These run with function owner privileges, bypassing RLS
-- ============================================================

-- Function to check phone exists (bypasses RLS for auth flow)
CREATE OR REPLACE FUNCTION check_phone_exists(check_phone TEXT, check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE phone = check_phone AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get email by phone (bypasses RLS for auth flow)
CREATE OR REPLACE FUNCTION get_email_by_phone(check_phone TEXT)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email 
  FROM public.profiles 
  WHERE phone = check_phone AND role = 'candidate'
  LIMIT 1;
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon role (for unauthenticated users during login)
GRANT EXECUTE ON FUNCTION check_phone_exists(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_email_by_phone(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_phone_exists(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_email_by_phone(TEXT) TO authenticated;
