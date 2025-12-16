'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useToast } from '@/components/Toast';

function CreateDiaryForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show: showToast } = useToast();
  
  // URLから日付を取得、なければ今日の日付
  const dateParam = searchParams.get('date');
  const initialDate = dateParam || new Date().toISOString().split('T')[0];
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(initialDate);
  const [submitting, setSubmitting] = useState(false);

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      showToast('内容を入力してください', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const requestBody = { 
        title: title.trim() || null,
        content: content.trim(),
        date: new Date(date).toISOString()
      };
      
      console.log('Creating diary with data:', requestBody);
      
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response:', { status: response.status, data });

      if (!response.ok) {
        console.error('Diary creation error:', data);
        throw new Error(data.error || 'Failed to create diary entry');
      }

      showToast('日記が作成されました', 'success');
      router.push('/diary');
    } catch (error) {
      console.error('Error creating diary:', error);
      showToast(error instanceof Error ? error.message : '作成失敗', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
        新しい日記を作成
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
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
            placeholder="今日の出来事を書きましょう..."
            rows={12}
            className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink resize-none"
            required
          />
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-pastel-pink text-white px-6 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? '保存中...' : '保存'}
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

export default function CreateDiaryPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">読み込み中...</div>}>
      <CreateDiaryForm />
    </Suspense>
  );
}
