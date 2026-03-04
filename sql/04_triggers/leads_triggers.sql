-- Trigger for leads updated_at
DROP TRIGGER IF EXISTS on_lead_updated ON public.leads;
CREATE TRIGGER on_lead_updated
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
