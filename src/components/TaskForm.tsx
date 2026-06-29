import { useState, useEffect, FormEvent } from 'react';
import { Task, Priority, TaskStatus } from '../types';
import { PlusCircle, Calendar, Save, XCircle, FileText, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';
import { compressAndResizeImage } from '../utils';

interface TaskFormProps {
  onSubmit: (taskData: {
    title: string;
    startDate: string;
    endDate: string;
    notes: string;
    priority: Priority;
    status: TaskStatus;
    nextSteps: string;
    nextStepsImage?: string;
    notesImage?: string;
  }) => void;
  editingTask: Task | null;
  onCancelEdit: () => void;
}

export default function TaskForm({ onSubmit, editingTask, onCancelEdit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [nextSteps, setNextSteps] = useState('');
  const [nextStepsImage, setNextStepsImage] = useState<string>('');
  const [notesImage, setNotesImage] = useState<string>('');
  const [error, setError] = useState('');

  // Set default start date to today (2026-06-24 based on server metadata)
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setStartDate(editingTask.startDate);
      setEndDate(editingTask.endDate);
      setNotes(editingTask.notes);
      setPriority(editingTask.priority);
      setStatus(editingTask.status || (editingTask.completed ? 'done' : 'todo'));
      setNextSteps(editingTask.nextSteps || '');
      setNextStepsImage(editingTask.nextStepsImage || '');
      setNotesImage(editingTask.notesImage || '');
    } else {
      resetForm();
    }
  }, [editingTask]);

  const resetForm = () => {
    setTitle('');
    
    // Set default date to today 2026-06-24
    const today = '2026-06-24';
    setStartDate(today);
    setEndDate(today);
    setNotes('');
    setPriority('medium');
    setStatus('todo');
    setNextSteps('');
    setNextStepsImage('');
    setNotesImage('');
    setError('');
  };

  const handleImagePaste = async (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>, target: 'nextSteps' | 'notes') => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault(); // Ngăn hành vi dán mặc định (ví dụ dán tên tệp)
          try {
            const base64 = await compressAndResizeImage(file);
            if (target === 'nextSteps') {
              setNextStepsImage(base64);
            } else {
              setNotesImage(base64);
            }
          } catch (err) {
            console.error('Lỗi nén ảnh từ clipboard:', err);
            setError('Lỗi khi dán hình ảnh từ Clipboard.');
          }
        }
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'nextSteps' | 'notes') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const base64 = await compressAndResizeImage(file);
      if (target === 'nextSteps') {
        setNextStepsImage(base64);
      } else {
        setNotesImage(base64);
      }
    } catch (err) {
      console.error('Lỗi nén ảnh tải lên:', err);
      setError('Lỗi khi tải hình ảnh lên.');
    }
    e.target.value = ''; // Reset input
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Vui lòng nhập tên công việc cần làm.');
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      setError('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
      return;
    }

    onSubmit({
      title: title.trim(),
      startDate,
      endDate,
      notes: notes.trim(),
      priority,
      status,
      nextSteps: nextSteps.trim(),
      nextStepsImage,
      notesImage
    });

    resetForm();
  };

  return (
    <form
      id="task-form"
      onSubmit={handleSubmit}
      className="bg-white dark:bg-[#071329] border border-slate-200/10 dark:border-[#0f3161] rounded-3xl p-6 shadow-xl space-y-4.5"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          {editingTask ? (
            <>
              <Save className="w-4.5 h-4.5 text-purple-500" />
              <span>Chỉnh sửa công việc</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4.5 h-4.5 text-purple-500" />
              <span>Thêm công việc mới</span>
            </>
          )}
        </h3>
        {editingTask && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
          >
            <XCircle className="w-3.5 h-3.5" />
            Hủy sửa
          </button>
        )}
      </div>

      {error && (
        <div id="form-error-banner" className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          Tên công việc <span className="text-rose-500">*</span>
        </label>
        <input
          id="task-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Rebuild UI Architecture..."
          className="w-full px-3.5 py-2.5 text-sm border border-slate-200/10 dark:border-[#0f3161] rounded-xl bg-slate-50 dark:bg-[#030e20] focus:bg-white dark:focus:bg-[#071329] focus:outline-none focus:ring-2 focus:ring-purple-500 transition dark:text-slate-200 placeholder:text-slate-500"
        />
      </div>

      {/* Dates row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            <span>Ngày bắt đầu</span>
          </label>
          <input
            id="task-start-date-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-200/10 dark:border-[#0f3161] rounded-xl bg-slate-50 dark:bg-[#030e20] focus:bg-white dark:focus:bg-[#071329] focus:outline-none focus:ring-2 focus:ring-purple-500 transition dark:text-slate-200 font-sans"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            <span>Ngày kết thúc</span>
          </label>
          <input
            id="task-end-date-input"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-200/10 dark:border-[#0f3161] rounded-xl bg-slate-50 dark:bg-[#030e20] focus:bg-white dark:focus:bg-[#071329] focus:outline-none focus:ring-2 focus:ring-purple-500 transition dark:text-slate-200 font-sans"
          />
        </div>
      </div>

      {/* Priority Level */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Độ ưu tiên
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as Priority[]).map((p) => {
            const isSelected = priority === p;
            let label = 'Thấp';
            let colorClasses = 'border-slate-700/50 text-slate-400 bg-[#030e20]';
            
            if (p === 'low') {
              label = 'Thấp';
              if (isSelected) colorClasses = 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20';
            } else if (p === 'medium') {
              label = 'Trung bình';
              if (isSelected) colorClasses = 'border-amber-500/40 text-amber-400 bg-amber-950/20';
            } else if (p === 'high') {
              label = 'Cao';
              if (isSelected) colorClasses = 'border-rose-500/40 text-rose-400 bg-rose-950/20';
            }

            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${colorClasses} ${
                  isSelected ? 'ring-2 ring-purple-500/20 font-bold' : 'hover:bg-[#071329]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Status */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          Tình trạng xử lý
        </label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'todo', label: 'Chưa bắt đầu', activeClass: 'border-slate-400/60 text-slate-700 bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-800/50' },
            { key: 'doing', label: 'Đang làm', activeClass: 'border-sky-500/40 text-sky-700 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/20' },
            { key: 'paused', label: 'Tạm dừng', activeClass: 'border-amber-500/40 text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20' },
            { key: 'done', label: 'Hoàn thành', activeClass: 'border-emerald-500/40 text-emerald-800 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20' }
          ] as { key: TaskStatus; label: string; activeClass: string }[]).map((item) => {
            const isSelected = status === item.key;
            const colorClasses = isSelected 
              ? `${item.activeClass} ring-2 ring-sky-500/10 font-bold` 
              : 'border-slate-200 text-slate-600 bg-slate-50 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50';

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setStatus(item.key)}
                className={`py-2 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${colorClasses}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Steps / Next Actions */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
          <span>Nội dung cần làm tiếp theo (Ghi chú tiến độ)</span>
        </label>
        <div className="relative flex items-center">
          <input
            id="task-next-steps-input"
            type="text"
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            onPaste={(e) => handleImagePaste(e, 'nextSteps')}
            placeholder="Ví dụ: Cần kiểm thử lại API... (Dán ảnh bằng Ctrl+V)"
            className="w-full pl-3.5 pr-11 py-2.5 text-sm border border-slate-200/10 dark:border-[#0f3161] rounded-xl bg-slate-50 dark:bg-[#030e20] focus:bg-white dark:focus:bg-[#071329] focus:outline-none focus:ring-2 focus:ring-purple-500 transition dark:text-slate-200 placeholder:text-slate-500"
          />
          <label className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-[#0c203f] transition cursor-pointer flex items-center justify-center" title="Tải ảnh tiến độ">
            <ImageIcon className="w-4.5 h-4.5" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'nextSteps')}
              className="hidden"
            />
          </label>
        </div>
        {nextStepsImage && (
          <div className="mt-2 relative inline-block">
            <img
              src={nextStepsImage}
              alt="Preview progress"
              className="w-16 h-16 object-cover rounded-xl border border-slate-200/10 dark:border-[#0f3161] shadow-sm"
            />
            <button
              type="button"
              onClick={() => setNextStepsImage('')}
              className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition shadow-md cursor-pointer"
              title="Xóa ảnh"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-purple-500" />
          <span>Ghi chú chi tiết</span>
        </label>
        <div className="relative">
          <textarea
            id="task-notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onPaste={(e) => handleImagePaste(e, 'notes')}
            placeholder="Mô tả công việc... (Dán ảnh bằng Ctrl+V)"
            rows={3}
            className="w-full pl-3.5 pr-11 py-2.5 text-sm border border-slate-200/10 dark:border-[#0f3161] rounded-xl bg-slate-50 dark:bg-[#030e20] focus:bg-white dark:focus:bg-[#071329] focus:outline-none focus:ring-2 focus:ring-purple-500 transition dark:text-slate-200 placeholder:text-slate-500 resize-none"
          />
          <label className="absolute right-3 bottom-3 p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-[#0c203f] transition cursor-pointer flex items-center justify-center" title="Tải ảnh ghi chú">
            <ImageIcon className="w-4.5 h-4.5" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'notes')}
              className="hidden"
            />
          </label>
        </div>
        {notesImage && (
          <div className="mt-2 relative inline-block">
            <img
              src={notesImage}
              alt="Preview notes"
              className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
            />
            <button
              type="button"
              onClick={() => setNotesImage('')}
              className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition shadow-md cursor-pointer"
              title="Xóa ảnh"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        id="task-submit-btn"
        type="submit"
        className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition duration-150 cursor-pointer"
      >
        {editingTask ? (
          <>
            <Save className="w-4 h-4" />
            <span>LƯU THAY ĐỔI</span>
          </>
        ) : (
          <>
            <PlusCircle className="w-4 h-4" />
            <span>THÊM VÀO DANH SÁCH</span>
          </>
        )}
      </button>
    </form>
  );
}
