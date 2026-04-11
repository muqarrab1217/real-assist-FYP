-- =====================================================
-- ROLLBACK: Enrollment Admin Approval System
-- =====================================================
-- ⚠️ WARNING: This will remove all enrollment approval data
-- Only run this if you need to undo the migration
-- =====================================================

-- Step 1: Drop audit log table
DROP TABLE IF EXISTS public.enrollment_audit_log CASCADE;

-- Step 2: Drop helper functions
DROP FUNCTION IF EXISTS public.get_enrollment_stats() CASCADE;
DROP FUNCTION IF EXISTS public.check_duplicate_enrollment() CASCADE;

-- Step 3: Drop trigger
DROP TRIGGER IF EXISTS check_duplicate_enrollment_trigger ON public.project_enrollments;

-- Step 4: Remove new columns from project_enrollments
ALTER TABLE public.project_enrollments
DROP COLUMN IF EXISTS selected_unit_type,
DROP COLUMN IF EXISTS selected_floor,
DROP COLUMN IF EXISTS selected_unit_number,
DROP COLUMN IF EXISTS unit_details,
DROP COLUMN IF EXISTS admin_notes,
DROP COLUMN IF EXISTS rejected_reason,
DROP COLUMN IF EXISTS processed_by,
DROP COLUMN IF EXISTS processed_at;

-- Step 5: Restore original status constraint
ALTER TABLE public.project_enrollments
DROP CONSTRAINT IF EXISTS project_enrollments_status_check;

ALTER TABLE public.project_enrollments
ADD CONSTRAINT project_enrollments_status_check
CHECK (status IN ('pending', 'active', 'completed'));

-- Step 6: Drop indexes
DROP INDEX IF EXISTS idx_enrollments_status;
DROP INDEX IF EXISTS idx_enrollments_pending;
DROP INDEX IF EXISTS idx_enrollments_user_id;
DROP INDEX IF EXISTS idx_enrollments_project_id;
DROP INDEX IF EXISTS idx_audit_enrollment_id;
DROP INDEX IF EXISTS idx_audit_created_at;

-- =====================================================
-- ROLLBACK COMPLETE
-- =====================================================
-- ⚠️ Note: This does NOT restore data that was deleted
-- If you approved/rejected enrollments, those actions
-- are permanent even after rollback
--
-- To restore functionality:
-- 1. Remove EnrollmentRequestsPage.tsx
-- 2. Remove enrollment route from routes/index.tsx
-- 3. Remove enrollment link from Sidebar.tsx
-- 4. Revert ProjectEnrollmentModal.tsx changes
-- 5. Revert api.ts changes (remove approval methods)
-- 6. Revert types/index.ts changes
-- =====================================================
