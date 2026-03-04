-- Create ai_logs table
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE SET NULL,
  input_data JSONB,
  output_data JSONB,
  status TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) DEFAULT auth.uid()
);

-- Enable RLS on ai_logs
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
