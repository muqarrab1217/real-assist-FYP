-- Automation Workflows & AI Logs policies
DROP POLICY IF EXISTS "Users can manage their own workflows" ON public.automation_workflows;
CREATE POLICY "Users can manage their own workflows" ON public.automation_workflows
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can see their own AI logs" ON public.ai_logs;
CREATE POLICY "Users can see their own AI logs" ON public.ai_logs
  FOR SELECT USING (user_id = auth.uid());
