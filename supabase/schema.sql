-- ============================================================
-- Rojgaar Hai — Supabase Schema
-- Improved version: normalized applications, child tables,
-- numeric salaries, updated_at triggers, pgcrypto
-- ============================================================

-- 1. Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Delete existing objects (safe reruns)
-- ============================================================
DROP TABLE IF EXISTS public.placements CASCADE;
DROP TABLE IF EXISTS public.communications CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.job_requirements CASCADE;
DROP TABLE IF EXISTS public.job_responsibilities CASCADE;
DROP TABLE IF EXISTS public.job_skills CASCADE;
DROP TABLE IF EXISTS public.job_postings CASCADE;
DROP TABLE IF EXISTS public.candidate_certifications CASCADE;
DROP TABLE IF EXISTS public.candidate_languages CASCADE;
DROP TABLE IF EXISTS public.candidate_experience CASCADE;
DROP TABLE IF EXISTS public.candidate_education CASCADE;
DROP TABLE IF EXISTS public.candidate_skills CASCADE;
DROP TABLE IF EXISTS public.candidate_preferred_locations CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.employers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.placement_status CASCADE;
DROP TYPE IF EXISTS public.commission_status CASCADE;
DROP TYPE IF EXISTS public.communication_type CASCADE;
DROP TYPE IF EXISTS public.contact_type CASCADE;
DROP TYPE IF EXISTS public.match_status CASCADE;
DROP TYPE IF EXISTS public.application_status CASCADE;
DROP TYPE IF EXISTS public.job_status CASCADE;
DROP TYPE IF EXISTS public.employment_type CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.candidate_status CASCADE;

-- 3. Enums
-- ============================================================
CREATE TYPE public.user_role AS ENUM ('superadmin', 'employer', 'candidate');

CREATE TYPE public.candidate_status AS ENUM ('New', 'Contacted', 'Interviewed', 'Placed', 'Inactive');

CREATE TYPE public.job_status AS ENUM ('Pending', 'Open', 'Closed', 'On Hold');

CREATE TYPE public.employment_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Freelance');

