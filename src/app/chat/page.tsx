'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { Trash2 } from 'lucide-react';

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

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      setConversations(conversations.filter(c => c.id !== conversationId));
      setSwipedId(null);
      showToast('チャットルームを削除しました', 'success');
    } catch (error) {
      showToast('削除に失敗しました', 'error');
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

    // 左スワイプのみ（diffが正の値）
    if (diff > 0 && diff < 100) {
      const element = e.currentTarget as HTMLElement;
      element.style.transform = `translateX(-${diff}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, conversationId: string) => {
    const element = e.currentTarget as HTMLElement;
    
    // スワイプ距離が50px以上なら削除ボタン表示
    if (currentXRef.current > 50) {
      element.style.transform = 'translateX(-80px)';
      setSwipedId(conversationId);
    } else {
      element.style.transform = 'translateX(0)';
      setSwipedId(null);
    }
    
    currentXRef.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent, conversationId: string) => {
    startXRef.current = e.clientX;
    currentXRef.current = 0;
    
    const element = e.currentTarget as HTMLElement;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX;
      const diff = startXRef.current - currentX;
      currentXRef.current = diff;

      if (diff > 0 && diff < 100) {
        element.style.transform = `translateX(-${diff}px)`;
      }
    };

    const handleMouseUp = () => {
      if (currentXRef.current > 50) {
        element.style.transform = 'translateX(-80px)';
        setSwipedId(conversationId);
      } else {
        element.style.transform = 'translateX(0)';
        setSwipedId(null);
      }
      
      currentXRef.current = 0;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
            const displayName = conversation.isDirect
              ? otherUser?.displayName || 'Chat'
              : conversation.title || `グループ (${conversation.participants.length}人)`;

            // グループアバター表示用
            const displayAvatar = conversation.isDirect
              ? otherUser?.avatarUrl
              : null;

            return (
              <div key={conversation.id} className="relative overflow-hidden">
                <div
                  className="relative bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 cursor-pointer"
                  style={{ transform: 'translateX(0)' }}
                  onTouchStart={(e) => handleTouchStart(e, conversation.id)}
                  onTouchMove={(e) => handleTouchMove(e, conversation.id)}
                  onTouchEnd={(e) => handleTouchEnd(e, conversation.id)}
                  onMouseDown={(e) => handleMouseDown(e, conversation.id)}
                >
                  <Link
                    href={`/chat/${conversation.id}`}
                    className="block p-4"
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
                </div>
                
                {/* 削除ボタン */}
                <button
                  onClick={(e) => handleDelete(conversation.id, e)}
                  className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center text-white rounded-r-lg"
                  style={{ 
                    transform: 'translateX(80px)',
                    transition: 'none'
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
