"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { Send, ArrowLeft, Users } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

interface Conversation {
  id: string;
  title?: string;
  isDirect: boolean;
  participants: Array<{
    user: {
      id: string;
      displayName: string;
      avatarUrl?: string;
    };
  }>;
}

export default function ChatRoomPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { show: showToast } = useToast();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [convRes, msgRes] = await Promise.all([
          fetch(`/api/chat/conversations/${conversationId}`),
          fetch(`/api/chat/messages?conversationId=${conversationId}`),
        ]);

        if (convRes.ok) {
          const convData = await convRes.json();
          setConversation(convData.conversation);
        }

        if (msgRes.ok) {
          const msgData = await msgRes.json();
          setMessages(msgData.messages || []);
        }
      } catch (error) {
        showToast("読み込み失敗", "error");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, conversationId, showToast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      } else {
        showToast("送信失敗", "error");
      }
    } catch (error) {
      showToast("送信失敗", "error");
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (!conversation) {
    return <div className="text-center py-8">チャットが見つかりません</div>;
  }

  // チャット名を決定
  let chatTitle = '';
  if (conversation.isDirect) {
    chatTitle = conversation.participants.find((p) => p.user.id !== session.user?.id)
      ?.user.displayName || "Chat";
  } else {
    // グループチャットの場合、参加者名を表示
    const participantNames = conversation.participants
      .map((p) => p.user.displayName || '不明')
      .join('/');
    const baseTitle = conversation.title || 'グループ';
    chatTitle = `${baseTitle} (${participantNames})`;
  }

  return (
    <div
      className="fixed inset-0 flex flex-col bg-gray-50"
      style={{ paddingTop: "72px", paddingBottom: "73px" }}
    >
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.push("/chat")}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{chatTitle}</h2>
          {!conversation.isDirect && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {conversation.participants.length}人
            </p>
          )}
        </div>
      </div>

      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            メッセージがまだありません
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.senderId === session.user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[75%] ${
                    isMe ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* アバター */}
                  {!isMe && (
                    <div className="flex-shrink-0">
                      {message.sender.avatarUrl ? (
                        <img
                          src={message.sender.avatarUrl}
                          alt={message.sender.displayName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pastel-pink to-pastel-purple flex items-center justify-center text-white text-xs font-bold">
                          {message.sender.displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* メッセージ吹き出し */}
                  <div className="flex flex-col">
                    {!isMe && (
                      <span className="text-xs text-gray-600 mb-1 px-2">
                        {message.sender.displayName}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isMe
                          ? "bg-pastel-pink text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <span
                      className={`text-xs text-gray-500 mt-1 px-2 ${
                        isMe ? "text-right" : "text-left"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力フォーム */}
      <form
        onSubmit={handleSend}
        className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={sending}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pastel-pink disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-pastel-pink text-white p-3 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
