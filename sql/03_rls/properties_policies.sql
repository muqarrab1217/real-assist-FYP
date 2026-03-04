-- Properties policies
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
CREATE POLICY "Properties are viewable by everyone" ON public.properties
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert properties" ON public.properties;
CREATE POLICY "Only admins can insert properties" ON public.properties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can update properties" ON public.properties;
CREATE POLICY "Only admins can update properties" ON public.properties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
