"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();
        if (data.user) {
          setProfile(data.user);
        }
      } catch (error) {
        showToast("プロフィール取得失敗", "error");
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
              <p className="font-semibold">{profile.displayName || "-"}</p>
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
