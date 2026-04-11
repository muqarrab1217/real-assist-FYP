-- =====================================================
-- FIX: Allow users to insert payments for their own clients
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the 403 error
-- URL: https://supabase.com/dashboard/project/pafnjodeibjhotynakln/sql
-- =====================================================

-- Add missing INSERT policy for payments table
DROP POLICY IF EXISTS "Users can insert payments for their own clients" ON public.payments;

CREATE POLICY "Users can insert payments for their own clients"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE id = payments.client_id
        AND user_id = auth.uid()
    )
  );

-- Also add UPDATE policy so users can pay their installments
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;

CREATE POLICY "Users can update their own payments"
  ON public.payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE id = payments.client_id
        AND user_id = auth.uid()
    )
  );

-- =====================================================
-- VERIFICATION: After running, check policies exist
-- =====================================================
-- SELECT policyname, cmd FROM pg_policies
-- WHERE tablename = 'payments';
--
-- Expected output should include:
-- - "Admins can manage all payments" | ALL
-- - "Users can view their own payments" | SELECT
-- - "Users can insert payments for their own clients" | INSERT
-- - "Users can update their own payments" | UPDATE
-- =====================================================
