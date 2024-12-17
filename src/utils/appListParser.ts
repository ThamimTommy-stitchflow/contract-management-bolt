import { App } from '../types/app';
import { apps as availableApps } from '../data/apps';
import { generateAppId } from './appUtils';

export function parseAppList(input: string): App[] {
  const appNames = input
    .split(/[,\n]/)
    .map(name => name.trim())
    .filter(name => name.length > 0);

  return appNames.map(name => {
    // First try to find an exact match (case-insensitive)
    let matchedApp = availableApps.find(app => 
      app.name.toLowerCase() === name.toLowerCase()
    );

    // If no exact match, try partial match
    if (!matchedApp) {
      matchedApp = availableApps.find(app => 
        app.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (matchedApp) {
      return matchedApp;
    }

    // Create new app with CSV Uploads category
    return {
      id: generateAppId(name),
      name: name.trim(),
      category: 'CSV Uploads' as const,
    };
  });
}