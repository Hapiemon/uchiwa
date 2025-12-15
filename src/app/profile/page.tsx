'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { Youtube, Image } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (data.user) {
          setProfile(data.user);
        }
      } catch (error) {
        showToast('プロフィール取得失敗', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session, showToast]);

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
        プロフィール
      </h1>
      {profile && (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {profile.avatarUrl && (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-24 h-24 rounded-full mx-auto border-4 border-pastel-pink"
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">名前</p>
              <p className="font-semibold">{profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">表示名</p>
              <p className="font-semibold">{profile.displayName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">メール</p>
              <p className="font-semibold">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">タイムゾーン</p>
              <p className="font-semibold">{profile.timezone}</p>
            </div>
          </div>
          {profile.bio && (
            <div>
              <p className="text-sm text-gray-600">自己紹介</p>
              <p className="font-semibold">{profile.bio}</p>
            </div>
          )}
          
          {/* メディアリンクセクション */}
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">思い出のリンク</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.youtubeUrl ? (
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg hover:from-red-100 hover:to-red-200 transition"
                >
                  <Youtube className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">YouTube動画</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-gray-400">
                  <Youtube className="w-5 h-5" />
                  <span className="text-sm">未設定</span>
                </div>
              )}
              
              {profile.googlePhotosUrl ? (
                <a
                  href={profile.googlePhotosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition"
                >
                  <Image className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Google Photos</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-gray-400">
                  <Image className="w-5 h-5" />
                  <span className="text-sm">未設定</span>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/profile/edit"
            className="inline-block w-full text-center bg-gradient-to-r from-pastel-pink to-pastel-purple text-white font-semibold py-2 rounded-lg hover:opacity-90 transition"
          >
            編集
          </Link>
        </div>
      )}
    </div>
  );
}
