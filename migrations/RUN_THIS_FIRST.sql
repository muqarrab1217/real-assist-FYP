-- =====================================================
-- QUICK START: Run This Migration
-- =====================================================
-- This file should be run in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/pafnjodeibjhotynakln/sql
-- =====================================================

-- Step 1: Backup (IMPORTANT!)
-- Create a backup before running migrations in production
-- Run this query first and save the results:
-- SELECT * FROM public.project_enrollments;

-- Step 2: Run the full migration
-- Copy the contents of migrations/001_enrollment_admin_approval.sql
-- and paste here, then click "Run"

-- Step 3: Verify the migration
-- Run these verification queries:

-- 3a. Check if new columns were added successfully
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'project_enrollments'
ORDER BY ordinal_position;

-- Expected new columns:
-- - selected_unit_type (text, nullable)
-- - selected_floor (integer, nullable)
-- - selected_unit_number (text, nullable)
-- - unit_details (jsonb, nullable)
-- - admin_notes (text, nullable)
-- - rejected_reason (text, nullable)
-- - processed_by (uuid, nullable)
-- - processed_at (timestamp, nullable)

-- 3b. Check if audit log table was created
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'enrollment_audit_log'
);
-- Expected: TRUE

-- 3c. Check if status constraint includes 'rejected'
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'project_enrollments'
  AND con.conname = 'project_enrollments_status_check';
-- Expected: CHECK(status IN ('pending', 'active', 'completed', 'rejected'))

-- 3d. Test enrollment stats function
SELECT * FROM public.get_enrollment_stats();
-- Should return a row with counts

-- Step 4: Test RLS policies
-- Should return policies for enrollment_audit_log
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('project_enrollments', 'enrollment_audit_log')
ORDER BY tablename, policyname;

-- Step 5 (Optional): Create test data
-- Uncomment and run this to create a test enrollment for testing approval flow

/*
-- Get a valid user ID (your admin account)
DO $$
DECLARE
  test_user_id UUID;
  test_project_id UUID;
  test_enrollment_id UUID;
BEGIN
  -- Get first user
  SELECT id INTO test_user_id FROM public.profiles WHERE role = 'client' LIMIT 1;

  -- Get first project
  SELECT id INTO test_project_id FROM public.properties LIMIT 1;

  IF test_user_id IS NOT NULL AND test_project_id IS NOT NULL THEN
    -- Create test enrollment
    INSERT INTO public.project_enrollments (
      user_id,
      project_id,
      total_price,
      down_payment,
      installment_duration_years,
      monthly_installment,
      selected_unit_type,
      selected_floor,
      selected_unit_number,
      unit_details,
      status
    ) VALUES (
      test_user_id,
      test_project_id,
      5000000,
      1750000,
      3,
      90278,
      'Penthouse',
      12,
      '1201-A',
      '{"bedrooms": "3 BR", "area": "2100 sq ft", "view": "Sea View"}'::jsonb,
      'pending'
    )
    RETURNING id INTO test_enrollment_id;

    RAISE NOTICE 'Test enrollment created with ID: %', test_enrollment_id;
  ELSE
    RAISE NOTICE 'No test data: user_id=%, project_id=%', test_user_id, test_project_id;
  END IF;
END $$;
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- ✅ If all verification queries passed, migration is successful!
--
-- Next steps:
-- 1. Deploy frontend code (npm run build && git push)
-- 2. Test enrollment flow at /projects/:id
-- 3. Test admin approval at /admin/enrollments
--
-- Rollback (if needed):
-- Run migrations/rollback_001.sql to undo changes
-- =====================================================
