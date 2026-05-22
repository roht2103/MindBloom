'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');

    // Mock send password reset email
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-soft-gradient">
      <div className="absolute top-6 left-6 flex items-center gap-2 text-primary font-display font-bold select-none">
        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          spa
        </span>
        <Link href="/">Mindbloom</Link>
      </div>

      <div className="w-full max-w-[420px] glass-card p-8 rounded-[4px] shadow-xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="font-sans text-sm text-on-surface-variant mt-2">
            We will send you a secure link to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container text-xs rounded-[4px] mb-6 border border-error/25 font-sans">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center font-sans">
            <div className="w-16 h-16 bg-secondary/15 text-secondary flex items-center justify-center rounded-[4px] mx-auto mb-6">
              <span className="material-symbols-outlined text-[36px]">mail</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Check Your Email</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password.
            </p>
            <Link href="/auth/login">
              <button className="w-full pill-button-primary py-3 rounded-[4px] font-sans text-sm font-semibold cursor-pointer">
                Back to Sign In
              </button>
            </Link>
          </div>
        ) : (
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
                className="w-full px-4 py-3 bg-surface-container-low text-foreground border border-outline-variant rounded-[4px] font-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full pill-button-primary py-3.5 mt-2 rounded-[4px] font-sans text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center mt-4 text-xs text-on-surface-variant font-sans">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
