import { Task, PriorityColorConfig, AppSettings, TaskStatus, AppNotification } from './types';

export const DEFAULT_PRIORITY_COLORS: PriorityColorConfig = {
  low: {
    bg: '#ecfdf5',     // Tailwind emerald-50
    text: '#047857',   // Tailwind emerald-700
    border: '#a7f3d0'  // Tailwind emerald-200
  },
  medium: {
    bg: '#fffbeb',     // Tailwind amber-50
    text: '#b45309',   // Tailwind amber-700
    border: '#fde68a'  // Tailwind amber-200
  },
  high: {
    bg: '#fef2f2',     // Tailwind red-50
    text: '#b91c1c',   // Tailwind red-700
    border: '#fca5a5'  // Tailwind red-200
  }
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Hoàn thiện tài liệu PRD ứng dụng Ghi Chú',
    startDate: '2026-06-24',
    endDate: '2026-06-25',
    notes: 'Viết PRD chi tiết bao gồm mục tiêu, phạm vi chức năng, lộ trình phát triển và các yêu cầu kỹ thuật chi tiết.',
    priority: 'high',
    completed: true,
    status: 'done',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Phát triển giao diện ứng dụng React',
    startDate: '2026-06-24',
    endDate: '2026-06-27',
    notes: 'Xây dựng giao diện tối giản, tối ưu chế độ tối sáng, tích hợp bộ lọc công việc nâng cao và khả năng tùy chỉnh màu sắc mức độ ưu tiên.',
    priority: 'medium',
    completed: false,
    status: 'doing',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'Đóng gói ứng dụng chạy offline với Electron',
    startDate: '2026-06-28',
    endDate: '2026-06-30',
    notes: 'Cấu hình Electron main.js và package.json để đóng gói mã nguồn React thành ứng dụng Desktop chạy offline hoàn chỉnh.',
    priority: 'low',
    completed: false,
    status: 'todo',
    createdAt: new Date().toISOString()
  }
];

export function getStoredTasks(): Task[] {
  const data = localStorage.getItem('local_task_manager_tasks');
  let tasks: Task[] = [];
  if (!data) {
    tasks = INITIAL_TASKS;
    localStorage.setItem('local_task_manager_tasks', JSON.stringify(tasks));
  } else {
    try {
      tasks = JSON.parse(data);
    } catch (e) {
      console.error('Lỗi phân tích dữ liệu công việc:', e);
      tasks = INITIAL_TASKS;
    }
  }

  // Chuẩn hóa dữ liệu cũ để đảm bảo có trường status
  const normalizedTasks: Task[] = tasks.map(t => {
    if (!t.status) {
      return {
        ...t,
        status: (t.completed ? 'done' : 'todo') as TaskStatus
      };
    }
    return t;
  });

  return normalizedTasks;
}

export function saveStoredTasks(tasks: Task[]) {
  localStorage.setItem('local_task_manager_tasks', JSON.stringify(tasks));
}

export function getStoredSettings(): AppSettings {
  const data = localStorage.getItem('local_task_manager_settings');
  const defaultSettings: AppSettings = {
    theme: 'dark',
    priorityColors: DEFAULT_PRIORITY_COLORS
  };
  
  if (!data) {
    return defaultSettings;
  }
  try {
    const parsed = JSON.parse(data);
    return {
      theme: parsed.theme || 'dark',
      priorityColors: {
        low: { ...DEFAULT_PRIORITY_COLORS.low, ...parsed.priorityColors?.low },
        medium: { ...DEFAULT_PRIORITY_COLORS.medium, ...parsed.priorityColors?.medium },
        high: { ...DEFAULT_PRIORITY_COLORS.high, ...parsed.priorityColors?.high }
      }
    };
  } catch (e) {
    console.error('Lỗi cấu hình cài đặt:', e);
    return defaultSettings;
  }
}

export function saveStoredSettings(settings: AppSettings) {
  localStorage.setItem('local_task_manager_settings', JSON.stringify(settings));
}

export function formatVietnameseDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function exportTasksToJSON(tasks: Task[], priorityColors: PriorityColorConfig) {
  const dataToExport = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    tasks,
    settings: {
      priorityColors
    }
  };
  
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `sao-luu-cong-viec-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Synthesize a pleasant bell chime using Web Audio API (completely offline-friendly)
export function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Tone 1: C5 (523.25 Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.4);
    
    // Tone 2: E5 (659.25 Hz) after 120ms delay
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.52);
    
    osc2.start(audioCtx.currentTime + 0.12);
    osc2.stop(audioCtx.currentTime + 0.52);
  } catch (e) {
    console.warn('Web Audio API not supported or blocked by browser policy:', e);
  }
}

// Calculate the trigger time for notification (1 day before endDate at 17:00)
export function getNotificationTriggerTime(endDateStr: string): Date | null {
  if (!endDateStr) return null;
  const parts = endDateStr.split('-');
  if (parts.length !== 3) return null;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const day = parseInt(parts[2], 10);
  
  const triggerDate = new Date(year, month, day);
  // Subtract one day
  triggerDate.setDate(triggerDate.getDate() - 1);
  // Set time to 17:00:00 (5:00 PM)
  triggerDate.setHours(17, 0, 0, 0);
  
  return triggerDate;
}

// Get notification history from localStorage
export function getStoredNotifications(): AppNotification[] {
  const data = localStorage.getItem('local_task_manager_notifications');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Loi doc danh sach thong bao:', e);
    return [];
  }
}

// Save notification history to localStorage
export function saveStoredNotifications(notifications: AppNotification[]) {
  localStorage.setItem('local_task_manager_notifications', JSON.stringify(notifications));
}

// Get already notified task IDs to prevent duplicate alerts
export function getStoredNotifiedTaskIds(): string[] {
  const data = localStorage.getItem('local_task_manager_notified_ids');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Loi doc danh sach ID da thong bao:', e);
    return [];
  }
}

// Save already notified task IDs to localStorage
export function saveStoredNotifiedTaskIds(ids: string[]) {
  localStorage.setItem('local_task_manager_notified_ids', JSON.stringify(ids));
}

// Compress and resize images using canvas to avoid localStorage overflow (max 500px dimension, jpeg 0.7)
export function compressAndResizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Define max dimension
        const MAX_DIM = 500;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as JPEG with 0.7 quality to achieve great compression (approx 15KB - 30KB)
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64);
        } else {
          reject(new Error('Cannot get canvas 2d context'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
