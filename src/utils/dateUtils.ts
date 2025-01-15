import { addMonths, subMonths, format, parseISO } from 'date-fns';

export function calculateReviewDate(renewalDate: string): string {
  if (!renewalDate) return '';
  
  try {
    const renewal = new Date(renewalDate);
    const review = subMonths(renewal, 2);
    return format(review, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error calculating review date:', error);
    return '';
  }
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function formatToUSDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    return format(date, 'MM/dd/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}