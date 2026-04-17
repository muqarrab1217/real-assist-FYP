-- Migration: Add Stripe integration columns
-- Run this in Supabase SQL Editor

-- 1. Add stripe_customer_id to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- 2. Add stripe_subscription_id and payment tracking to clients
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMPTZ;

-- 3. Add stripe_invoice_id to payments
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_stripe_subscription_id ON clients(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_invoice_id ON payments(stripe_invoice_id);
