import React from 'react';
import { Plus, Check } from 'lucide-react';
import { App } from '../../types/app';

interface AppCardProps {
  app: App;
  onSelect: (app: App) => void;
  isSelected: boolean;
}

export function AppCard({ app, onSelect, isSelected }: AppCardProps) {
  return (
    <button
      onClick={() => onSelect(app)}
      className={`flex items-center justify-between p-3 text-sm rounded-lg border transition-colors
        ${isSelected 
          ? 'bg-green-50 border-green-200 text-green-700' 
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      disabled={isSelected}
    >
      <span>{app.name}</span>
      {isSelected ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Plus className="h-4 w-4 text-gray-400" />
      )}
    </button>
  );
}