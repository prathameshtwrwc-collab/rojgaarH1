-- Adds industry (sector) and role (subsector) to job postings.
-- These drive skill suggestions, job filters and the smart matching analytics.
-- Safe to run more than once.

ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS subsector text;

CREATE INDEX IF NOT EXISTS job_postings_sector_idx ON public.job_postings (sector);
CREATE INDEX IF NOT EXISTS job_postings_subsector_idx ON public.job_postings (subsector);
