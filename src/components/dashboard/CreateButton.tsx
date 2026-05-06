'use client';

interface Props {
  onClick: () => void;
}

export default function CreateButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="rounded-[9999px] bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#f0f0f0]"
    >
      + New Mindmap
    </button>
  );
}
