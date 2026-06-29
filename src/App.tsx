import { useState, useEffect, useMemo } from 'react';
import { Task, Priority, PriorityColorConfig, FilterStatus, FilterPriority, AppSettings, TaskStatus, AppNotification } from './types';
import { 
  getStoredTasks, 
  saveStoredTasks, 
  getStoredSettings, 
  saveStoredSettings,
  playNotificationSound,
  getNotificationTriggerTime,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredNotifiedTaskIds,
  saveStoredNotifiedTaskIds
} from './utils';
import ThemeToggle from './components/ThemeToggle';
import ColorCustomizer from './components/ColorCustomizer';
import BackupRestore from './components/BackupRestore';
import Statistics from './components/Statistics';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import DesktopGuide from './components/DesktopGuide';
import { Search, SlidersHorizontal, ListTodo, ArrowUpDown, FileClock, Sparkles, Bell, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- States ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    priorityColors: getStoredSettings().priorityColors,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [sortBy, setSortBy] = useState<'endDate' | 'priority' | 'createdAt'>('endDate');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifiedTaskIds, setNotifiedTaskIds] = useState<string[]>([]);

  // --- Effects ---
  // Load tasks & settings on mount
  useEffect(() => {
    setTasks(getStoredTasks());
    setSettings(getStoredSettings());
    setNotifications(getStoredNotifications());
    setNotifiedTaskIds(getStoredNotifiedTaskIds());
  }, []);

  // Update theme class on document element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredSettings(settings);
  }, [settings.theme, settings]);

  // Persist tasks on change
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveStoredTasks(newTasks);
  };

  // Background check for notifications every 10 seconds
  useEffect(() => {
    // Request notification permission on mount if not yet decided
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkNotifications = () => {
      const now = new Date();
      let updatedNotified = [...notifiedTaskIds];
      let newNotificationsAdded: AppNotification[] = [];
      let hasNewTrigger = false;

      tasks.forEach((task) => {
        // Skip if task is completed
        const currentStatus = task.status || (task.completed ? 'done' : 'todo');
        if (currentStatus === 'done') return;

        const triggerTime = getNotificationTriggerTime(task.endDate);
        if (!triggerTime) return;

        // Check if it's time to trigger AND we haven't notified for this task yet
        if (now >= triggerTime && !updatedNotified.includes(task.id)) {
          hasNewTrigger = true;
          updatedNotified.push(task.id);

          const notificationMsg = `Công việc "${task.title}" sắp đến hạn chót (hạn chót: ${task.endDate}). Hãy kiểm tra và hoàn thành nhé!`;
          
          const newNotification: AppNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            taskId: task.id,
            taskTitle: task.title,
            message: notificationMsg,
            triggerTime: triggerTime.toISOString(),
            read: false,
            createdAt: new Date().toISOString()
          };

          newNotificationsAdded.push(newNotification);

          // Native desktop notification via Electron / browser API
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('Sổ Ghi Chú - Hạn Chót!', {
                body: notificationMsg,
                icon: './favicon.ico'
              });
            } catch (e) {
              console.error('Lỗi khi hiển thị thông báo hệ thống:', e);
            }
          }
        }
      });

      if (hasNewTrigger && newNotificationsAdded.length > 0) {
        // Play sound
        playNotificationSound();
        
        // Update state & storage
        const allNotifications = [...newNotificationsAdded, ...notifications];
        setNotifications(allNotifications);
        saveStoredNotifications(allNotifications);
        
        setNotifiedTaskIds(updatedNotified);
        saveStoredNotifiedTaskIds(updatedNotified);
      }
    };

    // Run check immediately
    checkNotifications();

    const intervalId = setInterval(checkNotifications, 10000); // check every 10 seconds
    return () => clearInterval(intervalId);
  }, [tasks, notifications, notifiedTaskIds]);

  const handleMarkAsRead = (notifId: string) => {
    const updated = notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    saveStoredNotifications([]);
  };

  const handleViewTask = (taskId: string, notifId: string) => {
    handleMarkAsRead(notifId);
    setShowNotificationsDropdown(false);
    
    // Scroll to the task item in the list
    setTimeout(() => {
      const el = document.getElementById(`task-item-${taskId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary highlight class or border flash
        el.classList.add('ring-2', 'ring-purple-500');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-purple-500');
        }, 3000);
      }
    }, 100);
  };

  // --- Handlers ---
  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const handleUpdatePriorityColors = (updatedColors: PriorityColorConfig) => {
    setSettings((prev) => ({
      ...prev,
      priorityColors: updatedColors,
    }));
  };

  const handleCreateOrUpdateTask = (taskData: {
    title: string;
    startDate: string;
    endDate: string;
    notes: string;
    priority: Priority;
    status: TaskStatus;
    nextSteps: string;
    nextStepsImage?: string;
    notesImage?: string;
  }) => {
    const isCompleted = taskData.status === 'done';
    if (editingTask) {
      // Editing
      const updated = tasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: taskData.title,
              startDate: taskData.startDate,
              endDate: taskData.endDate,
              notes: taskData.notes,
              priority: taskData.priority,
              status: taskData.status,
              nextSteps: taskData.nextSteps,
              nextStepsImage: taskData.nextStepsImage,
              notesImage: taskData.notesImage,
              completed: isCompleted,
            }
          : t
      );
      updateTasks(updated);
      setEditingTask(null);
    } else {
      // Creating new
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: taskData.title,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        notes: taskData.notes,
        priority: taskData.priority,
        status: taskData.status,
        nextSteps: taskData.nextSteps,
        nextStepsImage: taskData.nextStepsImage,
        notesImage: taskData.notesImage,
        completed: isCompleted,
        createdAt: new Date().toISOString(),
      };
      updateTasks([newTask, ...tasks]);
    }
  };

  const handleToggleComplete = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const currentVal = t.status || (t.completed ? 'done' : 'todo');
        const isNowCompleted = currentVal !== 'done';
        return {
          ...t,
          completed: isNowCompleted,
          status: (isNowCompleted ? 'done' : 'todo') as TaskStatus,
        };
      }
      return t;
    });
    updateTasks(updated);
  };

  const handleChangeStatus = (id: string, newStatus: TaskStatus) => {
    const updated = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            status: newStatus,
            completed: newStatus === 'done',
          }
        : t
    );
    updateTasks(updated);
  };

  const handleUpdateNextSteps = (id: string, nextSteps: string, nextStepsImage?: string) => {
    const updated = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            nextSteps,
            nextStepsImage: nextStepsImage !== undefined ? nextStepsImage : t.nextStepsImage
          }
        : t
    );
    updateTasks(updated);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    // Smooth scroll to form on mobile
    document.getElementById('task-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    updateTasks(updated);
    if (editingTask && editingTask.id === id) {
      setEditingTask(null);
    }
  };

  const handleImportData = (importedTasks: Task[], importedColors?: PriorityColorConfig, merge?: boolean) => {
    let finalTasks: Task[] = [];
    if (merge) {
      // Avoid duplicate IDs
      const existingIds = new Set(tasks.map((t) => t.id));
      const deduplicatedImported = importedTasks.map((t) => {
        if (existingIds.has(t.id)) {
          return { ...t, id: `task-imported-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
        }
        return t;
      });
      finalTasks = [...deduplicatedImported, ...tasks];
    } else {
      finalTasks = importedTasks;
    }

    updateTasks(finalTasks);

    if (importedColors) {
      handleUpdatePriorityColors(importedColors);
    }
  };

  const handleClearAllTasks = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ công việc hiện tại không? Hành động này không thể hoàn tác.')) {
      updateTasks([]);
      setEditingTask(null);
    }
  };

  // --- Filtering and Sorting Logic ---
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Text Search
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(query) || t.notes.toLowerCase().includes(query)
      );
    }

    // 2. Status Filter
    if (filterStatus === 'completed' || filterStatus === 'done') {
      result = result.filter((t) => (t.status || (t.completed ? 'done' : 'todo')) === 'done');
    } else if (filterStatus === 'pending') {
      result = result.filter((t) => (t.status || (t.completed ? 'done' : 'todo')) !== 'done');
    } else if (filterStatus !== 'all') {
      result = result.filter((t) => (t.status || (t.completed ? 'done' : 'todo')) === filterStatus);
    }

    // 3. Priority Filter
    if (filterPriority !== 'all') {
      result = result.filter((t) => t.priority === filterPriority);
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === 'endDate') {
        // Empty dates sorted last
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return a.endDate.localeCompare(b.endDate);
      }
      
      if (sortBy === 'createdAt') {
        return b.createdAt.localeCompare(a.createdAt); // newest first
      }

      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority]; // highest weight first
      }

      return 0;
    });

    return result;
  }, [tasks, searchTerm, filterStatus, filterPriority, sortBy]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020b18] via-[#051429] to-[#010710] dark:from-[#020b18] dark:via-[#051429] dark:to-[#010710] text-slate-100 dark:text-slate-100 transition-colors duration-200 font-sans pb-16">
      
      {/* HEADER SECTION */}
      <header className="border-b border-slate-200/10 dark:border-[#0f3161]/80 bg-[#020b18]/60 dark:bg-[#020b18]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 transition-transform hover:scale-105 duration-200">
              <ListTodo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Sổ Ghi Chú Công Việc
                <span className="text-[10px] font-bold text-purple-450 bg-purple-950/40 border border-purple-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  Offline Node
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Bento Dashboard • Hoạt động hoàn toàn ngoại tuyến
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-2.5 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-100/10 hover:bg-slate-100/20 text-slate-100 dark:bg-[#071329] dark:hover:bg-[#0c203f] dark:text-slate-100 border border-slate-200/10 dark:border-[#0f3161] cursor-pointer flex items-center justify-center shadow-xs relative"
                title="Thông báo hạn chót"
              >
                {unreadCount > 0 ? (
                  <BellRing className="w-5 h-5 text-purple-500 animate-swing" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                     {unreadCount}
                  </span>
                )}
              </button>
 
              <AnimatePresence>
                {showNotificationsDropdown && (
                  <motion.div
                    id="notification-dropdown-panel"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#071329] border border-slate-200/10 dark:border-[#0f3161] rounded-3xl shadow-2xl p-4 z-50 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-850 dark:text-white">
                        <Bell className="w-4 h-4 text-sky-500" />
                        <span>Thông báo hạn chót</span>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAllNotifications}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 cursor-pointer uppercase tracking-wider"
                        >
                          Xóa tất cả
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-2xl border text-xs leading-relaxed space-y-2 transition-all ${
                              notif.read
                                ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-900/50 opacity-70'
                                : 'bg-sky-50/15 dark:bg-sky-950/10 border-sky-100/30 dark:border-sky-900/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className={`font-semibold ${notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {notif.message}
                              </p>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-sky-500 rounded-full shrink-0 mt-1.5"></span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 dark:text-slate-500">
                              <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}</span>
                              <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                                <button
                                  onClick={() => handleViewTask(notif.taskId, notif.id)}
                                  className="text-sky-600 hover:text-sky-500 dark:text-sky-400 cursor-pointer"
                                >
                                  Xem
                                </button>
                                {!notif.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notif.id)}
                                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                                  >
                                    Đọc
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                          Không có thông báo nào.
                        </div>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="w-full text-center py-2 text-[10px] font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400 border-t border-slate-100 dark:border-slate-800/60 uppercase tracking-wider cursor-pointer"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ThemeToggle theme={settings.theme} onToggle={handleToggleTheme} />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT SIDEBAR (CONTROL & FORM PANEL) */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* Task Form Component */}
            <TaskForm
              onSubmit={handleCreateOrUpdateTask}
              editingTask={editingTask}
              onCancelEdit={() => setEditingTask(null)}
            />

            {/* Statistics */}
            <Statistics tasks={tasks} priorityColors={settings.priorityColors} />

            {/* Priority Colors Customizer */}
            <ColorCustomizer colors={settings.priorityColors} onChange={handleUpdatePriorityColors} />

            {/* Backup & Restore Utility */}
            <BackupRestore
              tasks={tasks}
              priorityColors={settings.priorityColors}
              onImport={handleImportData}
            />

            {/* Electron Packing Guide */}
            <DesktopGuide />

            {/* Reset Area */}
            {tasks.length > 0 && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleClearAllTasks}
                  className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-semibold hover:bg-rose-50/50 dark:hover:bg-rose-950/10 px-4 py-2 rounded-xl transition duration-150 cursor-pointer"
                >
                  Xóa tất cả công việc
                </button>
              </div>
            )}
          </section>

          {/* RIGHT MAIN (TASK LIST & FILTERS) */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* SEARCH & FILTERS BOX (BENTO STYLE) */}
            <div className="bg-white dark:bg-[#071329] border border-slate-200/10 dark:border-[#0f3161] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                <input
                  id="global-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm nhanh trong các công việc hoạt động..."
                  className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-200/10 dark:border-[#0f3161] rounded-2xl bg-slate-50 dark:bg-[#030e20] focus:bg-white dark:focus:bg-[#071329] focus:outline-none focus:ring-2 focus:ring-purple-500 transition dark:text-slate-200 placeholder:text-slate-500"
                />
              </div>

              {/* Filters grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                
                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
                    <span>Lọc trạng thái</span>
                  </label>
                  <select
                    id="status-filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200/10 dark:border-[#0f3161] rounded-xl bg-slate-50 dark:bg-[#030e20] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition cursor-pointer"
                  >
                    <option value="all">Tất cả công việc</option>
                    <option value="todo">Chờ làm (Chưa bắt đầu)</option>
                    <option value="doing">Đang làm</option>
                    <option value="paused">Tạm dừng</option>
                    <option value="done">Đã hoàn thành</option>
                    <option value="pending">Chưa xong (Tất cả)</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
                    <span>Mức ưu tiên</span>
                  </label>
                  <select
                    id="priority-filter-select"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200/10 dark:border-[#0f3161] rounded-xl bg-slate-50 dark:bg-[#030e20] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition cursor-pointer"
                  >
                    <option value="all">Tất cả mức độ</option>
                    <option value="high">Ưu tiên Cao</option>
                    <option value="medium">Ưu tiên Trung bình</option>
                    <option value="low">Ưu tiên Thấp</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-purple-500" />
                    <span>Sắp xếp theo</span>
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'endDate' | 'priority' | 'createdAt')}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200/10 dark:border-[#0f3161] rounded-xl bg-slate-50 dark:bg-[#030e20] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition cursor-pointer"
                  >
                    <option value="endDate">Ngày kết thúc gần nhất</option>
                    <option value="createdAt">Thời gian tạo (Mới nhất)</option>
                    <option value="priority">Độ ưu tiên cao nhất</option>
                  </select>
                </div>

              </div>

            </div>

            {/* TASK LIST TITLE & SUMMARY */}
            <div className="flex items-center justify-between px-3">
              <h3 className="text-sm font-bold text-slate-200 dark:text-slate-200 flex items-center gap-2">
                <span>Danh sách công việc bento</span>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-100 dark:border-purple-900/20">
                  {filteredAndSortedTasks.length} / {tasks.length}
                </span>
              </h3>
            </div>

            {/* ACTIVE TASKS CONTAINER */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredAndSortedTasks.length > 0 ? (
                  filteredAndSortedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      priorityColors={settings.priorityColors}
                      theme={settings.theme}
                      onToggleComplete={handleToggleComplete}
                      onChangeStatus={handleChangeStatus}
                      onUpdateNextSteps={handleUpdateNextSteps}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteTask}
                    />
                  ))
                ) : (
                  <motion.div
                    id="empty-task-placeholder"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="border border-dashed border-slate-200/10 dark:border-[#0f3161] rounded-3xl py-14 px-4 text-center space-y-3 bg-white/50 dark:bg-[#071329]/30 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#030e20] flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {tasks.length === 0
                          ? 'Chưa có công việc nào!'
                          : 'Không tìm thấy công việc phù hợp'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                        {tasks.length === 0
                          ? 'Bắt đầu thêm công việc đầu tiên ở bảng điều khiển bên trái để bắt đầu quản lý ngay nhé.'
                          : 'Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại các bộ lọc xem sao.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}
