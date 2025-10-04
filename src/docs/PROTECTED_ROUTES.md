# Protected Routes System

This document describes the comprehensive protected routes system implemented in the RealAssist application.

## Overview

The protected routes system provides:
- Authentication-based route protection
- Role-based access control
- Automatic redirects for unauthorized access
- Public route protection (redirects authenticated users)
- Centralized authentication state management

## Components

### 1. ProtectedRoute
Protects routes that require authentication and optionally specific roles.

```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

**Props:**
- `children`: React components to protect
- `requiredRole?`: Optional role requirement ('client' | 'admin')
- `fallbackPath?`: Custom redirect path (default: '/auth/login')

### 2. PublicRoute
Protects public routes by redirecting authenticated users to their dashboard.

```tsx
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

**Props:**
- `children`: React components to protect
- `redirectPath?`: Custom redirect path for authenticated users

### 3. RoleBasedRoute
Protects routes based on multiple allowed roles.

```tsx
<RoleBasedRoute allowedRoles={['admin', 'client']}>
  <SharedComponent />
</RoleBasedRoute>
```

**Props:**
- `children`: React components to protect
- `allowedRoles`: Array of allowed roles
- `fallbackPath?`: Custom redirect path

## Hooks

### useAuth
Provides authentication state and methods throughout the application.

```tsx
const { isAuthenticated, user, login, logout, hasRole } = useAuth();
```

**Returns:**
- `isAuthenticated`: Boolean authentication status
- `user`: Current user object
- `token`: Current authentication token
- `role`: Current user role
- `login(user, token)`: Login function
- `logout()`: Logout function
- `clearAuth()`: Clear authentication data
- `hasRole(role)`: Check if user has specific role
- `hasAnyRole(roles)`: Check if user has any of the specified roles

## Context

### AuthContext
Provides authentication context throughout the application tree.

```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

## Utilities

### auth.ts
Utility functions for authentication operations.

```tsx
import { isAuthenticated, hasRole, clearAuthData } from '@/utils/auth';
```

**Functions:**
- `getStoredToken()`: Get stored authentication token
- `getStoredUser()`: Get stored user data
- `getStoredRole()`: Get stored user role
- `isAuthenticated()`: Check authentication status
- `hasRole(role)`: Check user role
- `hasAnyRole(roles)`: Check multiple roles
- `clearAuthData()`: Clear all authentication data
- `setAuthData(user, token)`: Set authentication data

## Route Structure

### Public Routes
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password reset page

### Protected Client Routes
- `/client/dashboard` - Client dashboard
- `/client/payments` - Client payments
- `/client/ledger` - Client ledger
- `/client/updates` - Project updates

### Protected Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/leads` - Lead management
- `/admin/customers` - Customer management
- `/admin/payments` - Payment management
- `/admin/analytics` - Analytics
- `/admin/settings` - Settings

## Authentication Flow

1. **Login Process:**
   - User submits login form
   - Authentication data is validated
   - User data and token are stored in localStorage
   - User is redirected to appropriate dashboard

2. **Route Protection:**
   - ProtectedRoute checks authentication status
   - If not authenticated, redirects to login
   - If authenticated but wrong role, redirects to appropriate dashboard
   - If authenticated and correct role, renders protected content

3. **Logout Process:**
   - User clicks logout button
   - Authentication data is cleared from localStorage
   - User is redirected to login page

## Security Features

- **Token-based Authentication**: JWT tokens stored in localStorage
- **Role-based Access Control**: Different access levels for client/admin
- **Automatic Redirects**: Unauthorized access automatically redirected
- **State Persistence**: Authentication state persists across browser sessions
- **Route Guards**: Multiple layers of route protection

## Usage Examples

### Protecting a Route
```tsx
// Require authentication only
<ProtectedRoute>
  <SomeComponent />
</ProtectedRoute>

// Require specific role
<ProtectedRoute requiredRole="admin">
  <AdminOnlyComponent />
</ProtectedRoute>
```

### Using Authentication State
```tsx
const { isAuthenticated, user, hasRole } = useAuth();

if (isAuthenticated && hasRole('admin')) {
  return <AdminPanel />;
}
```

### Login Implementation
```tsx
const { login } = useAuth();

const handleLogin = async (credentials) => {
  const response = await authAPI.login(credentials);
  login(response.user, response.token);
};
```

## Error Handling

- Invalid authentication data is automatically cleared
- Network errors during login are handled gracefully
- Unauthorized access attempts are logged and redirected
- Token expiration is handled by clearing auth data

## Best Practices

1. **Always use ProtectedRoute for sensitive content**
2. **Use PublicRoute for auth pages to prevent authenticated users from accessing them**
3. **Check authentication state before making API calls**
4. **Clear authentication data on logout**
5. **Handle authentication errors gracefully**
6. **Use role-based checks for conditional rendering**

## Testing

The authentication system can be tested by:
1. Attempting to access protected routes without authentication
2. Testing role-based access control
3. Verifying automatic redirects
4. Testing login/logout flows
5. Checking state persistence across page refreshes
