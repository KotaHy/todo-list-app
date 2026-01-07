import React from 'react';

const LoadingCalendar: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] bg-white dark:bg-zinc-900 rounded-lg">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">カレンダーを読み込み中...</p>
      </div>
    </div>
  );
};

export default LoadingCalendar;

