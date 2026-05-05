'use client';

import Link from 'next/link';

interface Props {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          You've reached the free plan limit
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          You can create up to 3 mindmaps on the free plan. Upgrade to Pro to
          create unlimited mindmaps.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <Link
            href="/pricing"
            className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
