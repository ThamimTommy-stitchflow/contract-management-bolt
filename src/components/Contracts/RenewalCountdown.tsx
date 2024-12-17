import React from 'react';
import { Clock } from 'lucide-react';
import { 
  differenceInMonths, 
  differenceInDays, 
  parseISO, 
  isValid, 
  isTomorrow,
  isToday,
  addDays
} from 'date-fns';

interface RenewalCountdownProps {
  renewalDate: string;
}

export function RenewalCountdown({ renewalDate }: RenewalCountdownProps) {
  if (!renewalDate) return null;

  const today = new Date();
  const renewal = parseISO(renewalDate);

  if (!isValid(renewal)) return null;

  const monthsDiff = differenceInMonths(renewal, today);
  const daysDiff = differenceInDays(renewal, today);

  // Only show for upcoming renewals within 6 months
  if (monthsDiff > 6 || daysDiff < 0) return null;

  const getCountdownText = () => {
    if (isToday(renewal)) {
      return 'Renewal today';
    }
    if (isTomorrow(renewal)) {
      return 'Renewal tomorrow';
    }
    if (monthsDiff === 0) {
      return `Renewal in ${daysDiff} days`;
    }
    if (monthsDiff === 1) {
      const remainingDays = daysDiff % 30;
      return remainingDays > 0 
        ? `Renewal in 1 month, ${remainingDays} days`
        : 'Renewal in 1 month';
    }
    const remainingDays = daysDiff % 30;
    return remainingDays > 0
      ? `Renewal in ${monthsDiff} months, ${remainingDays} days`
      : `Renewal in ${monthsDiff} months`;
  };

  const getStyles = () => {
    // Today or tomorrow - red with higher urgency
    if (isToday(renewal) || isTomorrow(renewal)) {
      return {
        bg: 'bg-red-100',
        border: 'border-red-200',
        icon: 'text-red-600',
        text: 'text-red-800 font-semibold'
      };
    }
    // Less than 1 month - red
    if (monthsDiff === 0) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-500',
        text: 'text-red-700'
      };
    }
    // 1-6 months - orange/amber
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-500',
      text: 'text-amber-700'
    };
  };

  const styles = getStyles();

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${styles.bg} border ${styles.border} rounded-md`}>
      <Clock className={`h-3.5 w-3.5 ${styles.icon}`} />
      <span className={`text-xs font-medium ${styles.text}`}>
        {getCountdownText()}
      </span>
    </div>
  );
}