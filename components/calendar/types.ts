export interface Task {
  id: number; // numeric に合わせて number
  task_name: string; // text から task_name
  status?: number; // numeric, null 許可
  users_id?: number; // numeric, null 許可
  note?: string | null; // メモ
  created_at?: string; // DBのデフォルト値を使用する場合、オプショナルにする
  updated_at?: string;
  task_date: string; // timestamp without time zone null, YYYY-MM-DD 形式
  assignee_name?: string; // フロントエンド表示用
}

export interface TasksByDate {
  [key: string]: Task[];
}

export interface CalendarDay {
  date: number | null;
  isCurrentMonth: boolean;
  dateKey: string; // YYYY-MM-DD 形式
}

export interface User {
  id: number; // mt_users の id が numeric なら number
  user_name: string;
}