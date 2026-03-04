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
