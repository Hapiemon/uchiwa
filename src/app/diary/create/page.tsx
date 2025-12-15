'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DiaryEditor } from '@/components/DiaryEditor';
import { useToast } from '@/components/Toast';

export default function CreateDiaryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { show: showToast } = useToast();

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  const handleSubmit = async (content: string) => {
    try {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to create diary entry');
      }

      showToast('日記が作成されました', 'success');
      router.push('/diary');
    } catch (error) {
      showToast('作成失敗', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
        新しい日記を作成
      </h1>
      <DiaryEditor onSubmit={handleSubmit} />
    </div>
  );
}
