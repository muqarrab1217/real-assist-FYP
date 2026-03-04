-- Creates a property, bypassing RLS, intended ONLY for resolving mock frontend data during enrollment
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
  -- First check if it already exists to avoid duplicates
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
