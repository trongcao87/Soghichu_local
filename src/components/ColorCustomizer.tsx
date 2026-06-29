import { useState } from 'react';
import { Priority, PriorityColorConfig } from '../types';
import { Palette, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { DEFAULT_PRIORITY_COLORS } from '../utils';

interface ColorCustomizerProps {
  colors: PriorityColorConfig;
  onChange: (updatedColors: PriorityColorConfig) => void;
}

const COLOR_PRESETS = [
  {
    name: 'Mặc định hiện đại',
    low: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
    medium: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    high: { bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5' }
  },
  {
    name: 'Sắc thái biển xanh',
    low: { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
    medium: { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
    high: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' }
  },
  {
    name: 'Tối giản cổ điển',
    low: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
    medium: { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' },
    high: { bg: '#f1f5f9', text: '#0f172a', border: '#94a3b8' }
  },
  {
    name: 'Kẹo ngọt (Pastel)',
    low: { bg: '#fdf4ff', text: '#a21caf', border: '#f5d0fe' },
    medium: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    high: { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' }
  }
];

export default function ColorCustomizer({ colors, onChange }: ColorCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>('high');

  const handleReset = () => {
    onChange(DEFAULT_PRIORITY_COLORS);
  };

  const updateColorField = (priority: Priority, field: 'bg' | 'text' | 'border', value: string) => {
    const updated = {
      ...colors,
      [priority]: {
        ...colors[priority],
        [field]: value
      }
    };
    onChange(updated);
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    onChange({
      low: preset.low,
      medium: preset.medium,
      high: preset.high
    });
  };

  return (
    <div id="color-customizer-container" className="bg-white dark:bg-[#071329] border border-slate-200/10 dark:border-[#0f3161] rounded-3xl shadow-xl overflow-hidden transition-all">
      {/* Header Button */}
      <button
        id="toggle-color-customizer-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#0c203f]/35 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-4.5 h-4.5 text-purple-500" />
          <span>Tùy chỉnh màu sắc ưu tiên</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 space-y-5">
          {/* Preset templates */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2.5">
              Bộ màu cấu hình sẵn
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="p-2 text-xs border border-slate-200/10 dark:border-[#0f3161] rounded-xl text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-[#030e20] text-left transition cursor-pointer flex justify-between items-center"
                >
                  <span className="font-medium">{preset.name}</span>
                  <div className="flex gap-1 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.low.bg, border: `1px solid ${preset.low.border}` }}></span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.medium.bg, border: `1px solid ${preset.medium.border}` }}></span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.high.bg, border: `1px solid ${preset.high.border}` }}></span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Customizer */}
          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2.5">
              Chỉnh sửa chi tiết mã màu
            </label>
            
            {/* Priority Selector Tabs */}
            <div className="flex bg-slate-50 dark:bg-[#030e20] p-1 rounded-xl mb-4 border border-slate-100/10 dark:border-[#0f3161]">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                const label = p === 'low' ? 'Thấp' : p === 'medium' ? 'Trung bình' : 'Cao';
                const isSelected = selectedPriority === p;
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedPriority(p)}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-[#071329] text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-750'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Current preview for selected Priority */}
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Bản xem trước</span>
              <div
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-center border inline-block uppercase tracking-wider"
                style={{
                  backgroundColor: colors[selectedPriority].bg,
                  color: colors[selectedPriority].text,
                  borderColor: colors[selectedPriority].border
                }}
              >
                Ưu tiên {selectedPriority === 'low' ? 'Thấp' : selectedPriority === 'medium' ? 'Trung bình' : 'Cao'}
              </div>
            </div>

            {/* Color Inputs */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Màu nền</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[selectedPriority].bg}
                    onChange={(e) => updateColorField(selectedPriority, 'bg', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors[selectedPriority].bg}
                    onChange={(e) => updateColorField(selectedPriority, 'bg', e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-slate-200/10 dark:border-[#0f3161] bg-slate-50 dark:bg-[#030e20] dark:text-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Màu chữ</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[selectedPriority].text}
                    onChange={(e) => updateColorField(selectedPriority, 'text', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-755 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors[selectedPriority].text}
                    onChange={(e) => updateColorField(selectedPriority, 'text', e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-slate-200/10 dark:border-[#0f3161] bg-slate-50 dark:bg-[#030e20] dark:text-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Màu viền</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[selectedPriority].border}
                    onChange={(e) => updateColorField(selectedPriority, 'border', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-755 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors[selectedPriority].border}
                    onChange={(e) => updateColorField(selectedPriority, 'border', e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-slate-200/10 dark:border-[#0f3161] bg-slate-50 dark:bg-[#030e20] dark:text-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 rounded-xl transition cursor-pointer font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục màu mặc định</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
