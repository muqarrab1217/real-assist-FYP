# Chat History & Messaging System - RealAssist

## Overview

RealAssist includes a comprehensive AI chatbot system powered by Google Gemini with retrieval-augmented generation (RAG). The system consists of three main layers:

1. **Frontend UI** - Interactive chat widget (React/TypeScript)
2. **Backend API** - Document management and query processing (Express.js)
3. **Database** - Chat history and AI logs persistence (Supabase PostgreSQL)

---

## 1. Frontend Chatbot Component

### Location
`src/components/ui/Chatbot.tsx` (188 lines)

### Current State
**Mock implementation** - Simulated responses with no backend integration yet

### Visual Architecture

```
┌─────────────────────────────────────────┐
│  Floating Chat Button (Bottom Right)    │
│  - Gold gradient background (#d4af37)   │
│  - Pulsing glow animation (2s loop)     │
│  - Always visible on all pages          │
│  - z-index: 40                          │
└─────────────────────────────────────────┘
           ↓ onClick: opens modal
┌─────────────────────────────────────────┐
│  Chat Window Modal                       │
│  - Width: 200px                         │
│  - Height: 384px (h-96)                 │
│  - Glass morphism effect                 │
│  - Backdrop blur: 20px                   │
│  - Border: 1px solid rgba(212,175,55,0.25)
│  - z-index: 50                          │
└─────────────────────────────────────────┘
    ┌─────────────────────────────┐
    │ 1. Header Section           │
    │ ✓ AI avatar (gold gradient) │
    │ ✓ Title: "AI Assistant"     │
    │ ✓ Status: "Online"          │
    │ ✓ Close button (X)          │
    │ Background: 8% gold gradient│
    └─────────────────────────────┘
         ↓
    ┌─────────────────────────────┐
    │ 2. Messages Area            │
    │ ✓ Scrollable (max-h-64)     │
    │ ✓ User messages:            │
    │   - Gold gradient bg        │
    │   - Black text              │
    │   - Aligned right           │
    │ ✓ AI messages:              │
    │   - Dark gray bg            │
    │   - White text              │
    │   - Aligned left            │
    │ ✓ Fade-in animation (0.2s)  │
    │                             │
    │ Padding: 16px              │
    │ Gap between msgs: 16px     │
    └─────────────────────────────┘
         ↓
    ┌─────────────────────────────┐
    │ 3. Input Section            │
    │ ✓ Text input field          │
    │   - Black background        │
    │   - Gold border             │
    │   - White text              │
    │   - Placeholder text        │
    │ ✓ Send button               │
    │   - Gold gradient           │
    │   - Paper airplane icon     │
    │   - Hover/tap animation     │
    │                             │
    │ ✓ Enter key → send message  │
    └─────────────────────────────┘
```

### Message Data Model

```typescript
interface Message {
  id: string;           // Unique identifier
  text: string;         // Message content
  isUser: boolean;      // true = user, false = AI assistant
  timestamp: Date;      // When message was created
}
```

**ID Generation:**
- User messages: `Date.now().toString()`
- AI responses: `(Date.now() + 1).toString()`

### Current Implementation

#### State Management
```typescript
const [isOpen, setIsOpen] = useState(false);                    // Chat window visibility
const [messages, setMessages] = useState<Message[]>([...]);    // Message history
const [inputValue, setInputValue] = useState('');              // Current input text
```

#### Initial Message
```typescript
{
  id: '1',
  text: 'Hello! I\'m your AI assistant. How can I help you with your real estate investment today?',
  isUser: false,
  timestamp: new Date(),
}
```

#### Message Handling Flow

**User Sends Message:**
```
1. User types message & presses Enter or clicks Send
2. Input validation: trim() check for empty
3. Create message object with timestamp
4. Add to messages array
5. Clear input field
6. Simulate 1s delay
7. Add canned AI response
```

**Current Behavior (Mock):**
```typescript
const handleSendMessage = () => {
  if (!inputValue.trim()) return;

  // Add user message
  const newMessage: Message = {
    id: Date.now().toString(),
    text: inputValue,
    isUser: true,
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, newMessage]);
  setInputValue('');

  // Simulate AI response (1 second delay)
  setTimeout(() => {
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Thank you for your message! I\'m here to help with any questions...',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiResponse]);
  }, 1000);
};
```

### Keyboard & Input Events

