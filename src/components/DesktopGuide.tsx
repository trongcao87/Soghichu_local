import { useState } from 'react';
import { HelpCircle, Terminal, Laptop, Settings, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

export default function DesktopGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="desktop-guide-container" className="bg-white dark:bg-[#071329] border border-slate-200/10 dark:border-[#0f3161] rounded-3xl shadow-xl overflow-hidden transition-all">
      {/* Header Button */}
      <button
        id="toggle-desktop-guide-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#0c203f]/35 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Laptop className="w-4.5 h-4.5 text-purple-500" />
          <span>Hướng dẫn đóng gói Desktop (Electron)</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Tại sao Stack này hoàn hảo?</span>
            </h4>
            <p className="pl-5.5 text-slate-500 dark:text-slate-400">
              Ứng dụng được viết hoàn toàn bằng **React + Vite** cho hiệu suất cực cao và tốc độ phản hồi tức thì. Mọi dữ liệu được lưu cục bộ offline trong **LocalStorage**. Khi tích hợp với **Electron**, Electron sẽ hiển thị chính xác tệp HTML/CSS/JS đã build này lên một cửa sổ Desktop độc lập mà không cần kết nối Internet.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-purple-500" />
              <span>Các bước đóng gói thành file cài đặt máy tính (.exe/.app):</span>
            </h4>

            {/* Step 1 */}
            <div className="pl-4 border-l-2 border-purple-100 dark:border-[#0f3161] space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Bước 1: Cài đặt Electron vào thư mục dự án</span>
              <p className="text-slate-500 dark:text-slate-400">Mở terminal tại thư mục gốc và chạy lệnh cài đặt Electron:</p>
              <div className="bg-slate-950 text-slate-300 p-2.5 rounded-xl font-mono text-[10px] my-1 border border-slate-800/60 select-all">
                npm install --save-dev electron electron-builder
              </div>
            </div>

            {/* Step 2 */}
            <div className="pl-4 border-l-2 border-purple-100 dark:border-[#0f3161] space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Bước 2: Tạo file cấu hình Electron (`electron-main.js`)</span>
              <p className="text-slate-500 dark:text-slate-400">Tạo một tệp mới tên là `electron-main.js` ở thư mục gốc của bạn với nội dung:</p>
              <pre className="bg-slate-950 text-slate-300 p-3 rounded-xl font-mono text-[9px] overflow-x-auto border border-slate-800/60 leading-normal select-all">
{`const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'dist/favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Chạy file build tĩnh từ React
  win.loadFile(path.join(__dirname, 'dist/index.html'));
  
  // Ẩn thanh menu mặc định để giao diện tối giản hơn
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});`}
              </pre>
            </div>

            {/* Step 3 */}
            <div className="pl-4 border-l-2 border-purple-100 dark:border-[#0f3161] space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Bước 3: Cập nhật `package.json`</span>
              <p className="text-slate-500 dark:text-slate-400">Thêm điểm khởi chạy chính cho Electron và các lệnh chạy, đóng gói:</p>
              <pre className="bg-slate-950 text-slate-300 p-3 rounded-xl font-mono text-[9px] overflow-x-auto border border-slate-800/60 leading-normal select-all">
{`{
  "main": "electron-main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:start": "npm run build && electron .",
    "electron:pack": "npm run build && electron-builder"
  }
}`}
              </pre>
            </div>

            {/* Step 4 */}
            <div className="pl-4 border-l-2 border-purple-100 dark:border-[#0f3161] space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Bước 4: Trải nghiệm & Xuất bản</span>
              <p className="text-slate-500 dark:text-slate-400">Chạy thử ứng dụng trên máy tính:</p>
              <div className="bg-slate-950 text-slate-300 p-2.5 rounded-xl font-mono text-[10px] my-1 border border-slate-800/60 select-all">
                npm run electron:start
              </div>
              <p className="text-slate-500 dark:text-slate-400">Đóng gói thành file cài đặt độc lập (.exe hoặc .dmg/.app):</p>
              <div className="bg-slate-950 text-slate-300 p-2.5 rounded-xl font-mono text-[10px] my-1 border border-slate-800/60 select-all">
                npm run electron:pack
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
