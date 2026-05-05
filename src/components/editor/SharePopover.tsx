'use client';

import { useState, useRef, useEffect } from 'react';
import { generateShareLinkAction, revokeShareLinkAction } from '@/app/actions/share';

interface SharePopoverProps {
  mindmapId: string;
  isPublic: boolean;
  slug: string | null;
  onClose: () => void;
}

export default function SharePopover({ mindmapId, isPublic, slug, onClose }: SharePopoverProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(
    slug ? `${window.location.origin}/share/${slug}` : null,
  );
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  async function handleGenerate() {
    setLoading(true);
    try {
      const url = await generateShareLinkAction(mindmapId);
      setShareUrl(url);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = popoverRef.current?.querySelector('input');
      if (input) {
        input.select();
        document.execCommand('copy');
      }
    }
  }

  async function handleRevoke() {
    setLoading(true);
    try {
      await revokeShareLinkAction(mindmapId);
      setShareUrl(null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
    >
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Share Mindmap</h3>

      {!shareUrl ? (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate share link'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="min-w-0 flex-1 rounded border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-600"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {isPublic && (
            <button
              type="button"
              onClick={handleRevoke}
              disabled={loading}
              className="w-full rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              {loading ? 'Revoking...' : 'Revoke link'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
