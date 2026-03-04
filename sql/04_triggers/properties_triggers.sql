-- Trigger for properties updated_at
DROP TRIGGER IF EXISTS on_property_updated ON public.properties;
CREATE TRIGGER on_property_updated
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
