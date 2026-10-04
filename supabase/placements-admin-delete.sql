-- Lets a superadmin delete a placement record.
-- There is currently no DELETE policy on public.placements at all, so without this,
-- every delete is silently refused by RLS, even for an admin.
-- Run once in the Supabase SQL editor. Safe to run again.

DROP POLICY IF EXISTS "Superadmins can delete placements" ON public.placements;
CREATE POLICY "Superadmins can delete placements" ON public.placements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
  );
