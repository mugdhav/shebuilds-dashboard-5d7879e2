-- Migration: Restrict permissive write policies to prevent anonymous API abuse.
-- Keeps public SELECT (dashboard needs it) but removes open DELETE/UPDATE/INSERT
-- on sensitive operations. Public INSERT on submissions is preserved for /submit.

-- ── participants ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can insert participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can update participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can delete participants" ON public.participants;

-- ── activities ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can insert activities" ON public.activities;
DROP POLICY IF EXISTS "Anyone can delete activities" ON public.activities;

-- ── topics ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can insert topics" ON public.topics;
DROP POLICY IF EXISTS "Anyone can delete topics" ON public.topics;

-- ── submissions ───────────────────────────────────────────────────────────────
-- Keep INSERT (public /submit form needs it). Remove open UPDATE.
DROP POLICY IF EXISTS "Anyone can update submissions" ON public.submissions;

-- ── hackathon_settings ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can insert settings" ON public.hackathon_settings;
DROP POLICY IF EXISTS "Anyone can update settings" ON public.hackathon_settings;

-- ── DB constraints ────────────────────────────────────────────────────────────
ALTER TABLE public.activities
  ADD CONSTRAINT action_length CHECK (char_length(action) <= 500);

ALTER TABLE public.submissions
  ADD CONSTRAINT app_link_format
    CHECK (app_link IS NULL OR app_link ~* '^https?://');
