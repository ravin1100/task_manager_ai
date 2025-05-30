export interface Task {
  id?: number;
  title: string;
  description?: string;
  assignee: string;
  due_date: string; // ISO date string
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  created_at?: string;
  updated_at?: string;
  status: 'todo' | 'in_progress' | 'done';
  type: 'manual' | 'transcript'; // Differentiates between manual and transcript tasks
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface TaskDistribution {
  manual: number;
  transcript: number;
}

export interface DailyTaskCount {
  date: string;
  count: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
  }>;
  completionData: Array<{
    name: string;
    value: number;
  }>;
  taskDistribution: Array<{
    name: string;
    value: number;
  }>;
  dailyTaskCounts: Array<{
    date: string;
    count: number;
  }>;
  taskStats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
}
