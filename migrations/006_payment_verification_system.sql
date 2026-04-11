-- Migration 006: Payment Verification System
-- Adds payment_proofs table, extends payments table, adds sales_rep role

-- 1. Extend profiles role CHECK to include 'sales_rep'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'client', 'employee', 'sales_rep'));

-- 2. Add verification columns to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'portal',
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_required'
    CHECK (verification_status IN ('not_required', 'pending_verification', 'verified', 'rejected'));

-- 3. Create payment_proofs table
CREATE TABLE IF NOT EXISTS payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  proof_url TEXT NOT NULL,
  proof_type TEXT NOT NULL DEFAULT 'bank_transfer'
    CHECK (proof_type IN ('bank_transfer', 'jazzcash', 'easypaisa', 'cheque', 'cash_receipt', 'other')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create storage bucket for payment proofs (run via Supabase dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false)
-- ON CONFLICT DO NOTHING;

-- 5. RLS Policies for payment_proofs

ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

-- Clients can view their own proofs
CREATE POLICY "Clients can view own proofs" ON payment_proofs
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Clients can insert proofs for their own payments
CREATE POLICY "Clients can submit proofs" ON payment_proofs
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Sales reps can view all proofs
CREATE POLICY "Sales reps can view proofs" ON payment_proofs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'sales_rep'
    )
  );

-- Sales reps can update proof status (approve/reject)
CREATE POLICY "Sales reps can update proofs" ON payment_proofs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'sales_rep'
    )
  );

-- Admins have full access
CREATE POLICY "Admins full access proofs" ON payment_proofs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_proofs_payment_id ON payment_proofs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status);
CREATE INDEX IF NOT EXISTS idx_payments_verification_status ON payments(verification_status);
