'use client';

import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Anniversary } from '@/types';

interface AnniversaryCardProps {
  anniversary: Anniversary;
  userTimezone: string;
}

export function AnniversaryCard({ anniversary, userTimezone }: AnniversaryCardProps) {
  const daysUntil = useMemo(() => {
    const today = new Date();
    let nextDate = new Date(anniversary.date);

    // If yearly repeating and date passed this year, move to next year
    if (anniversary.repeatInterval === 'YEARLY') {
      if (nextDate < today) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    }

    const diff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [anniversary]);

  return (
    <div className="bg-gradient-to-br from-pastel-pink to-pastel-purple p-6 rounded-2xl shadow-md text-white">
      <h3 className="font-bold text-lg">{anniversary.title}</h3>
      <p className="text-sm opacity-90 mt-2">
        {anniversary.repeatInterval === 'YEARLY' ? '毎年 ' : ''}
        {new Date(anniversary.date).toLocaleDateString('ja-JP')}
      </p>
      <div className="mt-4 text-center">
        <p className="text-4xl font-bold">{daysUntil}</p>
        <p className="text-sm">日後</p>
      </div>
      {anniversary.notes && (
        <p className="text-sm mt-3 italic opacity-80">{anniversary.notes}</p>
      )}
    </div>
  );
}
