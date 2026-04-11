# RealAssist — Project Guidelines

AI-powered SaaS platform for real estate investment management. React 18 + TypeScript + Vite frontend, Node.js Express backend (RAG chatbot), Supabase (PostgreSQL) database.

## Build and Test

```bash
npm run dev              # Frontend on port 3000
npm run dev:backend      # Backend on port 5000
npm run dev:all          # Both concurrently
npm run build            # tsc && vite build → dist/
npm run test             # Vitest (all tests, single run)
npm run test -- path     # Single test file
npm run test:coverage    # Coverage report (V8 provider)
npm run lint             # ESLint
```

## Architecture

### Three-Role System
- **admin** — Dashboard, lead/customer/enrollment management, analytics, RAG upload, team management
- **client** — Dashboard, payments, ledger, project updates, enrollment
- **employee** — Placeholder (route exists, content TBD)

### Layout System
- `PublicLayout` — Landing, projects, about (includes floating Chatbot)
- `AuthLayout` — Login/register/forgot-password (dark centered card)
- `DashboardLayout` — Sidebar + outlet, role-specific menus (includes Chatbot)

### State Management
- **Server state**: TanStack Query v5 — query hooks in `src/hooks/queries/` (`useAdminQueries`, `useClientQueries`, `useCommonQueries`)
- **Auth/theme state**: React Context (`src/contexts/`)
- **Query config**: 5min stale, 15min GC, retry 1 (`src/lib/queryClient.ts`)

### Key Paths
| Area | Path |
|------|------|
| Pages | `src/pages/{Admin,Client,Landing,Auth,Projects,Dashboard,Settings}/` |
| Components | `src/components/{ui,layout,auth,Chat,Projects,Client,LandingPage}/` |
| Hooks | `src/hooks/` and `src/hooks/queries/` |
| Services/API | `src/services/api.ts` (~900 lines, 6 API objects) |
| Types | `src/types/index.ts` |
| Utils | `src/lib/utils.ts`, `src/utils/auth.ts` |
| Routes | `src/routes/index.tsx` |
| Tests | `testing/unit/` (31+ test files) |
| Backend | `ragBot/server/` |
| SQL migrations | `migrations/`, `sql/` |
| Docs | `src/docs/` (implementation guides, architecture, features) |

### API Layer (`src/services/api.ts`)
Six API objects: `authAPI`, `clientAPI`, `adminAPI`, `commonAPI`, `leadAPI`, `enrollmentAPI`. Each wraps Supabase RLS queries with transforms and error handling.

### Proxy
Frontend Vite dev server proxies `/api` → `http://localhost:5000` with 60s timeout (configured in `vite.config.ts`).

## Code Style

- **TypeScript strict mode** — all types required, no `any` without justification
- **Path alias**: `@/` → `src/` (e.g., `import { Button } from '@/components/ui/button'`)
- **Tailwind CSS** — utility-first, dark theme with gold (#d4af37) accents
- **shadcn/ui** components — Radix primitives in `src/components/ui/`
- **Dynamic classes**: use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge)
- **Currency/dates**: use `formatCurrency()`, `formatDate()`, `formatDateTime()` from `src/lib/utils.ts`

## Conventions

### Adding a New Page
1. Create page in `src/pages/{Section}/PageName.tsx`
2. Add route to `src/routes/index.tsx` — wrap with `ProtectedRoute` (role-based) or `PublicRoute`
3. Add sidebar nav item in `src/components/layout/Sidebar.tsx`
4. Write tests in `testing/unit/`

### Adding a New Query Hook
1. Add to the appropriate file in `src/hooks/queries/`
2. Use Nashville-pattern key factory: `adminKeys.leads()`, `clientKeys.payments()`
3. Gate with `enabled: !!user && user.role === 'admin'`
4. Mutations must invalidate related query keys

### Component Patterns
- Functional components with hooks
- Props interfaces defined near component
- Modals: accept `isOpen` + `onClose`, use shadcn Dialog
- Business logic extracted to custom hooks (`useFileUpload`, `useChat`)

### Auth & Route Protection
- `useAuth()` — global auth state from `AuthContext`
- `ProtectedRoute` component — checks `isAuthenticated` + `requiredRole`
- `PublicRoute` — redirects authenticated users to their dashboard
- Role checks: `user?.role === 'admin'`

### Testing
- Use `renderWithProviders()` from `testing/test-utils.tsx` (wraps with AuthProvider + QueryClient)
- Mock React Query hooks: `vi.mock('@/hooks/queries/useAdminQueries', ...)`
- Mock Framer Motion: replace `motion.div` with plain `<div>`
- Mock shadcn Dialog for portal-free testing
- Don't test CSS hover states or locale-dependent formatting
- Polyfills in `testing/setupTests.ts`: `matchMedia`, `IntersectionObserver`

## Known Gaps / In-Progress

- **Employee dashboard**: Route exists, content is placeholder
- **Export services**: `exportToPDF()` / `exportToExcel()` return mock Blobs (see `src/services/api.ts`)
- **Test coverage gaps**: AuthLoader (0%), Chatbot (7%), project modals (partial)
- Comprehensive docs exist at [src/docs/](src/docs/) — reference before duplicating
