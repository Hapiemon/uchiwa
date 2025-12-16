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
    today.setHours(0, 0, 0, 0);
    let nextDate = new Date(anniversary.date);
    nextDate.setHours(0, 0, 0, 0);

    // Calculate next occurrence based on repeat interval
    if (anniversary.repeatInterval === 'WEEKLY') {
      // Find the next occurrence of the same day of week
      const targetDay = nextDate.getDay();
      const currentDay = today.getDay();
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }
      nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysToAdd);
    } else if (anniversary.repeatInterval === 'MONTHLY') {
      // Find the next occurrence of the same day of month
      const targetDate = new Date(anniversary.date).getDate();
      nextDate = new Date(today.getFullYear(), today.getMonth(), targetDate);
      
      if (nextDate <= today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      
      // Handle months with fewer days
      while (nextDate.getDate() !== targetDate && nextDate.getMonth() !== (new Date(today.getFullYear(), today.getMonth(), targetDate).getMonth() + 1) % 12) {
        nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, targetDate);
      }
    } else if (anniversary.repeatInterval === 'YEARLY') {
      // Find the next occurrence of the same date
      nextDate = new Date(today.getFullYear(), nextDate.getMonth(), nextDate.getDate());
      if (nextDate <= today) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    } else {
      // NONE - just use the original date
      if (nextDate < today) {
        return -1; // Past event
      }
    }

    const diff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [anniversary]);

  const getRepeatLabel = () => {
    switch (anniversary.repeatInterval) {
      case 'WEEKLY':
        return '毎週';
      case 'MONTHLY':
        return '毎月';
      case 'YEARLY':
        return '毎年';
      default:
        return '';
    }
  };

  return (
    <div className="bg-gradient-to-br from-pastel-pink to-pastel-purple p-6 rounded-2xl shadow-md text-white">
      <h3 className="font-bold text-lg">{anniversary.title}</h3>
      <p className="text-sm opacity-90 mt-2">
        {getRepeatLabel() && `${getRepeatLabel()} `}
        {new Date(anniversary.date).toLocaleDateString('ja-JP', {
          year: anniversary.repeatInterval === 'YEARLY' ? undefined : 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: anniversary.repeatInterval === 'WEEKLY' ? 'long' : undefined,
        })}
      </p>
      <div className="mt-4 text-center">
        {daysUntil === -1 ? (
          <>
            <p className="text-2xl font-bold">終了</p>
            <p className="text-sm">過去の記念日</p>
          </>
        ) : daysUntil === 0 ? (
          <>
            <p className="text-4xl font-bold">🎉</p>
            <p className="text-lg font-bold">今日！</p>
          </>
        ) : (
          <>
            <p className="text-4xl font-bold">{daysUntil}</p>
            <p className="text-sm">日後</p>
          </>
        )}
      </div>
      {anniversary.notes && (
        <p className="text-sm mt-3 italic opacity-80">{anniversary.notes}</p>
      )}
    </div>
  );
}
