'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine current step percentage for a 3-step onboarding flow
  let progress = 33;
  let stepName = 'Role & Demographics';

  if (pathname.includes('/personal')) {
    progress = 66;
    stepName = 'Personal Details & Habits';
  } else if (pathname.includes('/intentions')) {
    progress = 100;
    stepName = 'Setting Intentions';
  }

  return (
    <div className="min-h-screen flex flex-col bg-soft-gradient">
      {/* Onboarding Header */}
      <header className="px-6 md:px-12 py-5 bg-surface/40 backdrop-blur-md border-b border-outline-variant/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-primary font-display font-bold select-none">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            spa
          </span>
          <span>Mindbloom Onboarding</span>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 min-w-[200px]">
          <div className="flex justify-between w-full text-xs font-semibold text-on-surface-variant font-sans">
            <span>{stepName}</span>
            <span>{progress}%</span>
          </div>
          {/* Progress bar container (satisfies 4px rounding) */}
          <div className="w-full h-1.5 bg-surface-container rounded-lg overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Onboarding Step Container */}
      <main className="flex-1 flex items-center justify-center py-10 px-6">
        <div className="w-full max-w-[640px]">
          {children}
        </div>
      </main>
    </div>
  );
}
