import { addMonths, subMonths, format, parse } from 'date-fns';

export function formatDate(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MM/dd/yyyy');
}

export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  try {
    // Handle both formats: YYYY-MM-DD and MM/DD/YYYY
    if (dateString.includes('-')) {
      return parse(dateString, 'yyyy-MM-dd', new Date());
    }
    return parse(dateString, 'MM/dd/yyyy', new Date());
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

export function calculateReviewDate(renewalDate: string): string {
  if (!renewalDate) return '';
  
  try {
    const renewal = parseDate(renewalDate);
    if (!renewal) return '';
    
    const review = subMonths(renewal, 2);
    return formatDate(review);
  } catch (error) {
    console.error('Error calculating review date:', error);
    return '';
  }
}

export function isValidDate(dateString: string): boolean {
  const date = parseDate(dateString);
  return date !== null;
}