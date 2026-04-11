# ChatGPT-like Chat History Implementation Plan
## RealAssist - Complete Step-by-Step Guide

**Document Version:** 1.0
**Status:** Planning Phase
**Target Timeline:** 5-7 development sessions
**Complexity:** High (Full-stack integration)

---

## Table of Contents
1. [Overview & Architecture](#overview)
2. [Phase Breakdown](#phases)
3. [Database Schema](#database-schema)
4. [Backend API Specification](#backend-api)
5. [Frontend Implementation](#frontend)
6. [Context Management Strategy](#context-management)
7. [Integration Guide](#integration)
8. [Error Handling](#error-handling)
9. [Testing Checklist](#testing)
10. [Deployment Notes](#deployment)

---

## Overview & Architecture {#overview}

### Current State
```
┌─────────────────┐
│   Chatbot.tsx   │
│  (React State)  │
└────────┬────────┘
         │
    POST /api/gemini/query
         │
┌────────▼───────────────────────┐
│  ragBot/server/index.cjs        │
│  - File Upload (/upload)        │
│  - Query Processing (/query)    │
│  - Gemini Integration           │
└────────┬───────────────────────┘
         │
    INSERT INTO ai_logs
         │
┌────────▼────────────────────────┐
│  Supabase (ai_logs table)       │
│  - Input: { "message": "..." }  │
│  - Output: { "response": "..." }│
└─────────────────────────────────┘

⚠️  LIMITATIONS:
  ✗ Messages lost on page refresh
  ✗ No chat session concept
  ✗ No previous context in Gemini calls
  ✗ Can't switch between conversations
  ✗ No chat titles or organization
```

### Target State (After Implementation)
```
┌───────────────────────────────────────────────────────┐
│                Chatbot.tsx (Enhanced)                 │
│  ┌──────────────────────┐  ┌──────────────────┐      │
│  │   Chat Sidebar       │  │   Message Area   │      │
│  │  - Chat List         │  │  - Full History  │      │
│  │  - New Chat Button   │  │  - Previous Msgs │      │
│  │  - Rename/Delete     │  │  - Context Aware │      │
│  └──────────────────────┘  └──────────────────┘      │
└────────────────┬──────────────────────────────────────┘
                 │
    ┌────────────┴──────────────┐
    │                           │
  GET /api/gemini/chats/:userId,  POST /api/gemini/chat/create,
  GET /api/gemini/chat/:chatId    POST /api/gemini/query (enhanced)
    │                           │
┌───▼──────────────────────────▼──────────────────────────┐
│         ragBot/server/index.cjs (Enhanced)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  New Endpoints:                                  │  │
│  │  - POST /api/gemini/chat/create                  │  │
│  │  - GET  /api/gemini/chats/:userId                │  │
│  │  - GET  /api/gemini/chat/:chatId                 │  │
│  │  - POST /api/gemini/chat/:chatId/Delete          │  │
│  │                                                  │  │
│  │  Enhanced Endpoints:                             │  │
│  │  - POST /api/gemini/query (with chatId)         │  │
│  │    • Load previous messages                      │  │
│  │    • Build context with history                  │  │
│  │    • Save new message pair                       │  │
│  │                                                  │  │
│  │  New Features:                                   │  │
│  │  - Context Window Management                     │  │
│  │  - Conversation Summarization                    │  │
│  │  - Token Counting                                │  │
│  └──────────────────────────────────────────────────┘  │
└────────┬──────────┬──────────────┬─────────────────────┘
         │          │              │
         │          │              └─── Gemini API
         │          │              (Enhanced calls with context)
         │          │
    INSERT/SELECT  INSERT/UPDATE/DELETE
         │          │
         │          │
┌────────▼──────────▼──────────────────────────────────┐
│    Supabase (Extended Schema)                        │
│  ┌─────────────────────────────────────────────────┐│
│  │ chat_sessions TABLE (NEW)                       ││
│  │  - id (UUID PK)                                 ││
│  │  - user_id (UUID FK → profiles)                 ││
│  │  - title (TEXT)                                 ││
│  │  - created_at (TIMESTAMP)                       ││
│  │  - updated_at (TIMESTAMP)                       ││
│  │                                                 ││
│  │ chat_messages TABLE (NEW)                       ││
│  │  - id (UUID PK)                                 ││
│  │  - chat_id (UUID FK → chat_sessions)            ││
│  │  - role (ENUM: 'user' | 'assistant')            ││
│  │  - content (TEXT)                               ││
│  │  - timestamp (TIMESTAMP)                        ││
│  │  - token_count (INTEGER)                        ││
│  │                                                 ││
│  │ context_summaries TABLE (NEW)                   ││
│  │  - id (UUID PK)                                 ││
│  │  - chat_id (UUID FK → chat_sessions)            ││
│  │  - summary (TEXT)                               ││
│  │  - message_count (INTEGER)                      ││
│  │  - created_at (TIMESTAMP)                       ││
│  │                                                 ││
│  │ ai_logs TABLE (EXISTING - Keep)                 ││
│  │  - Enhanced with chat_id reference              ││
│  └─────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘

✅ IMPROVEMENTS:
  ✓ Persistent multi-chat system
  ✓ Context-aware responses
  ✓ Intelligent summarization
  ✓ Switch between conversations
  ✓ Chat organization & management
  ✓ Token-efficient context handling
```

---

## Phase Breakdown {#phases}

### Phase 1: Foundation (Session 1)
**Duration:** 1 session (2-3 hours)
**Goal:** Set up database schema and core backend infrastructure

**Deliverables:**
- [ ] Database migration scripts
- [ ] New table creation (chat_sessions, chat_messages, context_summaries)
- [ ] RLS policies setup
- [ ] Database indexes for performance

**Tasks:**
1. Create database migration file
2. Create chat_sessions table
3. Create chat_messages table
4. Create context_summaries table
5. Add RLS policies for all tables
6. Create indexes (user_id, chat_id, timestamps)
7. Test queries and verify schema

---

### Phase 2: Backend API Enhancement (Sessions 2-3)
**Duration:** 2 sessions (4-5 hours)
**Goal:** Build all necessary backend endpoints

**Deliverables:**
- [ ] Chat creation endpoint
- [ ] Chat retrieval endpoint
- [ ] Message retrieval endpoint
- [ ] Enhanced query endpoint with context
- [ ] Chat deletion endpoint
- [ ] Context summarization logic

**Tasks:**
1. POST /api/gemini/chat/create
2. GET /api/gemini/chats/:userId
3. GET /api/gemini/chat/:chatId
4. POST /api/gemini/query (enhanced)
5. DELETE /api/gemini/chat/:chatId
6. Implement context manager module
7. Implement summarization function
8. Add token counting utility

---

### Phase 3: Frontend UI & State (Sessions 3-4)
**Duration:** 2 sessions (4-5 hours)
**Goal:** Build ChatGPT-like UI with chat management

**Deliverables:**
- [ ] Sidebar with chat list
- [ ] Chat switching functionality
- [ ] New chat creation
- [ ] Message history display
- [ ] Chat deletion/management
- [ ] Proper state management

**Tasks:**
1. Extract Chatbot component into separate parts
2. Create ChatSidebar component
3. Create ChatWindow component
4. Create ChatHistory component
5. Implement useChat custom hook
6. Add chat creation flow
7. Add chat selection logic
8. Implement message loading

---

### Phase 4: Integration & Testing (Session 5)
**Duration:** 1 session (2-3 hours)
**Goal:** Connect all components and ensure seamless operation

**Deliverables:**
- [ ] Full end-to-end testing
- [ ] Error handling verification
- [ ] Performance optimization
- [ ] Context managment validation

**Tasks:**
1. Test chat creation flow
2. Test message persistence
3. Test context loading
4. Test summarization trigger
5. Performance profiling
6. Error handling verification
7. Edge case testing

---

### Phase 5: Enhancement & Optimization (Session 6+)
**Duration:** 1-2 sessions (2-4 hours)
**Goal:** Polish and optimize the system

**Deliverables:**
- [ ] UI/UX refinements
- [ ] Performance optimizations
- [ ] Advanced features (export, share)
- [ ] Documentation

**Tasks:**
1. Optimize database queries
2. Add pagination for chat lists
3. Implement search functionality
4. Add chat export feature
5. Performance monitoring
6. Complete documentation

---

## Database Schema {#database-schema}

### Migration File: `migrations/005_add_chat_history_tables.sql`

```sql
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);
CREATE INDEX idx_chat_sessions_updated_at ON public.chat_sessions(updated_at DESC);
CREATE INDEX idx_chat_sessions_status ON public.chat_sessions(status);

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
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at ASC);
CREATE INDEX idx_chat_messages_role ON public.chat_messages(role);
CREATE INDEX idx_chat_messages_is_summarized ON public.chat_messages(is_summarized);

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
CREATE INDEX idx_context_summaries_chat_id ON public.context_summaries(chat_id);
CREATE INDEX idx_context_summaries_created_at ON public.context_summaries(created_at DESC);

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

-- ============================================
-- 7. Grant permissions
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.context_summaries TO authenticated;
GRANT SELECT ON public.chat_stats TO authenticated;
```

### Schema Diagram

```
┌─────────────────────────────────────────┐
│         profiles (existing)             │
│  - id (UUID) ◄──────────────────────┐   │
│  - email                            │   │
│  - first_name                       │   │
│  - last_name                        │   │
│  - role                             │   │
└─────────────────────────────────────────┘
                                         │
                                    PK FK
                                         │
          ┌──────────────────────────────┴─────────────────────┐
          │                                                      │
┌─────────▼────────────────┐                      ┌─────────────▼──────────────┐
│   chat_sessions (NEW)    │◄─────────────────────┤   chat_messages (NEW)      │
│ - id (UUID) PK          │       1:N            │ - id (UUID) PK             │
│ - user_id (FK) ──────────┤ (chat_id)          │ - chat_id (FK) ────────────┤
│ - title                  │                     │ - role                     │
│ - description            │                     │ - content                  │
│ - total_messages         │                     │ - token_count              │
│ - is_summarized          │                     │ - is_summarized            │
│ - created_at             │                     │ - created_at               │
│ - updated_at             │                     │ - updated_at               │
│ - last_message_at        │                     │ - metadata (JSONB)         │
│ - model_used             │                     └────────────────────────────┘
│ - status                 │
│                          │
│ Indexes:                 │
│ - user_id               │
│ - created_at DESC       │
│ - status                │
└──────────────┬───────────┘
               │
               │
               │ 1:N (summarizes)
               │
┌──────────────▼────────────────────┐
│  context_summaries (NEW)          │
│ - id (UUID) PK                   │
│ - chat_id (FK) ────────────────────┤
│ - summary (TEXT)                 │
│ - message_count                  │
│ - original_token_count           │
│ - summary_token_count            │
│ - first_message_id               │
│ - last_message_id                │
│ - created_at                     │
│ - metadata (JSONB)               │
│                                   │
│ Indexes:                          │
│ - chat_id                        │
│ - created_at DESC                │
└───────────────────────────────────┘

┌────────────────────────────────┐
│    ai_logs (existing - updated) │
│ (Add chat_id FK reference)      │
└────────────────────────────────┘
```

---

## Backend API Specification {#backend-api}

### Endpoint 1: Create New Chat Session

```
POST /api/gemini/chat/create
```

**Purpose:** Create a new chat session for the user

**Request:**
```typescript
{
  title?: string;        // Optional: "My First Chat" (if not provided, use "New Chat")
  description?: string;  // Optional detailed description
}
```

**Response (Success 201):**
```typescript
{
  success: true,
  chat: {
    id: "uuid-here",
    user_id: "uuid-here",
    title: "New Chat",
    created_at: "2025-03-21T10:00:00Z",
    updated_at: "2025-03-21T10:00:00Z",
    message_count: 0,
    status: "active"
  }
}
```

**Response (Error 400/500):**
```typescript
{
  success: false,
  error: "Failed to create chat session",
  details: "Database error message"
}
```

**Implementation Notes:**
- Calculate title from first user message if not provided initially
- Initialize with empty message array
- Set initial token count to 0
- Return chat ID to client for future requests

---

### Endpoint 2: Get All Chats for User

```
GET /api/gemini/chats/:userId
```

**Purpose:** Retrieve all chat sessions for a user

**Query Parameters:**
```typescript
limit?: number;    // Default: 20, Max: 100
offset?: number;   // Default: 0 (for pagination)
status?: string;   // 'active' | 'archived' | 'deleted' (default: 'active')
```

**Response (Success 200):**
```typescript
{
  success: true,
  chats: [
    {
      id: "uuid-1",
      title: "Investment Strategy Discussion",
      description: "Discussing portfolio options",
      message_count: 15,
      last_message_at: "2025-03-21T15:30:00Z",
      is_summarized: true,
      created_at: "2025-03-21T10:00:00Z",
      updated_at: "2025-03-21T15:30:00Z"
    },
    {
      id: "uuid-2",
      title: "Payment Plan Questions",
      description: null,
      message_count: 8,
      last_message_at: "2025-03-21T14:45:00Z",
      is_summarized: false,
      created_at: "2025-03-21T11:30:00Z",
      updated_at: "2025-03-21T14:45:00Z"
    }
  ],
  pagination: {
    total: 12,
    limit: 20,
    offset: 0,
    hasMore: false
  }
}
```

**Implementation Notes:**
- Use RLS to ensure user only sees their chats
- Order by last_message_at DESC by default
- Include message_count from chat_stats view
- Cache results for 30 seconds

---

### Endpoint 3: Get Messages for Specific Chat

```
GET /api/gemini/chat/:chatId
```

**Purpose:** Retrieve all messages for a specific chat session

**Query Parameters:**
```typescript
limit?: number;    // Default: 50 (chat messages to load)
offset?: number;   // Default: 0 (for pagination)
```

**Response (Success 200):**
```typescript
{
  success: true,
  chat: {
    id: "uuid-here",
    title: "Investment Strategy Discussion",
    created_at: "2025-03-21T10:00:00Z",
    message_count: 15,
    is_summarized: true,
    summary: "User asked about real estate investment options..." // if summarized
  },
  messages: [
    {
      id: "msg-uuid-1",
      role: "user",
      content: "What are the investment options available?",
      token_count: 12,
      created_at: "2025-03-21T10:05:00Z"
    },
    {
      id: "msg-uuid-2",
      role: "assistant",
      content: "We offer several real estate investment options...",
      token_count: 85,
      created_at: "2025-03-21T10:05:30Z"
    }
  ],
  pagination: {
    total: 15,
    limit: 50,
    offset: 0,
    hasMore: false
  }
}
```

**Implementation Notes:**
- Load messages in chronological order (ASC)
- Include context summary if chat is summarized
- Don't include full summarized messages (only point to summary)
- Use pagination for large chat histories

---

### Endpoint 4: Enhanced Query Endpoint (With Chat History)

```
POST /api/gemini/query
```

**Purpose:** Process user query and maintain chat history

**Request (Enhanced):**
```typescript
{
  message: string;        // User's question
  chatId: string;        // UUID of chat session (can be "new" for creating new chat)
  userId: string;        // User ID from auth
  includeHistory?: boolean; // Default: true
}
```

**Response (Success 200):**
```typescript
{
  success: true,
  response: "ABS Developers offers several real estate investment options...",

  // Chat session info
  chatId: "uuid-here",
  chatTitle: "Investment Strategy Discussion", // Auto-generated if new

  // Message info
  messageId: "msg-uuid-2",
  role: "assistant",

  // Context info
  contextUsed: {
    previousMessages: 2,
    contextWindow: 1500,
    totalTokensUsed: 200,
    summarized: false
  },

  // Timestamps
  timestamp: "2025-03-21T10:05:30Z"
}
```

**Request Processing Flow:**

```
┌─────────────────────────────────────────────────┐
│ 1. VALIDATE INPUT                               │
│    - Check message not empty                    │
│    - Verify userId                              │
│    - Check chatId exists (if not "new")         │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ 2. HANDLE NEW CHAT                              │
│    - If chatId = "new":                         │
│      • Create chat_session row                  │
│      • Set title to "New Chat" initially        │
│      • Will update after getting response       │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ 3. LOAD CONTEXT                                 │
│    - If includeHistory = true:                  │
│      • Load previous messages from DB           │
│      • Load context summaries (if exists)       │
│      • Calculate total tokens                   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ 4. MANAGE CONTEXT WINDOW                        │
│    - Check if total tokens > MAX_TOKENS         │
│    - If yes: trigger summarization              │
│      • Summarize oldest messages                │
│      • Replace with summary in context          │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ 5. BUILD PROMPT WITH HISTORY                    │
│    - System prompt (from current system)        │
│    - Previous messages as context               │
│    - Current user message                       │
│    - File context (from corpus)                 │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ 6. CALL GEMINI API                              │
│    - Send full prompt with context              │
│    - Get response                               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ 7. SAVE TO DATABASE                             │
│    - Insert user message to chat_messages       │
│    - Insert assistant response to chat_messages │
│    - Calculate token counts                     │
│    - Update chat_sessions (last_message_at)    │
│    - Update title (if first message)            │
│    - Log to ai_logs (with chat_id)              │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│ 8. RETURN RESPONSE                              │
│    - Return processed response                  │
│    - Include chat ID and metadata               │
└─────────────────────────────────────────────────┘
```

---

### Endpoint 5: Delete Chat Session

```
DELETE /api/gemini/chat/:chatId
```

**Purpose:** Soft-delete a chat session

**Response (Success 200):**
```typescript
{
  success: true,
  message: "Chat deleted successfully",
  chatId: "uuid-here"
}
```

**Implementation Notes:**
- Use soft delete (set status = 'deleted')
- Don't actually delete messages (for recovery)
- Verify ownership before deletion

---

## Backend Core Modules {#backend-modules}

### Module 1: Context Manager (`lib/contextManager.js`)

```javascript
// Token counting for context management
class ContextManager {
  constructor(maxTokens = 4000) {
    this.maxTokens = maxTokens;
    this.reservedTokens = 500; // For response generation
    this.availableTokens = maxTokens - reservedTokens; // 3500
  }

  /**
   * Count approximate tokens in text
   * Using rough estimation: 1 token ≈ 4 characters
   */
  countTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate total tokens used by messages
   */
  calculateMessageTokens(messages) {
    return messages.reduce((total, msg) => {
      return total + this.countTokens(msg.content);
    }, 0);
  }

  /**
   * Check if context fits within token limit
   */
  canFitInContext(totalTokens) {
    return totalTokens <= this.availableTokens;
  }

  /**
   * Build context string from messages
   * Includes both full messages and summaries
   */
  buildContextString(messages, summaries = []) {
    let context = "Previous conversation history:\n\n";

    for (const summary of summaries) {
      context += `[SUMMARIZED] ${summary.summary}\n\n`;
    }

    for (const msg of messages) {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      context += `${role}: ${msg.content}\n\n`;
    }

    return context;
  }

  /**
   * Get tokens available for current context
   */
  getAvailableTokens(currentUsedTokens) {
    return Math.max(0, this.availableTokens - currentUsedTokens);
  }

  /**
   * Should we trigger summarization?
   */
  shouldSummarize(totalTokens) {
    // Trigger at 80% of available tokens
    return totalTokens >= (this.availableTokens * 0.8);
  }
}

module.exports = ContextManager;
```

### Module 2: Summarization Engine (`lib/summarizer.js`)

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

class ConversationSummarizer {
  constructor(geminiApiKey) {
    this.genAI = new GoogleGenerativeAI(geminiApiKey);
    this.model = 'gemini-1.5-flash';
  }

  /**
   * Summarize a batch of messages
   */
  async summarizeMessages(messages) {
    if (messages.length === 0) return null;

    const conversationText = messages
      .map(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        return `${role}: ${msg.content}`;
      })
      .join('\n\n');

    const prompt = `Summarize this real estate investment conversation concisely in 2-3 sentences,
focusing on key topics, questions asked, and important information discussed. Keep it professional.

Conversation:
${conversationText}

Summary:`;

    try {
      const modelInstance = this.genAI.getGenerativeModel({ model: this.model });
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Summarization error:', error);
      throw new Error('Failed to summarize conversation');
    }
  }

  /**
   * Generate chat title from first message and response
   */
  async generateChatTitle(userMessage, assistantResponse) {
    const prompt = `Generate a short, concise title (max 6 words) for a real estate investment chat
that starts with this exchange:

User: ${userMessage}
Assistant: ${assistantResponse}

Title (no quotes, no explanation):`;

    try {
      const modelInstance = this.genAI.getGenerativeModel({ model: this.model });
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      return response.text().trim().slice(0, 50); // Max 50 chars
    } catch (error) {
      console.error('Title generation error:', error);
      return null; // Fallback to default
    }
  }
}

module.exports = ConversationSummarizer;
```

### Module 3: Chat Manager (`lib/chatManager.js`)

```javascript
const { createClient } = require('@supabase/supabase-js');

class ChatManager {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create new chat session
   */
  async createChatSession(userId, title = 'New Chat', description = null) {
    try {
      const { data, error } = await this.supabase
        .from('chat_sessions')
        .insert([{
          user_id: userId,
          title,
          description,
          total_messages: 0,
          is_summarized: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to create chat: ${error.message}`);
    }
  }

  /**
   * Get all chats for a user
   */
  async getUserChats(userId, limit = 20, offset = 0) {
    try {
      const { data, error, count } = await this.supabase
        .from('chat_sessions')
        .select('*, chat_stats(*)', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        chats: data,
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count
      };
    } catch (error) {
      throw new Error(`Failed to fetch chats: ${error.message}`);
    }
  }

  /**
   * Load messages for a chat
   */
  async getChatMessages(chatId, userId, limit = 50, offset = 0) {
    try {
      // Verify ownership
      const { data: chatData, error: chatError } = await this.supabase
        .from('chat_sessions')
        .select('user_id')
        .eq('id', chatId)
        .single();

      if (chatError || chatData.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      // Load messages
      const { data: messages, error: msgError, count } = await this.supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (msgError) throw msgError;

      // Load summary if exists
      const { data: summary } = await this.supabase
        .from('context_summaries')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        messages,
        summary: summary?.summary || null,
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count
      };
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }

  /**
   * Save message pair (user + assistant)
   */
  async saveMessagePair(chatId, userMessage, assistantMessage, userTokens, assistantTokens) {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .insert([
          {
            chat_id: chatId,
            role: 'user',
            content: userMessage,
            token_count: userTokens
          },
          {
            chat_id: chatId,
            role: 'assistant',
            content: assistantMessage,
            token_count: assistantTokens
          }
        ])
        .select();

      if (error) throw error;

      // Update chat metadata
      await this.supabase
        .from('chat_sessions')
        .update({
          total_messages: this.supabase.rpc('increment_message_count', { chat_id: chatId }),
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId);

      return data;
    } catch (error) {
      throw new Error(`Failed to save messages: ${error.message}`);
    }
  }

  /**
   * Save conversation summary
   */
  async saveSummary(chatId, summary, messageCount, originalTokens, summaryTokens, firstMsgId, lastMsgId) {
    try {
      const { data, error } = await this.supabase
        .from('context_summaries')
        .insert([{
          chat_id: chatId,
          summary,
          message_count: messageCount,
          original_token_count: originalTokens,
          summary_token_count: summaryTokens,
          first_message_id: firstMsgId,
          last_message_id: lastMsgId
        }])
        .select()
        .single();

      if (error) throw error;

      // Mark messages as summarized
      await this.supabase
        .from('chat_messages')
        .update({ is_summarized: true })
        .eq('chat_id', chatId)
        .lte('id', lastMsgId);

      // Update chat status
      await this.supabase
        .from('chat_sessions')
        .update({ is_summarized: true })
        .eq('id', chatId);

      return data;
    } catch (error) {
      throw new Error(`Failed to save summary: ${error.message}`);
    }
  }

  /**
   * Delete chat (soft delete)
   */
  async deleteChat(chatId, userId) {
    try {
      const { error } = await this.supabase
        .from('chat_sessions')
        .update({ status: 'deleted' })
        .eq('id', chatId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete chat: ${error.message}`);
    }
  }

  /**
   * Update chat title
   */
  async updateChatTitle(chatId, userId, newTitle) {
    try {
      const { data, error } = await this.supabase
        .from('chat_sessions')
        .update({ title: newTitle })
        .eq('id', chatId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to update title: ${error.message}`);
    }
  }
}

module.exports = ChatManager;
```

---

## Frontend Implementation {#frontend}

### Component Structure

```
Chatbot.tsx (Main Container)
  ├── ChatSidebar.tsx
  │   ├── ChatList.tsx
  │   ├── NewChatButton.tsx
  │   └── ChatActions.tsx (rename, delete)
  │
  ├── ChatWindow.tsx
  │   ├── ChatHeader.tsx
  │   ├── MessageArea.tsx
  │   │   └── Message.tsx (reusable)
  │   └── InputArea.tsx
  │
  └── Hooks
      └── useChat.ts (custom hook)
```

### Custom Hook: `src/hooks/useChat.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

export interface ChatSession {
  id: string;
  title: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  message_count: number;
  last_message_at?: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
  token_count?: number;
}

interface UseChat {
  // State
  chats: ChatSession[];
  currentChat: ChatSession | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  isSending: boolean;

  // Methods
  loadChats: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  createNewChat: () => Promise<ChatSession>;
  deleteChat: (chatId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  updateChatTitle: (chatId: string, newTitle: string) => Promise<void>;
}

export const useChat = (): UseChat => {
  const { user } = useAuthContext();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Load all chats for user
  const loadChats = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/gemini/chats/${user.id}`);
      if (!response.ok) throw new Error('Failed to load chats');

      const data = await response.json();
      setChats(data.chats || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading chats');
      console.error('Failed to load chats:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Select and load specific chat
  const selectChat = useCallback(async (chatId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gemini/chat/${chatId}`);
      if (!response.ok) throw new Error('Failed to load chat');

      const data = await response.json();
      setCurrentChat(data.chat);
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading chat');
      console.error('Failed to load chat:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new chat session
  const createNewChat = useCallback(async (): Promise<ChatSession> => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const response = await fetch('/api/gemini/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Chat',
          description: null
        })
      });

      if (!response.ok) throw new Error('Failed to create chat');

      const data = await response.json();
      const newChat = data.chat;

      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      setMessages([]);
      setError(null);

      return newChat;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error creating chat';
      setError(errorMsg);
      throw err;
    }
  }, [user?.id]);

  // Send message and get response
  const sendMessage = useCallback(async (text: string) => {
    if (!user?.id || !currentChat?.id) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/gemini/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          chatId: currentChat.id,
          userId: user.id,
          includeHistory: true
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: text,
        created_at: new Date()
      };

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: data.messageId,
        role: 'assistant',
        content: data.response,
        created_at: new Date()
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);

      // Update chat title if it's the first message
      if (currentChat.message_count === 0 && data.chatTitle !== 'New Chat') {
        await updateChatTitle(currentChat.id, data.chatTitle);
      }

      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error sending message';
      setError(errorMsg);
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  }, [user?.id, currentChat?.id]);

  // Delete chat
  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/gemini/chat/${chatId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete chat');

      setChats(prev => prev.filter(c => c.id !== chatId));

      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }

      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error deleting chat';
      setError(errorMsg);
      console.error('Failed to delete chat:', err);
    }
  }, [currentChat?.id]);

  // Update chat title
  const updateChatTitle = useCallback(async (chatId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/gemini/chat/${chatId}/title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });

      if (!response.ok) throw new Error('Failed to update title');

      const data = await response.json();

      setChats(prev =>
        prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c)
      );

      if (currentChat?.id === chatId) {
        setCurrentChat(prev => prev ? { ...prev, title: newTitle } : null);
      }

      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error updating title';
      setError(errorMsg);
      console.error('Failed to update title:', err);
    }
  }, [currentChat?.id]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    currentChat,
    messages,
    loading,
    error,
    isSending,
    loadChats,
    selectChat,
    createNewChat,
    deleteChat,
    sendMessage,
    updateChatTitle
  };
};
```

### Main Component: `src/components/ui/Chatbot.tsx` (Refactored)

```typescript
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useChat } from '@/hooks/useChat';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const chat = useChat();

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 h-14 w-14 text-black rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 z-40 flex items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
        }}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(212, 175, 55, 0.4)",
            "0 0 0 10px rgba(212, 175, 55, 0)",
            "0 0 0 0 rgba(212, 175, 55, 0)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[600px] h-[600px] rounded-lg shadow-2xl z-50 flex"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(0, 0, 0, 0.95) 100%)',
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              boxShadow: 'inset 0 0 200px rgba(212, 175, 55, 0.04)'
            }}
          >
            {/* Sidebar */}
            <ChatSidebar
              chats={chat.chats}
              currentChat={chat.currentChat}
              loading={chat.loading}
              onSelectChat={chat.selectChat}
              onCreateChat={chat.createNewChat}
              onDeleteChat={chat.deleteChat}
            />

            {/* Chat Area */}
            <ChatWindow
              currentChat={chat.currentChat}
              messages={chat.messages}
              loading={chat.loading}
              isSending={chat.isSending}
              error={chat.error}
              onSendMessage={chat.sendMessage}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
