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
      <span className="text-xs text-[#a1a4a5]">Saving...</span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="text-xs text-[#11ff99]">Saved ✓</span>
    );
  }
  if (status === 'error') {
    return (
      <span className="text-xs text-[#ff2047]">Save failed</span>
    );
  }
  return null;
}

export default function EditorHeader({ title, saveStatus }: EditorHeaderProps) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-[rgba(214,235,253,0.19)] bg-black px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-[4px] p-1 text-[#a1a4a5] transition-colors hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f0f0f0]"
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
        <h1 className="max-w-xs truncate text-sm font-semibold text-[#f0f0f0]">
          {title}
        </h1>
      </div>

      <SaveIndicator status={saveStatus} />
    </header>
  );
}
