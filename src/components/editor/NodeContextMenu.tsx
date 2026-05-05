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
      className="min-w-[160px] rounded-[12px] border border-[rgba(214,235,253,0.19)] bg-black py-1 shadow-[rgba(176,199,217,0.145)_0px_0px_0px_1px]"
    >
      {items.map((item) => (
        <button
          key={item.label}
          disabled={item.disabled}
          onClick={() => { item.action(); onClose(); }}
          className={[
            'flex w-full items-center px-3 py-2 text-sm transition-colors',
            item.disabled
              ? 'cursor-not-allowed text-[#464a4d]'
              : item.danger
              ? 'text-[#ff2047] hover:bg-[rgba(255,32,71,0.08)]'
              : 'text-[#a1a4a5] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f0f0f0]',
          ].join(' ')}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