| Event | Handler | Action |
|-------|---------|--------|
| `Enter` key | `handleKeyPress` | Trigger `handleSendMessage()` |
| Text change | `onChange` | Update `inputValue` state |
| Click Send | `onClick` | Trigger `handleSendMessage()` |
| Click Close (X) | `onClick` | Set `isOpen = false` |
| Click outside | N/A | Currently no click-outside handler |

### Styling Details

**Chat Button:**
- Background: `linear-gradient(135deg, #d4af37, #f4e68c)` (gold)
- Text color: Black
- Animation: Pulsing box-shadow (2s loop)
- Hover: Scale 1.05x
- Tap: Scale 0.95x

**Chat Window:**
- Background: `rgba(0, 0, 0, 0.85)` + gradient overlay
- Backdrop filter: `blur(20px)` (glass morphism)
- Border color: `rgba(212, 175, 55, 0.25)`
- Shadow: `inset 0 0 200px rgba(212, 175, 55, 0.04)`

**User Messages:**
- Background: `linear-gradient(135deg, #d4af37, #f4e68c)`
- Text: Black
- Position: Right-aligned

**AI Messages:**
- Background: `linear-gradient(135deg, rgba(212,175,55,0.08), rgba(0,0,0,0.8))`
- Border: `1px solid rgba(212, 175, 55, 0.2)`
- Text: White
- Position: Left-aligned

---

## 2. Backend RAG API

### Location
`ragBot/server/index.cjs` (510 lines)

### Purpose
- Upload real estate documents (PDFs, DOCX, TXT)
- Process user queries using uploaded documents
- Integrate with Google Gemini API for intelligent responses
- Log all interactions to Supabase

### Core Concepts

#### Corpus
A "corpus" is a collection of uploaded documents indexed for retrieval.
- **Corpus ID:** Unique identifier for the document collection
- **Corpus Name:** `real-estate-corpus-{timestamp}`
- **Stored in:** `ragBot/config/corpus-config.json`
- **One corpus per deployment**

#### File Registry
Metadata tracking for all uploaded files.
- **Path:** `ragBot/config/files-registry.json`
- **Purpose:** Quick reference without re-reading files
- **Limit:** Reasonable registry size (large registries can exceed JSON limits)

### Endpoint 1: Document Upload

#### Request
```
POST /api/gemini/upload
Content-Type: multipart/form-data

Body:
- files: [file1.pdf, file2.docx, file3.txt] (up to 50 files)
```

#### Constraints
- **File types:** PDF, DOCX, TXT only
- **Max per file:** Technically unlimited in code, but practical limit ~500MB
- **Max total:** 500MB for entire request
- **Max files per request:** 50
- **Directory:** `ragBot/uploads/`

#### Process

```
1. Validate files received
2. Load existing corpus ID (or create new one)
3. Load file registry from JSON
4. For each file:
   a. Validate MIME type
   b. Generate unique file ID (timestamp + random)
   c. Store metadata (no base64 - too large for JSON)
   d. Add to registry
5. Try to save updated registry
6. If registry too large:
   - Save without pretty-printing (minified JSON)
7. Return results with errors (if any)
```

#### File Registry Structure

```json
{
  "id": "1234567890-abc123def456",
  "fileName": "property-details.pdf",
  "uploadPath": "ragBot/uploads/file.pdf",
  "mimeType": "application/pdf",
  "uploadedAt": "2025-03-21T10:30:45.123Z",
  "corpusId": "real-estate-corpus-1699999999999",
  "size": 2097152
}
```

#### Response

**Success:**
```json
{
  "success": true,
  "message": "3 files uploaded successfully",
  "corpusId": "real-estate-corpus-1699999999999",
  "files": [
    { "id": "...", "fileName": "...", "size": ... }
  ],
  "totalFiles": 3,
  "successful": 3,
  "failed": 0
}
```

**Partial Success:**
```json
{
  "success": true,
  "message": "2 files uploaded successfully",
  "corpusId": "...",
  "files": [...],
  "errors": [
    { "fileName": "invalid.jpg", "error": "Only PDF, DOCX, and TXT files are allowed" }
  ],
  "totalFiles": 3,
  "successful": 2,
  "failed": 1
}
```

### Endpoint 2: Query Processing

#### Request
```
POST /api/gemini/query
Content-Type: application/json

Body:
{
  "message": "What is the price range for the luxury apartments?"
}
```

#### Response Flow

