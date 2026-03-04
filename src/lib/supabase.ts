import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[DEBUG] Supabase: URL or Key missing!');
  throw new Error('Supabase URL and Anon Key are required');
}

// Custom storage to bypass problematic Navigator LockManager in some environments
const customStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch { }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch { }
  },
};

console.log('[DEBUG] Supabase: Initializing with URL', supabaseUrl);
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'realassist-auth-token',
    storage: customStorage,
  }
});
