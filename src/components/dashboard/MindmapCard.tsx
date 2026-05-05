'use client';

import { useState, useRef, useEffect } from 'react';
import type { Mindmap } from '@/types/mindmap';
import { formatDistanceToNow } from 'date-fns';
import StarButton from './StarButton';

interface ContextMenu {
  x: number;
  y: number;
}

interface Props {
  mindmap: Mindmap;
  currentUserId: string;
  onDuplicate: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onRenameRequest: (id: string) => void;
  onClick: (id: string) => void;
  isStarred: boolean;
  onStarToggle: (id: string) => void;
}

function formatTimestamp(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

export default function MindmapCard({
  mindmap,
  currentUserId,
  onDuplicate,
  onDeleteRequest,
  onRenameRequest,
  onClick,
  isStarred,
  onStarToggle,
}: Props) {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = currentUserId !== undefined && mindmap.user_id === currentUserId;

  // Close context menu when clicking outside
  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    // Delay adding listener so the right-click itself doesn't close it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const timeAgo = formatTimestamp(mindmap.updated_at);

  return (
    <>
      <div
        className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
        onContextMenu={isOwner ? handleContextMenu : undefined}
      >
        {/* Thumbnail placeholder */}
        <div
          className="relative flex h-36 items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500"
          onClick={() => onClick(mindmap.id)}
        >
          <StarButton
            mindmapId={mindmap.id}
            isStarred={isStarred}
            onToggle={onStarToggle}
          />
          <svg
            className="h-12 w-12 text-white/80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span className="absolute bottom-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white/90 backdrop-blur-sm">
            {mindmap.data.nodes.length} nodes
          </span>
        </div>

        {/* Card body */}
        <div className="p-4" onClick={() => onClick(mindmap.id)}>
          <h3 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {mindmap.title}
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Modified {timeAgo}</p>
        </div>
      </div>

      {/* Context menu — only for owners */}
      {isOwner && contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:bg-gray-800 dark:border-gray-700"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu(null);
              onRenameRequest(mindmap.id);
            }}
          >
            Rename
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu(null);
              onDuplicate(mindmap.id);
            }}
          >
            Duplicate
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu(null);
              onDeleteRequest(mindmap.id);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
}
