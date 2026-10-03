-- Allow superadmins to update CV requests (mark Processing / Delivered / Cancelled).
-- Run once in Supabase → SQL Editor. Safe to re-run.

DROP POLICY IF EXISTS "Superadmins can update all cv requests" ON public.cv_requests;
CREATE POLICY "Superadmins can update all cv requests" ON public.cv_requests
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

-- Make sure the columns the admin page writes to exist.
ALTER TABLE public.cv_requests ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.cv_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
