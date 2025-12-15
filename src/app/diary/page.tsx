'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { Trash2 } from 'lucide-react';
import type { DiaryEntry } from '@/types';

export default function DiaryListPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch(
          `/api/diary?search=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setEntries(data.entries);
      } catch (error) {
        showToast('読み込み失敗', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchEntries();
    }
  }, [session, searchQuery, showToast]);

  const handleDelete = async (id: string) => {
    if (!confirm('削除してよろしいですか?')) return;

    try {
      await fetch(`/api/diary/${id}`, { method: 'DELETE' });
      setEntries((prev) => prev.filter((e) => e.id !== id));
      showToast('削除されました', 'success');
    } catch (error) {
      showToast('削除失敗', 'error');
    }
  };

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
          日記
        </h1>
        <Link
          href="/diary/create"
          className="bg-pastel-pink text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          新規作成
        </Link>
      </div>

      <input
        type="text"
        placeholder="検索..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border border-pink-200 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-pastel-pink"
      />

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          まだ日記がありません 📔
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm">
                    {new Date(entry.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                  <Link
                    href={`/diary/${entry.id}`}
                    className="font-semibold text-gray-800 hover:text-pastel-pink transition block mt-1 line-clamp-2"
                  >
                    {entry.content}
                  </Link>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-red-500 hover:text-red-700 transition ml-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
