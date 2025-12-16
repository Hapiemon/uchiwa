'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Heart, User } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-pastel-pink to-pastel-purple shadow-md z-40">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-white">
          <Heart className="w-6 h-6" />
          Uchiwa
        </Link>
        <div className="flex items-center gap-4">
          {session && (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white text-sm"
                title="プロフィール"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">プロフィール</span>
              </Link>
              <button
                onClick={() => signOut({ redirectTo: '/login' })}
                className="px-4 py-2 bg-white text-pink-500 rounded-full font-semibold text-sm hover:bg-pink-50 transition"
              >
                ログアウト
              </button>
            </>
          )}
          {!session && (
            <>
              <Link href="/login" className="text-white hover:text-pink-100 transition">
                ログイン
              </Link>
              <Link href="/register" className="text-white hover:text-pink-100 transition">
                登録
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
