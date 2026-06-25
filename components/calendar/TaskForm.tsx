import { useState } from "react";
import { Task, User } from "./types";

interface TaskFormProps {
  selectedDate: string;
  tasks: Task[];
  users: User[];
  newTaskText: string;
  newTaskNote: string;
  selectedAssignee: string;
  onTaskTextChange: (text: string) => void;
  onTaskNoteChange: (text: string) => void;
  onAssigneeChange: (assignee: string) => void;
  onAddTask: () => void;
  onDeleteTask: (taskId: number) => void;
  onEditTask: (
    taskId: number,
    data: { task_name: string; note: string | null; users_id: number | null; assignee_name: string | undefined }
  ) => void;
}

export default function TaskForm({
  selectedDate,
  tasks,
  users,
  newTaskText,
  newTaskNote,
  selectedAssignee,
  onTaskTextChange,
  onTaskNoteChange,
  onAssigneeChange,
  onAddTask,
  onDeleteTask,
  onEditTask,
}: TaskFormProps) {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editAssignee, setEditAssignee] = useState("");

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.task_name);
    setEditNote(task.note ?? "");
    setEditAssignee(task.assignee_name ?? "");
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
  };

  const saveEdit = (taskId: number) => {
    if (!editText.trim()) return;
    const assigneeUser = users.find((u) => u.user_name === editAssignee);
    onEditTask(taskId, {
      task_name: editText.trim(),
      note: editNote.trim() || null,
      users_id: assigneeUser?.id ?? null,
      assignee_name: assigneeUser?.user_name,
    });
    setEditingTaskId(null);
  };

  return (
    <div className="pt-4">
      <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-3">
        {selectedDate} のタスク
      </h3>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => onTaskTextChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") onAddTask();
            }}
            placeholder="タスク内容を入力"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <textarea
            value={newTaskNote}
            onChange={(e) => onTaskNoteChange(e.target.value)}
            placeholder="メモ（任意）"
            rows={2}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 resize-none"
          />
          <div className="flex gap-2">
            <select
              value={selectedAssignee}
              onChange={(e) => onAssigneeChange(e.target.value)}
              className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="">担当者を選択（未設定）</option>
              {users.map((user) => (
                <option key={user.id} value={user.user_name}>
                  {user.user_name}
                </option>
              ))}
            </select>

            <button
              onClick={onAddTask}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              追加
            </button>
          </div>
        </div>
      </div>

      {tasks.length > 0 && (
        <ul className="space-y-2">
          {tasks.map((task) =>
            editingTaskId === task.id ? (
              <li
                key={task.id}
                className="flex flex-col gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-md px-3 py-3 border border-blue-400 dark:border-blue-500"
              >
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") saveEdit(task.id);
                  }}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="メモ（任意）"
                  rows={2}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 resize-none"
                />
                <select
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="">担当者を選択（未設定）</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.user_name}>
                      {user.user_name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={cancelEdit}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => saveEdit(task.id)}
                    className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    保存
                  </button>
                </div>
              </li>
            ) : (
              <li
                key={task.id}
                className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 rounded-md px-3 py-2 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-zinc-800 dark:text-zinc-100 font-medium">
                    • {task.task_name}
                  </span>
                  {task.assignee_name && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 ml-3">
                      担当: {task.assignee_name}
                    </span>
                  )}
                  {task.note && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 ml-3">
                      メモ: {task.note}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <button
                    onClick={() => startEdit(task)}
                    className="rounded-md border border-blue-400 px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="rounded-md border border-red-400 px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    削除
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
