-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('admin', 'client', 'employee')) DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  price_min NUMERIC,
  price_max NUMERIC,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'construction', 'completed', 'active')),
  amenities TEXT[],
  images TEXT[],
  brochure_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Properties policies
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
CREATE POLICY "Properties are viewable by everyone" ON public.properties
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert properties" ON public.properties;
CREATE POLICY "Only admins can insert properties" ON public.properties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can update properties" ON public.properties;
CREATE POLICY "Only admins can update properties" ON public.properties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT CHECK (status IN ('hot', 'warm', 'cold', 'dead')) DEFAULT 'cold',
  source TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  last_contact TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads policies
DROP POLICY IF EXISTS "Admins can see all leads" ON public.leads;
CREATE POLICY "Admins can see all leads" ON public.leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can see leads assigned to them" ON public.leads;
CREATE POLICY "Users can see leads assigned to them" ON public.leads
  FOR SELECT USING (assigned_to = auth.uid());

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

DROP POLICY IF EXISTS "Users can manage their own workflows" ON public.automation_workflows;
CREATE POLICY "Users can manage their own workflows" ON public.automation_workflows
  FOR ALL USING (user_id = auth.uid());

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

DROP POLICY IF EXISTS "Users can see their own AI logs" ON public.ai_logs;
CREATE POLICY "Users can see their own AI logs" ON public.ai_logs
  FOR SELECT USING (user_id = auth.uid());

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Teams policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON public.teams;
CREATE POLICY "Teams are viewable by everyone" ON public.teams
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage teams" ON public.teams;
CREATE POLICY "Only admins can manage teams" ON public.teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, profile_id)
);

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team members policies
DROP POLICY IF EXISTS "Team members are viewable by everyone" ON public.team_members;
CREATE POLICY "Team members are viewable by everyone" ON public.team_members
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage team members" ON public.team_members;
CREATE POLICY "Only admins can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for teams updated_at
DROP TRIGGER IF EXISTS on_team_updated ON public.teams;
CREATE TRIGGER on_team_updated
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger for profiles updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bypass RPC for enrolling in Mock Projects
CREATE OR REPLACE FUNCTION public.create_mock_property_if_missing(
  p_name TEXT,
  p_type TEXT,
  p_location TEXT,
  p_price_min NUMERIC,
  p_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as DB owner to bypass RLS
AS $$
DECLARE
  v_property_id UUID;
BEGIN
  -- First check if it already exists
  SELECT id INTO v_property_id
  FROM public.properties
  WHERE name = p_name
  LIMIT 1;

  IF v_property_id IS NOT NULL THEN
    RETURN v_property_id;
  END IF;

  -- Insert new and return ID
  INSERT INTO public.properties (
    name,
    type,
    location,
    price_min,
    description,
    status
  ) VALUES (
    p_name,
    p_type,
    p_location,
    p_price_min,
    p_description,
    'construction'
  )
  RETURNING id INTO v_property_id;

  RETURN v_property_id;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger for properties updated_at
DROP TRIGGER IF EXISTS on_property_updated ON public.properties;
CREATE TRIGGER on_property_updated
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger for leads updated_at
DROP TRIGGER IF EXISTS on_lead_updated ON public.leads;
CREATE TRIGGER on_lead_updated
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_role TEXT;
BEGIN
  -- Automatically make realassist@admin.com an admin
  IF NEW.email = 'realassist@admin.com' THEN
    new_role := 'admin';
  ELSE
    new_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    new_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  investment_amount NUMERIC NOT NULL DEFAULT 0,
  current_installment INTEGER DEFAULT 0,
  total_installments INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;
CREATE POLICY "Admins can manage all clients" ON public.clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can view their own client data" ON public.clients;
CREATE POLICY "Users can view their own client data" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own client data" ON public.clients;
CREATE POLICY "Users can insert their own client data" ON public.clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  installment_number INTEGER,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  method TEXT,
  apartment_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE id = payments.client_id AND user_id = auth.uid()
    )
  );

-- DATA FIX: Force realassist@admin.com to be admin if it already exists
UPDATE public.profiles SET role = 'admin' WHERE email = 'realassist@admin.com';

-- Create project_updates table
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  milestone TEXT,
  progress INTEGER DEFAULT 0,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on project_updates
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

-- Project updates policies
DROP POLICY IF EXISTS "Project updates are viewable by everyone" ON public.project_updates;
CREATE POLICY "Project updates are viewable by everyone" ON public.project_updates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage project updates" ON public.project_updates;
CREATE POLICY "Only admins can manage project updates" ON public.project_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for project_updates updated_at
DROP TRIGGER IF EXISTS on_project_update_updated ON public.project_updates;
CREATE TRIGGER on_project_update_updated
  BEFORE UPDATE ON public.project_updates
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

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

-- Project enrollments policies
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.project_enrollments;
CREATE POLICY "Users can view their own enrollments" ON public.project_enrollments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all enrollments" ON public.project_enrollments;
CREATE POLICY "Admins can manage all enrollments" ON public.project_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can insert their own enrollments" ON public.project_enrollments;
CREATE POLICY "Users can insert their own enrollments" ON public.project_enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Trigger for project_enrollments updated_at
DROP TRIGGER IF EXISTS on_project_enrollment_updated ON public.project_enrollments;
CREATE TRIGGER on_project_enrollment_updated
  BEFORE UPDATE ON public.project_enrollments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 1. Extend payments Table (Backward-Compatible)
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('downpayment', 'installment', 'custom', 'fee')) DEFAULT 'installment',
ADD COLUMN IF NOT EXISTS billing_period TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS penalty_amount NUMERIC DEFAULT 0;

-- 2. Financial Ledger View (Backend Aggregation)
CREATE OR REPLACE VIEW public.client_financial_ledger AS
SELECT 
  c.id as client_id,
  c.user_id,
  c.property_id,
  c.investment_amount as total_payable,
  (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE client_id = c.id) as scheduled_total,
  (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE client_id = c.id AND status = 'paid') as total_paid,
  (c.investment_amount - (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE client_id = c.id AND status = 'paid')) as remaining_balance,
  (SELECT COUNT(*) FROM public.payments WHERE client_id = c.id AND status = 'paid') as installments_completed,
  (SELECT COUNT(*) FROM public.payments WHERE client_id = c.id AND status IN ('pending', 'overdue')) as installments_pending,
  ROUND(
    ((SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE client_id = c.id AND status = 'paid') / NULLIF(c.investment_amount, 0)) * 100, 
    2
  ) as completion_percentage
FROM public.clients c;

-- 3. RPC for Upcoming & Overdue Installments
CREATE OR REPLACE FUNCTION public.get_client_installment_status(p_client_id UUID)
RETURNS TABLE (
  next_due_date TIMESTAMP WITH TIME ZONE,
  next_due_amount NUMERIC,
  overdue_count INTEGER,
  overdue_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT due_date FROM public.payments WHERE client_id = p_client_id AND status = 'pending' AND due_date >= CURRENT_DATE ORDER BY due_date ASC LIMIT 1) as next_due_date,
    (SELECT amount FROM public.payments WHERE client_id = p_client_id AND status = 'pending' AND due_date >= CURRENT_DATE ORDER BY due_date ASC LIMIT 1) as next_due_amount,
    (SELECT COUNT(*)::INTEGER FROM public.payments WHERE client_id = p_client_id AND (status = 'overdue' OR (status = 'pending' AND due_date < CURRENT_DATE))) as overdue_count,
    (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE client_id = p_client_id AND (status = 'overdue' OR (status = 'pending' AND due_date < CURRENT_DATE))) as overdue_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
