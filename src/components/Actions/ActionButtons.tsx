import React, { useState } from 'react';
import { Upload, Plus } from 'lucide-react';
import { AppListInput } from './AppListInput';
import { ContractUploadModal } from '../Upload/ContractUploadModal';

interface ActionButtonsProps {
  onAppListSubmit: (appList: string) => void;
  onContractUpload: (files: File[]) => void;
}

export function ActionButtons({ onAppListSubmit, onContractUpload }: ActionButtonsProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAppListExpanded, setIsAppListExpanded] = useState(false);

  const handleUploadDone = (files: File[]) => {
    onContractUpload(files);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-4">
        <button
          onClick={() => setIsAppListExpanded(!isAppListExpanded)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Enter your app list
        </button>
        
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Upload className="h-4 w-4" />
          Upload a contract
        </button>
      </div>

      {isAppListExpanded && (
        <div className="mt-4">
          <AppListInput 
            onSubmit={(list) => {
              onAppListSubmit(list);
              setIsAppListExpanded(false);
            }}
            onCancel={() => setIsAppListExpanded(false)}
          />
        </div>
      )}

      <ContractUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDone={handleUploadDone}
      />
    </div>
  );
}