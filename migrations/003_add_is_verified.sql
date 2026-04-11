-- =====================================================
-- Migration: Add is_verified column to project_enrollments
-- =====================================================
-- This migration adds explicit verification tracking
-- Run this in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/pafnjodeibjhotynakln/sql
-- =====================================================

-- Step 1: Add is_verified column
ALTER TABLE public.project_enrollments
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Step 2: Update existing enrollments - set is_verified based on status
-- Active and completed enrollments are considered verified
UPDATE public.project_enrollments
SET is_verified = TRUE
WHERE status IN ('active', 'completed');

-- Pending and rejected enrollments are not verified
UPDATE public.project_enrollments
SET is_verified = FALSE
WHERE status IN ('pending', 'rejected') OR is_verified IS NULL;

-- Step 3: Create index for faster queries on is_verified
CREATE INDEX IF NOT EXISTS idx_enrollments_verified
ON public.project_enrollments(is_verified, user_id);

-- Step 4: Create a trigger to auto-update is_verified when status changes
CREATE OR REPLACE FUNCTION update_enrollment_verified_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to active or completed, set is_verified to true
  IF NEW.status IN ('active', 'completed') THEN
    NEW.is_verified := TRUE;
  -- When status changes to pending or rejected, set is_verified to false
  ELSIF NEW.status IN ('pending', 'rejected') THEN
    NEW.is_verified := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS enrollment_verified_status_trigger ON public.project_enrollments;

-- Create the trigger
CREATE TRIGGER enrollment_verified_status_trigger
BEFORE INSERT OR UPDATE ON public.project_enrollments
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_verified_status();

-- =====================================================
-- VERIFICATION: After running, check the column exists
-- =====================================================
-- SELECT id, user_id, status, is_verified FROM project_enrollments LIMIT 10;
--
-- Expected:
-- - Enrollments with status 'active' or 'completed' have is_verified = TRUE
-- - Enrollments with status 'pending' or 'rejected' have is_verified = FALSE
-- =====================================================
