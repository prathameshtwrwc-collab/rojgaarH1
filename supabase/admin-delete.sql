-- Superadmin deletion of jobs and accounts (candidates and companies).
-- Run once in the Supabase SQL editor. Safe to run again.
--
-- Deleting an account removes its sign-in (auth.users), which cascades to its profile,
-- candidate or employer rows, applications, skills and so on. Records with placements are
-- never deleted, so hiring history is kept.

-- 1. Is the caller a superadmin?
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

-- 2. Delete a job, with its applications and matches.
CREATE OR REPLACE FUNCTION public.admin_delete_job(target_job uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Only a superadmin can delete jobs';
  END IF;
  IF EXISTS (SELECT 1 FROM public.placements WHERE job_id = target_job) THEN
    RAISE EXCEPTION 'This job has placement records, so it cannot be deleted. Close it instead.';
  END IF;
  DELETE FROM public.job_postings WHERE id = target_job;
END;
$$;

-- 3. Delete a candidate or company account, with everything linked to it.
CREATE OR REPLACE FUNCTION public.admin_delete_account(target_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Only a superadmin can delete accounts';
  END IF;
  IF target_user = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user AND role = 'superadmin') THEN
    RAISE EXCEPTION 'Superadmin accounts cannot be deleted here';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.placements
    WHERE candidate_id = target_user OR employer_id = target_user
  ) THEN
    RAISE EXCEPTION 'This account has placement records, so it cannot be deleted.';
  END IF;
  DELETE FROM auth.users WHERE id = target_user;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_job(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_job(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_account(uuid) TO authenticated;
