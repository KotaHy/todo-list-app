import { Task } from "./types";

interface TaskFormProps {
  selectedDate: string;
  tasks: Task[];
  newTaskText: string;
  onTaskTextChange: (text: string) => void;
  onAddTask: () => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskForm({
  selectedDate,
  tasks,
  newTaskText,
  onTaskTextChange,
  onAddTask,
  onDeleteTask,
}: TaskFormProps) {
  return (
    <div className="border-t border-zinc-300 dark:border-zinc-700 pt-4">
      <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-3">
        {selectedDate} のタスク
      </h3>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => onTaskTextChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onAddTask();
            }
          }}
          placeholder="タスクを入力"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          onClick={onAddTask}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          追加
        </button>
      </div>
      {tasks.length > 0 && (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 rounded-md px-3 py-2"
            >
              <span className="text-sm text-zinc-800 dark:text-zinc-100">
                • {task.text}
              </span>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-red-500 hover:text-red-700 text-sm"
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