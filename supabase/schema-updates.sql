-- Schema updates for Rojgaar Hai
-- Run this in the Supabase SQL Editor. Safe to re-run (idempotent).

-- Employer signup no longer collects company details up front — they're
-- filled in later from the employer dashboard (with a Skip option), so
-- company_name must be allowed to start out empty.
ALTER TABLE public.employers ALTER COLUMN company_name DROP NOT NULL;

-- Candidate profile: add industry and department columns for sector/sub-sector
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS department TEXT;

-- Employer profile: add department column for sub-sector
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS department TEXT;

-- Job postings: add payment columns for job posting fee collection
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2);
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS upi_transaction_id TEXT;
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ;
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS payment_verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- CV/Resume requests from employers for verified candidate profiles
CREATE TABLE IF NOT EXISTS public.cv_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  plan_key TEXT NOT NULL,
  plan_label TEXT NOT NULL,
  cv_count INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  upi_transaction_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cv_requests_employer ON public.cv_requests(employer_id);
CREATE INDEX IF NOT EXISTS idx_cv_requests_status ON public.cv_requests(status);
