-- Restrict submissions SELECT to authenticated users only.
-- The table contains PII (full names and email addresses) and should
-- not be publicly readable via the anon key.
-- Public INSERT is preserved so the /submit form continues to work.

DROP POLICY IF EXISTS "Anyone can read submissions" ON public.submissions;

CREATE POLICY "Authenticated users can read submissions" ON public.submissions
  FOR SELECT USING (auth.role() = 'authenticated');
