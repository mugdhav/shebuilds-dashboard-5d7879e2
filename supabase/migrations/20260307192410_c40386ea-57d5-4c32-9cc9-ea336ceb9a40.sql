-- Restrict permissive write policies to prevent anonymous API abuse.

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
DROP POLICY IF EXISTS "Anyone can update submissions" ON public.submissions;

-- ── hackathon_settings ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can insert settings" ON public.hackathon_settings;
DROP POLICY IF EXISTS "Anyone can update settings" ON public.hackathon_settings;