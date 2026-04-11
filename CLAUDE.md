# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**RealAssist** - An AI-powered SaaS platform for real estate investment management. Provides separate dashboards for clients (investors) and administrators with features including project management, payment tracking, lead management, and AI-powered chatbot support using Supabase and Google Gemini API.

**Tech Stack:**
- Frontend: React 18, TypeScript, Tailwind CSS, Vite
- Backend: Node.js Express (in `ragBot/server/`)
- Database: Supabase (PostgreSQL)
- UI Components: shadcn/ui (Radix UI primitives)
- Routing: React Router v6
- State Management: React Query (TanStack Query) v5
- Animations: Framer Motion
- Testing: Vitest with jsdom, React Testing Library
- AI: Google Generative AI (Gemini)

## Quick Start Commands

### Development
```bash
npm run dev              # Frontend dev server (Vite on port 3000)
npm run dev:backend     # Backend server (Express on port 5000)
npm run dev:all         # Run frontend and backend concurrently
```

### Testing
```bash
npm run test                     # Run all tests once
npm run test -- file-path.test  # Run single test file
npm run test:coverage           # Run tests with coverage report
```

### Build & Deployment
```bash
npm run build           # TypeScript compilation + Vite build (outputs to dist/)
npm run preview         # Preview production build locally
npm run start           # Alias for preview
```

### Code Quality
```bash
npm run lint           # Run ESLint
```

## Project Structure

```
src/
├── pages/                  # Page components organized by role/section
│   ├── Landing/           # Landing page
│   ├── Auth/              # Auth pages (login, register, forgot-password)
│   ├── Client/            # Client dashboard (dashboard, payments, ledger, updates)
│   ├── Admin/             # Admin pages (dashboard, leads, analytics, RAG)
│   ├── Projects/          # Public project browsing
│   ├── Dashboard/         # Shared dashboard features
│   ├── Settings/          # Settings page
│   └── NotFoundPage       # 404 page
├── components/            # Reusable components
│   ├── ui/                # Base UI components (button, card, input, dialog)
│   ├── layout/            # Layout components (Navbar, Sidebar)
│   ├── auth/              # Auth guards and loaders
│   ├── Chat/              # Chat UI components
│   ├── Projects/          # Project-related components (modals, displays)
│   ├── Client/            # Client-specific components
│   └── LandingPage/       # Landing page sections
├── layouts/               # Layout wrappers (PublicLayout, AuthLayout, DashboardLayout)
├── routes/                # Router configuration (index.tsx)
├── contexts/              # React Context providers (AuthContext, ThemeContext)
├── hooks/                 # Custom React hooks
│   ├── queries/          # React Query hooks (useAdminQueries, useClientQueries, useCommonQueries)
│   ├── useAuth.ts        # Auth state hook
│   ├── useChat.ts        # Chat functionality hook
│   └── useFileUpload.ts  # File upload hook
├── services/              # API services (main file: api.ts ~46KB)
├── types/                 # TypeScript types and interfaces
├── lib/                   # Utility functions (supabase, queryClient, image utils)
├── data/                  # Mock data and constants
└── utils/                 # Helper utilities

testing/
├── setupTests.ts         # Vitest setup configuration
├── test-utils.tsx        # Custom testing utilities (renderWithProviders)
└── unit/                 # Unit tests (colocated by feature)
```

## Architecture Patterns

### Authentication & Authorization
- **Supabase Auth** with JWT tokens
- `useAuth()` hook provides auth state and user data
- Three roles: `admin`, `client`, `employee`
- Protected routes use `ProtectedRoute` component (checks auth + role)
- Public routes redirect authenticated users with `PublicRoute`
- Auth context in `src/contexts/AuthContext.tsx` manages global auth state

### State Management
- **React Query** (TanStack Query v5) for server state
- Query hooks organized in `src/hooks/queries/`:
  - `useAdminQueries.ts` - Admin-specific data fetching
  - `useClientQueries.ts` - Client-specific data fetching
  - `useCommonQueries.ts` - Shared queries
- Each query module exports:
  - Query keys factory (Nashville pattern)
  - Custom hooks using `useQuery()`, `useMutation()`, `useQueries()`
- Query client setup in `src/lib/queryClient.ts`
- **React Context** for auth and theme (non-server state)

### Layout System
- **PublicLayout** - Landing, about, projects (no sidebar)
- **AuthLayout** - Login/register pages
- **DashboardLayout** - Authenticated pages with sidebar navigation
- Layouts handle navigation, role-based menu rendering, and responsive behavior

### API Integration
- Main service file: `src/services/api.ts` (46KB)
- Contains mock data, API endpoints, and data transformations
- Supabase integration for database operations
- Pattern: Fetch data → transform → pass to React Query

