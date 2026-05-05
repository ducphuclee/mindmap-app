'use client';

import { useState } from 'react';
import UpgradeModal from './UpgradeModal';

const FREE_TIER_LIMIT = 3;

interface Props {
  onClick: () => void;
  count: number;
  isPro: boolean;
}

export default function CreateButton({ onClick, count, isPro }: Props) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isAtLimit = !isPro && count >= FREE_TIER_LIMIT;

  const handleClick = () => {
    if (isAtLimit) {
      setShowUpgradeModal(true);
    } else {
      onClick();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="rounded-[9999px] bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#f0f0f0]"
      >
        + New Mindmap
      </button>
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </>
  );
}
