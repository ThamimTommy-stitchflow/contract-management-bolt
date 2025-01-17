import React from 'react';
import { Search, X } from 'lucide-react';
import { SearchResults } from './SearchResults';
import { App } from '../../types/app';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSelectApp: (app: App) => void;
  filteredApps: App[];
  onAddCustomApp: (app: string) => void;
  isAddingApp?: boolean;
}

export function SearchBar({ value, onChange, onSelectApp, filteredApps, onAddCustomApp, isAddingApp = false }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        placeholder="Search apps..."
        className="w-full h-10 pl-10 pr-10 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <SearchResults
        searchQuery={value}
        filteredApps={filteredApps}
        onSelectApp={onSelectApp}
        onAddCustomApp={onAddCustomApp}
        isAddingApp={isAddingApp}
      />
    </div>
  );
}