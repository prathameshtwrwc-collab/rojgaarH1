-- ============================================================
-- Recruiter feature + job-approval bug fix
--
-- ⚠️ RUN IN TWO STEPS. Postgres will not let a brand-new enum
-- value be used in the same transaction/script that creates it,
-- so select PART 1 and run it first, then select PART 2 and run
-- it separately.
-- ============================================================

-- ============================================================
-- PART 1 — run this first, alone
-- ============================================================
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'recruiter';


-- ============================================================
-- PART 2 — run this after PART 1 has completed
-- ============================================================

-- Recruiters table
CREATE TABLE IF NOT EXISTS public.recruiters (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    referral_code TEXT NOT NULL UNIQUE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recruiters_referral_code ON public.recruiters(referral_code);
CREATE INDEX IF NOT EXISTS idx_recruiters_is_approved ON public.recruiters(is_approved);

DROP TRIGGER IF EXISTS trg_recruiters_updated_at ON public.recruiters;
CREATE TRIGGER trg_recruiters_updated_at
BEFORE UPDATE ON public.recruiters
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Candidates can now be mapped under a recruiter instead of (or as well as) an employer
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS referred_by_recruiter UUID REFERENCES public.recruiters(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_referred_by_recruiter ON public.candidates(referred_by_recruiter);

-- RLS: recruiters table
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recruiter record" ON public.recruiters;
CREATE POLICY "Users can view own recruiter record" ON public.recruiters
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can view all recruiters" ON public.recruiters;
CREATE POLICY "Authenticated users can view all recruiters" ON public.recruiters
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own recruiter record" ON public.recruiters;
CREATE POLICY "Users can insert own recruiter record" ON public.recruiters
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own recruiter record" ON public.recruiters;
CREATE POLICY "Users can update own recruiter record" ON public.recruiters
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Superadmins can update any recruiter" ON public.recruiters;
CREATE POLICY "Superadmins can update any recruiter" ON public.recruiters
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
  );

-- ── Bug fix: admin "Approve/Reject job" silently failed ──
-- The job_postings UPDATE policy only allowed the OWNING employer to
-- update their own job. Superadmin had no policy permitting them to
-- update ANY job row, so approve/reject clicks were blocked by RLS
-- with no visible error. This adds the missing permission.
DROP POLICY IF EXISTS "Superadmins can update any job" ON public.job_postings;
CREATE POLICY "Superadmins can update any job" ON public.job_postings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
  );
