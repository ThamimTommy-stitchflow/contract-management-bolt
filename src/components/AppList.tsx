import React from 'react';
import { Plus } from 'lucide-react';
import { App } from '../types';

interface AppListProps {
  apps: App[];
  category: string;
  onSelectApp: (app: App) => void;
}

export function AppList({ apps, category, onSelectApp }: AppListProps) {
  const categoryApps = apps.filter(app => app.category === category);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900">{category}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {categoryApps.map((app) => (
          <button
            key={app.id}
            onClick={() => onSelectApp(app)}
            className="flex items-center justify-between p-3 text-sm text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <span>{app.name}</span>
            <Plus className="h-4 w-4 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}