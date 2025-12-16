"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import Calendar from "@/components/Calendar";
import type { DiaryEntry } from "@/types";

export default function DiaryListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch("/api/diary");
        const data = await response.json();
        setEntries(data.entries || []);
      } catch (error) {
        showToast("読み込み失敗", "error");
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchEntries();
    }
  }, [session, showToast]);

  const handleDateClick = (date: Date) => {
    // 日記作成ページに遷移（日付をクエリパラメータで渡す）
    // ローカルタイムゾーンで日付文字列を作成
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    router.push(`/diary/create?date=${dateStr}`);
  };

  const handleDateWithEntryClick = (entryId: string) => {
    // 日記詳細ページに遷移
    router.push(`/diary/${entryId}`);
  };

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
          日記カレンダー
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : (
        <Calendar
          entries={entries.map((e) => ({
            id: e.id,
            date: new Date(e.date),
            title: e.title,
            content: e.content,
            author: e.author,
            editors: e.editors,
          }))}
          onDateClick={handleDateClick}
          onDateWithEntryClick={handleDateWithEntryClick}
        />
      )}
    </div>
  );
}
