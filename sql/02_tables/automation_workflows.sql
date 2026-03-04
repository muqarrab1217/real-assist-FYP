-- Create automation_workflows table
CREATE TABLE IF NOT EXISTS public.automation_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger TEXT,
  status TEXT DEFAULT 'active',
  user_id UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on automation_workflows
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
