import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  role: 'client' | 'admin' | 'employee' | null;
}

export const useAuth = () => {
  // Immediate hydration from localStorage to prevent flash of loading
  const getInitialState = (): AuthState => {
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('role');

    if (savedUser && savedRole) {
      try {
        return {
          isAuthenticated: true,
          user: JSON.parse(savedUser),
          loading: false, // We have data, so don't show initial loader
          role: savedRole as any,
        };
      } catch (e) {
        console.error('[DEBUG] useAuth: Failed to parse saved user', e);
      }
    }

    return {
      isAuthenticated: false,
      user: null,
      loading: true,
      role: null,
    };
  };

  const [authState, setAuthState] = useState<AuthState>(getInitialState());

  const isFetchingProfile = useRef(false);
  const currentUserId = useRef<string | null>(null);

  const fetchProfile = async (userId: string, email: string) => {
    if (isFetchingProfile.current && currentUserId.current === userId) {
      console.log('[DEBUG] useAuth: Already fetching profile for', userId);
      return;
    }

    console.log('[DEBUG] useAuth: Fetching profile for', email);
    isFetchingProfile.current = true;
    currentUserId.current = userId;

    const queryTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('PROFILE_QUERY_TIMEOUT')), 12000)
    );

    try {
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data: profile, error: profileError } = (await Promise.race([queryPromise, queryTimeout])) as any;

      if (profileError) {
        console.error('[DEBUG] useAuth: Profile fetch error:', profileError);
        throw profileError;
      }

      if (profile) {
        const userData = {
          id: userId,
          email: email,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          role: profile.role || 'client',
          createdAt: profile.created_at ? new Date(profile.created_at) : undefined,
        };

        console.log('[DEBUG] useAuth: Profile found, updating state for', email);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userData.role);

        setAuthState({
          isAuthenticated: true,
          user: userData,
          loading: false,
          role: userData.role,
        });
      } else {
        console.warn('[DEBUG] useAuth: No profile found for', email);
        setAuthState(prev => ({ ...prev, loading: false, isAuthenticated: !!userId }));
      }
    } catch (err: any) {
      console.error('[DEBUG] useAuth: Error in fetchProfile:', err.message || err);
      // Even if it fails/times out, we must stop loading so the UI can show login or error
      setAuthState(prev => ({ ...prev, loading: false }));
    } finally {
      isFetchingProfile.current = false;
    }
  };

  useEffect(() => {
    console.log('[DEBUG] useAuth: Hook initialized');

    // Initial check
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          await fetchProfile(session.user.id, session.user.email!);
        } else {
          console.log('[DEBUG] useAuth: No initial session found');
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error('[DEBUG] useAuth: Initialization error:', err);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initAuth();

    // Safety timeout: force loading to false after 10 seconds if still stuck
    const timeoutId = setTimeout(() => {
      setAuthState(prev => {
        if (prev.loading) {
          console.warn('[DEBUG] useAuth: Safety timeout reached, clearing loading state.');
          return { ...prev, loading: false };
        }
        return prev;
      });
    }, 10000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[DEBUG] useAuth: onAuthStateChange event:', event);

      if (event === 'SIGNED_OUT') {
        console.log('[DEBUG] useAuth: User signed out, clearing state');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          role: null,
        });
        currentUserId.current = null;
        return;
      }

      if (session) {
        // Only fetch if session user ID changed or if not currently authenticated
        // This avoids redundant fetches during login/refresh
        await fetchProfile(session.user.id, session.user.email!);
      } else {
        setAuthState(prev => ({ ...prev, loading: false, isAuthenticated: false, user: null }));
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role);
    setAuthState({
      isAuthenticated: true,
      user,
      loading: false,
      role: user.role,
    });
  };

  const logout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    await supabase.auth.signOut();
  };

  const hasRole = (role: 'client' | 'admin' | 'employee') => {
    return authState.role === role;
  };

  const hasAnyRole = (roles: ('client' | 'admin' | 'employee')[]) => {
    return authState.role ? roles.includes(authState.role as any) : false;
  };

  return {
    ...authState,
    login,
    logout,
    hasRole,
    hasAnyRole,
  };
};
