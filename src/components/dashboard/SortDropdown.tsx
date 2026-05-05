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
      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
    >
      <option value="last-modified">Last modified</option>
      <option value="title-asc">Title A-Z</option>
      <option value="title-desc">Title Z-A</option>
    </select>
  );
}
