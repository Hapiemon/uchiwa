'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/Toast';

export default function CreateAnniversaryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    repeatInterval: 'YEARLY',
    notes: '',
  });

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/anniversaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create anniversary');
      }

      showToast('記念日が追加されました', 'success');
      router.push('/anniversaries');
    } catch (error) {
      showToast('追加失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
        記念日を追加
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タイトル
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, repeatInterval: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink resize-none"
            rows={3}
            placeholder="この日についてのメモ..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pastel-pink to-pastel-purple text-white font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? '追加中...' : '追加'}
        </button>
      </form>
    </div>
  );
}
