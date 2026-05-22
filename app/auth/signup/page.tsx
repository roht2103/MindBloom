'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMindBloom } from '@/components/ui/mindbloom-provider';
import { supabase, isMock } from '@/lib/supabase-client';

export default function SignupPage() {
  const router = useRouter();
  const { updateProfile } = useMindBloom();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');

    if (isMock) {
      setTimeout(() => {
        setLoading(false);
        updateProfile({ name, email, role: 'none' });
        router.push('/onboarding/role');
      }, 1000);
    } else {
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        setLoading(false);
        updateProfile({ name, email, role: 'none' });
        router.push('/onboarding/role');
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
          <h1 className="font-display text-2xl font-bold text-foreground">Create Account</h1>
          <p className="font-sans text-sm text-on-surface-variant mt-2">
            Start your personalized wellness journey.
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
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full px-4 py-3 bg-surface-container-low text-foreground border border-outline-variant rounded-lg font-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

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
            <label className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
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
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-8 text-xs text-on-surface-variant font-sans">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