```

---

## Context Management Strategy {#context-management}

### Token Distribution Strategy

```
┌─────────────────────────────────────────────────────┐
│    GEMINI 1.5 FLASH CONTEXT WINDOW                 │
│                                                     │
│    Total Available: ~100,000 tokens (theoretical)  │
│    Practical Limit: 4,000 tokens (per request)    │
│                                                     │
│    ┌──────────────────────────────────────────────┐│
│    │ Reserved for Response Generation: 500 tokens ││
│    └──────────────────────────────────────────────┘│
│                                                     │
│    ┌──────────────────────────────────────────────┐│
│    │ Available for Context: 3,500 tokens           ││
│    │                                              ││
│    │ Breakdown:                                   ││
│    │ - File/Corpus Context: ~800 tokens          ││
│    │ - System Prompt: ~400 tokens                ││
│    │ - Chat History: ~2,300 tokens               ││
│    │   (Can be reduced via summarization)         ││
│    └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Summarization Trigger Algorithm

```javascript
const contextManager = new ContextManager(maxTokens = 4000);

// Monitor token usage
const totalTokens = contextManager.calculateMessageTokens(messages);

if (contextManager.shouldSummarize(totalTokens)) {
  // Summarize oldest 20% of messages
  const messagesToSummarize = messages.slice(0, Math.floor(messages.length * 0.2));
  const summary = await summarizer.summarizeMessages(messagesToSummarize);

  // Replace messages with summary
  messages = [
    { role: 'summary', content: summary, type: 'summarized' },
    ...messages.slice(messagesToSummarize.length)
  ];

  // Save summary to database
  await chatManager.saveSummary(
    chatId,
    summary,
    messagesToSummarize.length,
    contextManager.countTokens(messagesToSummarize),
    contextManager.countTokens(summary)
  );
}
```

