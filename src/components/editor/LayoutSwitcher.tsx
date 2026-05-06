'use client';

import { type LayoutType } from '@/lib/mindmap/layout-engine';

interface LayoutOption {
  value: LayoutType;
  label: string;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  { value: 'radial', label: 'Mind Map' },
  { value: 'tree-td', label: 'Tree ↓' },
  { value: 'tree-lr', label: 'Tree →' },
];

interface LayoutSwitcherProps {
  current: LayoutType;
  onChange: (type: LayoutType) => void;
}

export default function LayoutSwitcher({ current, onChange }: LayoutSwitcherProps) {
  return (
    <div className="flex items-center gap-1 rounded-[8px] border border-gray-200 bg-white px-1">
      {LAYOUT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            current === opt.value
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
