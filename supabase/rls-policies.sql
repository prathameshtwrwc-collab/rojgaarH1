-- RLS Policies for Rojgaar Hai
-- Run this in Supabase SQL Editor if the schema is already applied
-- and tables exist but RLS policies are missing.

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- employers
DROP POLICY IF EXISTS "Users can view own employer record" ON public.employers;
CREATE POLICY "Users can view own employer record" ON public.employers
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own employer record" ON public.employers;
CREATE POLICY "Users can update own employer record" ON public.employers
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can view all employers" ON public.employers;
CREATE POLICY "Authenticated users can view all employers" ON public.employers
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own employer record" ON public.employers;
CREATE POLICY "Users can insert own employer record" ON public.employers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- candidates
DROP POLICY IF EXISTS "Users can view own candidate record" ON public.candidates;
CREATE POLICY "Users can view own candidate record" ON public.candidates
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own candidate record" ON public.candidates;
CREATE POLICY "Users can update own candidate record" ON public.candidates
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can view all candidates" ON public.candidates;
CREATE POLICY "Authenticated users can view all candidates" ON public.candidates
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own candidate record" ON public.candidates;
CREATE POLICY "Users can insert own candidate record" ON public.candidates
  FOR INSERT WITH CHECK (auth.uid() = id);

-- job_postings
DROP POLICY IF EXISTS "Authenticated users can view all jobs" ON public.job_postings;
CREATE POLICY "Authenticated users can view all jobs" ON public.job_postings
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Employers can insert jobs" ON public.job_postings;
CREATE POLICY "Employers can insert jobs" ON public.job_postings
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can update own jobs" ON public.job_postings;
CREATE POLICY "Employers can update own jobs" ON public.job_postings
  FOR UPDATE USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can delete own jobs" ON public.job_postings;
CREATE POLICY "Employers can delete own jobs" ON public.job_postings
  FOR DELETE USING (auth.uid() = employer_id);

-- applications
DROP POLICY IF EXISTS "Candidates can view own applications" ON public.applications;
CREATE POLICY "Candidates can view own applications" ON public.applications
  FOR SELECT USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON public.applications;
CREATE POLICY "Employers can view applications for their jobs" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = applications.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view all applications" ON public.applications;
CREATE POLICY "Authenticated users can view all applications" ON public.applications
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Candidates can insert applications" ON public.applications;
CREATE POLICY "Candidates can insert applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can update own applications" ON public.applications;
CREATE POLICY "Candidates can update own applications" ON public.applications
  FOR UPDATE USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Employers can update applications for their jobs" ON public.applications;
CREATE POLICY "Employers can update applications for their jobs" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = applications.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

-- Public job board (anonymous visitors can browse open jobs without logging in)
DROP POLICY IF EXISTS "Anyone can view open jobs" ON public.job_postings;
CREATE POLICY "Anyone can view open jobs" ON public.job_postings
  FOR SELECT USING (status = 'Open' AND is_verified = true);

DROP POLICY IF EXISTS "Anyone can view employer names for open jobs" ON public.employers;
CREATE POLICY "Anyone can view employer names for open jobs" ON public.employers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view job skills" ON public.job_skills;
CREATE POLICY "Anyone can view job skills" ON public.job_skills
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view job requirements" ON public.job_requirements;
CREATE POLICY "Anyone can view job requirements" ON public.job_requirements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view job responsibilities" ON public.job_responsibilities;
CREATE POLICY "Anyone can view job responsibilities" ON public.job_responsibilities
  FOR SELECT USING (true);

-- ============================================================
-- Storage: resumes bucket (candidate resume uploads)
-- Run this once. Creates a public bucket where each candidate
-- can only write inside a folder named after their own user id.
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view resumes" ON storage.objects;
CREATE POLICY "Anyone can view resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Candidates can upload own resume" ON storage.objects;
CREATE POLICY "Candidates can upload own resume" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Candidates can update own resume" ON storage.objects;
CREATE POLICY "Candidates can update own resume" ON storage.objects
  FOR UPDATE USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Candidates can delete own resume" ON storage.objects;
