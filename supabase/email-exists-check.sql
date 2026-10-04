-- Lets the signup pages check whether an email is already registered, without exposing
-- any other account data to an unauthenticated visitor. Email lives on auth.users (not
-- public.profiles), so this is a SECURITY DEFINER function to safely peek into it.
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE OR REPLACE FUNCTION public.email_exists(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE lower(email) = lower(check_email)
  );
$$;

REVOKE ALL ON FUNCTION public.email_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_exists(text) TO anon, authenticated;
