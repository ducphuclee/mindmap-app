'use client';

import Link from 'next/link';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface EditorHeaderProps {
  title: string;
  saveStatus: SaveStatus;
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

export default function EditorHeader({ title, saveStatus }: EditorHeaderProps) {
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
        <h1 className="max-w-xs truncate text-sm font-semibold text-gray-900">
          {title}
        </h1>
      </div>

      <SaveIndicator status={saveStatus} />
    </header>
  );
}
