"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import type { Anniversary } from "@/types";

export default function EditAnniversaryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    repeatInterval: "YEARLY",
    notes: "",
  });

  useEffect(() => {
    const fetchAnniversary = async () => {
      try {
        const response = await fetch(`/api/anniversaries/${id}`);
        const data = await response.json();
        if (data.anniversary) {
          const anniversary = data.anniversary;
          setFormData({
            title: anniversary.title,
            date: new Date(anniversary.date).toISOString().split("T")[0],
            repeatInterval: anniversary.repeatInterval,
            notes: anniversary.notes || "",
          });
        }
      } catch (error) {
        showToast("読み込み失敗", "error");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAnniversary();
    }
  }, [session, id]);

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/anniversaries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update anniversary");
      }

      showToast("記念日が更新されました", "success");
      router.push("/anniversaries");
    } catch (error) {
      showToast("更新失敗", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
        記念日を編集
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タイトル
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink"
            placeholder="例: 初デート"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            日付
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            繰り返し
          </label>
          <select
            value={formData.repeatInterval}
            onChange={(e) =>
              setFormData({ ...formData, repeatInterval: e.target.value })
            }
            className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink"
          >
            <option value="NONE">なし</option>
            <option value="WEEKLY">毎週</option>
            <option value="MONTHLY">毎月</option>
            <option value="YEARLY">毎年</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メモ (オプション)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink resize-none"
            placeholder="メモを入力"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-pastel-pink to-pastel-purple text-white px-6 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "更新中..." : "更新"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
