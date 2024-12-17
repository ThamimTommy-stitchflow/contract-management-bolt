import { GroupedContract } from './contractGrouping';
import { parseISO, isValid } from 'date-fns';

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const date = parseISO(dateStr);
  return isValid(date) ? date : null;
}

function parseValue(value: string): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

export function sortContracts(contracts: GroupedContract[], sortBy: string): GroupedContract[] {
  const sortedContracts = [...contracts];

  switch (sortBy) {
    case 'renewal-priority': {
      return sortedContracts.sort((a, b) => {
        const dateA = parseDate(a.renewalDate);
        const dateB = parseDate(b.renewalDate);

        // Put contracts with renewal dates first
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        // Sort by closest renewal date
        return dateA.getTime() - dateB.getTime();
      });
    }

    case 'name-asc': {
      return sortedContracts.sort((a, b) => 
        a.appName.toLowerCase().localeCompare(b.appName.toLowerCase())
      );
    }

    case 'name-desc': {
      return sortedContracts.sort((a, b) => 
        b.appName.toLowerCase().localeCompare(a.appName.toLowerCase())
      );
    }

    case 'review-date': {
      return sortedContracts.sort((a, b) => {
        const dateA = parseDate(a.reviewDate);
        const dateB = parseDate(b.reviewDate);

        // Put contracts with review dates first
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        // Sort by closest review date
        return dateA.getTime() - dateB.getTime();
      });
    }

    case 'total-value': {
      return sortedContracts.sort((a, b) => {
        const valueA = parseValue(a.overallTotalValue);
        const valueB = parseValue(b.overallTotalValue);

        // Sort by highest value first
        return valueB - valueA;
      });
    }

    default:
      return sortedContracts;
  }
}