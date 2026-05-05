'use client';

export type SortOption = 'last-modified' | 'title-asc' | 'title-desc';

interface Props {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortDropdown({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="rounded-sharp border border-frost bg-black px-3 py-2 text-sm text-near-white focus:border-blue-10 focus:outline-none"
    >
      <option className="text-silver" value="last-modified">Last modified</option>
      <option className="text-silver" value="title-asc">Title A-Z</option>
      <option className="text-silver" value="title-desc">Title Z-A</option>
    </select>
  );
}
