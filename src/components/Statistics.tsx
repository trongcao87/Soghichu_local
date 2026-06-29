import { Task, PriorityColorConfig } from '../types';
import { CheckCircle2, Circle, Clock, Flame, SlidersHorizontal } from 'lucide-react';

interface StatisticsProps {
  tasks: Task[];
  priorityColors: PriorityColorConfig;
}

export default function Statistics({ tasks, priorityColors }: StatisticsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => (t.status || (t.completed ? 'done' : 'todo')) === 'done').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const lowPriorityCount = tasks.filter(t => t.priority === 'low').length;
  const mediumPriorityCount = tasks.filter(t => t.priority === 'medium').length;
  const highPriorityCount = tasks.filter(t => t.priority === 'high').length;

  const todoCount = tasks.filter(t => (t.status || (t.completed ? 'done' : 'todo')) === 'todo').length;
  const doingCount = tasks.filter(t => (t.status || (t.completed ? 'done' : 'todo')) === 'doing').length;
  const pausedCount = tasks.filter(t => (t.status || (t.completed ? 'done' : 'todo')) === 'paused').length;
  const doneCount = completedTasks;

  return (
    <div id="statistics-container" className="bg-white dark:bg-[#071329] border border-slate-200/10 dark:border-[#0f3161] rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500" />
          <span>Thống kê tiến độ</span>
        </h3>
        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/20 px-2.5 py-0.5 rounded-full">
          {completionRate}% hoàn thành
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-[#030e20] h-2 rounded-full overflow-hidden">
        <div
          className="bg-purple-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${completionRate}%` }}
        ></div>
      </div>

      {/* Core Counts */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="bg-slate-50 dark:bg-[#030e20] p-3 rounded-2xl text-center border border-slate-100/10 dark:border-[#0f3161]">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">Tổng số</span>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1 block">{totalTasks}</span>
        </div>
        <div className="bg-slate-50 dark:bg-[#030e20] p-3 rounded-2xl text-center border border-slate-100/10 dark:border-[#0f3161]">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider font-sans">Chưa xong</span>
          <span className="text-lg font-bold text-amber-500 mt-1 block flex items-center justify-center gap-1">
            <Circle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            {pendingTasks}
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-[#030e20] p-3 rounded-2xl text-center border border-slate-100/10 dark:border-[#0f3161]">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider font-sans">Đã xong</span>
          <span className="text-lg font-bold text-emerald-500 mt-1 block flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            {doneCount}
          </span>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="pt-3 border-t border-slate-100/10 dark:border-[#0f3161]/60 space-y-2.5">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
          Tình trạng xử lý:
        </span>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#030e20] rounded-xl border border-slate-100/10 dark:border-[#0f3161] font-medium">
            <span className="text-slate-500 dark:text-slate-400">Chờ làm:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{todoCount}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-sky-50/20 dark:bg-sky-950/10 rounded-xl border border-sky-100/50 dark:border-sky-900/20 font-medium">
            <span className="text-sky-600 dark:text-sky-400">Đang làm:</span>
            <span className="font-bold text-sky-700 dark:text-sky-300">{doingCount}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-amber-50/20 dark:bg-amber-950/10 rounded-xl border border-amber-100/50 dark:border-amber-900/20 font-medium">
            <span className="text-amber-600 dark:text-amber-400">Tạm dừng:</span>
            <span className="font-bold text-amber-700 dark:text-amber-300">{pausedCount}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20 font-medium">
            <span className="text-emerald-600 dark:text-emerald-400">Đã xong:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">{doneCount}</span>
          </div>
        </div>
      </div>

      {/* Priorities Distribution */}
      <div className="pt-3 border-t border-slate-100/10 dark:border-[#0f3161]/60 space-y-2.5">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-purple-500" />
          Phân bố độ ưu tiên:
        </span>
        
        <div className="space-y-2">
          {/* High Priority count */}
          <div className="flex items-center justify-between text-xs">
            <span
              className="px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider"
              style={{
                backgroundColor: priorityColors.high.bg,
                color: priorityColors.high.text,
                borderColor: priorityColors.high.border
              }}
            >
              Cao
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{highPriorityCount} công việc</span>
          </div>

          {/* Medium Priority count */}
          <div className="flex items-center justify-between text-xs">
            <span
              className="px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider"
              style={{
                backgroundColor: priorityColors.medium.bg,
                color: priorityColors.medium.text,
                borderColor: priorityColors.medium.border
              }}
            >
              Trung bình
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{mediumPriorityCount} công việc</span>
          </div>

          {/* Low Priority count */}
          <div className="flex items-center justify-between text-xs">
            <span
              className="px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider"
              style={{
                backgroundColor: priorityColors.low.bg,
                color: priorityColors.low.text,
                borderColor: priorityColors.low.border
              }}
            >
              Thấp
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{lowPriorityCount} công việc</span>
          </div>
        </div>
      </div>
    </div>
  );
}
