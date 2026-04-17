import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

type RoleType = 'client' | 'admin' | 'employee' | 'sales_rep';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;          // true until initial auth check completes
  profileLoading: boolean;   // true while profile DB fetch is in-flight
  profileReady: boolean;     // true once profile has been fetched from DB at least once
  role: RoleType | null;
}

/** Build a fallback user when profile fetch fails. Uses session metadata for role. */
const buildFallbackUser = (userId: string, email: string, metadataRole?: string): User => {
  const role = (metadataRole as RoleType) ||
    (email.toLowerCase() === 'realassistadmin@gmail.com' ? 'admin' : 'client');
  return {
    id: userId,
    email,
    firstName: '',
    lastName: '',
    role,
    profileCompleted: false,
    _isFallback: true,
  } as User & { _isFallback?: boolean };
};

/** A user object has full DB profile data when firstName is a defined string */
const isFullProfile = (user: any): boolean => {
  return user != null && typeof user.firstName === 'string' && !user._isFallback;
};

/** Map a Supabase profiles row to our User shape */
const mapProfileToUser = (userId: string, email: string, profile: any): User => ({
  id: userId,
  email,
  firstName: profile.first_name || '',
  lastName: profile.last_name || '',
  role: profile.role || 'client',
  phone: profile.phone || '',
  profileCompleted: profile.profile_completed ?? false,
  createdAt: profile.created_at ? new Date(profile.created_at) : undefined,
});

