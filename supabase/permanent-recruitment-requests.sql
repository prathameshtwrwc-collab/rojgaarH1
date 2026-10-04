-- Permanent recruitment requests: an employer pays a one-time fee per candidate type
-- (unskilled or skilled) for Rojgaar Hai's end-to-end hiring service.
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE TABLE IF NOT EXISTS public.permanent_recruitment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
    candidate_type TEXT NOT NULL CHECK (candidate_type IN ('unskilled', 'skilled')),
    plan_label TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    upi_transaction_id TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered', 'cancelled')),
    notes TEXT,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_permanent_recruitment_requests_employer
  ON public.permanent_recruitment_requests (employer_id);

ALTER TABLE public.permanent_recruitment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employers can view own permanent requests" ON public.permanent_recruitment_requests;
CREATE POLICY "Employers can view own permanent requests" ON public.permanent_recruitment_requests
  FOR SELECT USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can create own permanent requests" ON public.permanent_recruitment_requests;
CREATE POLICY "Employers can create own permanent requests" ON public.permanent_recruitment_requests
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Superadmins can view all permanent requests" ON public.permanent_recruitment_requests;
CREATE POLICY "Superadmins can view all permanent requests" ON public.permanent_recruitment_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
  );

DROP POLICY IF EXISTS "Superadmins can update all permanent requests" ON public.permanent_recruitment_requests;
CREATE POLICY "Superadmins can update all permanent requests" ON public.permanent_recruitment_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
  );
