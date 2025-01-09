import React from 'react';
import { Plus, Upload } from 'lucide-react';

interface ContractsHeaderProps {
  totalApps: number;
  onOpenAppSelection: () => void;
  onOpenContractUpload: () => void;
}

export function ContractsHeader({ 
  totalApps,
  onOpenAppSelection, 
  onOpenContractUpload 
}: ContractsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="text-sm font-medium text-gray-900">
        Total Apps: {totalApps}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenAppSelection}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add Apps
        </button>
        <button
          onClick={onOpenContractUpload}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Upload className="h-4 w-4" />
          Upload Contract
        </button>
      </div>
    </div>
  );
}