export const useAuth = () => {
  // ── Initial state from cache ──────────────────────────────────────
  const getInitialState = (): AuthState => {
    const cachedUser = localStorage.getItem('user');
    const cachedRole = localStorage.getItem('role');
    if (cachedUser && cachedRole) {
      try {
        const parsed = JSON.parse(cachedUser);
        return {
          isAuthenticated: true,
          user: parsed,
          loading: false,
          profileLoading: false,
          profileReady: isFullProfile(parsed),
          role: cachedRole as RoleType,
        };
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      }
    }
    // Supabase token exists but no cached user → show loading while we verify
    try {
      if (localStorage.getItem('realassist-auth-token')) {
        return { isAuthenticated: false, user: null, loading: true, profileLoading: false, profileReady: false, role: null };
      }
    } catch { /* access failed */ }
    return { isAuthenticated: false, user: null, loading: false, profileLoading: false, profileReady: false, role: null };
  };

  const [authState, setAuthState] = useState<AuthState>(getInitialState);

  // ── Refs for fetch coordination ───────────────────────────────────
  const fetchGeneration = useRef(0);
  const activeFetchId = useRef<string | null>(null);   // tracks which userId is in-flight
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Profile fetcher ───────────────────────────────────────────────
  const fetchProfile = useCallback(async (
    userId: string,
    email: string,
    metadataRole?: string,
    opts?: { isRetry?: boolean },
  ) => {
    // Same user already being fetched → skip (prevents SIGNED_IN + login() double-fire)
    if (activeFetchId.current === userId) {
      console.log('[DEBUG] useAuth: fetchProfile already in-flight for', userId);
      return;
    }
    // Different user in-flight → cancel old by bumping generation
    if (activeFetchId.current) {
      fetchGeneration.current++;
    }

    const myGen = ++fetchGeneration.current;
    activeFetchId.current = userId;
    console.log('[DEBUG] useAuth: fetchProfile start for', email, opts?.isRetry ? '(retry)' : '');

    setAuthState(prev => ({ ...prev, profileLoading: true }));

    const maxAttempts = 3;
    const retryDelay = 2500;

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (myGen !== fetchGeneration.current) {
          console.log('[DEBUG] useAuth: fetchProfile cancelled (superseded)');
          return;
        }

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 15000);

          let profile: any = null;
          let profileError: any = null;

          try {
            const result = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .abortSignal(controller.signal)
              .maybeSingle();
            profile = result.data;
            profileError = result.error;
          } catch (abortErr: any) {
            if (abortErr.name === 'AbortError' || controller.signal.aborted) {
              throw new Error('PROFILE_QUERY_TIMEOUT');
            }
            throw abortErr;
          } finally {
            clearTimeout(timer);
          }

          if (myGen !== fetchGeneration.current) return;

          if (profileError) {
            console.error(`[DEBUG] useAuth: Profile error attempt ${attempt}:`, profileError);
            throw profileError;
          }

          if (profile) {
            const userData = mapProfileToUser(userId, email, profile);
            console.log('[DEBUG] useAuth: Profile found on attempt', attempt);
            persistUser(userData);
            setAuthState({
              isAuthenticated: true,
              user: userData,
              loading: false,
              profileLoading: false,
              profileReady: true,
              role: userData.role as RoleType,
            });
            return; // ✅ success
          }

          // Row not found yet — new signup trigger may be delayed
          console.warn(`[DEBUG] useAuth: No profile row attempt ${attempt}/${maxAttempts}`);
          if (attempt < maxAttempts) {
            await new Promise(r => setTimeout(r, retryDelay));
          }
        } catch (err: any) {
          console.error(`[DEBUG] useAuth: Attempt ${attempt} error:`, err.message || err);
          if (attempt < maxAttempts) {
            await new Promise(r => setTimeout(r, retryDelay));
          }
        }
      }

      // All attempts exhausted → set fallback & schedule background retry
      if (myGen !== fetchGeneration.current) return;
      console.warn('[DEBUG] useAuth: All attempts exhausted — setting fallback user');
      const fallback = buildFallbackUser(userId, email, metadataRole);
      persistUser(fallback);
      setAuthState({
        isAuthenticated: true,
        user: fallback,
        loading: false,
        profileLoading: false,
        profileReady: false,      // NOT ready — still fallback
        role: fallback.role as RoleType,
      });

      // Schedule a single background retry after 30s
      if (!opts?.isRetry) {
        retryTimerRef.current = setTimeout(() => {
          console.log('[DEBUG] useAuth: Background retry for fallback user');
          fetchProfile(userId, email, metadataRole, { isRetry: true });
        }, 30000);
      }
    } finally {
      if (myGen === fetchGeneration.current) {
        activeFetchId.current = null;
        // Ensure profileLoading is cleared even on early return
        setAuthState(prev => prev.profileLoading ? { ...prev, profileLoading: false } : prev);
      }
    }
  }, []);

  // ── Storage helpers ───────────────────────────────────────────────
  const persistUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role);
  };

  const clearStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  // ── Init + subscription ───────────────────────────────────────────
  useEffect(() => {
    console.log('[DEBUG] useAuth: Hook initialized');
    let initDone = false;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          const cachedUser = localStorage.getItem('user');
          const cachedParsed = cachedUser ? JSON.parse(cachedUser) : null;

          if (cachedParsed && cachedParsed.id === session.user.id && isFullProfile(cachedParsed)) {
            console.log('[DEBUG] useAuth: Full profile cache hit — background refresh');
            setAuthState({
              isAuthenticated: true,
              user: cachedParsed as User,
              loading: false,
              profileLoading: false,
              profileReady: true,
              role: cachedParsed.role as RoleType,
            });
            // Background refresh to pick up server-side changes
            fetchProfile(session.user.id, session.user.email!, session.user.user_metadata?.role);
            return;
          }
          // No usable cache → blocking fetch
          await fetchProfile(session.user.id, session.user.email!, session.user.user_metadata?.role);
          // If fetchProfile exited early (already in-flight from onAuthStateChange),
          // loading may not have been set to false. Ensure it's cleared.
          setAuthState(prev => prev.loading ? { ...prev, loading: false } : prev);
        } else {
          console.log('[DEBUG] useAuth: No initial session');
          clearStorage();
          setAuthState({
            isAuthenticated: false, user: null, loading: false,
            profileLoading: false, profileReady: false, role: null,
          });
        }
      } catch (err) {
        console.error('[DEBUG] useAuth: Init error:', err);
        setAuthState(prev => ({ ...prev, loading: false }));
      } finally {
        initDone = true;
      }
    };

    initAuth();

    // Safety net: force loading=false after 20s
    const safetyTimer = setTimeout(() => {
      setAuthState(prev => prev.loading ? { ...prev, loading: false } : prev);
    }, 20000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[DEBUG] useAuth: onAuthStateChange:', event);

      if (event === 'SIGNED_OUT') {
        fetchGeneration.current++;
        activeFetchId.current = null;
        if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
        clearStorage();
        setAuthState({
          isAuthenticated: false, user: null, loading: false,
          profileLoading: false, profileReady: false, role: null,
        });
        return;
      }

      // Null session on non-SIGNED_OUT event is transient — ignore
      if (!session) return;

      // INITIAL_SESSION is handled by initAuth to avoid double-fetch
      if (!initDone && event === 'INITIAL_SESSION') return;

      // TOKEN_REFRESHED with an existing full profile — no need to refetch
      if (event === 'TOKEN_REFRESHED') {
        const cached = localStorage.getItem('user');
        const parsed = cached ? JSON.parse(cached) : null;
        if (parsed && parsed.id === session.user.id && isFullProfile(parsed)) return;
      }

      // Already fetching this user (e.g. SIGNED_IN fired inside signInWithPassword)
      if (activeFetchId.current === session.user.id) return;

      // Already have full profile cached for this user
      const cached = localStorage.getItem('user');
      const parsed = cached ? JSON.parse(cached) : null;
      if (parsed && parsed.id === session.user.id && isFullProfile(parsed)) return;

      await fetchProfile(session.user.id, session.user.email!, session.user.user_metadata?.role);
    });

    return () => {
      clearTimeout(safetyTimer);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ── Public API ────────────────────────────────────────────────────
  const login = useCallback((user: User) => {
    persistUser(user);
    setAuthState(prev => {
      // If a fetch already completed with a full profile for this user, don't downgrade
      if (prev.user?.id === user.id && isFullProfile(prev.user)) {
        return { ...prev, isAuthenticated: true, loading: false };
      }
      // If a fetch is already in-flight for this user, keep its profileLoading/profileReady
      const fetchInFlight = activeFetchId.current === user.id;
      return {
        isAuthenticated: true,
        user,
        loading: false,
        profileLoading: fetchInFlight ? prev.profileLoading : !isFullProfile(user),
        profileReady: fetchInFlight ? prev.profileReady : isFullProfile(user),
        role: user.role as RoleType,
      };
    });
    // Only start a new fetch if profile is incomplete AND nothing is in-flight for this user
    if (!isFullProfile(user) && activeFetchId.current !== user.id) {
      fetchProfile(user.id, user.email, user.role);
    }
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    console.log('[DEBUG] useAuth: Logout');
    fetchGeneration.current++;
    activeFetchId.current = null;
    if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
    clearStorage();
    sessionStorage.clear();
    setAuthState({
      isAuthenticated: false, user: null, loading: false,
      profileLoading: false, profileReady: false, role: null,
    });
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[DEBUG] useAuth: signOut error:', err);
    }
  }, []);

  const hasRole = useCallback((r: RoleType) => authState.role === r, [authState.role]);

  const hasAnyRole = useCallback(
    (roles: RoleType[]) => authState.role ? roles.includes(authState.role) : false,
    [authState.role],
  );

  return {
    ...authState,
    login,
    logout,
    hasRole,
    hasAnyRole,
  };
};
