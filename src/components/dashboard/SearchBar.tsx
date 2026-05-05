'use client';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative flex-1">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c5c5c]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search mindmaps..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[4px] border border-[rgba(214,235,253,0.19)] bg-black py-2 pl-10 pr-3 text-sm text-[#f0f0f0] placeholder:text-[#5c5c5c] focus:border-[#3b9eff] focus:outline-none"
      />
    </div>
  );
}
