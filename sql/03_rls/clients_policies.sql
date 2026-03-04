-- Clients policies
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