CREATE TYPE public.application_status AS ENUM ('applied', 'screening', 'shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'rejected', 'withdrawn', 'joined');

CREATE TYPE public.match_status AS ENUM ('Pending', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Hired', 'Rejected');

CREATE TYPE public.communication_type AS ENUM ('Email', 'Call', 'SMS', 'In-Person');

CREATE TYPE public.contact_type AS ENUM ('Candidate', 'Employer');

CREATE TYPE public.commission_status AS ENUM ('Paid', 'Unpaid', 'Partial');

CREATE TYPE public.placement_status AS ENUM ('Active', 'Completed', 'Terminated');

-- 4. Shared trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 5. Profiles
-- ============================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'candidate',
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_phone ON public.profiles(phone);

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Employers
-- ============================================================
CREATE TABLE public.employers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT,
    year_established INTEGER,
    website TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    postal_code TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    gst_number TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referral_code TEXT NOT NULL UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employers_company_name ON public.employers(company_name);
CREATE INDEX idx_employers_city ON public.employers(city);
CREATE INDEX idx_employers_state ON public.employers(state);
CREATE INDEX idx_employers_verified ON public.employers(verified);
CREATE INDEX idx_employers_referral_code ON public.employers(referral_code);

CREATE TRIGGER trg_employers_updated_at
BEFORE UPDATE ON public.employers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Candidates
-- ============================================================
CREATE TABLE public.candidates (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    location TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    gender TEXT,
    nationality TEXT DEFAULT 'Indian',
    marital_status TEXT,
    qualification TEXT,
    specialization TEXT,
    total_experience_years NUMERIC(5,2) DEFAULT 0,
    expected_salary_min NUMERIC(12,2),
    expected_salary_max NUMERIC(12,2),
    salary_currency TEXT DEFAULT 'INR',
    preferred_job_type public.employment_type,
    preferred_shift TEXT,
    notice_period TEXT,
    immediate_joining BOOLEAN NOT NULL DEFAULT FALSE,
    willing_to_relocate BOOLEAN NOT NULL DEFAULT FALSE,
    current_status TEXT,
    resume_url TEXT,
    profile_photo_url TEXT,
    aadhaar_number TEXT,
    pan_number TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    website_url TEXT,
    bio TEXT,
    referred_by UUID REFERENCES public.employers(id) ON DELETE SET NULL,
    referral_code_used TEXT,
    status public.candidate_status NOT NULL DEFAULT 'New',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_candidates_city ON public.candidates(city);
CREATE INDEX idx_candidates_state ON public.candidates(state);
CREATE INDEX idx_candidates_status ON public.candidates(status);
CREATE INDEX idx_candidates_referred_by ON public.candidates(referred_by);

CREATE TRIGGER trg_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. Candidate Skills
-- ============================================================
CREATE TABLE public.candidate_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    proficiency TEXT,
    years_experience NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(candidate_id, skill_name)
);

CREATE INDEX idx_candidate_skills_candidate ON public.candidate_skills(candidate_id);
CREATE INDEX idx_candidate_skills_name ON public.candidate_skills(skill_name);

-- 9. Candidate Preferred Locations
-- ============================================================
CREATE TABLE public.candidate_preferred_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_candidate_preferred_locations_candidate ON public.candidate_preferred_locations(candidate_id);
CREATE INDEX idx_candidate_preferred_locations_city ON public.candidate_preferred_locations(city);

-- 10. Candidate Education
-- ============================================================
CREATE TABLE public.candidate_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    degree TEXT,
    field_of_study TEXT,
    start_year INTEGER,
    end_year INTEGER,
    grade TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_candidate_education_candidate ON public.candidate_education(candidate_id);

-- 11. Candidate Experience
-- ============================================================
CREATE TABLE public.candidate_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    employment_type public.employment_type,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_candidate_experience_candidate ON public.candidate_experience(candidate_id);
CREATE INDEX idx_candidate_experience_company ON public.candidate_experience(company_name);

-- 12. Candidate Languages
-- ============================================================
CREATE TABLE public.candidate_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    language_name TEXT NOT NULL,
    proficiency TEXT,
    can_read BOOLEAN DEFAULT FALSE,
    can_write BOOLEAN DEFAULT FALSE,
    can_speak BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(candidate_id, language_name)
);

-- 13. Candidate Certifications
-- ============================================================
CREATE TABLE public.candidate_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    certification_name TEXT NOT NULL,
    issuing_organization TEXT,
    issue_date DATE,
    expiry_date DATE,
    credential_id TEXT,
    credential_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_candidate_certifications_candidate ON public.candidate_certifications(candidate_id);

-- 14. Job Postings
-- ============================================================
CREATE TABLE public.job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    number_of_openings INTEGER NOT NULL DEFAULT 1 CHECK (number_of_openings > 0),
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    salary_min NUMERIC(12,2),
    salary_max NUMERIC(12,2),
    salary_currency TEXT DEFAULT 'INR',
    employment_type public.employment_type NOT NULL,
    qualification_required TEXT,
    experience_min_years NUMERIC(5,2),
    experience_max_years NUMERIC(5,2),
    job_description TEXT NOT NULL,
    benefits TEXT,
    joining_timeline TEXT,
    working_hours TEXT,
    accommodation_provided BOOLEAN NOT NULL DEFAULT FALSE,
    transportation_provided BOOLEAN NOT NULL DEFAULT FALSE,
    additional_notes TEXT,
    recruiter_name TEXT,
    recruiter_email TEXT,
    recruiter_phone TEXT,
    status public.job_status NOT NULL DEFAULT 'Pending',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    deadline DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min),
    CHECK (experience_min_years IS NULL OR experience_max_years IS NULL OR experience_max_years >= experience_min_years)
);

CREATE INDEX idx_jobs_employer ON public.job_postings(employer_id);
CREATE INDEX idx_jobs_status ON public.job_postings(status);
CREATE INDEX idx_jobs_city ON public.job_postings(city);
CREATE INDEX idx_jobs_state ON public.job_postings(state);
CREATE INDEX idx_jobs_employment_type ON public.job_postings(employment_type);
CREATE INDEX idx_jobs_deadline ON public.job_postings(deadline);
CREATE INDEX idx_jobs_created_at ON public.job_postings(created_at DESC);

CREATE TRIGGER trg_job_postings_updated_at
BEFORE UPDATE ON public.job_postings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 15. Job Skills
-- ============================================================
CREATE TABLE public.job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, skill_name)
);

