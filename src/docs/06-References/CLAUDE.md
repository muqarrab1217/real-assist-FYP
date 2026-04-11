# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RealAssist is a real estate automation SaaS platform with three main components:
1. **React Frontend**: Client-facing and admin dashboards (Vite + TypeScript + Tailwind)
2. **Express Backend**: RAG chatbot API using Google Gemini File Search (`ragBot/server/`)
3. **Streamlit ML App**: Lead classification tool using Groq (`streamlit_app.py`)

## Development Commands

### Frontend Development
```bash
npm run dev                 # Start frontend dev server (port 3000)
npm run build              # Build for production (outputs to dist/)
npm run preview            # Preview production build
npm run lint               # Run ESLint
```

### Backend & Full-Stack Development
```bash
npm run dev:backend        # Start RAG API server (port 10000)
npm run dev:all           # Run frontend + backend concurrently
```

### Testing
```bash
npm test                   # Run Vitest tests once
npm run test:coverage     # Run tests with coverage report
```

### Lead Classifier (Streamlit)
```bash
# From PowerShell:
cd "D:\FYP"; $env:STREAMLIT_BROWSER_GATHER_USAGE_STATS="false"; $env:STREAMLIT_SERVER_HEADLESS="true"; python -m streamlit run streamlit_app.py --server.port 8501
```

## Architecture

### Frontend Structure
- **Routing**: React Router v6 with role-based protected routes (`src/routes/index.tsx`)
  - Public routes: Landing page, project listings
  - Client routes: Dashboard, payments, ledger, project updates
  - Admin routes: Dashboard, leads, customers, payments, analytics, RAG upload, team management
  - Employee routes: Basic dashboard (limited functionality)

- **Layouts**: Three main layouts in `src/layouts/`
  - `PublicLayout`: For unauthenticated pages
  - `AuthLayout`: For login/register pages
  - `DashboardLayout`: For authenticated pages (adapts based on role)

- **Authentication**: Implements role-based access control (RBAC)
  - Uses Supabase Auth with custom storage implementation (`src/lib/supabase.ts`)
  - Roles: `admin`, `client`, `employee`
  - Protected routes check user role before rendering (`src/components/auth/ProtectedRoute.tsx`)

- **API Layer**: Single API service (`src/services/api.ts`)
  - Supabase for database operations
  - Mock data fallbacks during development (`src/data/mockData.ts`, `src/data/extractedMockData.ts`)
  - Backend API proxy configured in `vite.config.ts` (`/api` → `http://localhost:5000`)

### Backend (ragBot)
- **Server**: Express app in `ragBot/server/index.js` (port 10000 in production, 5000 in local dev behind proxy)
- **Purpose**: Gemini RAG chatbot with document upload and query capabilities
- **Key Features**:
  - File upload endpoint: `POST /api/gemini/upload` (PDF, DOCX, TXT, max 500MB)
  - Query endpoint: `POST /api/gemini/query`
  - Corpus management: Auto-creates Gemini corpus on first upload
  - Config stored in `ragBot/config/corpus-config.json` (auto-generated, gitignored)
  - Chat history stored in Supabase (`chat_history` table)

### ML Component (models/ABS AudioBot)
- **Purpose**: ML-based lead classification for sales team
- **Models**: BERT, BiLSTM, Logistic Regression + TF-IDF
- **Deployment**: Streamlit app (`streamlit_app.py` in root) using Groq API for inference
- **Status**: Separate Git repository within models folder

### Database (Supabase)
- **Schema**: Defined in `supabase_schema.sql`
- **Key Tables**:
  - `profiles`: User profiles with role-based access
  - `properties`: Real estate listings
  - `leads`: Sales leads with AI classification (hot/warm/cold/dead)
  - `clients`: Client information
  - `payments`: Payment transactions
  - `chat_history`: RAG chatbot conversation logs
- **RLS Policies**: Row-level security enforced per user role

### Environment Variables
Required in `.env` (see `.env` for current values):
- `GEMINI_API_KEY`: Google Gemini API key for RAG chatbot
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_API_BASE_URL`: Backend API URL (http://localhost:10000 for dev)
- `GROQ_API_KEY`: Groq API key for lead classifier

## Key Design Patterns

### Component Organization
- **UI Components**: `src/components/ui/` contains shadcn/ui base components (Button, Card, Dialog, etc.)
- **Feature Components**: Role-specific components under `src/components/` (chatbot, forms, tables)
- **Pages**: Organized by role (`src/pages/Admin/`, `src/pages/Client/`)

### State Management
- Auth state: Managed via Supabase Auth with session persistence
- Global context: `src/contexts/` for shared state (auth context)
- Local state: React hooks for component-specific state

### Styling
- Tailwind CSS with custom configuration (`tailwind.config.js`)
- Design system: Purple-to-blue gradients for primary branding
- Framer Motion for animations
- Path alias `@/*` maps to `src/*` (configured in `vite.config.ts` and `tsconfig.json`)

## Important Notes

### API Proxy Configuration
- Frontend dev server (port 3000) proxies `/api` requests to backend (port 5000/10000)
- If backend is not running, proxy returns JSON error instead of failing silently
- Production uses environment variable `VITE_API_BASE_URL` to determine backend location

### Authentication Flow
- Custom storage implementation bypasses Navigator LockManager issues
- Session persists in localStorage with key `realassist-auth-token`
- Auth loader checks session on app mount (`src/components/auth/AuthLoader.tsx`)

### RAG Chatbot Integration
- Files uploaded via admin panel (`/admin/rag-upload`)
- Chatbot widget appears on all pages as floating button (`src/components/ui/Chatbot.tsx`)
- Uses Gemini 1.5 Pro with File Search tool for context-aware responses
- Chat history per user stored in Supabase for retrieval

### Testing
- Vitest configured for React components (`vite.config.ts`)
- Setup file: `testing/setupTests.ts`
- Test files in `testing/unit/`
- Coverage reports in `coverage/`

### Deployment
- **Frontend**: Vercel (config in `vercel.json`)
  - Build: `npm run build` → `dist/`
  - SPA rewrites configured for client-side routing
- **Backend**: Render (config in `render.yaml`)
  - Port 5000, Node environment
  - Requires `GEMINI_API_KEY` set in dashboard
- **Database**: Supabase hosted instance

### Models Directory
- `models/ABS AudioBot` is a separate Git repository (do not modify without coordination)
- Contains Jupyter notebooks for model training (BERT, BiLSTM, Logistic Regression)
- Best model exported as `Best_model.pkl`

## Common Development Tasks

### Adding a New Page
1. Create page component in `src/pages/[Role]/`
2. Add route in `src/routes/index.tsx` under appropriate role section
3. Wrap with `ProtectedRoute` if authentication required

### Modifying Database Schema
1. Update `supabase_schema.sql`
2. Run migration in Supabase dashboard or via CLI
3. Update TypeScript types in `src/types/` to match schema

### Adding RAG Documents
1. Navigate to `/admin/rag-upload` (admin role required)
2. Upload PDF/DOCX/TXT files
3. Files automatically indexed in Gemini corpus
4. Test chatbot with queries related to uploaded content

### Running Full Stack Locally
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev

# Or use concurrently:
npm run dev:all
```

### Modifying Lead Classification
- ML model code in `models/ABS AudioBot/`
- Streamlit app for UI in root `streamlit_app.py`
- Uses Groq for inference (not local model)
