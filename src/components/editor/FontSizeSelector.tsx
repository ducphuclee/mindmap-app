'use client';

interface FontSizeSelectorProps {
  value?: 'sm' | 'md' | 'lg';
  onChange: (size: 'sm' | 'md' | 'lg') => void;
}

const SIZES: { key: 'sm' | 'md' | 'lg'; label: string }[] = [
  { key: 'sm', label: 'S' },
  { key: 'md', label: 'M' },
  { key: 'lg', label: 'L' },
];

export default function FontSizeSelector({ value = 'md', onChange }: FontSizeSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-[8px] border border-gray-200 bg-white px-0.5">
      {SIZES.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            value === key
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
