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
  const { daysUntil, daysSince, nextMilestone } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const originalDate = new Date(anniversary.date);
    originalDate.setHours(0, 0, 0, 0);
    
    // 経過日数を計算
    const daysSinceAnniversary = Math.floor((today.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));
    
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
        const diff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { daysUntil: -1, daysSince: daysSinceAnniversary, nextMilestone: null };
      }
    }

    const diff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // キリのいい日数を計算（7, 30, 50, 100, 150, 200, 300, 365, 500, 1000, ...）
    const milestones = [7, 30, 50, 100, 150, 200, 300, 365, 500, 1000, 1500, 2000, 3000, 5000, 10000];
    let nextMilestoneValue = null;
    let daysToMilestone = null;
    
    for (const milestone of milestones) {
      if (daysSinceAnniversary < milestone) {
        nextMilestoneValue = milestone;
        daysToMilestone = milestone - daysSinceAnniversary;
        break;
      }
    }
    
    return { 
      daysUntil: diff, 
      daysSince: daysSinceAnniversary,
      nextMilestone: nextMilestoneValue && daysToMilestone 
        ? { days: nextMilestoneValue, remaining: daysToMilestone }
        : null
    };
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
      <h3 className="font-bold text-lg mb-1">{anniversary.title}</h3>
      
      {/* 設定した日付 */}
      <p className="text-xs opacity-90 mb-3">
        📅 {new Date(anniversary.date).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })}
      </p>
      
      {/* 繰り返し情報 */}
      {getRepeatLabel() && (
        <p className="text-sm opacity-90 mb-2">
          🔄 {getRepeatLabel()}
          {anniversary.repeatInterval === 'WEEKLY' && ` ${new Date(anniversary.date).toLocaleDateString('ja-JP', { weekday: 'long' })}`}
          {anniversary.repeatInterval === 'MONTHLY' && ` ${new Date(anniversary.date).getDate()}日`}
          {anniversary.repeatInterval === 'YEARLY' && ` ${new Date(anniversary.date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}`}
        </p>
      )}
      
      {/* 次の繰り返しまでの日数 */}
      <div className="mt-4 mb-4 text-center border-t border-white border-opacity-30 pt-4">
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
      
      {/* 経過日数とキリのいい日まで */}
      <div className="mt-4 pt-4 border-t border-white border-opacity-30 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-90">経過日数</span>
          <span className="font-bold text-lg">{daysSince}日</span>
        </div>
        
        {nextMilestone && (
          <div className="bg-white bg-opacity-20 rounded-lg p-3 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">🎯 次の節目</span>
              <span className="font-bold">{nextMilestone.days}日目</span>
            </div>
            <div className="mt-1 text-center">
              <span className="text-2xl font-bold">{nextMilestone.remaining}</span>
              <span className="text-xs ml-1">日後</span>
            </div>
          </div>
        )}
      </div>
      
      {anniversary.notes && (
        <p className="text-sm mt-4 pt-3 border-t border-white border-opacity-30 italic opacity-80">
          {anniversary.notes}
        </p>
      )}
    </div>
  );
}
