import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 
  | 'renewal-priority'
  | 'name-asc'
  | 'name-desc'
  | 'review-date'
  | 'total-value';

interface ContractSortProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

export function ContractSort({ value, onChange }: ContractSortProps) {
  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 transition-colors hover:bg-gray-50 group">
        <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="text-sm bg-transparent border-0 focus:ring-0 text-gray-600 hover:text-gray-900 font-medium appearance-none cursor-pointer pr-8 -mr-2 transition-colors outline-none"
        >
          <option value="renewal-priority">Sort by Renewal Priority</option>
          <option value="name-asc">Sort A-Z</option>
          <option value="name-desc">Sort Z-A</option>
          <option value="review-date">Sort by Access Review</option>
          <option value="total-value">Sort by Contract Value</option>
        </select>
      </div>
    </div>
  );
}