CREATE INDEX idx_job_skills_job ON public.job_skills(job_id);
CREATE INDEX idx_job_skills_name ON public.job_skills(skill_name);

-- 16. Job Responsibilities
-- ============================================================
CREATE TABLE public.job_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    responsibility TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_responsibilities_job ON public.job_responsibilities(job_id);

-- 17. Job Requirements
-- ============================================================
CREATE TABLE public.job_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_requirements_job ON public.job_requirements(job_id);

-- 18. Applications
-- ============================================================
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    status public.application_status NOT NULL DEFAULT 'applied',
    cover_letter TEXT,
    recruiter_notes TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    shortlisted_at TIMESTAMPTZ,
    interview_at TIMESTAMPTZ,
    selected_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

CREATE INDEX idx_applications_candidate ON public.applications(candidate_id);
CREATE INDEX idx_applications_job ON public.applications(job_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_applied_at ON public.applications(applied_at DESC);

CREATE TRIGGER trg_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 19. Matches
-- ============================================================
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL CHECK (match_score BETWEEN 0 AND 100),
    status public.match_status NOT NULL DEFAULT 'Pending',
    matched_skills JSONB NOT NULL DEFAULT '[]'::JSONB,
    missing_skills JSONB NOT NULL DEFAULT '[]'::JSONB,
    match_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

CREATE INDEX idx_matches_candidate ON public.matches(candidate_id);
CREATE INDEX idx_matches_job ON public.matches(job_id);
CREATE INDEX idx_matches_score ON public.matches(match_score DESC);
CREATE INDEX idx_matches_status ON public.matches(status);

CREATE TRIGGER trg_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 20. Communications
-- ============================================================
CREATE TABLE public.communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    communication_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type public.communication_type NOT NULL,
    contact_type public.contact_type NOT NULL,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
    employer_id UUID REFERENCES public.employers(id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
    contact_name TEXT NOT NULL,
    subject TEXT,
    notes TEXT,
    outcome TEXT,
    agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_communications_date ON public.communications(communication_date DESC);
CREATE INDEX idx_communications_candidate ON public.communications(candidate_id);
CREATE INDEX idx_communications_employer ON public.communications(employer_id);
CREATE INDEX idx_communications_job ON public.communications(job_id);
CREATE INDEX idx_communications_agent ON public.communications(agent_id);

-- 21. Placements
-- ============================================================
CREATE TABLE public.placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE RESTRICT,
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE RESTRICT,
    employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE RESTRICT,
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    placement_date DATE NOT NULL,
    joining_date DATE,
    handover_date DATE,
    commission NUMERIC(12,2) NOT NULL DEFAULT 0,
    commission_currency TEXT DEFAULT 'INR',
    commission_status public.commission_status NOT NULL DEFAULT 'Unpaid',
    commission_paid_at TIMESTAMPTZ,
    status public.placement_status NOT NULL DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (commission >= 0)
);

CREATE INDEX idx_placements_candidate ON public.placements(candidate_id);
CREATE INDEX idx_placements_job ON public.placements(job_id);
CREATE INDEX idx_placements_employer ON public.placements(employer_id);
CREATE INDEX idx_placements_status ON public.placements(status);
CREATE INDEX idx_placements_commission_status ON public.placements(commission_status);

CREATE TRIGGER trg_placements_updated_at
BEFORE UPDATE ON public.placements
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 22. Auth trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, phone)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'candidate'),
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'phone', NEW.phone)
    );
    RETURN NEW;
EXCEPTION
    WHEN invalid_text_representation THEN
        INSERT INTO public.profiles (id, role, full_name, phone)
        VALUES (NEW.id, 'candidate', COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), COALESCE(NEW.raw_user_meta_data ->> 'phone', NEW.phone));
        RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 23. RLS
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_preferred_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_responsibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;

-- 24. RLS Policies
-- ============================================================

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- employers
CREATE POLICY "Users can view own employer record" ON public.employers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own employer record" ON public.employers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all employers" ON public.employers
  FOR SELECT USING (auth.role() = 'authenticated');

-- candidates
CREATE POLICY "Users can view own candidate record" ON public.candidates
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own candidate record" ON public.candidates
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all candidates" ON public.candidates
  FOR SELECT USING (auth.role() = 'authenticated');

