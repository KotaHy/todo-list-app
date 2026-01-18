// ... 既存のコード ...
interface TopHeaderProps {
  onMyPage: () => void; // プロパティ名を変更
  onLogout: () => void;
}

export default function TopHeader({
  onMyPage, // 変更
  onLogout,
}: TopHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-700 shadow-sm">
      <div className="flex justify-end items-center gap-3 px-4 py-3">
        <button
          onClick={onMyPage} // 変更
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          マイページ
        </button>
        <button
          onClick={onLogout}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}