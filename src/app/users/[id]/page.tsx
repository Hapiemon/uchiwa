"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { ArrowLeft } from "lucide-react";

interface User {
  id: string;
  name: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  timezone: string;
  createdAt: string;
}

export default function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`);
        if (!response.ok) {
          throw new Error("User not found");
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        showToast("ユーザ取得失敗", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id, showToast]);

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">ユーザが見つかりません</p>
        <Link
          href="/users"
          className="text-pastel-pink hover:underline font-semibold"
        >
          ユーザ一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 mb-6 text-pastel-pink hover:text-pastel-purple transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ユーザ一覧に戻る</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {user.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.displayName || user.name}
            className="w-24 h-24 rounded-full mx-auto border-4 border-pastel-pink"
          />
        )}

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
            {user.displayName || user.name}
          </h1>
          {user.displayName && (
            <p className="text-gray-600">@{user.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">ユーザID</p>
            <p className="font-mono text-sm text-gray-700 break-all">
              {user.id}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">タイムゾーン</p>
            <p className="font-semibold">{user.timezone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">参加日</p>
            <p className="font-semibold">
              {new Date(user.createdAt).toLocaleDateString("ja-JP")}
            </p>
          </div>
        </div>

        {user.bio && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">自己紹介</p>
            <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
              {user.bio}
            </p>
          </div>
        )}

        <Link
          href="/users"
          className="block w-full text-center bg-gradient-to-r from-pastel-pink to-pastel-purple text-white font-semibold py-2 rounded-lg hover:opacity-90 transition"
        >
          ユーザ一覧に戻る
        </Link>
      </div>
    </div>
  );
}
