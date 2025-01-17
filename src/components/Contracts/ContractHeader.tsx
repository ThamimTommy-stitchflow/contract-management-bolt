import React from 'react';
import { Plus } from 'lucide-react';
import { ContractSort, SortOption } from './ContractSort';

interface ContractHeaderProps {
  totalApps: number;
  sortValue: SortOption;
  onSortChange: (option: SortOption) => void;
  onOpenAppSelection: () => void;
}

export function ContractHeader({ totalApps, sortValue, onSortChange, onOpenAppSelection }: ContractHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="text-lg font-medium text-gray-900">
        Total Apps: {totalApps}
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenAppSelection}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Add managed app
        </button>
        <ContractSort value={sortValue} onChange={onSortChange} />
      </div>
    </div>
  );
}