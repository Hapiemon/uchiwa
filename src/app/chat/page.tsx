"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { Trash2 } from "lucide-react";

export default function ChatListPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const { show: showToast } = useToast();
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/chat/conversations");
        const data = await response.json();
        setConversations(data.conversations || []);
      } catch (error) {
        showToast("読み込み失敗", "error");
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchConversations();
    }
  }, [session, showToast]);

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(
        `/api/chat/conversations/${conversationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }

      setConversations(conversations.filter((c) => c.id !== conversationId));
      setSwipedId(null);
      showToast("チャットルームを削除しました", "success");
    } catch (error) {
      showToast("削除に失敗しました", "error");
    }
  };

  const handleTouchStart = (e: React.TouchEvent, conversationId: string) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent, conversationId: string) => {
    const currentX = e.touches[0].clientX;
    const diff = startXRef.current - currentX;
    currentXRef.current = diff;

    const element = e.currentTarget as HTMLElement;
    const parentWidth = element.offsetWidth;
    const maxTranslate = parentWidth * 0.3; // 30%まで

    // 左スワイプ（削除）と右スワイプ（キャンセル）の両方に対応
    if (diff > 0 && diff < maxTranslate) {
      // 左スワイプ（削除ボタン表示）
      const percentage = (diff / parentWidth) * 100;
      element.style.transform = `translateX(-${percentage}%)`;
      element.style.transition = "none";
    } else if (diff < 0 && swipedId === conversationId) {
      // 右スワイプ（削除ボタンを閉じる）
      const resetDiff = Math.max(diff, -maxTranslate);
      const percentage =
        ((-maxTranslate + Math.abs(resetDiff)) / parentWidth) * 100;
      element.style.transform = `translateX(-${percentage}%)`;
      element.style.transition = "none";
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, conversationId: string) => {
    const element = e.currentTarget as HTMLElement;
    const parentWidth = element.offsetWidth;
    const threshold = parentWidth * 0.2; // 20%の位置で確定
    element.style.transition = "transform 0.3s ease-out";

    // スワイプ距離が20%以上なら削除ボタン表示、それ以外は元に戻す
    if (currentXRef.current > threshold) {
      element.style.transform = "translateX(-30%)";
      setSwipedId(conversationId);
    } else if (
      currentXRef.current < -(threshold * 0.5) &&
      swipedId === conversationId
    ) {
      // 右スワイプで閉じる
      element.style.transform = "translateX(0)";
      setSwipedId(null);
    } else if (swipedId !== conversationId) {
      element.style.transform = "translateX(0)";
    }

    currentXRef.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent, conversationId: string) => {
    startXRef.current = e.clientX;
    currentXRef.current = 0;

    const element = e.currentTarget as HTMLElement;
    const parentWidth = element.offsetWidth;
    const maxTranslate = parentWidth * 0.3; // 30%まで

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX;
      const diff = startXRef.current - currentX;
      currentXRef.current = diff;

      // 左ドラッグと右ドラッグの両方に対応
      if (diff > 0 && diff < maxTranslate) {
        const percentage = (diff / parentWidth) * 100;
        element.style.transform = `translateX(-${percentage}%)`;
        element.style.transition = "none";
      } else if (diff < 0 && swipedId === conversationId) {
        const resetDiff = Math.max(diff, -maxTranslate);
        const percentage =
          ((-maxTranslate + Math.abs(resetDiff)) / parentWidth) * 100;
        element.style.transform = `translateX(-${percentage}%)`;
        element.style.transition = "none";
      }
    };

    const handleMouseUp = () => {
      const threshold = parentWidth * 0.2; // 20%の位置で確定
      element.style.transition = "transform 0.3s ease-out";

      if (currentXRef.current > threshold) {
        element.style.transform = "translateX(-30%)";
        setSwipedId(conversationId);
      } else if (
        currentXRef.current < -(threshold * 0.5) &&
        swipedId === conversationId
      ) {
        element.style.transform = "translateX(0)";
        setSwipedId(null);
      } else if (swipedId !== conversationId) {
        element.style.transform = "translateX(0)";
      }

      currentXRef.current = 0;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
          チャット
        </h1>
        <Link
          href="/chat/create"
          className="bg-pastel-pink text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          新規作成
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : !conversations || conversations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          チャットがまだありません 💬
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const otherUser = conversation.participants.find(
              (p: any) => p.userId !== session.user?.id
            )?.user;
            const lastMessage = conversation.messages[0];

            // グループ名またはユーザー名を表示
            let displayName = "";
            if (conversation.isDirect) {
              displayName = otherUser?.displayName || "Chat";
            } else {
              // グループチャットの場合、参加者名を表示
              const participantNames = conversation.participants
                .map((p: any) => p.user?.displayName || "不明")
                .join("/");
              const baseTitle = conversation.title || "グループ";
              displayName = `${baseTitle} (${participantNames})`;
            }

            // グループアバター表示用
            const displayAvatar = conversation.isDirect
              ? otherUser?.avatarUrl
              : null;

            return (
              <div
                key={conversation.id}
                className="relative overflow-hidden rounded-lg"
              >
                {/* 削除ボタン（背景レイヤー - カードと同じサイズ） */}
                <button
                  onClick={(e) => handleDelete(conversation.id, e)}
                  className="absolute inset-0 bg-gradient-to-l from-red-600 to-red-500 flex items-center justify-end pr-4 text-white hover:from-red-700 hover:to-red-600 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1 w-[30%] min-w-[80px]">
                    <Trash2 className="w-6 h-6" />
                    <span className="text-xs font-medium">削除</span>
                  </div>
                </button>

                {/* カード（前面レイヤー） */}
                <div
                  className="relative z-10 bg-white shadow hover:shadow-lg cursor-pointer select-none rounded-lg"
                  style={{
                    transform:
                      swipedId === conversation.id
                        ? "translateX(-30%)"
                        : "translateX(0)",
                    transition: "transform 0.3s ease-out",
                  }}
                  onTouchStart={(e) => handleTouchStart(e, conversation.id)}
                  onTouchMove={(e) => handleTouchMove(e, conversation.id)}
                  onTouchEnd={(e) => handleTouchEnd(e, conversation.id)}
                  onMouseDown={(e) => handleMouseDown(e, conversation.id)}
                >
                  <Link
                    href={`/chat/${conversation.id}`}
                    className="block p-4 bg-white rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {displayAvatar ? (
                        <img
                          src={displayAvatar}
                          alt={displayName}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pastel-pink to-pastel-purple flex items-center justify-center text-white font-bold">
                          {conversation.participants.length}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {displayName}
                        </h3>
                        {lastMessage && (
                          <p className="text-sm text-gray-600 truncate">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="opacity-50">←</span>
                        <Trash2 className="w-3 h-3 opacity-30" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
