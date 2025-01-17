import { kebabCase } from './stringUtils';
import { apps as availableApps } from '../data/apps';

export function generateAppId(name: string): string {
  return `custom-${kebabCase(name)}`;
}

export function isPreDefinedApp(appId: string): boolean {
  return availableApps.some(app => app.id === appId);
}