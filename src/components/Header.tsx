'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Heart, Youtube, Image } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const { data: session } = useSession();
  const [mediaLinks, setMediaLinks] = useState<{ youtubeUrl?: string; googlePhotosUrl?: string }>({});

  useEffect(() => {
    if (session) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setMediaLinks({
              youtubeUrl: data.user.youtubeUrl,
              googlePhotosUrl: data.user.googlePhotosUrl,
            });
          }
        })
        .catch(() => {});
    }
  }, [session]);

  return (
    <header className="bg-gradient-to-r from-pastel-pink to-pastel-purple shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-white">
          <Heart className="w-6 h-6" />
          Uchiwa
        </Link>
        <div className="flex items-center gap-4">
          {session && (
            <>
              {mediaLinks.youtubeUrl && (
                <a
                  href={mediaLinks.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white text-sm"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                  <span className="hidden sm:inline">動画</span>
                </a>
              )}
              {mediaLinks.googlePhotosUrl && (
                <a
                  href={mediaLinks.googlePhotosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white text-sm"
                  title="Google Photos"
                >
                  <Image className="w-4 h-4" />
                  <span className="hidden sm:inline">写真</span>
                </a>
              )}
              <span className="text-white text-sm hidden md:inline">{session.user?.email}</span>
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
