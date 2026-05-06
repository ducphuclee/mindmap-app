'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { renameMindmap } from '@/lib/mindmap/actions';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface EditorHeaderProps {
  title: string;
  saveStatus: SaveStatus;
  mindmapId: string;
  onTitleSaved?: (newTitle: string) => void;
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;
  if (status === 'saving') {
    return (
      <span className="text-xs text-gray-500">Saving...</span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="text-xs text-green-600">Saved ✓</span>
    );
  }
  if (status === 'error') {
    return (
      <span className="text-xs text-red-500">Save failed</span>
    );
  }
  return null;
}

export default function EditorHeader({ title, saveStatus, mindmapId, onTitleSaved }: EditorHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = useCallback(() => {
    setDraft(title);
    setEditing(true);
  }, [title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(title);
  }, [title]);

  const save = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === title) {
      cancel();
      return;
    }
    setSaving(true);
    try {
      await renameMindmap(mindmapId, trimmed);
      onTitleSaved?.(trimmed);
      setEditing(false);
    } catch {
      cancel();
    } finally {
      setSaving(false);
    }
  }, [draft, title, mindmapId, onTitleSaved, cancel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        save();
      } else if (e.key === 'Escape') {
        cancel();
      }
    },
    [save, cancel],
  );

  return (
    <header className="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-[4px] p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label="Back to dashboard"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={handleKeyDown}
            disabled={saving}
            className="max-w-xs rounded border-0 border-b border-gray-300 bg-transparent px-0 py-0 text-sm font-semibold text-gray-900 outline-none focus:border-gray-400"
          />
        ) : (
          <h1
            className="max-w-xs cursor-text truncate text-sm font-semibold text-gray-900"
            onClick={startEditing}
          >
            {title}
          </h1>
        )}
      </div>

      <SaveIndicator status={saveStatus} />
    </header>
  );
}
