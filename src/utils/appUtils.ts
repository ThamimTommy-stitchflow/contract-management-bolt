import { kebabCase } from './stringUtils';

export function generateAppId(name: string): string {
  return `custom-${kebabCase(name)}`;
}