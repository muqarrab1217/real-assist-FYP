-- =====================================================
-- Migration: Enrollment Admin Approval System
-- Date: 2026-03-21
-- Description: Adds unit selection, admin approval workflow,
--              and audit logging for project enrollments
-- =====================================================

-- =====================================================
-- STEP 1: Extend project_enrollments Table
-- =====================================================

-- Add unit selection fields
ALTER TABLE public.project_enrollments
ADD COLUMN IF NOT EXISTS selected_unit_type TEXT,
ADD COLUMN IF NOT EXISTS selected_floor INTEGER,
ADD COLUMN IF NOT EXISTS selected_unit_number TEXT,
ADD COLUMN IF NOT EXISTS unit_details JSONB DEFAULT '{}';

-- Add admin approval fields
ALTER TABLE public.project_enrollments
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS rejected_reason TEXT,
ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Update status CHECK constraint to include 'rejected'
ALTER TABLE public.project_enrollments
DROP CONSTRAINT IF EXISTS project_enrollments_status_check;

ALTER TABLE public.project_enrollments
ADD CONSTRAINT project_enrollments_status_check
CHECK (status IN ('pending', 'active', 'completed', 'rejected'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_enrollments_status
  ON public.project_enrollments(status);

CREATE INDEX IF NOT EXISTS idx_enrollments_pending
  ON public.project_enrollments(status)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id
  ON public.project_enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_project_id
  ON public.project_enrollments(project_id);

-- Add comment for documentation
COMMENT ON COLUMN public.project_enrollments.selected_unit_type IS 'Type of unit selected (e.g., Penthouse, Suite, Apartment)';
COMMENT ON COLUMN public.project_enrollments.selected_floor IS 'Floor number of the selected unit';
COMMENT ON COLUMN public.project_enrollments.selected_unit_number IS 'Unit/Apartment number (e.g., 501-A)';
COMMENT ON COLUMN public.project_enrollments.unit_details IS 'Additional unit details in JSON format (bedrooms, area, view, etc.)';
COMMENT ON COLUMN public.project_enrollments.processed_by IS 'Admin who approved/rejected the enrollment';
COMMENT ON COLUMN public.project_enrollments.processed_at IS 'Timestamp when enrollment was approved/rejected';

-- =====================================================
-- STEP 2: Create Enrollment Audit Log Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.enrollment_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES public.project_enrollments(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'approved', 'rejected', 'modified')),
  old_status TEXT,
  new_status TEXT,
  performed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_enrollment_id
  ON public.enrollment_audit_log(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_audit_created_at
  ON public.enrollment_audit_log(created_at DESC);

-- Enable RLS on audit log
ALTER TABLE public.enrollment_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.enrollment_audit_log;
CREATE POLICY "Admins can view audit logs"
  ON public.enrollment_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow system to insert audit logs (any authenticated user can log their own actions)
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.enrollment_audit_log;
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.enrollment_audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- STEP 3: Update RLS Policies for Enrollments
-- =====================================================

-- Ensure admins can update enrollment status
DROP POLICY IF EXISTS "Admins can update enrollment status"
  ON public.project_enrollments;

CREATE POLICY "Admins can update enrollment status"
  ON public.project_enrollments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- STEP 4: Create Helper Functions
-- =====================================================

-- Function to get enrollment statistics for admin dashboard
CREATE OR REPLACE FUNCTION public.get_enrollment_stats()
RETURNS TABLE (
  total_enrollments BIGINT,
  pending_count BIGINT,
  approved_count BIGINT,
  rejected_count BIGINT,
  total_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_enrollments,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_count,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_count,
    COALESCE(SUM(total_price), 0) as total_value
  FROM public.project_enrollments;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to prevent duplicate active enrollments for same user+project
CREATE OR REPLACE FUNCTION public.check_duplicate_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already has an active enrollment for this project
  IF NEW.status = 'active' THEN
    IF EXISTS (
      SELECT 1 FROM public.project_enrollments
      WHERE user_id = NEW.user_id
        AND project_id = NEW.project_id
        AND status = 'active'
        AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'User already has an active enrollment for this project';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS check_duplicate_enrollment_trigger ON public.project_enrollments;
CREATE TRIGGER check_duplicate_enrollment_trigger
  BEFORE INSERT OR UPDATE ON public.project_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.check_duplicate_enrollment();

-- =====================================================
-- STEP 5: Add Comments for Documentation
-- =====================================================

COMMENT ON TABLE public.enrollment_audit_log IS 'Tracks all enrollment status changes and admin actions for compliance and audit purposes';
COMMENT ON COLUMN public.enrollment_audit_log.action IS 'Type of action: created, approved, rejected, modified';
COMMENT ON COLUMN public.enrollment_audit_log.performed_by IS 'Admin or user who performed the action';

-- =====================================================
-- END OF MIGRATION
-- =====================================================

-- Verification queries (run these to check migration success):
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'project_enrollments' ORDER BY ordinal_position;
-- SELECT * FROM public.enrollment_audit_log LIMIT 5;
