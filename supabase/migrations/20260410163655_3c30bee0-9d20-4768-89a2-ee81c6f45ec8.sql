
CREATE TABLE public.registrations (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  verified boolean NOT NULL DEFAULT false,
  verification_token uuid DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read registrations"
  ON public.registrations FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert registrations"
  ON public.registrations FOR INSERT TO public WITH CHECK (true);
