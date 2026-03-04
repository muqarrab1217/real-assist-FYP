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
