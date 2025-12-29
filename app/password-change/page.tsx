"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function PasswordChangePage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};

    if (!currentPassword) nextErrors.current = "現在のパスワードを入力してください";
    if (!newPassword) nextErrors.new = "新しいパスワードを入力してください";
    if (!confirmPassword) nextErrors.confirm = "確認用パスワードを入力してください";

    if (!nextErrors.new && !nextErrors.confirm && newPassword !== confirmPassword) {
      nextErrors.confirm = "新しいパスワードと確認用が一致しません";
    }
    if (!nextErrors.new && newPassword.length < 6) {
      nextErrors.new = "新しいパスワードは6文字以上で入力してください";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/password-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.status === 200) {
        alert("パスワードを変更しました");
        router.push("/top");
      } else {
        const body = await res.json().catch(() => ({}));
        setErrors({ confirm: body.message ?? "パスワードの変更に失敗しました" });
      }
    } catch (err) {
      console.error(err);
      setErrors({ confirm: "通信エラーが発生しました" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {/* 左上の戻るボタン */}
      <button
        onClick={() => router.back()}
        className="absolute left-4 top-4 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        戻る
      </button>

      <main className="flex min-h-screen w-full max-w-md flex-col items-center justify-center px-8 bg-white dark:bg-black">
        <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
          パスワード変更
        </h1>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="currentPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              現在のパスワード
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="現在のパスワードを入力"
            />
            {errors.current && <p className="text-xs text-red-500">{errors.current}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="newPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              新しいパスワード
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="新しいパスワードを入力"
            />
            {errors.new && <p className="text-xs text-red-500">{errors.new}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              新しいパスワード（確認用）
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="新しいパスワードを再度入力"
            />
            {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-md bg-blue-600 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
          >
            {loading ? "変更中..." : "変更"}
          </button>
        </form>
      </main>
    </div>
  );
}