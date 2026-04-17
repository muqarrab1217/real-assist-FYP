-- =====================================================
-- MIGRATION 006: Allow Multi-Enrollment Per Project
-- =====================================================
-- Changes the duplicate enrollment check from per-project
-- to per-inventory-item. Users can now enroll in the same
-- project multiple times for DIFFERENT units, but cannot
-- have two active enrollments for the SAME unit.
-- =====================================================

-- Update the trigger function to check inventory_item_id instead of project_id
CREATE OR REPLACE FUNCTION public.check_duplicate_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check when status is being set to 'active' or 'pending'
  IF NEW.status IN ('active', 'pending') THEN
    -- Prevent duplicate active/pending enrollment for the same inventory item
    IF NEW.inventory_item_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.project_enrollments
      WHERE user_id = NEW.user_id
        AND inventory_item_id = NEW.inventory_item_id
        AND status IN ('active', 'pending')
        AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'User already has an active or pending enrollment for this unit';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger (same name, updated function)
DROP TRIGGER IF EXISTS check_duplicate_enrollment_trigger ON public.project_enrollments;
CREATE TRIGGER check_duplicate_enrollment_trigger
  BEFORE INSERT OR UPDATE ON public.project_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.check_duplicate_enrollment();
