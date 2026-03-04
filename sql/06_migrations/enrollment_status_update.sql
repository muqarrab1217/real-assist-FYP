-- Migration to update project_enrollments status constraint
ALTER TABLE public.project_enrollments 
DROP CONSTRAINT IF EXISTS project_enrollments_status_check;

ALTER TABLE public.project_enrollments 
ADD CONSTRAINT project_enrollments_status_check 
CHECK (status IN ('pending', 'awaiting_downpayment', 'active', 'completed'));

-- Ensure any existing 'pending' could also be considered 'awaiting_downpayment' if needed
-- UPDATE public.project_enrollments SET status = 'awaiting_downpayment' WHERE status = 'pending';
