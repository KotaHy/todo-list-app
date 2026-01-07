"use client";

"use client";

import { useState, useEffect } from "react";
import { CalendarDay, Task, TasksByDate, User } from "./types";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import TaskForm from "./TaskForm";
import LoadingCalendar from "./LoadingCalendar"; // LoadingCalendarをインポート

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<TasksByDate>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedAssigneeName, setSelectedAssigneeName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false); // isLoading ステートを追加

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users.map((u: any) => ({ ...u, id: Number(u.id) })));
        }
      })
      .catch(err => console.error("Failed to fetch users:", err));
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true); // フェッチ開始時にローディングをtrueに
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // getMonth() は0から始まるため+1
      const firstDayOfMonth = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0);

      const tasksByDate: TasksByDate = {};

      for (let d = firstDayOfMonth; d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        try {
          const res = await fetch(`/api/tasks?task_date=${dateKey}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.tasks.length > 0) {
              tasksByDate[dateKey] = data.tasks.map((task: Task) => ({
                ...task,
                assignee_name: users.find(u => u.id === task.users_id)?.user_name || undefined,
              }));
            } else if (!data.success) {
              console.error(`Failed to fetch tasks for ${dateKey}:`, data.message);
            }
          } else {
            console.error(`Failed to fetch tasks for ${dateKey}:`, res.statusText);
          }
        } catch (error) {
          console.error(`Error fetching tasks for ${dateKey}:`, error);
        }
      }
      setTasks(tasksByDate);
      setIsLoading(false); // フェッチ完了時にローディングをfalseに
    };
    fetchTasks();
  }, [currentDate, users]); // currentDate と users が変更されたときに再フェッチ

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0:日, 6:土

  const calendarDays: CalendarDay[] = [];

  // 前月の日付を埋める
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonthLastDay - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    calendarDays.push({
      date,
      isCurrentMonth: false,
      dateKey: `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`,
    });
  }

  // 今月の日付
  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    calendarDays.push({
      date: i,
      isCurrentMonth: true,
      dateKey,
    });
  }

  // 次月の日付を埋める (土曜日まで完全に表示)
  const totalCells = calendarDays.length;
  const remainingCells = 7 - (totalCells % 7);
  if (remainingCells < 7) { // 週が完全でない場合のみ
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      calendarDays.push({
        date: i,
        isCurrentMonth: false,
        dateKey: `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }
  }


  const handleDateClick = (dateKey: string) => {
    if (!dateKey) return;
    setSelectedDate(dateKey);
    setNewTaskText("");
    setSelectedAssigneeName("");
  };

  const handleAddTask = async () => {
    if (!selectedDate || !newTaskText.trim()) return;

    let users_id: number | null = null;
    if (selectedAssigneeName) {
      const assigneeUser = users.find(user => user.user_name === selectedAssigneeName);
      if (assigneeUser) {
        users_id = assigneeUser.id;
      }
    }

    const taskData = {
      task_date: selectedDate,
      task_name: newTaskText.trim(),
      users_id: users_id,
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        const responseData = await res.json();
        const newTask: Task = {
          ...responseData.task,
          assignee_name: selectedAssigneeName,
        };

        setTasks((prev) => ({
          ...prev,
          [selectedDate]: [...(prev[selectedDate] || []), newTask],
        }));

        setNewTaskText("");
        setSelectedAssigneeName("");
      } else {
        const errorData = await res.json();
        console.error("Failed to add task:", errorData.message);
        alert("タスクの追加に失敗しました: " + errorData.message);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      alert("タスクの追加中にエラーが発生しました。");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!selectedDate) return;

    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTasks((prev) => ({
          ...prev,
          [selectedDate]: prev[selectedDate]?.filter((t) => t.id !== taskId) || [],
        }));
      } else {
        const errorData = await res.json();
        console.error("Failed to delete task:", errorData.message);
        alert("タスクの削除に失敗しました: " + errorData.message);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("タスクの削除中にエラーが発生しました。");
    }
  };

  return (
    <div className="w-full max-w-6xl bg-white rounded-xl shadow-md dark:bg-zinc-900 p-6">
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 pb-4">
            <CalendarHeader
              year={year}
              month={month}
              onPreviousMonth={() => {
                setCurrentDate(new Date(year, month - 1, 1));
                setSelectedDate(null);
              }}
              onNextMonth={() => {
                setCurrentDate(new Date(year, month + 1, 1));
                setSelectedDate(null);
              }}
            />
          </div>
          {isLoading ? (
            <LoadingCalendar />
          ) : (
            <CalendarGrid
              calendarDays={calendarDays}
              tasks={tasks}
              currentYear={year}
              currentMonth={month}
              onDateClick={handleDateClick}
            />
          )}
        </div>

        {selectedDate && (
          <div className="w-80 shrink-0">
            <TaskForm
              selectedDate={selectedDate}
              tasks={tasks[selectedDate] || []}
              users={users}
              newTaskText={newTaskText}
              selectedAssignee={selectedAssigneeName}
              onTaskTextChange={setNewTaskText}
              onAssigneeChange={setSelectedAssigneeName}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        )}
      </div>
    </div>
  );
}
