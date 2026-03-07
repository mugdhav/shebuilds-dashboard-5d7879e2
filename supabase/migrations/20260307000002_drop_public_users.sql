-- Migration: Remove the manually-created public.users table that has a plaintext
-- password column and no RLS. This table is not used by the application
-- (not in types.ts, not in any migration). Drop it to eliminate the data breach risk.
--
-- If you ever need user authentication, use Supabase Auth (auth.users) instead.

DROP TABLE IF EXISTS public.users;
