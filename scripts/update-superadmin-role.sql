-- Update superadmin profile role
-- Run this in Supabase SQL Editor

UPDATE public.profiles
SET role = 'superadmin', full_name = 'Super Admin'
WHERE id = '12ca61bb-6a61-4b44-8ced-243460fc14f9';

-- Verify the update
SELECT id, role, full_name FROM public.profiles WHERE id = '12ca61bb-6a61-4b44-8ced-243460fc14f9';
