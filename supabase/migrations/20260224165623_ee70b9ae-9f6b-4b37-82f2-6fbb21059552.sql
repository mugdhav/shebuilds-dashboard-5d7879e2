
-- Create participants table
CREATE TABLE public.participants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_initials TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#a855f7',
  project_name TEXT,
  project_description TEXT,
  app_topic TEXT,
  build_status TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_spotlight BOOLEAN NOT NULL DEFAULT false,
  ticket_number TEXT,
  email TEXT,
  luma_guest_id TEXT,
  checked_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activities table
CREATE TABLE public.activities (
  id SERIAL PRIMARY KEY,
  participant_name TEXT NOT NULL,
  action TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create topics table
CREATE TABLE public.topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  weight INTEGER NOT NULL DEFAULT 1
);

-- Create submissions table
CREATE TABLE public.submissions (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  app_name TEXT NOT NULL,
  app_topic TEXT,
  app_link TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hackathon_settings table
CREATE TABLE public.hackathon_settings (
  id SERIAL PRIMARY KEY,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '3 hours'),
  active_participants INTEGER NOT NULL DEFAULT 0,
  completed_apps INTEGER NOT NULL DEFAULT 0,
  in_progress INTEGER NOT NULL DEFAULT 0,
  submissions INTEGER NOT NULL DEFAULT 0,
  is_using_demo_data BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on all tables
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for dashboard display (no auth required)
CREATE POLICY "Anyone can read participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can read activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Anyone can read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Anyone can read settings" ON public.hackathon_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can read submissions" ON public.submissions FOR SELECT USING (true);

-- Public write access (this is an admin-less hackathon dashboard, managed via the admin page)
CREATE POLICY "Anyone can insert participants" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update participants" ON public.participants FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete participants" ON public.participants FOR DELETE USING (true);

CREATE POLICY "Anyone can insert activities" ON public.activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete activities" ON public.activities FOR DELETE USING (true);

CREATE POLICY "Anyone can insert topics" ON public.topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete topics" ON public.topics FOR DELETE USING (true);

CREATE POLICY "Anyone can insert submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update submissions" ON public.submissions FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert settings" ON public.hackathon_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update settings" ON public.hackathon_settings FOR UPDATE USING (true);

-- Enable realtime for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.topics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hackathon_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;

-- Insert default settings row
INSERT INTO public.hackathon_settings (start_time, end_time, active_participants, completed_apps, is_using_demo_data)
VALUES (now(), now() + interval '3 hours', 0, 0, true);
