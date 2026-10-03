-- Ties each CV request to the job it was made for.
-- Run once in the Supabase SQL editor. Safe to run again.
-- Older requests keep no job and stay in the company-level list.

ALTER TABLE public.cv_requests
  ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS cv_requests_job_idx ON public.cv_requests (job_id);
