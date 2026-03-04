import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

const mockUser = {
  id: '1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'client' as const,
};

describe('AuthContext and useAuth hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('login persists user and token, logout clears them', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login(mockUser, 'token-123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe('token-123');
    expect(localStorage.getItem('role')).toBe('client');

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('useAuthContext provides auth state via provider', () => {
    const Consumer = () => {
      const auth = useAuthContext();
      return <div>{auth.isAuthenticated ? 'yes' : 'no'}</div>;
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    expect(screen.getByText('no')).toBeInTheDocument();
  });
});

describe('ThemeContext', () => {
  it('provides dark mode flag and toggle function', () => {
    const Consumer = () => {
      const { isDarkMode, toggleDarkMode } = useTheme();
      return (
        <button onClick={toggleDarkMode}>
          {isDarkMode ? 'dark' : 'light'}
        </button>
      );
    };

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );

    expect(screen.getByText('dark')).toBeInTheDocument();
  });
});

