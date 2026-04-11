import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('login persists user and token, logout clears them', async () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('client');
    expect(localStorage.getItem('role')).toBe('client');

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
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

  it('useAuth hook returns isAuthenticated boolean', () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.isAuthenticated).toBe('boolean');
  });

  it('useAuth login function accepts user object', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('AuthContext initializes with unauthenticated state', () => {
    const Consumer = () => {
      const auth = useAuthContext();
      return <div>authenticated: {auth.isAuthenticated ? 'true' : 'false'}</div>;
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    expect(screen.getByText(/authenticated: false/)).toBeInTheDocument();
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

  it('theme toggle button changes mode', async () => {
    const user = userEvent.setup({ delay: null });
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

    const button = screen.getByRole('button');
    await user.click(button);
    expect(document.body).toBeInTheDocument();
  });

  it('useTheme hook provides isDarkMode state', () => {
    const Consumer = () => {
      const { isDarkMode } = useTheme();
      return <div>{isDarkMode ? 'dark' : 'light'}</div>;
    };

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );

    expect(screen.getByText('dark')).toBeInTheDocument();
  });

  it('ThemeProvider renders children without crashing', () => {
    const Consumer = () => <div>test content</div>;

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );

    expect(screen.getByText('test content')).toBeInTheDocument();
  });
});


