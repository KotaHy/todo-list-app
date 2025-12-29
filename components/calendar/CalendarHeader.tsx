interface CalendarHeaderProps {
  year: number;
  month: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const monthNames = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月"
];

export default function CalendarHeader({
  year,
  month,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPreviousMonth}
        className="rounded-md px-3 py-1 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        ←
      </button>
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
        {year}年 {monthNames[month]}
      </h2>
      <button
        onClick={onNextMonth}
        className="rounded-md px-3 py-1 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        →
      </button>
    </div>
  );
}