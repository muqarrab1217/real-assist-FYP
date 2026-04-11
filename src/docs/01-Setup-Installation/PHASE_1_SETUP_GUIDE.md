# Phase 1: Database Setup & Backend Modules - Implementation Guide

**Status:** PHASE 1 SETUP IN PROGRESS
**Created:** 2025-03-21

---

## What We've Created

### 1. Database Migration File
**File:** `migrations/005_add_chat_history_tables.sql`

Creates:
- ✅ `chat_sessions` table (chat metadata and titles)
- ✅ `chat_messages` table (individual messages)
- ✅ `context_summaries` table (conversation summaries)
- ✅ RLS policies for all tables
- ✅ Indexes for performance
- ✅ Helper view: `chat_stats`
- ✅ Extended `ai_logs` with chat_id reference

### 2. Backend Modules (Node.js)

**File:** `ragBot/server/lib/contextManager.js`
- Token counting and context window management
- Determines when to summarize conversations
- Builds context strings for Gemini

**File:** `ragBot/server/lib/summarizer.js`
- Conversations summarization using Gemini API
- Chat title generation
- Response processing and cleaning

**File:** `ragBot/server/lib/chatManager.js`
- Database CRUD operations
- Create/retrieve/delete chats
- Message persistence
- Summary management

---

## Step-by-Step Application Guide

### STEP 1: Apply Database Migration

#### Option A: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Sign in with your account
   - Select your RealAssist project

2. **Access SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query" button

3. **Copy Migration SQL**
   - Open file: `migrations/005_add_chat_history_tables.sql`
   - Copy entire content

4. **Run Migration**
   - Paste into Supabase SQL editor
   - Click "Run" button
   - Wait for completion (should see "✓ Execution successful")

5. **Monitor Execution**
   - Watch the "Query Results" section
   - Should see multiple statements executed
   - No errors should appear

#### Option B: Using Supabase CLI (If Installed)

```bash
# Navigate to project root
cd d:/FYP/FYP

# Run migration (requires Supabase CLI configured)
supabase db push

# Or manually run SQL file via psql if you have direct DB access
psql -U postgres -h your-host -d postgres -f migrations/005_add_chat_history_tables.sql
```

### STEP 2: Verify Tables Created

After running migration, verify in Supabase:

1. **Open Table Editor**
   - Go to Supabase Dashboard
   - Click "Table Editor" in left sidebar

2. **Check for New Tables**
   - Look for: `chat_sessions`, `chat_messages`, `context_summaries`
   - Should all show "✓" (green checkmark)

3. **Verify Columns**

   **chat_sessions:**
   ```
   ✓ id (UUID)
   ✓ user_id (UUID)
   ✓ title (text)
   ✓ description (text)
   ✓ total_messages (int8)
   ✓ is_summarized (bool)
   ✓ created_at (timestamp)
   ✓ updated_at (timestamp)
   ✓ last_message_at (timestamp)
   ✓ model_used (text)
   ✓ status (text)
   ```

   **chat_messages:**
   ```
   ✓ id (UUID)
   ✓ chat_id (UUID) - FK to chat_sessions
   ✓ role (text)
   ✓ content (text)
   ✓ token_count (int8)
   ✓ is_summarized (bool)
   ✓ created_at (timestamp)
   ✓ updated_at (timestamp)
   ✓ metadata (jsonb)
   ```

   **context_summaries:**
   ```
   ✓ id (UUID)
   ✓ chat_id (UUID) - FK to chat_sessions
   ✓ summary (text)
   ✓ message_count (int8)
   ✓ original_token_count (int8)
   ✓ summary_token_count (int8)
   ✓ first_message_id (UUID)
   ✓ last_message_id (UUID)
   ✓ created_at (timestamp)
   ✓ metadata (jsonb)
   ```

### STEP 3: Verify RLS Policies

1. **Check RLS is Enabled**
   - Open Table Editor
   - Click on `chat_sessions` table
   - Click "Authentication" button (left side)
   - Should see "✓ Row Level Security is enabled"

2. **Verify Policies**
   - Click "Policies" tab
   - Should see 4 policies:
     ```
     ✓ Users can view their own chat sessions
     ✓ Users can create their own chat sessions
     ✓ Users can update their own chat sessions
     ✓ Users can delete their own chat sessions
     ```

3. **Repeat for chat_messages and context_summaries**
   - Each should have appropriate "Users can..." policies

### STEP 4: Create Helper SQL Functions (If Needed)

If the migration fails due to missing `handle_updated_at()` function, create it:

```sql
-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Then re-run the migration.

### STEP 5: Test Database Connection

Run this test query in Supabase SQL Editor:

```sql
-- Test: Check all tables exist and are accessible
SELECT
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND information_schema.tables.table_name = columns.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('chat_sessions', 'chat_messages', 'context_summaries')
ORDER BY table_name;

-- Expected output: 3 rows with tables and their column counts
```

### STEP 6: Verify Indexes

```sql
-- Check indexes were created
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN ('chat_sessions', 'chat_messages', 'context_summaries')
ORDER BY tablename, indexname;

