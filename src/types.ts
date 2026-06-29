export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'paused' | 'done';

export interface Task {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  notes: string;
  priority: Priority;
  completed: boolean;
  status?: TaskStatus; // Optional to support backward compatibility, we will fallback 'done' if completed, else 'todo' or 'doing'
  nextSteps?: string;  // Content of what needs to be done next
  nextStepsImage?: string; // Base64 compressed image of progress
  notesImage?: string;     // Base64 compressed image of detailed notes
  createdAt: string;
}

export interface PriorityColorConfig {
  low: {
    bg: string;     // Hex color (e.g., "#d1fae5" or Tailwind equivalent)
    text: string;   // Hex color or custom tailwind representation
    border: string;
  };
  medium: {
    bg: string;
    text: string;
    border: string;
  };
  high: {
    bg: string;
    text: string;
    border: string;
  };
}

export type FilterStatus = 'all' | 'todo' | 'doing' | 'paused' | 'done' | 'completed' | 'pending';
export type FilterPriority = 'all' | Priority;

export interface AppSettings {
  theme: 'light' | 'dark';
  priorityColors: PriorityColorConfig;
}

export interface AppNotification {
  id: string;
  taskId: string;
  taskTitle: string;
  message: string;
  triggerTime: string;
  read: boolean;
  createdAt: string;
}

