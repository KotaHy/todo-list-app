export interface Task {
    id: string;
    text: string;
  }
  
  export interface TasksByDate {
    [key: string]: Task[];
  }
  
  export interface CalendarDay {
    date: number | null;
    isCurrentMonth: boolean;
    dateKey: string;
  }