### Context Loading Strategy

1. **Initial Load:**
   - Load last 20 messages (recent context)
   - Load any existing summaries

2. **Long Chats (100+ messages):**
   - Load summaries instead of full old messages
   - Load last 30 recent messages in full
   - Reduces token usage from 5000+ to ~2000

3. **Very Long Chats (500+ messages):**
   - Load multiple summaries
   - Load only last 10-15 recent messages
   - Even more efficient (~1500 tokens)

---

## Integration Guide {#integration}

### Step 1: Apply Database Migration

```bash
# Apply migration to Supabase
1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Create new query
4. Copy content of: migrations/005_add_chat_history_tables.sql
5. Click "Run"
6. Verify: Table Editor should show new tables
```

### Step 2: Create Backend Modules

Create these files in `ragBot/server/`:

1. `lib/contextManager.js` - Token management
2. `lib/summarizer.js` - Conversation summarization
3. `lib/chatManager.js` - Database operations

Create new endpoints in `index.cjs`:
- `POST /api/gemini/chat/create`
- `GET /api/gemini/chats/:userId`
- `GET /api/gemini/chat/:chatId`
- `DELETE /api/gemini/chat/:chatId`
- `PATCH /api/gemini/chat/:chatId/title`
- Modify `POST /api/gemini/query`

