'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMindBloom } from '@/components/ui/mindbloom-provider';
import { supabase, isMock } from '@/lib/supabase-client';

export default function LoginPage() {
  const router = useRouter();
  const { profile, updateProfile } = useMindBloom();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');

    if (isMock) {
      setTimeout(() => {
        setLoading(false);
        updateProfile({ name: 'Alex Rivera', email });
        
        // If role is already selected, bypass onboarding, else redirect to onboarding
        if (profile.role !== 'none') {
          router.push('/dashboard');
        } else {
          router.push('/onboarding/role');
        }
      }, 1000);
    } else {
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        // Fetch user profile from public.profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user?.id)
          .single();

        setLoading(false);

        if (profileData) {
          updateProfile({
            name: profileData.name || 'User',
            email: profileData.email || email,
            role: profileData.role || 'none',
            gender: profileData.gender || '',
            age: profileData.age || undefined,
            maritalStatus: profileData.marital_status || '',
            smoking: profileData.smoking || '',
            alcohol: profileData.alcohol || '',
            intentions: profileData.intentions || [],
            challenges: profileData.challenges || [],
            xp: profileData.xp || 120,
            level: profileData.level || 1,
            streak: profileData.streak || 3,
            notificationsEnabled: profileData.notifications_enabled ?? true
          });

          if (profileData.role && profileData.role !== 'none') {
            router.push('/dashboard');
          } else {
            router.push('/onboarding/role');
          }
        } else {
          updateProfile({ name: 'User', email, role: 'none' });
          router.push('/onboarding/role');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-soft-gradient">
      <div className="absolute top-6 left-6 flex items-center gap-2 text-primary font-display font-bold select-none">
        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          spa
        </span>
        <Link href="/">Mindbloom</Link>
      </div>

      <div className="w-full max-w-[420px] glass-card p-8 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="font-sans text-sm text-on-surface-variant mt-2">
            Let's return to your mindful check-in.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container text-xs rounded-lg mb-6 border border-error/25 font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-4 py-3 bg-surface-container-low text-foreground border border-outline-variant rounded-lg font-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Password
              </label>
              <Link href="/auth/forgot-password" className="font-sans text-[11px] text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-surface-container-low text-foreground border border-outline-variant rounded-lg font-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full pill-button-primary py-3.5 mt-2 rounded-lg font-sans text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <hr className="border-outline-variant/30" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-surface text-on-surface-variant text-[11px] font-semibold uppercase tracking-widest select-none">
            Or Sign In With
          </span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={async () => {
              setLoading(true);
              if (isMock) {
                setTimeout(() => {
                  setLoading(false);
                  updateProfile({ name: 'Google User', email: 'user@gmail.com' });
                  router.push('/onboarding/role');
                }, 800);
              } else {
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/dashboard`
                    }
                  });
                  if (error) {
                    setError(error.message);
                    setLoading(false);
                  }
                } catch (err: any) {
                  setError(err.message || 'OAuth error occurred');
                  setLoading(false);
                }
              }
            }}
            className="flex-1 py-3 px-4 bg-surface-container border border-outline-variant hover:bg-surface-container-high/60 text-foreground text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.9 21.57,11.5 21.35,11.1z"
              />
              <path
                fill="currentColor"
                d="M12,21c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.66,0.98 -2.82,0 -5.2,-1.9 -6.05,-4.47H1.57v2.66C3.06,18.38 7.24,21 12,21z"
              />
              <path
                fill="currentColor"
                d="M5.95,12.75c-0.22,-0.66 -0.35,-1.36 -0.35,-2.08s0.13,-1.42 0.35,-2.08V5.93H1.57C0.57,7.93 0,10.15 0,12.5s0.57,4.57 1.57,6.57L5.95,12.75z"
              />
              <path
                fill="currentColor"
                d="M12,5.38c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,2.68 14.43,2 12,2 7.24,2 3.06,4.62 1.57,8.61l4.38,3.39C6.8,9.5 9.18,5.38 12,5.38z"
              />
            </svg>
            Google
          </button>
        </div>

        <div className="text-center mt-8 text-xs text-on-surface-variant font-sans">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
