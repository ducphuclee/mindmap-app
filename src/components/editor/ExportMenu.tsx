'use client';

import { useCallback, useRef, useState } from 'react';
import { exportPNG, exportPDF } from '@/lib/mindmap/export-service';

interface ExportMenuProps {
  onClose: () => void;
}

const VIEWPORT_SELECTOR = '.react-flow__viewport';

function getViewport(): HTMLElement | null {
  return document.querySelector<HTMLElement>(VIEWPORT_SELECTOR);
}

export default function ExportMenu({ onClose }: ExportMenuProps) {
  const [loading, setLoading] = useState<'png' | 'pdf' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(
    async (format: 'png' | 'pdf') => {
      const viewport = getViewport();
      if (!viewport) return;
      setLoading(format);
      try {
        if (format === 'png') {
          await exportPNG(viewport, 'mindmap.png');
        } else {
          await exportPDF(viewport, 'mindmap.pdf');
        }
      } catch {
        // Export failed silently — no error UI per AC
      } finally {
        setLoading(null);
        onClose();
      }
    },
    [onClose],
  );

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-[12px] border border-gray-200 bg-white py-1 shadow-md"
    >
      <button
        type="button"
        disabled={loading === 'png'}
        onClick={() => handleExport('png')}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading === 'png' ? spinner : exportIcon}
        Export as PNG
      </button>
      <button
        type="button"
        disabled={loading === 'pdf'}
        onClick={() => handleExport('pdf')}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading === 'pdf' ? spinner : pdfIcon}
        Export as PDF
      </button>
    </div>
  );
}

const spinner = (
  <svg
    className="h-4 w-4 animate-spin text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const exportIcon = (
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
);

const pdfIcon = (
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
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);
