-- Create project_enrollments table
CREATE TABLE IF NOT EXISTS public.project_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  total_price NUMERIC NOT NULL,
  down_payment NUMERIC NOT NULL,
  installment_duration_years INTEGER NOT NULL,
  monthly_installment NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on project_enrollments
ALTER TABLE public.project_enrollments ENABLE ROW LEVEL SECURITY;
