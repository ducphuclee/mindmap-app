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
      className="absolute right-0 top-full z-50 mt-1 w-80 rounded-[12px] border border-[rgba(214,235,253,0.19)] bg-black p-4 shadow-[rgba(176,199,217,0.145)_0px_0px_0px_1px]"
    >
      <h3 className="mb-3 text-sm font-semibold text-[#f0f0f0]">Share Mindmap</h3>

      {!shareUrl ? (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-[9999px] border border-[rgba(214,235,253,0.19)] bg-transparent px-3 py-2 text-sm text-[#f0f0f0] transition-colors hover:bg-[rgba(255,255,255,0.28)] disabled:opacity-50"
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
              className="min-w-0 flex-1 rounded-[8px] border border-[rgba(214,235,253,0.19)] bg-black px-2 py-1.5 text-xs text-[#f0f0f0]"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-[9999px] border border-[rgba(214,235,253,0.19)] bg-transparent px-3 py-1.5 text-xs font-medium text-[#f0f0f0] transition-colors hover:bg-[rgba(255,255,255,0.28)]"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {isPublic && (
            <button
              type="button"
              onClick={handleRevoke}
              disabled={loading}
              className="w-full rounded-[9999px] border border-[rgba(214,235,253,0.19)] px-3 py-1.5 text-xs font-medium text-[#ff2047] transition-colors hover:bg-[rgba(255,32,71,0.08)] disabled:opacity-50"
            >
              {loading ? 'Revoking...' : 'Revoke link'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
