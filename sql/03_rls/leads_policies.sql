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
