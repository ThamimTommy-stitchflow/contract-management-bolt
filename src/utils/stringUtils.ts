export function kebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}