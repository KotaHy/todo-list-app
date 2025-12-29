"use client";

import { useState } from "react";
import { CalendarDay, Task, TasksByDate } from "./types";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import TaskForm from "./TaskForm";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<TasksByDate>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 月の最初の日と最後の日を取得
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // カレンダーの日付配列を作成
  const calendarDays: CalendarDay[] = [];

  // 1. 前月の日付を埋める
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, date);
    calendarDays.push({
      date,
      isCurrentMonth: false,
      dateKey: `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`,
    });
  }

  // 2. 今月の日付
  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    calendarDays.push({
      date: i,
      isCurrentMonth: true,
      dateKey,
    });
  }

  // 3. 次月の日付で「その週の土曜日まで」を埋める
  // 配列の長さが7の倍数になるまで、翌月の日付を追加します
  if (calendarDays.length % 7 !== 0) {
    const remainingDays = 7 - (calendarDays.length % 7);

    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      const y = nextDate.getFullYear();
      const m = nextDate.getMonth() + 1;
      const d = nextDate.getDate();
      
      calendarDays.push({
        date: d,
        isCurrentMonth: false, // 翌月分なので false
        dateKey: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }
  }

  const handleDateClick = (dateKey: string) => {
    if (!dateKey) return;
    setSelectedDate(dateKey);
    setNewTaskText("");
  };

  const handleAddTask = () => {
    if (!selectedDate || !newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
    };

    setTasks((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newTask],
    }));

    setNewTaskText("");
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedDate) return;
    setTasks((prev) => ({
      ...prev,
      [selectedDate]: prev[selectedDate]?.filter((task) => task.id !== taskId) || [],
    }));
  };

  return (
    <div className="w-full max-w-6xl bg-white rounded-xl shadow-md dark:bg-zinc-900 p-6">
      <div className="flex gap-6">
        {/* 左側: カレンダー */}
        <div className="flex-1">
          <CalendarHeader
            year={year}
            month={month}
            onPreviousMonth={() => setCurrentDate(new Date(year, month - 1, 1))}
            onNextMonth={() => setCurrentDate(new Date(year, month + 1, 1))}
          />
          <CalendarGrid
            calendarDays={calendarDays}
            tasks={tasks}
            currentYear={year}
            currentMonth={month}
            onDateClick={handleDateClick}
          />
        </div>

        {/* 右側: タスクフォーム */}
        {selectedDate && (
          <div className="w-80 flex-shrink-0">
            <TaskForm
              selectedDate={selectedDate}
              tasks={tasks[selectedDate] || []}
              newTaskText={newTaskText}
              onTaskTextChange={setNewTaskText}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        )}
      </div>
    </div>
  );
}