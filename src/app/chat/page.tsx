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
        setConversations(data.conversations);
      } catch (error) {
        showToast('読み込み失敗', 'error');
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
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
        チャット
      </h1>

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : conversations.length === 0 ? (
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

            return (
              <Link
                key={conversation.id}
                href={`/chat/${conversation.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition p-4"
              >
                <div className="flex items-center gap-3">
                  {otherUser?.avatarUrl && (
                    <img
                      src={otherUser.avatarUrl}
                      alt={otherUser.displayName || ''}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {otherUser?.displayName || 'Chat'}
                    </h3>
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
