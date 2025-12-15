'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DiaryEditor } from '@/components/DiaryEditor';
import { useToast } from '@/components/Toast';
import type { DiaryEntry } from '@/types';

export default function DiaryDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/diary/${id}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        setEntry(data.entry);
      } catch (error) {
        showToast('読み込み失敗', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchEntry();
    }
  }, [session, id, showToast]);

  const handleUpdate = async (content: string) => {
    try {
      const response = await fetch(`/api/diary/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Update failed');
      const data = await response.json();
      setEntry(data.entry);
      setIsEditing(false);
      showToast('更新されました', 'success');
    } catch (error) {
      showToast('更新失敗', 'error');
    }
  };

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (!entry) {
    return <div className="text-center py-8">見つかりません</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
        日記を表示
      </h1>
      {isEditing ? (
        <DiaryEditor
          initialContent={entry.content}
          onSubmit={handleUpdate}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600 text-sm mb-4">
            {new Date(entry.createdAt).toLocaleDateString('ja-JP')}
          </p>
          <p className="whitespace-pre-wrap text-gray-800 mb-6">{entry.content}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-pastel-pink text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}
