import { Task } from "./types";

interface CalendarCellProps {
  day: {
    date: number | null;
    isCurrentMonth: boolean;
    dateKey: string;
  };
  tasks: Task[];
  isToday: boolean;
  onDateClick: (dateKey: string) => void;
}

export default function CalendarCell({
  day,
  tasks,
  isToday,
  onDateClick,
}: CalendarCellProps) {
  if (day.date === null) {
    return (
      <div className="min-h-[100px] border border-transparent rounded-md" />
    );
  }

  return (
    <div
      className={`
        min-h-[100px] border rounded-md p-1
        ${
          day.isCurrentMonth
            ? isToday
              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 cursor-pointer"
              : "border-zinc-300 dark:border-zinc-700 hover:border-blue-400 cursor-pointer"
            : "border-zinc-200 dark:border-zinc-800 opacity-50 cursor-not-allowed" // 次月はクリック不可に
        }
      `}
      onClick={() => day.isCurrentMonth && onDateClick(day.dateKey)} // 今月の日付のみクリック可能に
    >
      <div
        className={`
          text-sm font-semibold mb-1
          ${
            day.isCurrentMonth
              ? isToday
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-800 dark:text-zinc-100"
              : "text-zinc-400 dark:text-zinc-600"
          }
        `}
      >
        {day.date}
      </div>
      {day.isCurrentMonth && tasks.length > 0 && (
        <ul className="text-xs space-y-0.5">
          {tasks.slice(0, 3).map((task) => (
            <li
              key={task.id}
              className="text-zinc-700 dark:text-zinc-300 truncate"
            >
              • {task.task_name} {/* task.text から task.task_name に変更 */}
            </li>
          ))}
          {tasks.length > 3 && (
            <li className="text-zinc-500 dark:text-zinc-500">
              +{tasks.length - 3}件
            </li>
          )}
        </ul>
      )}
    </div>
  );
}