```
1. Validate message exists and is string
2. Check if Gemini API initialized
3. Load corpus config
4. Check corpus exists (fail if no documents uploaded)
5. Load file registry
6. Build context string with document list
7. Create system prompt with instructions
8. Call Gemini 1.5 Flash model
9. Process response (cleanup, validation)
10. Log to Supabase ai_logs table
11. Return processed response
```

#### System Prompt Structure

```
You are a professional real estate customer service representative for ABS Developers.
You assist customers with queries about ABS Developers' properties, projects, pricing,
features, payment plans, and real estate offerings. You are a helpful human assistant, not an AI.

[DOCUMENT CONTEXT]
Available documents in corpus:
1. property-details.pdf (application/pdf, 2.5MB)
2. payment-plans.docx (application/vnd.ms-word, 1.2MB)
[Content previews for text files...]

[USER QUESTION]
What is the price range for luxury apartments?

CRITICAL INSTRUCTIONS:
1. STRICT SCOPE: Answer ALL questions about ABS Developers, properties, real estate
2. OFF-TOPIC RESPONSE: Only if completely unrelated → "I am here to assist you
   with all queries related to ABS Developers."
3. WORD LIMIT: Maximum 80 words
4. PROFESSIONAL TONE: Helpful, courteous, human-like
5. NO AI MENTIONS: Never say "I'm an AI" or "I'm a chatbot"
6. NO MARKDOWN: Plain text only, no asterisks or formatting
7. NO QUOTES: Write naturally without quotation marks
8. ACCURACY: Base answers on uploaded documents
9. NO GUESSING: If unsure, acknowledge it

Now provide your response in plain text:
```

#### Response Processing

**Step 1: Cleanup Markdown**
```
Remove: **bold** → bold
Remove: *italic* → italic
Remove: # headers
Remove: [links](urls) → plain text
Remove: bullet points with asterisks
Remove: extra whitespace
```

**Step 2: Remove AI Phrases**
```
Patterns to remove:
- "I am an AI"
- "I'm a chatbot"
- "As an AI"
- "I don't have access to"
- "I cannot tell you"
- And similar phrases...
```

**Step 3: Validate Context**
```
Check if response mentions AI behavior:
- If yes AND doesn't mention real estate → Redirect to off-topic response
- If yes AND mentions real estate → Accept answer (might be relevant)
- If no → Accept answer

Off-topic keywords: poem, joke, weather, sports, movie, date, time, etc.
```

**Step 4: Enforce 80-Word Limit**
```
Split response to words
If > 80 words:
  - Keep first 80 words
  - Append "..."
Else:
  - Return as-is
```

#### Response Example

**Request:**
```json
{
  "message": "How much does a 2-bedroom apartment cost?"
}
```

**Gemini Output (raw):**
```
**ABS Developers** luxury 2-bedroom apartments are priced between PKR 5-8 million
depending on location and amenities. We offer flexible payment plans with 20% down
payment and affordable monthly installments over 5 years. Contact our sales team for
current promotions and availability.
```

**After Processing:**
```
ABS Developers luxury 2-bedroom apartments are priced between PKR 5-8 million
depending on location and amenities. We offer flexible payment plans with 20% down
payment and affordable monthly installments over 5 years. Contact our sales team for...
```

### Endpoint 3: Health Check

```
GET /api/health
Response: { "status": "ok", "service": "ragBot-api" }
```

### Configuration Files

#### `ragBot/config/corpus-config.json`
```json
{
  "corpusId": "real-estate-corpus-1699999999999",
  "corpusName": "real-estate-corpus-1699999999999",
  "createdAt": "2025-03-21T10:00:00.000Z"
}
```

#### `ragBot/config/files-registry.json`
```json
[
  {
    "id": "1234567890-abc123",
    "fileName": "property-catalogue.pdf",
    "uploadPath": "ragBot/uploads/file1.pdf",
    "mimeType": "application/pdf",
    "uploadedAt": "2025-03-21T10:30:00.000Z",
    "corpusId": "real-estate-corpus-1699999999999",
    "size": 2097152
  },
  ...
]
```

---

## 3. Database Schema

### Table: `ai_logs`

**Purpose:** Track all AI queries and responses for audit trails

```sql
CREATE TABLE public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE SET NULL,
  input_data JSONB,                    -- { "message": "user question" }
  output_data JSONB,                   -- { "response": "...", "model": "gemini-1.5-flash" }
  status TEXT,                         -- 'success' or error code
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) DEFAULT auth.uid()
);
```

