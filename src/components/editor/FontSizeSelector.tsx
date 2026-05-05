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
    <div className="flex items-center gap-0.5 rounded-[8px] border border-[rgba(214,235,253,0.19)] bg-black px-0.5">
      {SIZES.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            value === key
              ? 'bg-[rgba(255,255,255,0.1)] text-[#f0f0f0]'
              : 'text-[#a1a4a5] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f0f0f0]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
