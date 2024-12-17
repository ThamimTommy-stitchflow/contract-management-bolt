import React from 'react';
import { DollarSign } from 'lucide-react';
import { ContractSort, SortOption } from './ContractSort';

interface ContractHeaderProps {
  totalValue: string;
  sortValue: SortOption;
  onSortChange: (option: SortOption) => void;
}

export function ContractHeader({ totalValue, sortValue, onSortChange }: ContractHeaderProps) {
  const formattedValue = parseFloat(totalValue).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5">
        <div className="p-2 bg-blue-50 rounded-md">
          <DollarSign className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-600">Total Contract Value</div>
          <div className="text-lg font-semibold text-gray-900">
            ${formattedValue}
          </div>
        </div>
      </div>
      
      <ContractSort value={sortValue} onChange={onSortChange} />
    </div>
  );
}