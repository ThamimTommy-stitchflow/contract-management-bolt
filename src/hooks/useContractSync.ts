import { useCallback, useState } from 'react';
import { useContractStorage } from './useContractStorage';
import { useCompany } from '../context/CompanyContext';
import { contractService } from '../services/contracts';

export function useContractSync() {
  const { setContracts } = useContractStorage();
  const { company } = useCompany();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncContracts = useCallback(async () => {
    if (isSyncing || !company?.id) return;
    
    setIsSyncing(true);
    try {
      const freshContracts = await contractService.getCompanyContracts(company.id);
      setContracts(freshContracts);
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [company?.id, isSyncing, setContracts]);

  return { syncContracts, isSyncing };
}