### Step 3: Update Frontend

Replace `src/components/ui/Chatbot.tsx` with refactored version
Create new components:
- `src/components/ui/ChatSidebar.tsx`
- `src/components/ui/ChatWindow.tsx`
- `src/components/ui/ChatHistory.tsx`

Create hook:
- `src/hooks/useChat.ts`

### Step 4: Update Types

Add to `src/types/index.ts`:

```typescript
export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  total_messages: number;
  is_summarized: boolean;
  created_at: Date;
  updated_at: Date;
  last_message_at?: Date;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  token_count?: number;
  is_summarized: boolean;
  created_at: Date;
}

export interface ContextSummary {
  id: string;
  chat_id: string;
  summary: string;
  message_count: number;
  original_token_count: number;
  summary_token_count: number;
  created_at: Date;
}
```

---

## Error Handling {#error-handling}

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Chat not found` | chatId doesn't exist | Verify chatId in database |
| `Unauthorized` | User doesn't own chat | Check RLS policies |
| `Failed to create chat` | Database error | Check Supabase connection |
| `Token limit exceeded` | Too many messages | Trigger summarization |
| `Summarization failed` | Gemini API error | Return full messages, log error |
| `Message not saved` | Database inconsistency | Retry with exponential backoff |

### Error Response Format

```typescript
{
  success: false,
  error: "Descriptive error message",
  code: "ERROR_CODE",
  details: "Additional context if available",
  retryable: true // Is it safe to retry?
}
```

---

## Testing Checklist {#testing}

### Phase 1: Database Tests
- [ ] Chat session creation
- [ ] Chat session retrieval
- [ ] Chat message insertion
- [ ] RLS policies enforce correctly
- [ ] Indexes created and functional
- [ ] Soft delete works

### Phase 2: API Tests
- [ ] Create new chat
- [ ] Fetch all chats for user
- [ ] Fetch messages for specific chat
- [ ] Send message with history
- [ ] Title auto-generation works
- [ ] Summarization triggers correctly
- [ ] Delete chat

### Phase 3: Frontend Tests
- [ ] Chat list displays
- [ ] Chat selection works
- [ ] New chat creation
- [ ] Message sending
- [ ] History loading
- [ ] Error messages display
- [ ] Responsive design

### Phase 4: Integration Tests
- [ ] End-to-end chat flow
- [ ] Context preserved across messages
- [ ] Summarization maintains accuracy
- [ ] Performance acceptable
- [ ] No data loss

---

## Deployment Notes {#deployment}

### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] Database migration applied
- [ ] Environment variables set
- [ ] API keys configured
- [ ] RLS policies verified
- [ ] Error handling complete
- [ ] Performance tested
- [ ] Documentation updated

### Performance Considerations
- **Database Indexes:** Essential for query performance
- **Pagination:** Implement for large chat lists
- **Caching:** Cache recent chats for 30 seconds
- **Lazy Loading:** Load messages on demand
- **Compression:** Compress old messages in database

### Scalability
- **Small (1-100 users):** Basic setup works
- **Medium (100-1000 users):** Add caching layer
- **Large (1000+ users):** Consider:
  - Message archival
  - Read replicas for queries
  - Search indexing (Elasticsearch)
  - Message compression

---

## Summary

This implementation plan provides:

✅ **Complete architecture** - Frontend, backend, database
✅ **Detailed API specs** - All endpoints documented
✅ **Code templates** - Ready-to-use modules
✅ **Error handling** - Common issues covered
✅ **Testing plan** - Comprehensive checklist
✅ **Deployment guide** - Production-ready

**Total development time:** 5-7 sessions
**Complexity level:** High (full-stack)
**Risk level:** Medium (requires testing)

Ready to begin implementation? Proceed to Phase 1: Database Migration.