### Component Patterns
- Functional components with hooks
- Props interfaces defined near component
- Modal components accept `isOpen` and `onClose` props
- Dialog-based modals use shadcn/ui Dialog component
- Custom hooks for business logic (useFileUpload, useChat, etc.)

## Testing

### Setup & Configuration
- **Framework:** Vitest (configured in `vite.config.ts`)
- **Test Environment:** jsdom
- **Setup File:** `testing/setupTests.ts`
- **Testing Utilities:** `testing/test-utils.tsx` exports `renderWithProviders` wrapper
- **Coverage:** V8 provider, outputs to `coverage/` directory

### Test Structure
- Tests are colocated with source code in `testing/unit/` directory
- Organized by feature/component type
- Example test files:
  - `auth.test.tsx` - Auth context and hooks
  - `ChatWindow.test.tsx` - Chat component
  - `dialog.test.tsx` - Dialog UI component
  - `imageUpload.test.tsx` - File upload component

### Key Testing Patterns

#### Component Testing with Providers
```typescript
import { renderWithProviders } from '../test-utils';

// renderWithProviders wraps component with AuthProvider + QueryClientProvider
const { getByText } = renderWithProviders(<MyComponent />);
```

#### Mocking React Query Hooks
```typescript
vi.mock('@/hooks/queries/useAdminQueries', () => ({
  useAdminLeads: vi.fn(() => ({
    data: mockLeads,
    isLoading: false,
    error: null,
  })),
}));
```

#### Mocking UI Components (Dialog, Modal)
```typescript
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: any) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));
```

#### Mocking Framer Motion
```typescript
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));
```

### Testing Best Practices (Session 3 Findings)
- Test component rendering and structure, not CSS hover states
- Use function matchers for text that may be split across elements
- Mock browser APIs like `scrollIntoView` with `vi.fn()`
- For icon-only buttons: use `getAllByRole('button')` to avoid multiple element errors
- Avoid testing locale-dependent date formatting - test data presence instead
- Remove assertions on CSS classes that aren't guaranteed in test environment
- Use `renderWithProviders()` for components requiring AuthProvider or React Query

### Current Test Coverage (541/541 tests passing)
**Critical Components Need Tests:**
- AuthLoader.tsx (0%) - Load states
- Chatbot.tsx (7%) - AI response handling
- Project modals - Form validation, submission

**Components with Partial Coverage:**
- CustomDropdown (59%): Menu interactions, option selection
- ImageUpload (60%): File validation, upload states
- Projects folder (56%): Modal forms, data handling
- UI components (dialog, textarea have 50-65%): State variations, interactions

## Common Patterns & Guidelines

### Adding a New Page
1. Create component in `src/pages/[Section]/[PageName].tsx`
2. Add route to `src/routes/index.tsx` with appropriate layout
3. Wrap with `ProtectedRoute` if role-based, `PublicRoute` if auth-aware
4. Create tests in `testing/unit/[feature].test.tsx`

### Adding Role-Based Features
1. Use `useAuth()` hook: `const { user } = useAuth(); if (user?.role === 'admin') { ... }`
2. Wrap routes with `ProtectedRoute`: `<ProtectedRoute requiredRole="admin"><Component /></ProtectedRoute>`
3. Query hooks handle role checks automatically (see `useAdminQueries.ts`)

### Using React Query
1. Create custom hook in appropriate `queries/` file
2. Use query key factory for consistency: `adminKeys.leads()`
3. Wrap hook with `useQuery()` or `useMutation()`
4. Add `enabled` condition for conditional fetching
5. All query hooks use auth context for role checks

### Styling
- Tailwind CSS utility classes
- Design system: Purple-to-blue gradient primary, green/yellow/red for status
- shadcn/ui components for consistency
- Use `clsx` + `tailwind-merge` for dynamic classes

## Backend Integration

### Backend Server
- Express.js running on port 5000
- Located in `ragBot/server/`
- Frontend Vite dev server proxies `/api` requests to backend
- Proxy configured in `vite.config.ts` with 60s timeout for large uploads

### Backend Features
- RAG (Retrieval Augmented Generation) chatbot functionality
- File upload handling via Multer
- More details in `ragBot/README.md`

## Environment Setup

- `.env` file contains: Supabase URL, Anon Key, Gemini API key, and backend URL
- `.gitignore` excludes: node_modules, dist, coverage, .env
- Node.js 18+ required
- Both frontend and backend need to run during development

## Important Notes

- **Port Configuration:** Frontend (3000), Backend (5000)
- **Use `npm run dev:all`** for local development with both servers
- **Backend Requirement:** Some features require the backend server running
- **TypeScript Strict Mode** enabled - ensure proper typing
- **Testing:** Use `renderWithProviders()` for components needing auth or React Query
- **API Proxying:** Vite proxy provides helpful error messages if backend is down
- **Session 3 Test Status:** 541 tests passing across 541 total tests in 32 test files
