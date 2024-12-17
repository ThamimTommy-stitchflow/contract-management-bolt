import { App } from '../types/app';

export function filterAppsBySearch(apps: App[], searchQuery: string): App[] {
  if (!searchQuery.trim()) return apps;
  const query = searchQuery.toLowerCase().trim();
  return apps.filter(app => 
    app.name.toLowerCase().includes(query) || 
    app.category.toLowerCase().includes(query)
  );
}