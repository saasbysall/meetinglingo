
-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  minutes INT DEFAULT 0,
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  mic_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  meeting_link TEXT NOT NULL,
  platform TEXT NOT NULL,
  source_language TEXT NOT NULL DEFAULT 'en-GB',
  target_language TEXT NOT NULL DEFAULT 'es-ES',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings,
  file_url TEXT,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  full_name TEXT,
  company_name TEXT,
  company_size TEXT,
  usage_goal TEXT,
  receive_updates BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can see and modify their own data
CREATE POLICY IF NOT EXISTS "Users can see their own data" ON public.users 
  FOR ALL USING (auth.uid() = id);

-- Users can see and modify their own meetings
CREATE POLICY IF NOT EXISTS "Users can see their own meetings" ON public.meetings 
  FOR ALL USING (auth.uid() = user_id);

-- Users can see and modify their own transcripts
CREATE POLICY IF NOT EXISTS "Users can see transcripts for their own meetings" ON public.transcripts 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE public.meetings.id = public.transcripts.meeting_id
      AND public.meetings.user_id = auth.uid()
    )
  );

-- Users can see and modify their own profiles
CREATE POLICY IF NOT EXISTS "Users can see their own profiles" ON public.profiles 
  FOR ALL USING (auth.uid() = id);
