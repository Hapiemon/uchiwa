"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

interface User {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export default function CreateChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { show: showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        // 自分以外のユーザーを表示
        setUsers(
          data.users?.filter((u: User) => u.id !== session?.user?.id) || []
        );
      } catch (error) {
        showToast("ユーザー読み込み失敗", "error");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUsers();
    }
  }, [session, showToast]);

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) {
      showToast("ユーザーを選択してください", "error");
      return;
    }

    const isDirect = selectedUsers.length === 1;
    if (!isDirect && !title.trim()) {
      showToast("グループ名を入力してください", "error");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selectedUsers,
          title: isDirect ? null : title.trim(),
          isDirect,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast("チャット作成成功", "success");
        router.push(`/chat/${data.conversation.id}`);
      } else {
        showToast(data.error || "チャット作成失敗", "error");
      }
    } catch (error) {
      showToast("チャット作成失敗", "error");
    } finally {
      setCreating(false);
    }
  };

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
        チャット作成
      </h1>

      {selectedUsers.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            グループ名
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="グループ名を入力"
            className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink"
          />
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ユーザーを選択 ({selectedUsers.length}人選択中)
        </label>

        {loading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : !users || users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ユーザーがいません
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <label
                key={user.id}
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                  selectedUsers.includes(user.id)
                    ? "border-pastel-pink bg-pink-50"
                    : "border-gray-200 hover:border-pastel-pink"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                  className="w-5 h-5 text-pastel-pink rounded focus:ring-pastel-pink"
                />
                {user.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName || ""}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <span className="font-medium">{user.displayName}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          キャンセル
        </button>
        <button
          onClick={handleCreate}
          disabled={creating || selectedUsers.length === 0}
          className="flex-1 bg-pastel-pink text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? "作成中..." : "作成"}
        </button>
      </div>
    </div>
  );
}
