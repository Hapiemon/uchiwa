'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { Trash2, ArrowLeft } from 'lucide-react';
import type { DiaryEntry } from '@/types';

export default function DiaryDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/diary/${id}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        setEntry(data.entry);
        setTitle(data.entry.title || '');
        setContent(data.entry.content);
        setDate(new Date(data.entry.date).toISOString().split('T')[0]);
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      showToast('内容を入力してください', 'error');
      return;
    }
    
    try {
      const response = await fetch(`/api/diary/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim() || null,
          content: content.trim(),
          date: new Date(date).toISOString()
        }),
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

  const handleDelete = async () => {
    if (!confirm('この日記を削除してもよろしいですか？')) return;
    
    try {
      const response = await fetch(`/api/diary/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');
      showToast('削除されました', 'success');
      router.push('/diary');
    } catch (error) {
      showToast('削除失敗', 'error');
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
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/diary')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
          日記
        </h1>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
              日付
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink"
              required
            />
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              タイトル（任意）
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="今日の出来事"
              className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
              内容
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink resize-none"
              required
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-pastel-pink text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setTitle(entry.title || '');
                setContent(entry.content);
                setDate(new Date(entry.date).toISOString().split('T')[0]);
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-2">
              {new Date(entry.date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
            {entry.title && (
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{entry.title}</h2>
            )}
            
            {/* 作成者と編集者の表示 */}
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
              <span className="px-2 py-1 bg-pastel-pink/10 text-pastel-pink rounded-full">
                作成: {(entry as any).author?.displayName || (entry as any).author?.name || '不明'}
              </span>
              {(entry as any).editors && (entry as any).editors.length > 0 && (
                <>
                  {(entry as any).editors.map((editor: any, index: number) => (
                    <span key={index} className="px-2 py-1 bg-pastel-purple/10 text-pastel-purple rounded-full">
                      編集: {editor.user?.displayName || editor.user?.name || '不明'}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
          
          <p className="whitespace-pre-wrap text-gray-800 mb-6 leading-relaxed">
            {entry.content}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-pastel-pink text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
