"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { Users } from "lucide-react";

interface User {
  id: string;
  name: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        if (data.users) {
          setUsers(data.users);
        }
      } catch (error) {
        showToast("ユーザ取得失敗", "error");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUsers();
    }
  }, [session, showToast]);

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-8 h-8 text-pastel-pink" />
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
          ユーザ一覧
        </h1>
      </div>

      <div className="mb-6">
        <Link
          href="/profile"
          className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          ← 自分のプロフィールに戻る
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ユーザが見つかりません
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition"
            >
              <div className="flex items-start gap-3">
                {user.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName || user.name}
                    className="w-12 h-12 rounded-full border-2 border-pastel-pink object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg truncate">
                    {user.displayName || "表示名未入力"}
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap break-words mt-1">
                    {user.bio || "自己紹介はまだありません"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
