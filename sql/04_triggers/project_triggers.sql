-- Trigger for project_updates updated_at
DROP TRIGGER IF EXISTS on_project_update_updated ON public.project_updates;
CREATE TRIGGER on_project_update_updated
  BEFORE UPDATE ON public.project_updates
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger for project_enrollments updated_at
DROP TRIGGER IF EXISTS on_project_enrollment_updated ON public.project_enrollments;
CREATE TRIGGER on_project_enrollment_updated
  BEFORE UPDATE ON public.project_enrollments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
