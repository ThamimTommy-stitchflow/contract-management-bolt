import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { App } from '../../types/app';
import { generateAppId } from '../../utils/appUtils';

interface SearchResultsProps {
  searchQuery: string;
  filteredApps: App[];
  onSelectApp: (app: App) => void;
  onAddCustomApp: (name: string) => void;
  isAddingApp?: boolean;
}

export function SearchResults({ 
  searchQuery, 
  filteredApps = [], 
  onSelectApp,
  onAddCustomApp,
  isAddingApp = false
}: SearchResultsProps) {
  const query = searchQuery.trim().toLowerCase();
  
  // Only proceed if we have a query
  if (!query) return null;

  // Check if we have any matches
  const matchingApps = filteredApps.filter(app => 
    app.name.toLowerCase().includes(query)
  );

  // Check for exact match
  const hasExactMatch = matchingApps.some(
    app => app.name.toLowerCase() === query
  );

  const handleAddCustomApp = () => {
    const name = searchQuery.trim();
    onAddCustomApp(name)
  };

  return (
    <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-10 max-h-64 overflow-y-auto">
      {/* Show matching apps */}
      {matchingApps.length > 0 && (
        <div className="py-1">
          {matchingApps.map(app => (
            <button
              key={app.id}
              onClick={() => onSelectApp(app)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
            >
              <span>{app.name}</span>
              <span className="text-xs text-gray-500">{app.category}</span>
            </button>
          ))}
        </div>
      )}

      {/* Show Add option only if no exact match exists */}
      {!hasExactMatch && query.length >= 2 && (
        <>
          {matchingApps.length > 0 && <div className="border-t border-gray-100" />}
          <button
            onClick={handleAddCustomApp}
            disabled={isAddingApp}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-blue-600 disabled:opacity-50"
          >
            {isAddingApp ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {isAddingApp ? 'Adding...' : `Add "${searchQuery.trim()}"`}
          </button>
        </>
      )}
    </div>
  );
}