-- job_postings
CREATE POLICY "Authenticated users can view all jobs" ON public.job_postings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Employers can insert jobs" ON public.job_postings
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update own jobs" ON public.job_postings
  FOR UPDATE USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own jobs" ON public.job_postings
  FOR DELETE USING (auth.uid() = employer_id);

-- applications
CREATE POLICY "Candidates can view own applications" ON public.applications
  FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "Employers can view applications for their jobs" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = applications.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view all applications" ON public.applications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Candidates can insert applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own applications" ON public.applications
  FOR UPDATE USING (auth.uid() = candidate_id);

-- matches
CREATE POLICY "Authenticated users can view all matches" ON public.matches
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update matches where involved" ON public.matches
  FOR UPDATE USING (auth.uid() = candidate_id OR auth.uid() = employer_id);

CREATE POLICY "Users can insert matches" ON public.matches
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- communications
CREATE POLICY "Authenticated users can view all communications" ON public.communications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert communications" ON public.communications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own communications" ON public.communications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- placements
CREATE POLICY "Authenticated users can view all placements" ON public.placements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert placements" ON public.placements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update placements" ON public.placements
  FOR UPDATE USING (auth.role() = 'authenticated');

-- job_skills
CREATE POLICY "Authenticated users can view all job skills" ON public.job_skills
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Employers can insert job skills" ON public.job_skills
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_skills.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update job skills" ON public.job_skills
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_skills.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can delete job skills" ON public.job_skills
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_skills.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

-- candidate_skills
CREATE POLICY "Authenticated users can view all candidate skills" ON public.candidate_skills
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Candidates can insert own skills" ON public.candidate_skills
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own skills" ON public.candidate_skills
  FOR UPDATE USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can delete own skills" ON public.candidate_skills
  FOR DELETE USING (auth.uid() = candidate_id);

-- candidate_preferred_locations
CREATE POLICY "Authenticated users can view all preferred locations" ON public.candidate_preferred_locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Candidates can insert own preferred locations" ON public.candidate_preferred_locations
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own preferred locations" ON public.candidate_preferred_locations
  FOR UPDATE USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can delete own preferred locations" ON public.candidate_preferred_locations
  FOR DELETE USING (auth.uid() = candidate_id);

-- candidate_education
CREATE POLICY "Authenticated users can view all education" ON public.candidate_education
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Candidates can insert own education" ON public.candidate_education
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own education" ON public.candidate_education
  FOR UPDATE USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can delete own education" ON public.candidate_education
  FOR DELETE USING (auth.uid() = candidate_id);

-- candidate_experience
CREATE POLICY "Authenticated users can view all experience" ON public.candidate_experience
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Candidates can insert own experience" ON public.candidate_experience
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own experience" ON public.candidate_experience
  FOR UPDATE USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can delete own experience" ON public.candidate_experience
  FOR DELETE USING (auth.uid() = candidate_id);

-- candidate_languages
CREATE POLICY "Authenticated users can view all languages" ON public.candidate_languages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Candidates can insert own languages" ON public.candidate_languages
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own languages" ON public.candidate_languages
  FOR UPDATE USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can delete own languages" ON public.candidate_languages
  FOR DELETE USING (auth.uid() = candidate_id);

-- candidate_certifications
CREATE POLICY "Authenticated users can view all certifications" ON public.candidate_certifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Candidates can insert own certifications" ON public.candidate_certifications
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own certifications" ON public.candidate_certifications
  FOR UPDATE USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can delete own certifications" ON public.candidate_certifications
  FOR DELETE USING (auth.uid() = candidate_id);

-- job_requirements
CREATE POLICY "Authenticated users can view all job requirements" ON public.job_requirements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Employers can insert job requirements" ON public.job_requirements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_requirements.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update job requirements" ON public.job_requirements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_requirements.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can delete job requirements" ON public.job_requirements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_requirements.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

-- job_responsibilities
CREATE POLICY "Authenticated users can view all job responsibilities" ON public.job_responsibilities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Employers can insert job responsibilities" ON public.job_responsibilities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_responsibilities.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update job responsibilities" ON public.job_responsibilities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_responsibilities.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can delete job responsibilities" ON public.job_responsibilities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_responsibilities.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );
