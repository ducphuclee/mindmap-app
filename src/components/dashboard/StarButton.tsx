'use client';

interface Props {
  mindmapId: string;
  isStarred: boolean;
  onToggle: (id: string) => void;
}

export default function StarButton({ mindmapId, isStarred, onToggle }: Props) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(mindmapId);
      }}
      className={`absolute right-2 top-2 z-10 rounded-full p-1 text-lg transition-opacity ${
        isStarred
          ? 'text-yellow-400 opacity-100 dark:text-yellow-400'
          : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-yellow-400 dark:text-gray-500'
      }`}
      aria-label={isStarred ? 'Unstar' : 'Star'}
    >
      {isStarred ? '★' : '☆'}
    </button>
  );
}
