'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMindBloom } from '@/components/ui/mindbloom-provider';
import { useTheme } from '@/components/ui/theme-provider';
import { supabase } from '@/lib/supabase-client';

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user, isLoading } = useMindBloom();
  const { theme, toggleTheme } = useTheme();

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (profile.role === 'none') {
        router.push('/onboarding/role');
      }
    }
  }, [user, profile.role, isLoading, router]);

  // Core navigation items (excluding Community)
  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'AI Companion', href: '/chat', icon: 'chat_bubble' },
    { name: 'Mood Logs', href: '/mood', icon: 'spa' },
    { name: 'Relief Library', href: '/relief', icon: 'extension' },
    { name: 'Gamification', href: '/gamification', icon: 'military_tech' },
    { name: 'Insights', href: '/analytics', icon: 'insights' },
    { name: 'Profile', href: '/profile', icon: 'person' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ];

  // Mobile bottom bar items (excluding Community)
  const mobileItems = [
    { name: 'Home', href: '/dashboard', icon: 'dashboard' },
    { name: 'Relief', href: '/relief', icon: 'extension' },
    { name: 'Chat', href: '/chat', icon: 'chat_bubble' },
    { name: 'Profile', href: '/profile', icon: 'person' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
            progress_activity
          </span>
          <p className="text-sm font-semibold text-on-surface-variant">Loading MindBloom...</p>
        </div>
      </div>
    );
  }

  if (!user || profile.role === 'none') {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">
      {/* 1. Desktop Sidebar Navigation (Hidden on mobile) */}
      <aside className="hidden md:flex md:w-[260px] flex-col bg-surface border-r border-outline-variant/20 fixed h-full z-30">
        {/* Brand header */}
        <div className="p-6 flex items-center gap-3 border-b border-outline-variant/15 shrink-0 select-none">
          <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            spa
          </span>
          <span className="text-lg font-display font-bold text-primary tracking-tight">Mindbloom</span>
        </div>

        {/* User Mini Profile Banner */}
        <div className="px-6 py-5 border-b border-outline-variant/15 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-[4px] overflow-hidden bg-primary/10 flex items-center justify-center text-primary shrink-0 select-none">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{profile.name}</p>
            <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">
              Level {profile.level} • {profile.xp} XP
            </p>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-[4px] text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] select-none">
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-outline-variant/15 space-y-1 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[4px] text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-primary/5 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[4px] text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/5 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Area (Scrollable space offset on desktop for sidebar) */}
      <div className="flex-1 flex flex-col md:pl-[260px] pb-[72px] md:pb-0">
        {/* Adaptive Header (Top Bar) */}
        <header className="sticky top-0 left-0 right-0 z-20 flex justify-between md:justify-end items-center px-6 py-4 bg-background/80 backdrop-blur-md border-b border-outline-variant/10">
          {/* Logo visible only on mobile */}
          <div className="flex items-center gap-2 md:hidden select-none">
            <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              spa
            </span>
            <span className="text-base font-display font-bold text-primary tracking-tight">Mindbloom</span>
          </div>

          {/* Status Quick Widgets */}
          <div className="flex items-center gap-4">
            {/* Streak Counter widget */}
            <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-[4px] text-xs font-bold border border-orange-500/15 select-none">
              <span className="material-symbols-outlined text-[18px] fill-current animate-pulse">
                local_fire_department
              </span>
              <span>{profile.streak} Days</span>
            </div>

            {/* Level Counter widget */}
            <div className="flex items-center gap-1.5 bg-secondary-container/20 text-secondary dark:text-secondary-fixed-dim px-3 py-1 rounded-[4px] text-xs font-bold border border-secondary/15 select-none">
              <span className="material-symbols-outlined text-[18px]">military_tech</span>
              <span>Lvl {profile.level}</span>
            </div>

            {/* User Profile Shortcut */}
            <Link
              href="/profile"
              className="w-8 h-8 rounded-[4px] overflow-hidden bg-primary/10 flex items-center justify-center text-primary border border-primary/20 select-none hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">person</span>
            </Link>
          </div>
        </header>

        {/* Shared Layout Content page renderer */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation (Visible on mobile/tablet screens only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-surface/90 backdrop-blur-lg border-t border-outline-variant/15 flex justify-around items-center px-4 py-2 pb-safe shadow-[0_-4px_20px_0_rgba(103,75,181,0.05)] rounded-t-[4px]">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-[4px] transition-all ${
                isActive
                  ? 'bg-primary-container/25 text-primary scale-105'
                  : 'text-on-surface-variant/80 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] select-none" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
