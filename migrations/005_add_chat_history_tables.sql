-- Migration: Add Chat History Tables for RealAssist
-- Description: Create tables for chat sessions, messages, and context summaries
-- Version: 1.0
-- Date: 2025-03-21

-- ============================================
-- 1. chat_sessions TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  description TEXT,

  -- Context management
  total_messages INTEGER DEFAULT 0,
  is_summarized BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  model_used TEXT DEFAULT 'gemini-1.5-flash',
  status TEXT CHECK (status IN ('active', 'archived', 'deleted')) DEFAULT 'active'
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can create their own chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can update their own chat sessions" ON public.chat_sessions
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can delete their own chat sessions" ON public.chat_sessions
  FOR DELETE USING (user_id = auth.uid());

-- Create indexes for chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON public.chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.chat_sessions(status);

-- ============================================
-- 2. chat_messages TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,

  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,

  -- Token management
  token_count INTEGER DEFAULT 0,

  -- Summarization tracking
  is_summarized BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.chat_messages;
CREATE POLICY "Users can view messages in their chats" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = chat_messages.chat_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in their chats" ON public.chat_messages;
CREATE POLICY "Users can insert messages in their chats" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = chat_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update messages in their chats" ON public.chat_messages;
CREATE POLICY "Users can update messages in their chats" ON public.chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = chat_id AND user_id = auth.uid()
    )
  );

-- Create indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON public.chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_summarized ON public.chat_messages(is_summarized);

-- ============================================
-- 3. context_summaries TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.context_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,

  -- Summary content
  summary TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,

  -- Token tracking
  original_token_count INTEGER DEFAULT 0,
  summary_token_count INTEGER DEFAULT 0,

  -- Summarization range
  first_message_id UUID,
  last_message_id UUID,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.context_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for context_summaries
DROP POLICY IF EXISTS "Users can view summaries in their chats" ON public.context_summaries;
CREATE POLICY "Users can view summaries in their chats" ON public.context_summaries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = context_summaries.chat_id AND user_id = auth.uid()
    )
  );

-- Create indexes for context_summaries
CREATE INDEX IF NOT EXISTS idx_context_summaries_chat_id ON public.context_summaries(chat_id);
CREATE INDEX IF NOT EXISTS idx_context_summaries_created_at ON public.context_summaries(created_at DESC);

-- ============================================
-- 4. TRIGGERS for automatic updated_at
-- ============================================
DROP TRIGGER IF EXISTS on_chat_session_updated ON public.chat_sessions;
CREATE TRIGGER on_chat_session_updated
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_chat_message_updated ON public.chat_messages;
CREATE TRIGGER on_chat_message_updated
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================
-- 5. EXTEND ai_logs TABLE (ADD chat_id reference)
-- ============================================
ALTER TABLE public.ai_logs
ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ai_logs_chat_id ON public.ai_logs(chat_id);

-- ============================================
-- 6. HELPER VIEW: Chat Stats
-- ============================================
DROP VIEW IF EXISTS public.chat_stats;
CREATE OR REPLACE VIEW public.chat_stats AS
SELECT
  cs.id as chat_id,
  cs.user_id,
  cs.title,
  COUNT(cm.id)::INTEGER as message_count,
  SUM(CASE WHEN cm.role = 'user' THEN 1 ELSE 0 END)::INTEGER as user_message_count,
  SUM(CASE WHEN cm.role = 'assistant' THEN 1 ELSE 0 END)::INTEGER as assistant_message_count,
  COALESCE(SUM(cm.token_count), 0)::INTEGER as total_tokens,
  MAX(cm.created_at) as last_message_at,
  cs.created_at,
  cs.updated_at
FROM public.chat_sessions cs
LEFT JOIN public.chat_messages cm ON cs.id = cm.chat_id
WHERE cs.status = 'active'
GROUP BY cs.id, cs.user_id, cs.title, cs.created_at, cs.updated_at;

-- Grant permissions
GRANT SELECT ON public.chat_stats TO authenticated;

-- ============================================
-- 7. Migration validation
-- ============================================
-- This comment serves as a marker that the migration was successfully applied
-- Check tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('chat_sessions', 'chat_messages', 'context_summaries');

-- Check columns in chat_sessions:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'chat_sessions' ORDER BY ordinal_position;

-- Check indexes:
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('chat_sessions', 'chat_messages', 'context_summaries') ORDER BY tablename, indexname;
