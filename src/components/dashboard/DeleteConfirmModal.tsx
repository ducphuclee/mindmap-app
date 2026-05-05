'use client';

import BaseModal from '@/components/common/BaseModal';

interface Props {
  isOpen: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <BaseModal
      isOpen={isOpen}
      isDangerous
      submitLabel="Delete"
      onSubmit={onConfirm}
      onClose={onCancel}
      title="Delete this mindmap?"
    >
      <span className="dark:text-gray-300">Are you sure you want to delete &ldquo;{title}&rdquo;? This action cannot
      be undone.</span>
    </BaseModal>
  );
}
