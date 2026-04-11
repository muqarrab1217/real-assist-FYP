-- =====================================================
-- Chat System Database Migration
-- =====================================================
-- This migration adds chat session and message persistence
-- to support the RAG chatbot system with proper user attribution
-- =====================================================

-- =====================================================
-- TABLE 1: chat_sessions
-- Stores chat session metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  description TEXT,
  total_messages INTEGER DEFAULT 0,
  is_summarized BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('active', 'archived', 'deleted')) DEFAULT 'active',
  model_used TEXT DEFAULT 'gemini-1.5-flash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all chat sessions" ON public.chat_sessions;
CREATE POLICY "Admins can view all chat sessions" ON public.chat_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can create their own chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can update their own chat sessions" ON public.chat_sessions
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can delete their own chat sessions" ON public.chat_sessions
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all chat sessions" ON public.chat_sessions;
CREATE POLICY "Admins can manage all chat sessions" ON public.chat_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_chat_session_updated ON public.chat_sessions;
CREATE TRIGGER on_chat_session_updated
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message_at ON public.chat_sessions(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON public.chat_sessions(updated_at DESC);

-- =====================================================
-- TABLE 2: chat_messages
-- Stores individual messages within chat sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER DEFAULT 0,
  is_summarized BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = chat_messages.chat_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all chat messages" ON public.chat_messages;
CREATE POLICY "Admins can view all chat messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can insert messages to their own sessions" ON public.chat_messages;
CREATE POLICY "Users can insert messages to their own sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = chat_messages.chat_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can insert messages to any session" ON public.chat_messages;
CREATE POLICY "Admins can insert messages to any session" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update messages in any session" ON public.chat_messages;
CREATE POLICY "Admins can update messages in any session" ON public.chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON public.chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_summarized ON public.chat_messages(is_summarized);

-- =====================================================
-- TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS on_chat_message_updated ON public.chat_messages;
CREATE TRIGGER on_chat_message_updated
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get chat session with messages
CREATE OR REPLACE FUNCTION public.get_chat_session_with_messages(p_session_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  total_messages INTEGER,
  is_summarized BOOLEAN,
  status TEXT,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  messages JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.user_id,
    cs.title,
    cs.description,
    cs.total_messages,
    cs.is_summarized,
    cs.status,
    cs.model_used,
    cs.created_at,
    cs.updated_at,
    cs.last_message_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', cm.id,
            'role', cm.role,
            'content', cm.content,
            'token_count', cm.token_count,
            'is_summarized', cm.is_summarized,
            'created_at', cm.created_at,
            'metadata', cm.metadata
          ) ORDER BY cm.created_at ASC
        )
        FROM public.chat_messages cm
        WHERE cm.chat_id = cs.id
      ),
      '[]'::jsonb
    ) as messages
  FROM public.chat_sessions cs
  WHERE cs.id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's chat sessions (for listing)
CREATE OR REPLACE FUNCTION public.get_user_chat_sessions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_status TEXT DEFAULT 'active'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  total_messages INTEGER,
  is_summarized BOOLEAN,
  status TEXT,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_message_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.user_id,
    cs.title,
    cs.description,
    cs.total_messages,
    cs.is_summarized,
    cs.status,
    cs.model_used,
    cs.created_at,
    cs.updated_at,
    cs.last_message_at
  FROM public.chat_sessions cs
  WHERE cs.user_id = p_user_id 
    AND (p_status IS NULL OR cs.status = p_status)
  ORDER BY cs.last_message_at DESC NULLS LAST, cs.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Small helper used by RLS and admin-only reads
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_chat_session_with_messages(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_chat_sessions(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created:
--   1. chat_sessions - Session metadata with user attribution
--   2. chat_messages - Individual messages referenced by session_id
--
-- Features:
--   - Row Level Security (users see own data, admins see all)
--   - Updated-at maintenance triggers
--   - Performance indexes on key columns
--   - Helper functions for efficient queries
-- =====================================================
