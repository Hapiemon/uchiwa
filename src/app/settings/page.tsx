"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { Trash2, RefreshCw, Database, Edit, Plus, X, Save } from "lucide-react";

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
  notes: string | null;
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
  const [activeTab, setActiveTab] = useState<
    "users" | "diary" | "anniversaries" | "memories"
  >("users");
  const [users, setUsers] = useState<User[]>([]);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [memories, setMemories] = useState<MemoryLink[]>([]);
  const [loading, setLoading] = useState(false);

  // モーダル制御
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, diariesRes, anniversariesRes, memoriesRes] =
        await Promise.all([
          fetch("/api/settings/users"),
          fetch("/api/diary?take=100"),
          fetch("/api/anniversaries"),
          fetch("/api/memories"),
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
      if (memoriesRes.ok) {
        const data = await memoriesRes.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      showToast("データの取得に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const openAddModal = () => {
    setModalMode("add");
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalMode("edit");
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (data: any) => {
    try {
      let response;

      if (activeTab === "diary") {
        if (modalMode === "add") {
          response = await fetch("/api/diary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } else {
          response = await fetch(`/api/diary/${editingItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        }
      } else if (activeTab === "anniversaries") {
        if (modalMode === "add") {
          response = await fetch("/api/anniversaries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } else {
          response = await fetch(`/api/anniversaries/${editingItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        }
      } else if (activeTab === "memories") {
        if (modalMode === "add") {
          response = await fetch("/api/memories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } else {
          response = await fetch(`/api/memories/${editingItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        }
      } else if (activeTab === "users") {
        response = await fetch(`/api/settings/users/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      if (response && response.ok) {
        showToast(
          modalMode === "add" ? "追加されました" : "更新されました",
          "success"
        );
        closeModal();
        fetchData();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      showToast("保存に失敗しました", "error");
    }
  };

  const handleDelete = async (id: string, endpoint: string) => {
    if (!confirm("削除してもよろしいですか？")) return;
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      if (response.ok) {
        showToast("削除されました", "success");
        fetchData();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      showToast("削除に失敗しました", "error");
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
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          更新
        </button>
      </div>

      {/* タブ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "users" as const, label: "ユーザー", count: users.length },
          { key: "diary" as const, label: "日記", count: diaries.length },
          {
            key: "anniversaries" as const,
            label: "記念日",
            count: anniversaries.length,
          },
          {
            key: "memories" as const,
            label: "メモリー",
            count: memories.length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === tab.key
                ? "bg-pastel-pink text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* 追加ボタン */}
      {activeTab !== "users" && (
        <div className="mb-4">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-pastel-purple text-white rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            新規追加
          </button>
        </div>
      )}

      {/* コンテンツ */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {activeTab === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    名前
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    表示名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    作成日
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">{user.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {user.displayName || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              user.id,
                              `/api/settings/users/${user.id}`
                            )
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "diary" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    タイトル
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    内容
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    作成者
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    日付
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {diaries.map((diary) => (
                  <tr key={diary.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{diary.title || "-"}</td>
                    <td className="px-4 py-3 text-sm max-w-md truncate">
                      {diary.content}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {diary.author.displayName || diary.author.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(diary.date).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(diary)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(diary.id, `/api/diary/${diary.id}`)
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "anniversaries" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    タイトル
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    日付
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    繰り返し
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    メモ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {anniversaries.map((anniversary) => (
                  <tr key={anniversary.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{anniversary.title}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(anniversary.date).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {anniversary.repeatInterval}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">
                      {anniversary.notes || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(anniversary)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              anniversary.id,
                              `/api/anniversaries/${anniversary.id}`
                            )
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "memories" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    タイトル
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    URL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    順序
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {memories.map((memory) => (
                  <tr key={memory.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{memory.title}</td>
                    <td className="px-4 py-3 text-sm max-w-md truncate">
                      <a
                        href={memory.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {memory.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">{memory.order}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(memory)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              memory.id,
                              `/api/memories/${memory.id}`
                            )
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <EditModal
          mode={modalMode}
          type={activeTab}
          item={editingItem}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// 編集・追加モーダルコンポーネント
function EditModal({
  mode,
  type,
  item,
  onClose,
  onSave,
}: {
  mode: "add" | "edit";
  type: string;
  item: any;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState<any>(item || {});

  useEffect(() => {
    if (type === "diary" && !item) {
      setFormData({
        title: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
      });
    } else if (type === "anniversaries" && !item) {
      setFormData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        repeatInterval: "YEARLY",
        notes: "",
      });
    } else if (type === "memories" && !item) {
      setFormData({ title: "", url: "", order: 0 });
    } else if (type === "users" && item) {
      setFormData({
        name: item.name,
        displayName: item.displayName || "",
        email: item.email,
      });
    }
  }, [item, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 日付フィールドの処理
    let processedData = { ...formData };
    if (type === "diary" && formData.date) {
      processedData.date = new Date(formData.date).toISOString();
    }
    if (type === "anniversaries" && formData.date) {
      processedData.date = new Date(formData.date).toISOString();
    }

    onSave(processedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {mode === "add" ? "新規追加" : "編集"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {type === "users" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">名前</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">表示名</label>
                <input
                  type="text"
                  value={formData.displayName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </>
          )}

          {type === "diary" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">日付</label>
                <input
                  type="date"
                  value={
                    formData.date
                      ? new Date(formData.date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">内容</label>
                <textarea
                  value={formData.content || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={10}
                  required
                />
              </div>
            </>
          )}

          {type === "anniversaries" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">日付</label>
                <input
                  type="date"
                  value={
                    formData.date
                      ? new Date(formData.date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  繰り返し
                </label>
                <select
                  value={formData.repeatInterval || "YEARLY"}
                  onChange={(e) =>
                    setFormData({ ...formData, repeatInterval: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="NONE">なし</option>
                  <option value="WEEKLY">毎週</option>
                  <option value="MONTHLY">毎月</option>
                  <option value="YEARLY">毎年</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">メモ</label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </>
          )}

          {type === "memories" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <input
                  type="url"
                  value={formData.url || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">順序</label>
                <input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-pastel-pink text-white px-6 py-3 rounded-lg hover:opacity-90"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
