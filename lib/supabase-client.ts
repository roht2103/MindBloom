import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isMock = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('mock-project') || supabaseAnonKey.includes('mock-anon');

// Mock client implementation matching the exact interface needed
const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: { id: 'mock-user-uuid', email: 'alex@mindbloom.ai' } }, error: null }),
    signUp: async () => ({ data: { user: { id: 'mock-user-uuid', email: 'alex@mindbloom.ai' } }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: any) => {
      // For testing, trigger the callback immediately with a mock session
      setTimeout(() => {
        callback('SIGNED_IN', {
          user: { id: 'mock-user-uuid', email: 'alex@mindbloom.ai' },
          access_token: 'mock-token'
        });
      }, 100);
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: async () => ({ data: [], error: null })
      }),
      order: async () => ({ data: [], error: null })
    }),
    insert: async (data: any) => ({ data, error: null }),
    update: () => ({
      eq: async () => ({ data: null, error: null })
    }),
    delete: () => ({
      eq: async () => ({ data: null, error: null })
    })
  })
};

export const supabase = isMock 
  ? (mockSupabase as any) 
  : createClient(supabaseUrl, supabaseAnonKey);

export { isMock };