CREATE POLICY "Candidates can delete own resume" ON storage.objects
  FOR DELETE USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- matches
DROP POLICY IF EXISTS "Authenticated users can view all matches" ON public.matches;
CREATE POLICY "Authenticated users can view all matches" ON public.matches
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update matches where involved" ON public.matches;
CREATE POLICY "Users can update matches where involved" ON public.matches
  FOR UPDATE USING (
    auth.uid() = candidate_id
    OR EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = matches.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert matches" ON public.matches;
CREATE POLICY "Users can insert matches" ON public.matches
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- communications
DROP POLICY IF EXISTS "Authenticated users can view all communications" ON public.communications;
CREATE POLICY "Authenticated users can view all communications" ON public.communications
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert communications" ON public.communications;
CREATE POLICY "Users can insert communications" ON public.communications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own communications" ON public.communications;
CREATE POLICY "Users can update own communications" ON public.communications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- placements
DROP POLICY IF EXISTS "Authenticated users can view all placements" ON public.placements;
CREATE POLICY "Authenticated users can view all placements" ON public.placements
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert placements" ON public.placements;
CREATE POLICY "Users can insert placements" ON public.placements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update placements" ON public.placements;
CREATE POLICY "Users can update placements" ON public.placements
  FOR UPDATE USING (auth.role() = 'authenticated');

-- job_skills
DROP POLICY IF EXISTS "Authenticated users can view all job skills" ON public.job_skills;
CREATE POLICY "Authenticated users can view all job skills" ON public.job_skills
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Employers can insert job skills" ON public.job_skills;
CREATE POLICY "Employers can insert job skills" ON public.job_skills
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_skills.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can update job skills" ON public.job_skills;
CREATE POLICY "Employers can update job skills" ON public.job_skills
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_skills.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can delete job skills" ON public.job_skills;
CREATE POLICY "Employers can delete job skills" ON public.job_skills
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_skills.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

-- candidate_skills
DROP POLICY IF EXISTS "Authenticated users can view all candidate skills" ON public.candidate_skills;
CREATE POLICY "Authenticated users can view all candidate skills" ON public.candidate_skills
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Candidates can insert own skills" ON public.candidate_skills;
CREATE POLICY "Candidates can insert own skills" ON public.candidate_skills
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can update own skills" ON public.candidate_skills;
CREATE POLICY "Candidates can update own skills" ON public.candidate_skills
  FOR UPDATE USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can delete own skills" ON public.candidate_skills;
CREATE POLICY "Candidates can delete own skills" ON public.candidate_skills
  FOR DELETE USING (auth.uid() = candidate_id);

-- candidate_preferred_locations
DROP POLICY IF EXISTS "Authenticated users can view all preferred locations" ON public.candidate_preferred_locations;
CREATE POLICY "Authenticated users can view all preferred locations" ON public.candidate_preferred_locations
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Candidates can insert own preferred locations" ON public.candidate_preferred_locations;
CREATE POLICY "Candidates can insert own preferred locations" ON public.candidate_preferred_locations
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can update own preferred locations" ON public.candidate_preferred_locations;
CREATE POLICY "Candidates can update own preferred locations" ON public.candidate_preferred_locations
  FOR UPDATE USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can delete own preferred locations" ON public.candidate_preferred_locations;
CREATE POLICY "Candidates can delete own preferred locations" ON public.candidate_preferred_locations
  FOR DELETE USING (auth.uid() = candidate_id);

-- candidate_education
DROP POLICY IF EXISTS "Authenticated users can view all education" ON public.candidate_education;
CREATE POLICY "Authenticated users can view all education" ON public.candidate_education
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Candidates can insert own education" ON public.candidate_education;
CREATE POLICY "Candidates can insert own education" ON public.candidate_education
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can update own education" ON public.candidate_education;
CREATE POLICY "Candidates can update own education" ON public.candidate_education
  FOR UPDATE USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can delete own education" ON public.candidate_education;
CREATE POLICY "Candidates can delete own education" ON public.candidate_education
  FOR DELETE USING (auth.uid() = candidate_id);

-- candidate_experience
DROP POLICY IF EXISTS "Authenticated users can view all experience" ON public.candidate_experience;
CREATE POLICY "Authenticated users can view all experience" ON public.candidate_experience
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Candidates can insert own experience" ON public.candidate_experience;
CREATE POLICY "Candidates can insert own experience" ON public.candidate_experience
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can update own experience" ON public.candidate_experience;
CREATE POLICY "Candidates can update own experience" ON public.candidate_experience
  FOR UPDATE USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can delete own experience" ON public.candidate_experience;
CREATE POLICY "Candidates can delete own experience" ON public.candidate_experience
  FOR DELETE USING (auth.uid() = candidate_id);

-- candidate_languages
DROP POLICY IF EXISTS "Authenticated users can view all languages" ON public.candidate_languages;
CREATE POLICY "Authenticated users can view all languages" ON public.candidate_languages
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Candidates can insert own languages" ON public.candidate_languages;
CREATE POLICY "Candidates can insert own languages" ON public.candidate_languages
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can update own languages" ON public.candidate_languages;
CREATE POLICY "Candidates can update own languages" ON public.candidate_languages
  FOR UPDATE USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can delete own languages" ON public.candidate_languages;
CREATE POLICY "Candidates can delete own languages" ON public.candidate_languages
  FOR DELETE USING (auth.uid() = candidate_id);

-- candidate_certifications
DROP POLICY IF EXISTS "Authenticated users can view all certifications" ON public.candidate_certifications;
CREATE POLICY "Authenticated users can view all certifications" ON public.candidate_certifications
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Candidates can insert own certifications" ON public.candidate_certifications;
CREATE POLICY "Candidates can insert own certifications" ON public.candidate_certifications
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can update own certifications" ON public.candidate_certifications;
CREATE POLICY "Candidates can update own certifications" ON public.candidate_certifications
  FOR UPDATE USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can delete own certifications" ON public.candidate_certifications;
CREATE POLICY "Candidates can delete own certifications" ON public.candidate_certifications
  FOR DELETE USING (auth.uid() = candidate_id);

-- job_requirements
DROP POLICY IF EXISTS "Authenticated users can view all job requirements" ON public.job_requirements;
CREATE POLICY "Authenticated users can view all job requirements" ON public.job_requirements
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Employers can insert job requirements" ON public.job_requirements;
CREATE POLICY "Employers can insert job requirements" ON public.job_requirements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_requirements.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can update job requirements" ON public.job_requirements;
CREATE POLICY "Employers can update job requirements" ON public.job_requirements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_requirements.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can delete job requirements" ON public.job_requirements;
CREATE POLICY "Employers can delete job requirements" ON public.job_requirements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_requirements.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

-- job_responsibilities
DROP POLICY IF EXISTS "Authenticated users can view all job responsibilities" ON public.job_responsibilities;
CREATE POLICY "Authenticated users can view all job responsibilities" ON public.job_responsibilities
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Employers can insert job responsibilities" ON public.job_responsibilities;
CREATE POLICY "Employers can insert job responsibilities" ON public.job_responsibilities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_responsibilities.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can update job responsibilities" ON public.job_responsibilities;
CREATE POLICY "Employers can update job responsibilities" ON public.job_responsibilities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_responsibilities.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can delete job responsibilities" ON public.job_responsibilities;
CREATE POLICY "Employers can delete job responsibilities" ON public.job_responsibilities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = job_responsibilities.job_id
      AND job_postings.employer_id = auth.uid()
    )
  );
