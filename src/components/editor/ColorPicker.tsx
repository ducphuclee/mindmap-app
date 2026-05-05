'use client';

import { useState, useRef, useEffect } from 'react';

const PRESET_COLORS = [
  '#FFFFFF', '#FEF2F2', '#FFF7ED', '#FFFBEB',
  '#F0FFF4', '#EFF6FF', '#F5F3FF', '#FDF2F8',
  '#F3F4F6', '#FEE2E2', '#FED7AA', '#FDE68A',
  '#D1FAE5', '#DBEAFE', '#E9D5FF', '#FCE7F3',
  '#E5E7EB', '#FECACA', '#FDBA74', '#FCD34D',
  '#A7F3D0', '#93C5FD', '#C4B5FD', '#FBCFE8',
  '#9CA3AF', '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899',
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label: string;
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-6 w-6 rounded border border-[rgba(214,235,253,0.19)]"
        style={{ backgroundColor: value || '#FFFFFF' }}
        title={label}
      />
      {open && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-[12px] border border-[rgba(214,235,253,0.19)] bg-black p-2 shadow-[rgba(176,199,217,0.145)_0px_0px_0px_1px]">
          <div className="grid grid-cols-8 gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onChange(color);
                  setOpen(false);
                }}
                className={`h-5 w-5 rounded border ${
                  value === color ? 'ring-2 ring-[#3b9eff]' : 'border-[rgba(214,235,253,0.19)]'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
