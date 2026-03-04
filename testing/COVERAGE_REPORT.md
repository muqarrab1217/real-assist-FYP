# Test Coverage Report

## Coverage Summary

**Total Test Coverage: 22.82%**

- **Statements**: 22.82%
- **Branches**: 65.15%
- **Functions**: 43.1%
- **Lines**: 22.82%

## Test Results

✅ **All 36 tests passing** across 8 test files:
- `authRoutes.test.tsx` - 5 tests
- `authPages.test.tsx` - 8 tests
- `dashboardPages.test.tsx` - 10 tests
- `layout.test.tsx` - 3 tests
- `clientPayments.test.tsx` - 3 tests
- `ui.test.tsx` - 3 tests
- `forgotPassword.test.tsx` - 2 tests
- `notFound.test.tsx` - 2 tests

## Coverage by Component

### High Coverage (>90%)
- **Auth Routes**: 84.84% (ProtectedRoute: 100%, PublicRoute: 91.17%, RoleBasedRoute: 88.09%)
- **Layout Components**: 91.02% (Navbar: 73.21%, Sidebar: 98.5%)
- **UI Components**: 59.42% (Button: 100%, Input: 100%, Card: 91.89%, Badge: 95.83%)
- **Auth Pages**: 99.48% (LoginPage: 99.26%, RegisterPage: 99.41%, ForgotPasswordPage: 100%)
- **Admin Dashboard**: 97.77%
- **Payments Management**: 95.38%
- **Client Dashboard**: 98.24%
- **Client Payments**: 81.11%

### Areas Needing More Coverage
- Landing Page components (0%)
- Project pages (0%)
- Admin pages (Analytics, Customer Management, Lead Management, etc.)
- Context providers (AuthContext, ThemeContext)
- Hooks (useAuth)
- Services (API layer)

## How to Access the Coverage Report

### Option 1: View HTML Report (Recommended)
1. Open `coverage/index.html` in your browser
   - Double-click the file in Windows Explorer
   - Or run: `start coverage/index.html` in PowerShell
   - Or navigate to: `D:\FYP\coverage\index.html`

2. The HTML report provides:
   - Interactive file tree navigation
   - Line-by-line coverage highlighting
   - Coverage statistics per file
   - Uncovered line numbers

### Option 2: View in Testing Folder
A copy of the main coverage report is available at:
- `testing/coverage-report.html`

### Option 3: Generate New Report
To regenerate the coverage report:

```bash
npm run test:coverage
```

Or with specific reporters:

```bash
npm run test:coverage -- --coverage.reporter=html --coverage.reporter=text
```

## Coverage Configuration

Coverage is configured in `vite.config.ts`:
- Provider: `@vitest/coverage-v8`
- Reporters: `['text', 'html']`
- Output directory: `coverage/`

## Next Steps

To improve coverage:
1. Add tests for Landing Page components
2. Add tests for Project pages
3. Add tests for Admin management pages
4. Add tests for Context providers
5. Add tests for API service layer
6. Add tests for custom hooks

