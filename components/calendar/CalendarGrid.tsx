import { CalendarDay, Task } from "./types";
import CalendarCell from "./CalendarCell";

interface CalendarGridProps {
  calendarDays: CalendarDay[];
  tasks: { [key: string]: Task[] };
  currentYear: number;
  currentMonth: number;
  onDateClick: (dateKey: string) => void;
}

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarGrid({
  calendarDays,
  tasks,
  currentYear,
  currentMonth,
  onDateClick,
}: CalendarGridProps) {
  const today = new Date();

  const isToday = (date: number | null, isCurrentMonth: boolean) => {
    if (date === null) return false;
    return (
      isCurrentMonth &&
      date === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  return (
    <>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-zinc-600 dark:text-zinc-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((day, index) => (
          <CalendarCell
            key={index}
            day={day}
            tasks={tasks[day.dateKey] || []}
            isToday={isToday(day.date, day.isCurrentMonth)}
            onDateClick={onDateClick}
          />
        ))}
      </div>
    </>
  );
}