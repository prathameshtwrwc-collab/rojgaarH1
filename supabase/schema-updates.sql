-- Schema updates for Rojgaar Hai
-- Run this in the Supabase SQL Editor. Safe to re-run (idempotent).

-- Employer signup no longer collects company details up front — they're
-- filled in later from the employer dashboard (with a Skip option), so
-- company_name must be allowed to start out empty.
ALTER TABLE public.employers ALTER COLUMN company_name DROP NOT NULL;
