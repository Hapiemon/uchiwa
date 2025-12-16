'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { Trash2, RefreshCw, Database, Edit, Plus, X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  displayName: string | null;
  createdAt: string;
}

interface DiaryEntry {
  id: string;
  title: string | null;
  content: string;
  date: string;
  author: { name: string; displayName: string | null };
  createdAt: string;
}

interface Anniversary {
  id: string;
  title: string;
  date: string;
  repeatInterval: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string | null;
  isDirect: boolean;
  createdAt: string;
  participants: Array<{ user: { name: string } }>;
}

interface Message {
  id: string;
  content: string;
  sender: { name: string };
  createdAt: string;
}

interface MemoryLink {
  id: string;
  title: string;
  url: string;
  order: number;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { show: showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'users' | 'diary' | 'anniversaries' | 'conversations' | 'messages' | 'memories'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<MemoryLink[]>([]);
  const [loading, setLoading] = useState(false);
  
  // モーダル制御
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, diariesRes, anniversariesRes, conversationsRes, messagesRes, memoriesRes] = await Promise.all([
        fetch('/api/settings/users'),
        fetch('/api/diary?take=100'),
        fetch('/api/anniversaries'),
        fetch('/api/chat/conversations'),
        fetch('/api/settings/messages'),
        fetch('/api/memories'),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (diariesRes.ok) {
        const data = await diariesRes.json();
        setDiaries(data.entries || []);
      }
      if (anniversariesRes.ok) {
        const data = await anniversariesRes.json();
        setAnniversaries(data.anniversaries || []);
      }
      if (conversationsRes.ok) {
        const data = await conversationsRes.json();
        setConversations(data.conversations || []);
      }
      if (messagesRes.ok) {
        const data = await messagesRes.json();
        setMessages(data.messages || []);
      }
      if (memoriesRes.ok) {
        const data = await memoriesRes.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      showToast('データの取得に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('このユーザーを削除してもよろしいですか？関連するデータも削除されます。')) return;
    try {
      const response = await fetch(`/api/settings/users/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
        showToast('削除されました', 'success');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showToast('削除に失敗しました', 'error');
    }
  };

  const handleDeleteDiary = async (id: string) => {
    if (!confirm('この日記を削除してもよろしいですか？')) return;
    try {
      const response = await fetch(`/api/diary/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setDiaries(diaries.filter(d => d.id !== id));
        showToast('削除されました', 'success');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showToast('削除に失敗しました', 'error');
    }
  };

  const handleDeleteAnniversary = async (id: string) => {
    if (!confirm('この記念日を削除してもよろしいですか？')) return;
    try {
      const response = await fetch(`/api/anniversaries/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setAnniversaries(anniversaries.filter(a => a.id !== id));
        showToast('削除されました', 'success');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showToast('削除に失敗しました', 'error');
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (!confirm('このチャットを削除してもよろしいですか？')) return;
    try {
      const response = await fetch(`/api/chat/conversations/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setConversations(conversations.filter(c => c.id !== id));
        showToast('削除されました', 'success');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showToast('削除に失敗しました', 'error');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('このメッセージを削除してもよろしいですか？')) return;
    try {
      const response = await fetch(`/api/settings/messages/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessages(messages.filter(m => m.id !== id));
        showToast('削除されました', 'success');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showToast('削除に失敗しました', 'error');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('このメモリーリンクを削除してもよろしいですか？')) return;
    try {
      const response = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMemories(memories.filter(m => m.id !== id));
        showToast('削除されました', 'success');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showToast('削除に失敗しました', 'error');
    }
  };

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-pastel-purple" />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
            データベース管理
          </h1>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-pastel-pink text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          更新
        </button>
      </div>

      {/* タブ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'users' as const, label: 'ユーザー', count: users.length },
          { key: 'diary' as const, label: '日記', count: diaries.length },
          { key: 'anniversaries' as const, label: '記念日', count: anniversaries.length },
          { key: 'conversations' as const, label: 'チャット', count: conversations.length },
          { key: 'messages' as const, label: 'メッセージ', count: messages.length },
          { key: 'memories' as const, label: 'メモリー', count: memories.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-pastel-pink text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">表示名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成日</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">{user.name}</td>
                    <td className="px-4 py-3 text-sm">{user.displayName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'diary' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">タイトル</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">内容</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成者</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {diaries.map((diary) => (
                  <tr key={diary.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{diary.title || '-'}</td>
                    <td className="px-4 py-3 text-sm max-w-md truncate">{diary.content}</td>
                    <td className="px-4 py-3 text-sm">{diary.author.displayName || diary.author.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(diary.date).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteDiary(diary.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'anniversaries' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">タイトル</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">繰り返し</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成日</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {anniversaries.map((anniversary) => (
                  <tr key={anniversary.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{anniversary.title}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(anniversary.date).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-sm">{anniversary.repeatInterval}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(anniversary.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteAnniversary(anniversary.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">タイトル</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">タイプ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">参加者</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成日</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <tr key={conversation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{conversation.title || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {conversation.isDirect ? 'ダイレクト' : 'グループ'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {conversation.participants.map(p => p.user.name).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(conversation.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteConversation(conversation.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">内容</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">送信者</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">送信日時</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm max-w-md truncate">{message.content}</td>
                    <td className="px-4 py-3 text-sm">{message.sender.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'memories' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">タイトル</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">順序</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成日</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {memories.map((memory) => (
                  <tr key={memory.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{memory.title}</td>
                    <td className="px-4 py-3 text-sm max-w-md truncate">
                      <a href={memory.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {memory.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">{memory.order}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(memory.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteMemory(memory.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
