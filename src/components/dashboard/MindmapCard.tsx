'use client';

import { useState, useRef, useEffect } from 'react';
import type { Mindmap } from '@/types/mindmap';
import { formatDistanceToNow } from 'date-fns';
import DeleteConfirmModal from './DeleteConfirmModal';

interface ContextMenu {
  x: number;
  y: number;
}

interface Props {
  mindmap: Mindmap;
  onRename: (id: string, title: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
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
  onRename,
  onDuplicate,
  onDelete,
  onClick,
}: Props) {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(mindmap.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Focus and select rename input when it appears
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== mindmap.title) {
      onRename(mindmap.id, trimmed);
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setRenameValue(mindmap.title);
      setIsRenaming(false);
    }
  };

  const timeAgo = formatTimestamp(mindmap.updated_at);

  return (
    <>
      <div
        className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        onContextMenu={handleContextMenu}
      >
        {/* Thumbnail placeholder */}
        <div
          className="flex h-36 items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500"
          onClick={() => onClick(mindmap.id)}
        >
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
        </div>

        {/* Card body */}
        <div className="p-4" onClick={() => onClick(mindmap.id)}>
          {isRenaming ? (
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleRenameKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded border border-blue-500 px-2 py-1 text-sm font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <h3 className="truncate text-sm font-medium text-gray-900">
              {mindmap.title}
            </h3>
          )}
          <p className="mt-1 text-xs text-gray-500">Modified {timeAgo}</p>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu(null);
              setIsRenaming(true);
              setRenameValue(mindmap.title);
            }}
          >
            Rename
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
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
              setShowDeleteModal(true);
            }}
          >
            Delete
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title={mindmap.title}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            onDelete(mindmap.id);
          }}
        />
      )}
    </>
  );
}
