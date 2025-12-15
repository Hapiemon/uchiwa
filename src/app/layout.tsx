import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { TabNav } from '@/components/TabNav';
import { ToastContainer } from '@/components/Toast';
import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'Uchiwa - かわいいカップル向けWebアプリ',
  description: 'あなたとの思い出を共有するアプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gradient-to-b from-pastel-lavender to-white min-h-screen">
        <SessionProvider>
          <Header />
          <main className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
            {children}
          </main>
          <TabNav />
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  );
}
