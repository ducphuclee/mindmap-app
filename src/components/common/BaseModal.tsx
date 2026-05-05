'use client';

import { Fragment, type ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  submitLabel?: string;
  onSubmit?: () => void;
  isDangerous?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  submitLabel,
  onSubmit,
  isDangerous,
  isLoading,
  children,
}: BaseModalProps) {
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
          <div className="fixed inset-0 bg-black/50" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
                <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </Dialog.Title>

                {description && (
                  <Dialog.Description className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </Dialog.Description>
                )}

                {children && <div className="mt-4">{children}</div>}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    onClick={onClose}
                  >
                    Cancel
                  </button>

                  {onSubmit && (
                    <button
                      type="button"
                      className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                        isDangerous
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={onSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Submitting...' : submitLabel ?? 'Submit'}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
