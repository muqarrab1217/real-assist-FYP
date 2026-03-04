-- Extend payments Table (Backward-Compatible)
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('downpayment', 'installment', 'custom', 'fee')) DEFAULT 'installment',
ADD COLUMN IF NOT EXISTS billing_period TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS penalty_amount NUMERIC DEFAULT 0;

-- Extend properties Table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'construction', 'completed', 'active'));

-- DATA FIX: Force realassist@admin.com to be admin if it already exists
UPDATE public.profiles SET role = 'admin' WHERE email = 'realassist@admin.com';

-- bypass RPC for enrolling in Mock Projects
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

-- FIX: Allow clients to insert their own client record during enrollment
DROP POLICY IF EXISTS "Users can insert their own client data" ON public.clients;
CREATE POLICY "Users can insert their own client data" ON public.clients
  FOR INSERT WITH CHECK (user_id = auth.uid());
