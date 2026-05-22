import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isMock = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('mock-project') || supabaseAnonKey.includes('mock-anon');

class MockAuth {
  private listeners: ((event: string, session: any) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'sb_mock_session') {
          const session = this.getSessionSync();
          this.notify(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        }
      });
    }
  }

  private getSessionSync() {
    if (typeof window === 'undefined') return null;
    const sessionStr = localStorage.getItem('sb_mock_session');
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }

  private notify(event: string, session: any) {
    this.listeners.forEach(cb => cb(event, session));
  }

  async getSession() {
    const session = this.getSessionSync();
    return { data: { session }, error: null };
  }

  async getUser() {
    const session = this.getSessionSync();
    return { data: { user: session?.user || null }, error: null };
  }

  async signInWithPassword({ email }: { email: string }) {
    const session = {
      user: { id: 'mock-user-uuid', email },
      access_token: 'mock-token'
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('sb_mock_session', JSON.stringify(session));
    }
    this.notify('SIGNED_IN', session);
    return { data: session, error: null };
  }

  async signUp({ email }: { email: string }) {
    // Return session but we can support standard credentials too
    const session = {
      user: { id: 'mock-user-uuid', email },
      access_token: 'mock-token'
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('sb_mock_session', JSON.stringify(session));
    }
    this.notify('SIGNED_IN', session);
    return { data: session, error: null };
  }

  async signOut() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb_mock_session');
    }
    this.notify('SIGNED_OUT', null);
    return { error: null };
  }

  onAuthStateChange(callback: any) {
    this.listeners.push(callback);
    const session = this.getSessionSync();
    setTimeout(() => {
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    }, 0);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
          }
        }
      }
    };
  }
}

// Mock client implementation matching the exact interface needed
const mockSupabase = {
  auth: new MockAuth(),
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
