'use client';

import { Header } from '@/components/Header';
import { TabNav } from '@/components/TabNav';
import { ToastContainer } from '@/components/Toast';
import { PuzzleGuard } from '@/components/PuzzleGuard';
import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPuzzlePage = pathname === '/';

  return (
    <SessionProvider>
      <PuzzleGuard>
        {!isPuzzlePage && <Header />}
        <main className={isPuzzlePage ? '' : 'max-w-4xl mx-auto px-4 py-8 pb-28'}>
          {children}
        </main>
        {!isPuzzlePage && <TabNav />}
        <ToastContainer />
      </PuzzleGuard>
    </SessionProvider>
  );
}
