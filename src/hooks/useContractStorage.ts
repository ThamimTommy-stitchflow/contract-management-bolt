import { useState, useCallback, useEffect } from 'react';
import { ContractRecord } from '../types/contracts';
import { SelectedApp } from '../types/app';
import { transformToContractRecords } from '../utils/contractTransformer';
import { storage } from '../storage/localStorage';

const STORAGE_KEY = 'contract_records';

export function useContractStorage() {
  const [contracts, setContracts] = useState<ContractRecord[]>(() => {
    return storage.get<ContractRecord[]>(STORAGE_KEY) || [];
  });

  // Persist contracts whenever they change
  useEffect(() => {
    storage.set(STORAGE_KEY, contracts);
  }, [contracts]);

  const updateContracts = useCallback((selectedApps: SelectedApp[]) => {
    const newContracts = transformToContractRecords(selectedApps);
    setContracts(newContracts);
  }, []);

  const removeContract = useCallback((appId: string) => {
    setContracts(prev => prev.filter(contract => contract.appId !== appId));
  }, []);

  return {
    contracts,
    setContracts,
    updateContracts,
    removeContract,
  };
}