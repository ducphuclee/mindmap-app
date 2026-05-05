'use client';

interface Props {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  title,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Delete this mindmap?
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete &ldquo;{title}&rdquo;? This action
          cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
