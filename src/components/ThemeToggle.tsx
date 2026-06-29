import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      id="theme-toggle-btn"
      onClick={onToggle}
      className="p-2.5 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center justify-center shadow-xs"
      title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: theme === 'light' ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5" id="theme-icon-moon" />
        ) : (
          <Sun className="w-5 h-5 text-amber-400" id="theme-icon-sun" />
        )}
      </motion.div>
    </button>
  );
}
