"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopHeader from "@/components/TopHeader";
import type { Task, User } from "@/components/calendar/types";

interface UserTask extends Task {
  user_name?: string;
}

const formatDate = (value: string | undefined) => {
  if (!value) return "";
  // 想定フォーマット: "YYYY-MM-DD" または ISO 文字列
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    // "YYYY-MM-DD" のような単純な日付文字列だけを想定して "/" 置換
    return value.replace(/-/g, "/");
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
};

export default function UserTasksPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const admin = userId === "1";
    setIsAdmin(admin);

    if (!admin) {
      // admin 以外は /top へ戻す
      router.replace("/top");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error("ユーザー一覧の取得に失敗しました");
        }
        const data = await res.json();
        const fetchedUsers: User[] = data.users ?? [];
        setUsers(fetchedUsers);
        if (fetchedUsers.length > 0) {
          setSelectedUserId(fetchedUsers[0].id);
        }
      } catch (e) {
        console.error(e);
        setError("ユーザー一覧の取得に失敗しました");
      }
    };

    fetchUsers();
  }, [router]);

  useEffect(() => {
    if (!isAdmin || !selectedUserId) return;

    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          year: String(year),
          month: String(month),
          users_id: String(selectedUserId),
        });
        const res = await fetch(`/api/tasks?${params.toString()}`);
        if (!res.ok) {
          throw new Error("タスクの取得に失敗しました");
        }
        const data = await res.json();
        setTasks((data.tasks ?? []) as UserTask[]);
      } catch (e) {
        console.error(e);
        setError("タスクの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [isAdmin, selectedUserId, year, month]);

  const handleGoToMyPage = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      router.push(`/users/${userId}/edit`);
    } else {
      router.push("/login");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleSearchUserTasks = () => {
    // すでにこのページなので何もしない
  };

  const handleBackToTop = () => {
    router.push("/top");
  };

  const handlePrevMonth = () => {
    setMonth((prev) => {
      if (prev === 1) {
        setYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setMonth((prev) => {
      if (prev === 12) {
        setYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <TopHeader
        onMyPage={handleGoToMyPage}
        onLogout={handleLogout}
        isAdmin={isAdmin}
        onBackToTop={handleBackToTop}
      />
      <main className="flex-1 pt-24 px-4 pb-6 max-w-5xl mx-auto w-full">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          ユーザーごとのタスク一覧
        </h1>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-700 dark:text-zinc-200">
              ユーザー
            </span>
            <select
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={selectedUserId ?? ""}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.user_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              前の月
            </button>
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {year}年 {month}月
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              次の月
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">日付</th>
                  <th className="px-3 py-2 text-left font-medium">タスク名</th>
                  <th className="px-3 py-2 text-left font-medium">メモ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-4 text-center text-zinc-500 dark:text-zinc-400"
                    >
                      読み込み中...
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-4 text-center text-zinc-500 dark:text-zinc-400"
                    >
                      この条件のタスクはありません。
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-t border-zinc-100 dark:border-zinc-800"
                    >
                      <td className="px-3 py-2 text-zinc-800 dark:text-zinc-100 whitespace-nowrap">
                        {formatDate(task.task_date)}
                      </td>
                      <td className="px-3 py-2 text-zinc-800 dark:text-zinc-100">
                        {task.task_name}
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200">
                        {task.note ?? ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}


