import { Task, User } from "./types";

interface TaskFormProps {
  selectedDate: string;
  tasks: Task[];
  users: User[];
  newTaskText: string;
  newTaskNote: string;
  selectedAssignee: string; // 選択された担当者名 (string)
  onTaskTextChange: (text: string) => void;
  onTaskNoteChange: (text: string) => void;
  onAssigneeChange: (assignee: string) => void;
  onAddTask: () => void;
  onDeleteTask: (taskId:number) => void;
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
}: TaskFormProps) {
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
                <option key={user.id} value={user.user_name}> {/* ここを修正 */}
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
          {tasks.map((task) => (
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
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-red-500 hover:text-red-700 text-sm ml-2"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}