'use client';

import { Fragment, useCallback, useState, type FormEvent, type DragEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { MindmapData } from '@/types/mindmap';
import { parseFile } from '@/lib/ai/file-parser';

interface AIInitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: MindmapData) => void;
}

export default function AIInitModal({ isOpen, onClose, onApply }: AIInitModalProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      const parsed = await parseFile(file);
      setText(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    }
  }, []);

  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && !isLoading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!res.ok) {
        const msg = `Request failed (${res.status})`;
        setError(msg);
        return;
      }

      const { data } = await res.json(); onApply(data as MindmapData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[24px] border border-gray-200 bg-white p-6 shadow-md transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                  Generate Mindmap
                </Dialog.Title>

                <Dialog.Description className="mt-2 text-sm text-gray-500">
                  Describe the mindmap you want to create. The AI will generate nodes and connections based on your input.
                </Dialog.Description>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div
                    className="flex flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-gray-200 p-4 mb-3 text-sm text-gray-500"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    Drop .txt, .md, or .pdf
                  </div>
                  <textarea
                    className="w-full rounded-[8px] border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#3b9eff] focus:outline-none focus:ring-1 focus:ring-[#3b9eff]"
                    rows={5}
                    placeholder="e.g. Create a mindmap about renewable energy sources with main categories: solar, wind, hydro"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />

                  {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="rounded-[9999px] border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
                      onClick={onClose}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={`rounded-[9999px] px-4 py-2 text-sm font-medium text-white transition-colors ${
                        canSubmit
                          ? 'border border-gray-200 bg-transparent hover:bg-gray-100'
                          : 'border border-gray-200 bg-transparent cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isLoading ? 'Generating...' : 'Submit'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