-- Should see indexes like:
-- idx_chat_sessions_user_id
-- idx_chat_sessions_created_at
-- idx_chat_messages_chat_id
-- etc.
```

### STEP 7: Test View

```sql
-- Test chat_stats view
SELECT * FROM public.chat_stats LIMIT 1;
-- Should return empty or 0 rows (no chats yet, which is expected)
```

---

## Backend Module Installation

### STEP 8: Verify Node.js Modules Exist

Check that these files were created:

```bash
# From project root:
ls -la ragBot/server/lib/

# Should see:
# contextManager.js
# summarizer.js
# chatManager.js
```

### STEP 9: Update Imports in Main Server File

In `ragBot/server/index.cjs`, add these imports at the top (after existing requires):

```javascript
// Add after line 8 (after const fs = require('fs').promises)

const ContextManager = require('./lib/contextManager');
const ConversationSummarizer = require('./lib/summarizer');
const ChatManager = require('./lib/chatManager');
```

### STEP 10: Initialize Modules in Server

In `ragBot/server/index.cjs`, add initialization code after `genAI` initialization:

```javascript
// After line 62 (after genAI initialization)

// Initialize Chat Management modules
let contextManager;
let summarizer;
let chatManager;

try {
  contextManager = new ContextManager(4000); // 4000 token limit
  summarizer = new ConversationSummarizer(process.env.GEMINI_API_KEY);
  chatManager = new ChatManager(supabaseUrl, supabaseKey);
  console.log('✅ Chat management modules initialized successfully');
} catch (error) {
  console.error('⚠️  Warning: Chat modules failed to initialize:', error.message);
  console.error('   Chat history features will be disabled until fixed');
}
```

---

## Verification Checklist

### Database Verification
- [ ] Migration runs without errors
- [ ] Tables exist in Table Editor
- [ ] All columns present and correct types
- [ ] RLS policies enabled on all tables
- [ ] Indexes created (verify via SQL query)
- [ ] chat_stats view accessible
- [ ] ai_logs extended with chat_id column

### Code Verification
- [ ] contextManager.js exists and is syntactically valid
- [ ] summarizer.js exists and imports GoogleGenerativeAI
- [ ] chatManager.js exists and imports @supabase
- [ ] Modules imported in index.cjs
- [ ] Modules initialized without errors
- [ ] Server starts successfully

### Quick Test (in Node.js)
```javascript
// Test context manager
const ContextManager = require('./ragBot/server/lib/contextManager');
const cm = new ContextManager();
console.log(cm.countTokens('Hello world')); // Should return ~3
console.log(cm.shouldSummarize(3000)); // Should return true (at 80%+ of 3500)

// Test that modules load
const summarizer = new ConversationSummarizer(process.env.GEMINI_API_KEY);
const chatManager = new ChatManager(supabaseUrl, supabaseKey);
```

---

## Common Issues & Solutions

### Issue: "Table already exists" error

**Solution:** The migration includes `CREATE TABLE IF NOT EXISTS`, so this is safe. The migration will skip creation of existing tables.

### Issue: "RLS violates with new table" error

**Solution:** Make sure RLS is enabled on tables before applying policies. The migration does this automatically.

### Issue: "handle_updated_at() function doesn't exist"

**Solution:** Run this first if your supabase schema is missing this function:

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Then re-run the migration.

### Issue: "Cannot connect to Supabase"

**Solution:**
- Verify environment variables are set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Check Supabase project is active
- Verify keys are correct (copy from Supabase Dashboard > Settings > API)

### Issue: Modules fail to import

**Solution:**
- Verify all files are in correct location:
  - `ragBot/server/lib/contextManager.js`
  - `ragBot/server/lib/summarizer.js`
  - `ragBot/server/lib/chatManager.js`
- Check for syntax errors (run `node -c filename.js`)
- Verify dependencies are installed (`npm list @supabase/supabase-js`)

---

## What's Next?

Once Phase 1 is complete and verified:

1. **Phase 2:** Build backend API endpoints
   - POST /api/gemini/chat/create
   - GET /api/gemini/chats/:userId
   - GET /api/gemini/chat/:chatId
   - POST /api/gemini/query (enhanced)
   - DELETE /api/gemini/chat/:chatId
   - PATCH /api/gemini/chat/:chatId/title

2. **Phase 3:** Build frontend components
   - Refactor Chatbot.tsx
   - Create ChatSidebar, ChatWindow
   - Implement useChat hook

3. **Phase 4:** Integration & testing
   - End-to-end testing
   - Error handling
   - Performance optimization

---

## Summary

**Phase 1 Deliverables:**
✅ Database migration file created
✅ 3 new tables in Supabase
✅ RLS policies configured
✅ Indexes for performance
✅ 3 backend modules created
✅ Modules integrated into server

**Files Created:**
- migrations/005_add_chat_history_tables.sql (280+ lines)
- ragBot/server/lib/contextManager.js (150+ lines)
- ragBot/server/lib/summarizer.js (250+ lines)
- ragBot/server/lib/chatManager.js (330+ lines)

**Total Code Added:** ~1000 lines

Ready to proceed with Phase 2 after verifying this phase is complete.

---

**Instructions:** Follow the steps above in order. After completion, respond with "✓ Phase 1 Complete" to proceed to Phase 2.
