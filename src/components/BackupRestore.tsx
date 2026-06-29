import { useRef, useState, ChangeEvent } from 'react';
import { Task, PriorityColorConfig } from '../types';
import { Download, Upload, CheckCircle2, AlertCircle, FileJson } from 'lucide-react';
import { exportTasksToJSON } from '../utils';

interface BackupRestoreProps {
  tasks: Task[];
  priorityColors: PriorityColorConfig;
  onImport: (importedTasks: Task[], importedColors?: PriorityColorConfig, merge?: boolean) => void;
}

export default function BackupRestore({ tasks, priorityColors, onImport }: BackupRestoreProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [tempImportedData, setTempImportedData] = useState<{ tasks: Task[]; colors?: PriorityColorConfig } | null>(null);

  const handleExport = () => {
    try {
      exportTasksToJSON(tasks, priorityColors);
      setStatus({ type: 'success', message: 'Xuất tệp JSON sao lưu thành công!' });
      setTimeout(() => setStatus({ type: null, message: '' }), 4000);
    } catch (e) {
      setStatus({ type: 'error', message: 'Có lỗi xảy ra khi xuất dữ liệu.' });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Basic validation
        if (!parsed || (!Array.isArray(parsed.tasks) && !Array.isArray(parsed))) {
          throw new Error('Định dạng tệp JSON không hợp lệ.');
        }

        const importedTasks: Task[] = Array.isArray(parsed.tasks) ? parsed.tasks : parsed;
        
        // Validate items
        const validTasks = importedTasks.filter(t => t && t.title && t.id);
        if (validTasks.length === 0) {
          throw new Error('Không tìm thấy công việc hợp lệ trong tệp sao lưu.');
        }

        const colors = parsed.settings?.priorityColors;

        setTempImportedData({
          tasks: validTasks,
          colors: colors
        });
        setShowImportOptions(true);
        setStatus({ type: null, message: '' });
      } catch (err: any) {
        setStatus({ type: 'error', message: err.message || 'Lỗi đọc tệp JSON.' });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const executeImport = (merge: boolean) => {
    if (!tempImportedData) return;
    
    onImport(tempImportedData.tasks, tempImportedData.colors, merge);
    
    setStatus({
      type: 'success',
      message: merge 
        ? `Đã gộp thành công ${tempImportedData.tasks.length} công việc vào danh sách!`
        : `Đã khôi phục hoàn toàn ${tempImportedData.tasks.length} công việc mới!`
    });
    
    // Reset state
    setShowImportOptions(false);
    setTempImportedData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => setStatus({ type: null, message: '' }), 5000);
  };

  const cancelImport = () => {
    setShowImportOptions(false);
    setTempImportedData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="backup-restore-container" className="bg-white dark:bg-[#071329] border border-slate-200/10 dark:border-[#0f3161] rounded-3xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <FileJson className="w-5 h-5 text-purple-500" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Sao lưu & Khôi phục dữ liệu (JSON)
        </h3>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
        Dữ liệu được lưu trữ trực tiếp trên trình duyệt của bạn. Xuất tệp JSON để lưu dự phòng hoặc chuyển dữ liệu sang thiết bị khác.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Export Button */}
        <button
          id="export-json-btn"
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition duration-150 cursor-pointer uppercase tracking-wider"
        >
          <Download className="w-4 h-4" />
          <span>Xuất JSON</span>
        </button>

        {/* Import Button */}
        <button
          id="import-json-btn"
          onClick={triggerFileInput}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-[#030e20] dark:hover:bg-[#0c203f] border border-slate-200/10 dark:border-[#0f3161] rounded-xl shadow-xs transition duration-150 cursor-pointer uppercase tracking-wider"
        >
          <Upload className="w-4 h-4 text-purple-500" />
          <span>Nhập JSON</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        id="json-file-input"
      />

      {/* Notification banner */}
      {status.type && (
        <div
          id="backup-status-banner"
          className={`flex items-start gap-2 p-3 rounded-xl text-xs border font-medium ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
              : 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Import options dialog */}
      {showImportOptions && tempImportedData && (
        <div id="import-options-dialog" className="p-4 bg-slate-50 dark:bg-[#030e20]/50 border border-slate-200/10 dark:border-[#0f3161]/60 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Phát hiện {tempImportedData.tasks.length} công việc trong tệp sao lưu!</span>
          </div>
          
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Chọn hình thức khôi phục dữ liệu mong muốn:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => executeImport(true)}
              className="px-2.5 py-2 text-[11px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100/50 dark:text-purple-400 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 rounded-xl transition cursor-pointer border border-purple-100/50 dark:border-purple-950/50"
            >
              Gộp thêm vào
            </button>
            <button
              onClick={() => executeImport(false)}
              className="px-2.5 py-2 text-[11px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100/50 dark:text-rose-400 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 rounded-xl transition cursor-pointer border border-rose-100/50 dark:border-rose-950/50"
            >
              Ghi đè hoàn toàn
            </button>
          </div>
          
          <button
            onClick={cancelImport}
            className="w-full text-center py-1.5 text-[10px] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400 transition cursor-pointer font-bold uppercase tracking-wider"
          >
            Hủy khôi phục
          </button>
        </div>
      )}
    </div>
  );
}
