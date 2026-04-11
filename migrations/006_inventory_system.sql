-- Migration 006: Inventory-Driven Enrollment System
-- Creates project_inventory table, adds columns to properties & project_enrollments,
-- sets up RLS, storage bucket, and auto-status trigger.

-- ============================================================
-- 1. NEW TABLE: project_inventory
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  row_data JSONB NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'booked')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_inventory_project ON public.project_inventory(project_id);
CREATE INDEX IF NOT EXISTS idx_project_inventory_status ON public.project_inventory(project_id, status);

-- ============================================================
-- 2. NEW COLUMNS ON properties
-- ============================================================
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS inventory_headers JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS blueprint_url TEXT,
  ADD COLUMN IF NOT EXISTS booking_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS price_column_key TEXT;

-- ============================================================
-- 3. NEW COLUMNS ON project_enrollments
-- ============================================================
ALTER TABLE public.project_enrollments
  ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.project_inventory(id),
  ADD COLUMN IF NOT EXISTS payment_frequency TEXT DEFAULT 'monthly' CHECK (payment_frequency IN ('monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS is_flexible_plan BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS down_payment_percentage NUMERIC;

-- ============================================================
-- 4. RLS POLICIES FOR project_inventory
-- ============================================================
ALTER TABLE public.project_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view inventory"
ON public.project_inventory FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert inventory"
ON public.project_inventory FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update inventory"
ON public.project_inventory FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete inventory"
ON public.project_inventory FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 5. STORAGE BUCKET FOR BLUEPRINTS & FILES
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can read
CREATE POLICY "Public read access for project-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-files');

-- Storage policy: authenticated users can upload
CREATE POLICY "Auth users can upload project-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');

-- ============================================================
-- 6. TRIGGER: Auto-update inventory status on enrollment approval/rejection
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_inventory_on_enrollment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- On approval: mark inventory item as booked
  IF NEW.status = 'active' AND NEW.inventory_item_id IS NOT NULL THEN
    UPDATE public.project_inventory
    SET status = 'booked', updated_at = timezone('utc'::text, now())
    WHERE id = NEW.inventory_item_id;
  END IF;
  -- On rejection: revert inventory item to available
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' AND NEW.inventory_item_id IS NOT NULL THEN
    UPDATE public.project_inventory
    SET status = 'available', updated_at = timezone('utc'::text, now())
    WHERE id = NEW.inventory_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to allow re-running
DROP TRIGGER IF EXISTS trg_enrollment_inventory_status ON public.project_enrollments;

CREATE TRIGGER trg_enrollment_inventory_status
AFTER UPDATE OF status ON public.project_enrollments
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_enrollment_status();
