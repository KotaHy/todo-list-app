"use client";

"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
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
  const [newTaskNote, setNewTaskNote] = useState("");
  const [selectedAssigneeName, setSelectedAssigneeName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false); // isLoading ステートを追加
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

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

      try {
        const res = await fetch(`/api/tasks?year=${year}&month=${month}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.tasks.length > 0) {
            const tasksByDate: TasksByDate = {};
            data.tasks.forEach((task: Task) => {
              const formattedDateKey = format(new Date(task.task_date), 'yyyy-MM-dd'); // ここを修正
              if (!tasksByDate[formattedDateKey]) {
                tasksByDate[formattedDateKey] = [];
              }
              tasksByDate[formattedDateKey].push({
                ...task,
                assignee_name: users.find(u => u.id === task.users_id)?.user_name || undefined,
              });
            });
            setTasks(tasksByDate);
          } else if (!data.success) {
            console.error(`Failed to fetch tasks for ${year}-${month}:`, data.message);
          } else { // data.tasks が空の場合
            setTasks({}); // タスクがない場合は空のオブジェクトを設定
          }
        } else {
          console.error(`Failed to fetch tasks for ${year}-${month}:`, res.statusText);
        }
      } catch (error) {
        console.error(`Error fetching tasks for ${year}-${month}:`, error);
      } finally {
        setIsLoading(false); // フェッチ完了時にローディングをfalseに
      }
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
    setNewTaskNote("");
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
      note: newTaskNote.trim() || null,
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
          note: newTaskNote.trim() || undefined,
        };

        setTasks((prev) => ({
          ...prev,
          [selectedDate]: [...(prev[selectedDate] || []), newTask],
        }));

        setNewTaskText("");
        setNewTaskNote("");
        setSelectedAssigneeName("");
      } else {
        const errorData = await res.json();
        console.error("Failed to add task:", errorData.message);
        setModalMessage("タスクの追加に失敗しました: " + errorData.message);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      setModalMessage("タスクの追加中にエラーが発生しました。");
      setShowModal(true);
    }
  };

  const handleEditTask = async (
    taskId: number,
    data: { task_name: string; note: string | null; users_id: number | null; assignee_name: string | undefined }
  ) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, task_name: data.task_name, note: data.note, users_id: data.users_id }),
      });

      if (res.ok) {
        setTasks((prev) => {
          const updated = { ...prev };
          for (const dateKey in updated) {
            updated[dateKey] = updated[dateKey].map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    task_name: data.task_name,
                    note: data.note,
                    users_id: data.users_id ?? undefined,
                    assignee_name: data.assignee_name,
                  }
                : t
            );
          }
          return updated;
        });
      } else {
        const errorData = await res.json();
        setModalMessage("タスクの更新に失敗しました: " + errorData.message);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error editing task:", error);
      setModalMessage("タスクの更新中にエラーが発生しました。");
      setShowModal(true);
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
        setModalMessage("タスクの削除に失敗しました: " + errorData.message);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      setModalMessage("タスクの削除中にエラーが発生しました。");
      setShowModal(true);
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
              newTaskNote={newTaskNote}
              selectedAssignee={selectedAssigneeName}
              onTaskTextChange={setNewTaskText}
              onTaskNoteChange={setNewTaskNote}
              onAssigneeChange={setSelectedAssigneeName}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />
          </div>
        )}
      </div>

      {/* エラーモーダル */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-50 mb-2">
                エラー
              </h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                {modalMessage}
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
