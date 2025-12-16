'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function ChatListPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/chat/conversations');
        const data = await response.json();
        setConversations(data.conversations || []);
      } catch (error) {
        showToast('読み込み失敗', 'error');
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchConversations();
    }
  }, [session, showToast]);

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
            const displayName = conversation.isDirect
              ? otherUser?.displayName || 'Chat'
              : conversation.title || `グループ (${conversation.participants.length}人)`;

            // グループアバター表示用
            const displayAvatar = conversation.isDirect
              ? otherUser?.avatarUrl
              : null;

            return (
              <Link
                key={conversation.id}
                href={`/chat/${conversation.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition p-4"
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
                  <div className="flex-1">
                    <h3 className="font-semibold">{displayName}</h3>
                    {lastMessage && (
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
