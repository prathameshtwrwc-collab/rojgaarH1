-- Superadmin deletion of a CV request.
-- Run once in the Supabase SQL editor. Safe to run again.
-- Needs supabase/admin-delete.sql (for public.is_superadmin) to have been run first.

CREATE OR REPLACE FUNCTION public.admin_delete_cv_request(target_request uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Only a superadmin can delete CV requests';
  END IF;
  DELETE FROM public.cv_requests WHERE id = target_request;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_cv_request(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_cv_request(uuid) TO authenticated;
