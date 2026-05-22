'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommunityPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
          progress_activity
        </span>
        <p className="text-sm font-semibold text-on-surface-variant">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}

