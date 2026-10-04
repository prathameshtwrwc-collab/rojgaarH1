-- Lets the signup pages check whether a phone number is already registered, without
-- exposing any other profile data to an unauthenticated visitor.
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE OR REPLACE FUNCTION public.phone_number_exists(check_phone text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE phone = check_phone
  );
$$;

REVOKE ALL ON FUNCTION public.phone_number_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.phone_number_exists(text) TO anon, authenticated;
