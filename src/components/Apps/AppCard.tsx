import React from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { App } from '../../types/app';

interface AppCardProps {
  app: App;
  onSelect: (app: App) => void;
  isSelected: boolean;
  isLoading?: boolean;
}

export function AppCard({ app, onSelect, isSelected, isLoading = false }: AppCardProps) {
  return (
    <button
      onClick={() => onSelect(app)}
      className={`flex items-center justify-between p-3 text-sm rounded-lg border transition-colors
        ${isSelected 
          ? 'bg-green-50 border-green-200 text-green-700' 
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      disabled={isSelected || isLoading}
    >
      <span>{app.name}</span>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <>
            <span className="text-blue-500">Adding...</span>
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          </>
        ) : isSelected ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Plus className="h-4 w-4 text-gray-400" />
        )}
      </div>
    </button>
  );
}