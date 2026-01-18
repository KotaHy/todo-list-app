"use client";

import { useRouter } from "next/navigation";
import TopHeader from "@/components/TopHeader";
import Calendar from "@/components/calendar/Calendar";

export default function Top() {
  const router = useRouter();

  const handleGoToMyPage = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      router.push(`/users/${userId}/edit`); // IDを含めた正しいパスへ修正
    } else {
      router.push("/login"); // IDがない場合はログインへ
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/");
      router.refresh(); // ミドルウェアの判定を最新にする
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <TopHeader
        onMyPage={handleGoToMyPage} // 変更
        onLogout={handleLogout}
      />
      <div className="flex flex-1 items-center justify-center p-4 pt-24">
        <Calendar />
      </div>
    </div>
  );
}