'use client';

import { useState } from 'react';
import { type LayoutType } from '@/lib/mindmap/layout-engine';
import LayoutSwitcher from './LayoutSwitcher';
import SharePopover from './SharePopover';

interface EditorToolbarProps {
  currentLayout: LayoutType;
  onLayoutChange: (type: LayoutType) => void;
  mindmapId: string;
  isPublic: boolean;
  slug: string | null;
  onFitView: () => void;
}

export default function EditorToolbar({ currentLayout, onLayoutChange, mindmapId, isPublic, slug, onFitView }: EditorToolbarProps) {
  const [showShare, setShowShare] = useState(false);

  return (
    <div className="relative flex items-center gap-1 border-b border-gray-200 bg-white px-4 py-1">
      <LayoutSwitcher current={currentLayout} onChange={onLayoutChange} />

      <div className="mx-2 h-5 w-px bg-gray-200" />

      <button
        type="button"
        onClick={onFitView}
        title="Fit to screen"
        className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-100"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
        Fit
      </button>

      <button
        type="button"
        disabled
        title="Export (coming soon)"
        className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowShare((prev) => !prev)}
          title="Share"
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-100"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </button>

        {showShare && (
          <SharePopover
            mindmapId={mindmapId}
            isPublic={isPublic}
            slug={slug}
            onClose={() => setShowShare(false)}
          />
        )}
      </div>
    </div>
  );
}
