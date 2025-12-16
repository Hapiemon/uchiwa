'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnniversaryCard } from '@/components/AnniversaryCard';
import { useToast } from '@/components/Toast';
import { Trash2, Edit } from 'lucide-react';
import type { Anniversary } from '@/types';

export default function AnniversariesPage() {
  const { data: session } = useSession();
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchAnniversaries = async () => {
      try {
        const response = await fetch('/api/anniversaries');
        const data = await response.json();
        setAnniversaries(data.anniversaries || []);
      } catch (error) {
        showToast('読み込み失敗', 'error');
        setAnniversaries([]);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAnniversaries();
    }
  }, [session, showToast]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/anniversaries/${id}`, { method: 'DELETE' });
      setAnniversaries((prev) => prev.filter((a) => a.id !== id));
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
          記念日
        </h1>
        <Link
          href="/anniversaries/create"
          className="bg-pastel-pink text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          追加
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : !anniversaries || anniversaries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          記念日がまだありません 📅
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {anniversaries.map((anniversary) => (
            <div key={anniversary.id} className="relative">
              <AnniversaryCard
                anniversary={anniversary}
                userTimezone={(session.user as any)?.timezone || 'Asia/Tokyo'}
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Link
                  href={`/anniversaries/edit/${anniversary.id}`}
                  className="text-white hover:opacity-75 transition bg-black bg-opacity-20 p-2 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => handleDelete(anniversary.id)}
                  className="text-white hover:opacity-75 transition bg-black bg-opacity-20 p-2 rounded-lg"
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
