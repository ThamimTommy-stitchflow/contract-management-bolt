import React from 'react';
import { Dialog } from '@headlessui/react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  appName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  appName,
  onConfirm,
  onCancel
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 max-w-sm w-full">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Delete Contract
          </Dialog.Title>
          
          <Dialog.Description className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete the contract for {appName}? This action cannot be undone.
          </Dialog.Description>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}