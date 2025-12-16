"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { Plus, Trash2, Edit2, ExternalLink, Save, X } from "lucide-react";

interface MemoryLink {
  id: string;
  title: string;
  url: string;
  order: number;
}

export default function MemoriesPage() {
  const { data: session } = useSession();
  const [memories, setMemories] = useState<MemoryLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMemory, setNewMemory] = useState({ title: "", url: "" });
  const [editMemory, setEditMemory] = useState({ title: "", url: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const { show: showToast } = useToast();

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await fetch("/api/memories");
      const data = await response.json();
      setMemories(data.memories || []);
    } catch (error) {
      showToast("読み込み失敗", "error");
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.title.trim() || !newMemory.url.trim()) {
      showToast("タイトルとURLを入力してください", "error");
      return;
    }

    try {
      const response = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMemory),
      });

      if (!response.ok) throw new Error("Failed to create");

      const data = await response.json();
      setMemories([...memories, data.memory]);
      setNewMemory({ title: "", url: "" });
      setShowAddForm(false);
      showToast("追加しました", "success");
    } catch (error) {
      showToast("追加に失敗しました", "error");
    }
  };

  const handleEdit = async (id: string) => {
    if (!editMemory.title.trim() || !editMemory.url.trim()) {
      showToast("タイトルとURLを入力してください", "error");
      return;
    }

    try {
      const response = await fetch(`/api/memories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMemory),
      });

      if (!response.ok) throw new Error("Failed to update");

      const data = await response.json();
      setMemories(memories.map((m) => (m.id === id ? data.memory : m)));
      setEditingId(null);
      showToast("更新しました", "success");
    } catch (error) {
      showToast("更新に失敗しました", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/memories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setMemories(memories.filter((m) => m.id !== id));
      showToast("削除しました", "success");
    } catch (error) {
      showToast("削除に失敗しました", "error");
    }
  };

  const startEdit = (memory: MemoryLink) => {
    setEditingId(memory.id);
    setEditMemory({ title: memory.title, url: memory.url });
  };

  if (!session) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink to-pastel-purple">
          思い出のリンク
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-pastel-pink text-white px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2"
        >
          {showAddForm ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {showAddForm ? "キャンセル" : "追加"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル
              </label>
              <input
                type="text"
                value={newMemory.title}
                onChange={(e) =>
                  setNewMemory({ ...newMemory, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pastel-pink focus:border-transparent"
                placeholder="例: 初デートの写真"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={newMemory.url}
                onChange={(e) =>
                  setNewMemory({ ...newMemory, url: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pastel-pink focus:border-transparent"
                placeholder="https://..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-pastel-pink text-white py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : memories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          思い出のリンクがまだありません 💕
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => (
            <div key={memory.id} className="bg-white rounded-lg shadow-lg p-6">
              {editingId === memory.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editMemory.title}
                    onChange={(e) =>
                      setEditMemory({ ...editMemory, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pastel-pink focus:border-transparent"
                  />
                  <input
                    type="url"
                    value={editMemory.url}
                    onChange={(e) =>
                      setEditMemory({ ...editMemory, url: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pastel-pink focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(memory.id)}
                      className="flex-1 bg-pastel-pink text-white py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {memory.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(memory)}
                        className="p-2 text-pastel-purple hover:bg-pastel-lavender rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(memory.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <a
                    href={memory.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pastel-pink hover:text-pastel-purple transition break-all"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{memory.url}</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
