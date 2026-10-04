-- Adds an optional exact location / area to job postings, shown alongside city and state.
-- Run once in the Supabase SQL editor. Safe to run again.

ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS address TEXT;
