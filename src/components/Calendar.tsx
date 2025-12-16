'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasEntry?: boolean;
}

interface CalendarProps {
  entries: Array<{ id: string; date: Date; title?: string; content: string }>;
  onDateClick: (date: Date) => void;
  onDateWithEntryClick: (entryId: string) => void;
}

export default function Calendar({ entries, onDateClick, onDateWithEntryClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getMonthDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 月の最初の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // カレンダーの開始日（月曜日から開始）
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 日曜日の場合は6日前、それ以外は1日前から
    startDate.setDate(firstDay.getDate() - diff);
    
    // 6週間分（42日）のカレンダーを生成
    const days: CalendarDay[] = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const entryForDay = entries.find(entry => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getFullYear() === currentDay.getFullYear() &&
          entryDate.getMonth() === currentDay.getMonth() &&
          entryDate.getDate() === currentDay.getDate()
        );
      });
      
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        hasEntry: !!entryForDay
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const days = getMonthDays(currentDate);
  const weekDays = ['月', '火', '水', '木', '金', '土', '日'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDay) => {
    const entry = entries.find(e => {
      const entryDate = new Date(e.date);
      return (
        entryDate.getFullYear() === day.date.getFullYear() &&
        entryDate.getMonth() === day.date.getMonth() &&
        entryDate.getDate() === day.date.getDate()
      );
    });
    
    if (entry) {
      onDateWithEntryClick(entry.id);
    } else {
      onDateClick(day.date);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-pastel-pink text-white rounded-lg hover:opacity-90 transition"
          >
            今日
          </button>
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="前の月"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="次の月"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const today = isToday(day.date);
          
          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square p-2 rounded-lg border-2 transition relative
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${today ? 'border-pastel-pink bg-pink-50' : 'border-transparent'}
                ${day.hasEntry ? 'bg-pastel-mint border-pastel-mint' : ''}
                ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
                hover:border-pastel-purple hover:shadow-md
              `}
            >
              <span className={`text-sm ${today ? 'font-bold text-pastel-pink' : ''}`}>
                {day.date.getDate()}
              </span>
              {day.hasEntry && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1.5 h-1.5 bg-pastel-pink rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="flex gap-4 mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-pastel-pink bg-pink-50"></div>
          <span>今日</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-pastel-mint"></div>
          <span>日記あり</span>
        </div>
      </div>
    </div>
  );
}
