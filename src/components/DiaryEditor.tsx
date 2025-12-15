'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';

interface DiaryEditorProps {
  initialContent?: string;
  onSubmit: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function DiaryEditor({ initialContent = '', onSubmit, isLoading = false }: DiaryEditorProps) {
  const [content, setContent] = useState(initialContent);
  const { show: showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('内容を入力してください', 'error');
      return;
    }
    try {
      await onSubmit(content);
      setContent('');
      showToast('保存されました', 'success');
    } catch (error) {
      showToast('エラーが発生しました', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-4 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink resize-none"
        rows={6}
        placeholder="今日のできごとを書いてください..."
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-pastel-pink to-pastel-purple text-white font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {isLoading ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
