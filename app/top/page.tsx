export default function TopPage() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-col items-center justify-center px-8 py-16 bg-white rounded-xl shadow-md dark:bg-zinc-900">
          <h1 className="mb-4 text-2xl font-semibold text-black dark:text-zinc-50">
            ログインしました
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            ようこそ、Topページです。
          </p>
        </main>
      </div>
    );
  }