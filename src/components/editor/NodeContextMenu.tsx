'use client';

import { useEffect, useRef } from 'react';

interface NodeContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  hasParent: boolean; // whether the node has a parent edge (to enable/disable "Add Sibling")
  onAddChild: () => void;
  onAddSibling: () => void;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function NodeContextMenu({
  x, y, nodeId, hasParent,
  onAddChild, onAddSibling, onRename, onDelete, onClose,
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Suppress unused nodeId lint — it is part of the public API contract
  void nodeId;

  const items = [
    { label: 'Add Child', action: onAddChild, disabled: false, danger: false },
    { label: 'Add Sibling', action: onAddSibling, disabled: !hasParent, danger: false },
    { label: 'Rename', action: onRename, disabled: false, danger: false },
    { label: 'Delete', action: onDelete, disabled: false, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: y, left: x, zIndex: 9999 }}
      className="min-w-[160px] rounded-[12px] border border-gray-200 bg-white py-1 shadow-md"
    >
      {items.map((item) => (
        <button
          key={item.label}
          disabled={item.disabled}
          onClick={() => { item.action(); onClose(); }}
          className={[
            'flex w-full items-center px-3 py-2 text-sm transition-colors',
            item.disabled
              ? 'cursor-not-allowed text-gray-300'
              : item.danger
              ? 'text-red-500 hover:bg-red-50'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
          ].join(' ')}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
