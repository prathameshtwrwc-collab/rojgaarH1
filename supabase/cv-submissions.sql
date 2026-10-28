-- CV submissions: the admin hand-picks candidates for a job and sends their CVs to the employer.
-- Run once in the Supabase SQL editor. Safe to run again.
--
-- Flow
--   1. Admin opens a job (or a paid CV request) and picks candidates, with an optional note on each.
--   2. One row per candidate is written here. Rows sent together share a batch_id.
--   3. The employer sees them under "CVs from Rojgaar Hai" on that job, opens the resume
--      (status becomes 'viewed'), then marks each one Shortlisted / Interview / Hired / Not a fit.
--   4. The admin sees that response on the job page, so the next batch can be better.
--
-- Privacy: the employer gets a snapshot (name, resume link and, only when share_contact is on,
-- the phone number) taken at send time. Employers can only read and answer their own rows,
-- and a trigger stops them changing anything except their response.

-- Same helper as admin-delete.sql, repeated so this file also works on its own
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

CREATE TABLE IF NOT EXISTS public.cv_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  cv_request_id UUID REFERENCES public.cv_requests(id) ON DELETE SET NULL,

  -- What the employer sees, frozen at send time
  candidate_name TEXT,
  candidate_phone TEXT,          -- left empty unless share_contact is true
  resume_url TEXT,
  match_score INTEGER CHECK (match_score IS NULL OR match_score BETWEEN 0 AND 100),
  share_contact BOOLEAN NOT NULL DEFAULT TRUE,
  admin_note TEXT,               -- why this candidate fits, written by the admin
  message TEXT,                  -- covering message for the whole batch

  -- The employer's response
  status TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'viewed', 'shortlisted', 'interview', 'hired', 'rejected')),
  employer_feedback TEXT,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,

  sent_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A candidate is sent to the same employer for the same job only once
-- (a fixed UUID stands in for "no job", so general requests are covered too)
CREATE UNIQUE INDEX IF NOT EXISTS cv_submissions_once_idx
  ON public.cv_submissions (employer_id, COALESCE(job_id, '00000000-0000-0000-0000-000000000000'::uuid), candidate_id);
CREATE INDEX IF NOT EXISTS cv_submissions_employer_idx ON public.cv_submissions (employer_id);
CREATE INDEX IF NOT EXISTS cv_submissions_job_idx ON public.cv_submissions (job_id);
CREATE INDEX IF NOT EXISTS cv_submissions_request_idx ON public.cv_submissions (cv_request_id);
CREATE INDEX IF NOT EXISTS cv_submissions_batch_idx ON public.cv_submissions (batch_id);

-- Keep updated_at fresh, and let employers change only their response fields
CREATE OR REPLACE FUNCTION public.cv_submissions_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  IF public.is_superadmin() THEN
    RETURN NEW;
  END IF;
  IF NEW.batch_id IS DISTINCT FROM OLD.batch_id
     OR NEW.employer_id IS DISTINCT FROM OLD.employer_id
     OR NEW.job_id IS DISTINCT FROM OLD.job_id
     OR NEW.candidate_id IS DISTINCT FROM OLD.candidate_id
     OR NEW.cv_request_id IS DISTINCT FROM OLD.cv_request_id
     OR NEW.candidate_name IS DISTINCT FROM OLD.candidate_name
     OR NEW.candidate_phone IS DISTINCT FROM OLD.candidate_phone
     OR NEW.resume_url IS DISTINCT FROM OLD.resume_url
     OR NEW.match_score IS DISTINCT FROM OLD.match_score
     OR NEW.share_contact IS DISTINCT FROM OLD.share_contact
     OR NEW.admin_note IS DISTINCT FROM OLD.admin_note
     OR NEW.message IS DISTINCT FROM OLD.message
     OR NEW.sent_by IS DISTINCT FROM OLD.sent_by
     OR NEW.sent_at IS DISTINCT FROM OLD.sent_at THEN
    RAISE EXCEPTION 'Employers can only update the status and feedback of a CV submission';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cv_submissions_guard ON public.cv_submissions;
CREATE TRIGGER trg_cv_submissions_guard
BEFORE UPDATE ON public.cv_submissions
FOR EACH ROW EXECUTE FUNCTION public.cv_submissions_guard();

-- Row-level security
ALTER TABLE public.cv_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmins manage cv submissions" ON public.cv_submissions;
CREATE POLICY "Superadmins manage cv submissions" ON public.cv_submissions
  FOR ALL USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "Employers read own cv submissions" ON public.cv_submissions;
CREATE POLICY "Employers read own cv submissions" ON public.cv_submissions
  FOR SELECT USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers answer own cv submissions" ON public.cv_submissions;
CREATE POLICY "Employers answer own cv submissions" ON public.cv_submissions
  FOR UPDATE USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
