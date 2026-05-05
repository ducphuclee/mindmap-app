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
    <div className="flex items-center gap-0.5">
      {SIZES.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            value === key
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
