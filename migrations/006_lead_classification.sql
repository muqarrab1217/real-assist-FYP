-- Migration: Add user_id and AI classification tracking to leads table
-- This links leads to authenticated chat users and tracks AI-based classification

-- Add user_id column to link leads to authenticated users
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id);

-- Add chat_session_id to track which chat session triggered the classification
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS chat_session_id UUID REFERENCES public.chat_sessions(id);

-- Add classification_source to distinguish manual vs AI-classified leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS classification_source TEXT DEFAULT 'manual';

-- Create index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);

-- Create unique constraint so each user has one lead record (upsert-friendly)
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_user_id_unique ON public.leads(user_id) WHERE user_id IS NOT NULL;
