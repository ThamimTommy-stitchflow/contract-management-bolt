export const validateCompanyName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Organization name is required';
  }
  if (name.length < 2) {
    return 'Organization name must be at least 2 characters';
  }
  if (name.length > 100) {
    return 'Organization name must be less than 100 characters';
  }
  return null;
};

export const validateAccessCode = (code: string): string | null => {
  if (!code.trim()) {
    return 'Access code is required';
  }
  if (code.length !== 4) {
    return 'Access code must be exactly 4 characters';
  }
  if (!/^[a-zA-Z0-9]+$/.test(code)) {
    return 'Access code must be alphanumeric';
  }
  return null;
};