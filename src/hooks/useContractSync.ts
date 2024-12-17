import { useCallback, useEffect } from 'react';
import { SelectedApp } from '../types/app';
import { useContractStorage } from './useContractStorage';
import { transformToContractRecords } from '../utils/contractTransformer';

export function useContractSync(selectedApps: SelectedApp[]) {
  const { setContracts } = useContractStorage();

  // Sync contracts whenever selectedApps changes
  useEffect(() => {
    const contractRecords = transformToContractRecords(selectedApps);
    setContracts(contractRecords);
  }, [selectedApps, setContracts]);

  // Manual sync function for explicit updates
  const syncContracts = useCallback(() => {
    const contractRecords = transformToContractRecords(selectedApps);
    setContracts(contractRecords);
  }, [selectedApps, setContracts]);

  return { syncContracts };
}