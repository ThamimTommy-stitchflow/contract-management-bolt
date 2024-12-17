import { GroupedContract } from './contractGrouping';

export function calculateTotalContractValue(contracts: GroupedContract[]): string {
  const total = contracts.reduce((sum, contract) => {
    const value = parseFloat(contract.overallTotalValue) || 0;
    return sum + value;
  }, 0);

  return total.toFixed(2);
}