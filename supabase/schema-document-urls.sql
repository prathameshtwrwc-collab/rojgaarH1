-- Add document URL columns to candidates table
-- Run this in Supabase SQL Editor

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS aadhaar_url TEXT,
  ADD COLUMN IF NOT EXISTS pan_url TEXT,
  ADD COLUMN IF NOT EXISTS certificate_url TEXT,
  ADD COLUMN IF NOT EXISTS experience_letter_url TEXT;

-- Add RLS policy for the new columns (existing policies cover these)
-- No additional RLS needed as candidates table already has policies