**Fields:**
- `id` - Unique log entry ID
- `workflow_id` - Optional reference to automation workflow (for future use)
- `input_data` - User's question as JSON object
- `output_data` - AI response and model name as JSON object
- `status` - 'success' or error message
- `executed_at` - When query was processed (server timestamp)
- `user_id` - Who asked the question (from auth context)

**RLS Policy:**
```
Users can see their own AI logs
FOR SELECT USING (user_id = auth.uid());
```

**Example Log Entry:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "workflow_id": null,
  "input_data": {
    "message": "What is the minimum down payment?"
  },
  "output_data": {
    "response": "ABS Developers requires a minimum down payment of 20% for most projects...",
    "model": "gemini-1.5-flash"
  },
  "status": "success",
  "executed_at": "2025-03-21T10:35:42.123Z",
  "user_id": "user-123-uuid"
}
```

---

## 4. Data Flow Architecture

### Complete Message Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                          USER                                     │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Types message & presses Enter
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Chatbot.tsx)                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 1. Message Input                                           │  │
│  │    - User message added to React state                    │  │
│  │    - Input field cleared                                  │  │
│  │    - Message displayed immediately                        │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ CURRENT: Simulated response
                              │ FUTURE: Call /api/gemini/query
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND (ragBot API)                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ POST /api/gemini/query                                     │  │
│  │ Body: { "message": "..." }                                │  │
│  │                                                            │  │
│  │ Processing:                                               │  │
│  │ 1. Load file registry from JSON                          │  │
│  │ 2. Build context string with document list              │  │
│  │ 3. Create system prompt with instructions               │  │
│  │ 4. Call Gemini 1.5 Flash model with prompt             │  │
│  │ 5. Receive raw response from Gemini                     │  │
│  │ 6. Process response:                                    │  │
│  │    - Remove markdown formatting                         │  │
│  │    - Remove AI phrases                                  │  │
│  │    - Validate context (off-topic check)               │  │
│  │    - Enforce 80-word limit                            │  │
│  │ 7. Clean and finalize response text                    │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Return response
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                   DATABASE (Supabase)                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ INSERT INTO ai_logs (                                      │  │
│  │   input_data: { "message": "..." },                       │  │
│  │   output_data: { "response": "...", "model": "..." },    │  │
│  │   status: "success",                                      │  │
│  │   user_id: auth.uid()                                    │  │
│  │ )                                                          │  │
│  │                                                            │  │
│  │ Log stored for audit trail & chat history               │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Return response JSON
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Chatbot.tsx)                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Receive response & display:                               │  │
│  │ - Add AI message to messages array                        │  │
│  │ - Animate fade-in                                         │  │
│  │ - Auto-scroll to latest message                          │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Display in chat window
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                          USER                                     │
│               Sees AI response in chat                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Implementation Status

| Component | Status | Details |
|-----------|--------|---------|
| **Chatbot UI** | ✅ Complete | Full UI rendering with animations |
| **Message State** | ✅ Complete | Local React state management |
| **Message Display** | ✅ Complete | User vs AI styling, auto-scroll |
| **Mock Responses** | ✅ Complete | 1-second delay simulated |
| **Document Upload API** | ✅ Complete | Handles file uploads, registry |
| **Query Process API** | ✅ Complete | Gemini integration working |
| **Response Processing** | ✅ Complete | Cleanup, validation, word limit |
| **Database Logging** | ✅ Complete | ai_logs table configured |
| **Frontend-Backend Integration** | ❌ Missing | Chatbot doesn't call backend yet |
| **Chat History Retrieval** | ❌ Missing | Can't load previous messages |
| **User Context** | ⚠️ Partial | Need to pass user ID from auth |
| **Real-time Updates** | ❌ Not implemented | Could use WebSockets later |
| **Typing Indicators** | ❌ Not implemented | No "AI is typing..." state |
| **Error Handling** | ⚠️ Partial | Mock error messages only |

---

## 6. Key Features & Current Behaviors

### Frontend Features
- ✅ Floating chat button with pulsing animation
- ✅ Glass morphism chat window
- ✅ Message-to-right, AI-to-left layout
- ✅ Gold gradient buttons and elements
- ✅ Enter key to send message
- ✅ Close button (X) or click outside
- ✅ Scrollable message area
- ✅ Smooth fade-in animations
- ✅ Responsive design (mobile-friendly)

### Backend Features
- ✅ Multi-file document upload (up to 50 files)
- ✅ Automatic corpus creation
- ✅ File registry management
- ✅ Document context in prompts
- ✅ Gemini 1.5 Flash model integration
- ✅ Response cleanup and validation
- ✅ Off-topic detection and redirection
- ✅ 80-word limit enforcement
- ✅ Audit logging to Supabase

### What Works Today
- Users can type messages in the UI
- Simulated 1-second delay before response
- Canned response for any question
- Messages stored in React state
- Chatbot available on all pages

### What's Missing
- **Backend Integration:** Frontend doesn't call `/api/gemini/query` yet
- **Real Responses:** Still using mock data
- **Chat History:** Messages disappear on refresh
- **User Context:** No user ID sent with queries
- **Error States:** No error handling for failed API calls

---

## 7. Integration Points

### How Components Interact

1. **Admin Uploads Documents**
   - Navigate to `/admin/rag-upload` (not shown in current code, but referenced in CLAUDE.md)
   - Select files (PDF, DOCX, TXT)
   - POST to `/api/gemini/upload`
   - Files stored in `ragBot/uploads/`
   - Registry updated in `ragBot/config/files-registry.json`

2. **User Asks Question**
   - Open chat (click floating button)
   - Type question
   - Press Enter
   - (Currently: Mock response)
   - (Future: POST to `/api/gemini/query`)

3. **Response Processing**
   - Gemini receives prompt with document context
   - Generates response
   - Response cleaned (markdown removed, AI phrases removed)
   - Word limit enforced (80 max)
   - Logged to `ai_logs` table with user_id

4. **Chat History Access**
   - Query `ai_logs` table filtering by `user_id`
   - Reconstruct message thread
   - Load on component mount

---

## 8. Model Details

### Gemini 1.5 Flash

**Model ID:** `gemini-1.5-flash`

**Why This Model:**
- ✅ Supports large context windows
- ✅ Fast inference (suitable for chat)
- ✅ Cost-effective
- ✅ Compatible with `generateContent` API
- ✅ Supports text input and file context

**Capabilities:**
- Text generation
- Multi-turn conversations (via prompt engineering)
- Document analysis (from file registry context)
- Instruction following (strict prompts work well)

**Limitations:**
- No built-in conversation memory (stateless)
- No native vision/image support in this deployment
- Requires explicit prompt for context

---

## 9. Environment Variables Required

```bash
# In .env file:
GEMINI_API_KEY=your_google_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 10. File Locations Summary

