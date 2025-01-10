import { useCallback, useState } from 'react';
import { SelectedApp } from '../types/app';
import { useContractStorage } from './useContractStorage';

export function useContractSync(selectedApps: SelectedApp[]) {
  const { updateContracts } = useContractStorage();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync contracts whenever selectedApps changes
  const syncContracts = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await updateContracts(selectedApps);
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [selectedApps, updateContracts, isSyncing]);

  return { syncContracts, isSyncing };
}