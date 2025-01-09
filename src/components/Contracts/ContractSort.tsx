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
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="text-sm bg-transparent border-0 focus:ring-0 text-gray-600 font-medium appearance-none cursor-pointer pr-8"
        >
          <option value="renewal-priority">Sort by Renewal Priority</option>
          <option value="name-asc">Sort A-Z</option>
          <option value="name-desc">Sort Z-A</option>
          <option value="review-date">Sort by Access Review</option>
          <option value="total-value">Sort by Contract Value</option>
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}