| File/Directory | Purpose |
|---|---|
| `src/components/ui/Chatbot.tsx` | Frontend chat widget |
| `ragBot/server/index.cjs` | Express API server |
| `ragBot/uploads/` | Uploaded documents stored here |
| `ragBot/config/corpus-config.json` | Corpus ID metadata |
| `ragBot/config/files-registry.json` | File upload registry |
| `supabase_schema.sql` (lines 121-137) | `ai_logs` table definition |

---

## 11. Next Steps to Fully Integrate

### Priority 1: Connect Frontend to Backend
```typescript
// In Chatbot.tsx handleSendMessage():
const response = await fetch('/api/gemini/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: inputValue })
});
const data = await response.json();
// Add response.response to messages
```

### Priority 2: Add User Context
```typescript
const { user } = useAuthContext();
// Include when calling backend API
```

### Priority 3: Retrieve Chat History
```typescript
// On component mount:
useEffect(() => {
  const loadHistory = async () => {
    const { data } = await supabase
      .from('ai_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('executed_at', { ascending: true });
    // Map data to Message objects
  };
  loadHistory();
}, []);
```

### Priority 4: Error Handling
- Catch network errors
- Handle API failures
- Show error messages to user
- Retry logic or fallback responses

### Priority 5: Enhanced UX
- Show "AI is typing..." indicator
- Disable send button while waiting
- Display loading skeleton
- Handle long responses gracefully

---

## Summary

The RealAssist chat system is a **3-layer architecture** combining:

1. **Beautiful Frontend UI** - Users see elegant glass-morphism chat
2. **Powerful Backend** - RAG-enhanced questions using uploaded documents
3. **Persistent Database** - All interactions logged for audit trails

Current status: **Frontend UI ready, backend tested, integration pending**

To activate real responses, connect the frontend input to the backend API endpoint.
