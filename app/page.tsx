'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ui/theme-provider';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-soft-gradient">
      {/* Header NavBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-surface/75 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[32px] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
            spa
          </span>
          <span className="text-xl font-display font-bold text-primary tracking-tight">Mindbloom</span>
        </div>

        <nav className="hidden md:flex gap-8 items-center">
          <Link href="/" className="font-sans text-[14px] font-medium text-primary border-b-2 border-primary pb-1">
            Home
          </Link>
          <Link href="/auth/login" className="font-sans text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/auth/login" className="font-sans text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors">
            AI Companion
          </Link>
          <Link href="/auth/login" className="font-sans text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors">
            Relief Library
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Dark Mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-surface-container-high/50 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            <span className="material-symbols-outlined select-none">
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          <Link href="/auth/login">
            <button className="px-5 py-2 border border-primary hover:bg-primary/5 text-primary font-sans text-[14px] font-medium rounded-full cursor-pointer transition-all">
              Sign In
            </button>
          </Link>

          <Link href="/onboarding/role">
            <button className="pill-button-primary px-5 py-2 font-sans text-[14px] font-medium rounded-full cursor-pointer">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-32 pb-16">
        {/* Hero Section */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight leading-tight">
              Your safe space for a <span className="text-primary">calm mind.</span>
            </h1>
            <p className="font-sans text-lg md:text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience a more mindful way to navigate life's challenges. Mindbloom provides gentle, intelligent support for your mental well-being, anytime you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/onboarding/role">
                <button className="pill-button-primary px-10 py-4 rounded-full text-on-primary font-sans text-[15px] font-medium shadow-md">
                  Start My Journey
                </button>
              </Link>
              <Link href="/auth/login">
                <button className="pill-button-outline px-10 py-4 rounded-full text-primary font-sans text-[15px] font-medium bg-transparent">
                  Access Dashboard
                </button>
              </Link>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="mt-16 relative w-full max-w-5xl mx-auto h-[320px] md:h-[500px] flex justify-center items-center">
            <div className="absolute inset-0 bg-primary/5 rounded-[4px] blur-3xl scale-75"></div>
            <img
              alt="Minimalist Mindful Illustration"
              className="relative z-10 w-full h-full object-contain rounded-[4px] floating-anim select-none"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC55uIBcvmsy2gPdycauPbYaV051V33q5wiLW01II0HwGDOBwpb5vLCmmoZQM9GItEaQcNMeBWea9BbFhGyoe5Y2qRyFyie8dALAhbkR6_LUGhb_8IA-RyqwGo6SwLgj2PLk8q2m3VQfRH9RkWFgxHS52h6fN9YqHFvTJBWZ-GlaISP5UpSZVQVl8iC8p1_xLlBZD-UTe9ojTXTkhAzsxJSijG5h6jr16hTm0q-Lz7F_B6F_b4GqAz1Moylg2GHNEZP6zj-qmhYw"
            />
          </div>
        </section>

        {/* Trust Bar */}
        <section className="w-full py-12 bg-surface-container-low/50 border-y border-outline-variant/20 mb-20">
          <div className="container mx-auto px-6 text-center">
            <p className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-4">
              Empowering Mindful Growth
            </p>
            <p className="font-display text-xl md:text-2xl text-primary font-medium opacity-90 max-w-3xl mx-auto">
              Supporting 50,000+ students and working professionals to prevent stress, anxiety, and early burnout.
            </p>
          </div>
        </section>

        {/* Feature Preview Cards */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-foreground">
            Designed for Emotional Balance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: AI Chat Support */}
            <div className="glass-card p-8 rounded-[4px] flex flex-col gap-6 group hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-[4px] bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[32px] select-none">
                  chat_bubble
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold mb-3 text-foreground">
                  AI Companion Support
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  A companion that listens without judgment. Available 24/7 to help you process thoughts, detect stress factors, and find clarity.
                </p>
              </div>
              <div className="mt-auto pt-4">
                <Link href="/auth/login" className="font-sans text-[13px] font-semibold text-primary flex items-center gap-2 hover:gap-3 transition-all">
                  Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Card 2: Mood Tracking */}
            <div className="glass-card p-8 rounded-[4px] flex flex-col gap-6 group hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-[4px] bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[32px] select-none">
                  spa
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold mb-3 text-foreground">
                  Mood Insights
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Visualize your emotional journey. Identify chronic patterns and anxiety triggers using our mood scoring index and predictive insights.
                </p>
              </div>
              <div className="mt-auto pt-4">
                <Link href="/auth/login" className="font-sans text-[13px] font-semibold text-secondary flex items-center gap-2 hover:gap-3 transition-all">
                  Explore patterns <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Card 3: Relief Tools Library */}
            <div className="glass-card p-8 rounded-[4px] flex flex-col gap-6 group hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-[4px] bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[32px] select-none">
                  extension
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold mb-3 text-foreground">
                  Interactive Stress Games
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Paced micro-exercises designed to ground your breathing, pop stress bubbles, challenge focus, and lower cognitive load in minutes.
                </p>
              </div>
              <div className="mt-auto pt-4">
                <Link href="/auth/login" className="font-sans text-[13px] font-semibold text-tertiary flex items-center gap-2 hover:gap-3 transition-all">
                  Play now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Content Area / Testimonial */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-16">
          <div className="glass-card rounded-[4px] overflow-hidden flex flex-col md:flex-row items-stretch min-h-[480px]">
            <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
              <span className="font-sans text-xs font-semibold text-primary mb-4 uppercase tracking-widest">
                Breathing Room
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 text-foreground">
                Find your center in the noise of everyday life.
              </h2>
              <p className="font-sans text-base text-on-surface-variant mb-8 leading-relaxed">
                Our platform is built on clinically-validated techniques wrapped in a beautiful, non-intimidating experience. No clutter, no noise, just you and your peace of mind.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[4px] overflow-hidden bg-surface-container">
                  <img
                    alt="User avatar"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMGgdhEEMS1k7qP_csbZBc8oRd3SlBT6C5LSa6P6Ccdvf67tv_6WBG7RqDZO4U8UmvRY19aEeecXoKMZ5db8qS0JWXI5m1Q5aoxlAAlQiwIcB3H9HqOC6Wn7-iYr9dXkWYdMY5sjmJuoAZ_rf1Oy-RtV9Dt_a2zjxphBF5mEEaWZW22mN5y6oolu6QYgNXlcj3LbeMFR2opkrk8X4xTW_Mp2cv64ftK2sQ-eVJmD4gyT5WZQfrMnA6cH8P2HU3UuMGAwwR6Ck3RQ"
                  />
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-foreground">Sarah Jenkins</p>
                  <p className="font-sans text-xs text-on-surface-variant">Product Designer & Daily User</p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-primary/5 min-h-[300px] relative">
              <img
                alt="Calm environment"
                className="w-full h-full object-cover select-none"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq1kCnbHSZKq8OPbykE04JjWUOhp3DkzxeveqZj_OLlvcV-e_zOwom4VDnuWvVqtpMGVP_neF0LNq6q0CXKDtSL7OiWcWzMHTPVI62H4kcWavTkYZO0bl7rPhiX7P98FtP2781_BMDbXkqutM6yPV3MF4QU--TE9hKowLnWxXM2qrn19QnVEwcEhAjEQKY7rmKyPzuupAgFdoV9OjmTnYBEfzGKqoVDBozAr_iFIWGxws7TYPg-q2X3AE6BEI6etP4oVxDrjX41w"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 px-6 md:px-12 flex flex-col items-center gap-6 bg-surface-container-lowest dark:bg-surface-dim border-t border-outline-variant/10">
        <div className="flex items-center gap-2 text-primary font-display text-xl font-bold select-none">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            spa
          </span>
          Mindbloom
        </div>
        <nav className="flex flex-wrap justify-center gap-8 mb-4">
          <a href="#" className="font-sans text-xs text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="font-sans text-xs text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="font-sans text-xs text-on-surface-variant hover:text-primary transition-colors font-medium text-red-500 hover:text-red-600">Emergency Crisis Line</a>
          <a href="#" className="font-sans text-xs text-on-surface-variant hover:text-primary transition-colors">Contact Support</a>
        </nav>
        <p className="font-sans text-xs text-on-surface-variant/70">
          © {new Date().getFullYear()} Mindbloom AI. Built for academic & professional wellness.
        </p>
      </footer>
    </div>
  );
}
