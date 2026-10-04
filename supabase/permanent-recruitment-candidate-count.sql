-- Lets an employer request more than one permanent-recruitment candidate at a time.
-- Run once in the Supabase SQL editor. Safe to run again.

ALTER TABLE public.permanent_recruitment_requests
  ADD COLUMN IF NOT EXISTS candidate_count INTEGER NOT NULL DEFAULT 1;
