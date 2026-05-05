'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import BaseModal from '@/components/common/BaseModal';

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onRename: (newTitle: string) => Promise<void>;
}

export default function RenameDialog({
  isOpen,
  onClose,
  currentTitle,
  onRename,
}: RenameDialogProps) {
  const [input, setInput] = useState(currentTitle);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInput(currentTitle);
    }
  }, [isOpen, currentTitle]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const trimmed = input.trim();
  const canSave = trimmed !== '' && trimmed !== currentTitle;

  const handleSave = useCallback(async () => {
    if (!canSave || loading) return;
    setLoading(true);
    try {
      await onRename(trimmed);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [canSave, loading, trimmed, onRename, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (canSave && !loading) {
        handleSave();
      }
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Rename mindmap"
      submitLabel="Save"
      onSubmit={handleSave}
      isLoading={loading}
    >
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
      />
    </BaseModal>
  );
}
