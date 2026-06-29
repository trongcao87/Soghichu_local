import { useState, useEffect } from 'react';
import { Task, PriorityColorConfig, TaskStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Edit2, Trash2, Calendar, FileText, ChevronDown, ChevronUp, Clock, AlertCircle, Play, CheckCircle2, Save, X, Plus, Image as ImageIcon } from 'lucide-react';
import { formatVietnameseDate, compressAndResizeImage } from '../utils';

interface TaskItemProps {
  key?: string;
  task: Task;
  priorityColors: PriorityColorConfig;
  theme?: 'light' | 'dark';
  onToggleComplete: (id: string) => void;
  onChangeStatus: (id: string, status: TaskStatus) => void;
  onUpdateNextSteps?: (id: string, nextSteps: string, nextStepsImage?: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, priorityColors, theme, onToggleComplete, onChangeStatus, onUpdateNextSteps, onEdit, onDelete }: TaskItemProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [isEditingNextSteps, setIsEditingNextSteps] = useState(false);
  const [tempNextSteps, setTempNextSteps] = useState(task.nextSteps || '');
  const [tempNextStepsImage, setTempNextStepsImage] = useState(task.nextStepsImage || '');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Update local state when task prop changes
  useEffect(() => {
    setTempNextSteps(task.nextSteps || '');
    setTempNextStepsImage(task.nextStepsImage || '');
  }, [task.nextSteps, task.nextStepsImage]);

  const colorConfig = priorityColors[task.priority];

  const isDefaultColor =
    (task.priority === 'low' && colorConfig.bg.toLowerCase() === '#ecfdf5' && colorConfig.text.toLowerCase() === '#047857') ||
    (task.priority === 'medium' && colorConfig.bg.toLowerCase() === '#fffbeb' && colorConfig.text.toLowerCase() === '#b45309') ||
    (task.priority === 'high' && colorConfig.bg.toLowerCase() === '#fef2f2' && colorConfig.text.toLowerCase() === '#b91c1c');

  const getPriorityClasses = () => {
    if (isDefaultColor) {
      switch (task.priority) {
        case 'low':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30';
        case 'medium':
          return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30';
        case 'high':
          return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30';
      }
    }
    return '';
  };

  const priorityStyle = isDefaultColor ? {} : {
    backgroundColor: colorConfig.bg,
    color: colorConfig.text,
    borderColor: colorConfig.border
  };

  const currentStatus = task.status || (task.completed ? 'done' : 'todo');

  // Helper for human-readable priority text
  const getPriorityLabel = () => {
    switch (task.priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
    }
  };

