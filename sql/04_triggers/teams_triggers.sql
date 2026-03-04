-- Trigger for teams updated_at
DROP TRIGGER IF EXISTS on_team_updated ON public.teams;
CREATE TRIGGER on_team_updated
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
