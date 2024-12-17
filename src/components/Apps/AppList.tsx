import React from 'react';
import { AppCard } from './AppCard';
import { App } from '../../types/app';

interface AppListProps {
  apps: App[];
  category: string;
  onSelectApp: (app: App) => void;
  selectedApps: App[];
}

export function AppList({ apps, category, onSelectApp, selectedApps }: AppListProps) {
  const categoryApps = apps.filter(app => app.category === category);

  if (categoryApps.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium sticky top-0 bg-gray-100 py-2 text-gray-900 z-10">
        {category}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {categoryApps.map((app) => (
          <AppCard 
            key={app.id} 
            app={app} 
            onSelect={onSelectApp}
            isSelected={selectedApps.some(selectedApp => selectedApp.id === app.id)}
          />
        ))}
      </div>
    </div>
  );
}