  const getStatusStyles = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700/80';
      case 'doing':
        return 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/30';
      case 'paused':
        return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30';
      case 'done':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return <AlertCircle className="w-3 h-3 text-slate-500 inline mr-1 shrink-0" />;
      case 'doing':
        return <Play className="w-3 h-3 text-sky-500 fill-sky-500/10 inline mr-1 shrink-0 animate-pulse" />;
      case 'paused':
        return <Clock className="w-3 h-3 text-amber-500 inline mr-1 shrink-0" />;
      case 'done':
        return <CheckCircle2 className="w-3 h-3 text-emerald-500 inline mr-1 shrink-0" />;
    }
  };

  const statusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'Chưa bắt đầu';
      case 'doing': return 'Đang làm';
      case 'paused': return 'Tạm dừng';
      case 'done': return 'Hoàn thành';
    }
  };

  const handleInlineImagePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          try {
            const base64 = await compressAndResizeImage(file);
            setTempNextStepsImage(base64);
          } catch (err) {
            console.error('Lỗi khi nén ảnh inline:', err);
          }
        }
      }
    }
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const base64 = await compressAndResizeImage(file);
      setTempNextStepsImage(base64);
    } catch (err) {
      console.error('Lỗi khi nén ảnh tải lên inline:', err);
    }
    e.target.value = '';
  };

  return (
    <motion.div
      id={`task-item-${task.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className={`border rounded-2xl p-5 bg-white dark:bg-[#071329] transition-all shadow-md group ${
        currentStatus === 'done'
          ? 'border-slate-100 dark:border-[#0f3161]/40 bg-slate-50/50 dark:bg-[#071329]/20 opacity-80'
          : 'border-slate-200/10 dark:border-[#0f3161] hover:border-purple-200 dark:hover:border-purple-900/60'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox wrapper */}
        <button
          id={`toggle-complete-btn-${task.id}`}
          onClick={() => onToggleComplete(task.id)}
          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer mt-0.5 ${
            currentStatus === 'done'
              ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'border-slate-300 dark:border-slate-700 hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20'
          }`}
        >
          {currentStatus === 'done' && <Check className="w-4 h-4 stroke-[3px]" />}
        </button>
 
        {/* Core Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h4
              id={`task-title-${task.id}`}
              className={`text-sm font-bold text-slate-900 dark:text-slate-100 break-words transition-all duration-300 ${
                currentStatus === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }`}
            >
              {task.title}
            </h4>
 
            {/* Custom Priority Badge */}
            <span
              id={`task-priority-badge-${task.id}`}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border inline-block uppercase tracking-wider ${getPriorityClasses()}`}
              style={priorityStyle}
            >
              {getPriorityLabel()}
            </span>

            {/* Interactive Status Selector Badge */}
            <div className="relative inline-flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider transition-colors duration-150 ${getStatusStyles(currentStatus)}`}>
                {getStatusIcon(currentStatus)}
                <select
                  id={`task-status-select-${task.id}`}
                  value={currentStatus}
                  onChange={(e) => onChangeStatus(task.id, e.target.value as TaskStatus)}
                  className="bg-transparent text-inherit font-bold uppercase tracking-wider outline-none cursor-pointer pr-1 border-none focus:ring-0 select-none appearance-none"
                  title="Thay đổi trạng thái xử lý"
                >
                  <option value="todo" className="bg-white dark:bg-[#071329] text-slate-700 dark:text-slate-300 normal-case font-normal">Chưa bắt đầu</option>
                  <option value="doing" className="bg-white dark:bg-[#071329] text-sky-600 dark:text-sky-400 normal-case font-normal">Đang làm</option>
                  <option value="paused" className="bg-white dark:bg-[#071329] text-amber-600 dark:text-amber-400 normal-case font-normal">Tạm dừng</option>
                  <option value="done" className="bg-white dark:bg-[#071329] text-emerald-600 dark:text-emerald-400 normal-case font-normal">Hoàn thành</option>
                </select>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
              </span>
            </div>
          </div>
 
          {/* Dates Display */}
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>
                {formatVietnameseDate(task.startDate)}
                {task.endDate && task.endDate !== task.startDate && ` - ${formatVietnameseDate(task.endDate)}`}
              </span>
            </div>
            
            {task.notes && (
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-0.5 font-bold cursor-pointer"
              >
                <span>{showNotes ? 'Thu gọn' : 'Xem ghi chú'}</span>
                {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Next Steps / Progress Section */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-500" />
                <span>Nội dung cần làm tiếp theo:</span>
              </span>
              
              <div className="flex items-center gap-2">
                {currentStatus !== 'done' && (
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className="px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 rounded-lg border border-emerald-500/20 transition cursor-pointer flex items-center gap-0.5 uppercase tracking-wider"
                    title="Đánh dấu hoàn thành nhanh"
                  >
                    <Check className="w-3 h-3 stroke-[3px]" />
                    <span>Nút Hoàn thành</span>
                  </button>
                )}
                
                {!isEditingNextSteps && (
                  <button
                    onClick={() => setIsEditingNextSteps(true)}
                    className="text-[10px] font-bold text-purple-600 hover:text-purple-500 dark:text-purple-400 cursor-pointer flex items-center gap-0.5"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>{task.nextSteps ? 'Cập nhật' : 'Thêm ghi chú'}</span>
                  </button>
                )}
              </div>
            </div>

            {isEditingNextSteps ? (
              <div className="space-y-2 mt-1">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      value={tempNextSteps}
                      onChange={(e) => setTempNextSteps(e.target.value)}
                      onPaste={handleInlineImagePaste}
                      placeholder="Ví dụ: Gửi báo cáo... (Dán ảnh bằng Ctrl+V)"
                      className="w-full pl-3.5 pr-11 py-1.5 text-xs border border-slate-200/10 dark:border-[#0f3161] rounded-xl bg-slate-50 dark:bg-[#030e20] focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 dark:text-slate-200 placeholder:text-slate-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateNextSteps?.(task.id, tempNextSteps.trim(), tempNextStepsImage);
                          setIsEditingNextSteps(false);
                        } else if (e.key === 'Escape') {
                          setTempNextSteps(task.nextSteps || '');
                          setTempNextStepsImage(task.nextStepsImage || '');
                          setIsEditingNextSteps(false);
                        }
                      }}
                    />
                    <label className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-[#0c203f] transition cursor-pointer flex items-center justify-center" title="Tải ảnh">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleInlineImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateNextSteps?.(task.id, tempNextSteps.trim(), tempNextStepsImage);
                      setIsEditingNextSteps(false);
                    }}
                    className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition cursor-pointer shrink-0"
                    title="Lưu"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setTempNextSteps(task.nextSteps || '');
                      setTempNextStepsImage(task.nextStepsImage || '');
                      setIsEditingNextSteps(false);
                    }}
                    className="p-1.5 bg-slate-100/10 hover:bg-slate-100/20 dark:bg-[#030e20] dark:hover:bg-[#0c203f] text-slate-500 dark:text-slate-350 rounded-lg transition cursor-pointer shrink-0"
                    title="Hủy"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {tempNextStepsImage && (
                  <div className="relative inline-block ml-1">
                    <img
                      src={tempNextStepsImage}
                      alt="Inline progress preview"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200/10 dark:border-[#0f3161] shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setTempNextStepsImage('')}
                      className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition shadow-md cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-purple-50/15 dark:bg-[#030e20] border border-purple-100/20 dark:border-[#0f3161] rounded-2xl p-3 flex items-start justify-between gap-3">
                <div className="flex-1 text-xs">
                  {task.nextSteps ? (
                    <span className="text-slate-700 dark:text-slate-200 font-bold text-[11.5px] block leading-relaxed">{task.nextSteps}</span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic block">Chưa ghi chú việc cần làm tiếp theo. Nhấp "Thêm ghi chú" để bổ sung tiến trình.</span>
                  )}
                </div>
                {task.nextStepsImage && (
                  <img
                    src={task.nextStepsImage}
                    alt="Progress visual"
                    onClick={() => setLightboxImage(task.nextStepsImage!)}
                    className="w-12 h-12 object-cover rounded-xl border border-sky-150/40 dark:border-sky-900/20 cursor-zoom-in hover:scale-105 duration-200 shadow-sm shrink-0"
                  />
                )}
              </div>
            )}
          </div>
 
          {/* Collapsible notes details */}
          {task.notes && showNotes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#030e20] rounded-2xl p-4 border border-slate-100/10 dark:border-[#0f3161]/60 space-y-3"
            >
              <div className="flex items-start gap-2 leading-relaxed break-words whitespace-pre-wrap font-medium">
                <FileText className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <span>{task.notes}</span>
              </div>
              {task.notesImage && (
                <div className="pl-6">
                  <img
                    src={task.notesImage}
                    alt="Notes visual"
                    onClick={() => setLightboxImage(task.notesImage!)}
                    className="max-w-[200px] max-h-[150px] object-cover rounded-xl border border-slate-200 dark:border-slate-850 cursor-zoom-in hover:opacity-90 transition shadow-sm"
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
 
        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition duration-150">
          <button
            id={`edit-task-btn-${task.id}`}
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-sky-950/20 transition cursor-pointer"
            title="Sửa công việc"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            id={`delete-task-btn-${task.id}`}
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/20 transition cursor-pointer"
            title="Xóa công việc"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage}
                alt="Enlarged preview"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute -top-3 -right-3 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full transition shadow-lg border border-white/10 cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
