'use client';

import Link from 'next/link';

interface Props {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-large border border-frost bg-black p-8 shadow-ring"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-xl font-bold text-near-white font-heading">
          You've reached the free plan limit
        </h2>
        <p className="mb-6 text-sm text-silver">
          You can create up to 3 mindmaps on the free plan. Upgrade to Pro to
          create unlimited mindmaps.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-pill border border-frost px-4 py-2 text-sm font-medium text-near-white transition-colors hover:bg-[rgba(255,255,255,0.28)]"
          >
            Cancel
          </button>
          <Link
            href="/pricing"
            className="rounded-pill bg-white px-4 py-2 text-center text-sm font-medium text-black"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
