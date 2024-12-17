import { useState, useCallback, useEffect } from 'react';
import { App, SelectedApp, ContractDetails } from '../types/app';
import { storage } from '../storage/localStorage';
import { createDefaultService } from '../utils/serviceUtils';

const STORAGE_KEY = 'selected_apps';

export function useSelectedApps() {
  const [selectedApps, setSelectedApps] = useState<SelectedApp[]>(() => {
    return storage.get<SelectedApp[]>(STORAGE_KEY) || [];
  });

  const [customApps, setCustomApps] = useState<App[]>([]);

  // Persist selected apps whenever they change
  useEffect(() => {
    storage.set(STORAGE_KEY, selectedApps);
  }, [selectedApps]);

  const createDefaultContractDetails = useCallback((): ContractDetails => ({
    services: [createDefaultService()],
    overallTotalValue: '',
    renewalDate: '',
    reviewDate: '',
    notes: '',
    contactDetails: '',
    stitchflowConnection: 'CSV Upload/API coming soon',
    contractFileUrl: ''
  }), []);

  const handleUpdateDetails = useCallback((appId: string, details: Partial<ContractDetails>) => {
    setSelectedApps(prev => prev.map(app => 
      app.id === appId 
        ? { 
            ...app, 
            contractDetails: { 
              ...createDefaultContractDetails(),
              ...app.contractDetails,
              ...details,
              services: details.services || app.contractDetails?.services || [createDefaultService()]
            } 
          }
        : app
    ));
  }, [createDefaultContractDetails]);

  const handleSelectApp = useCallback((app: App) => {
    setSelectedApps(prev => {
      if (prev.some(a => a.id === app.id)) return prev;
      return [...prev, {
        ...app,
        selected: true,
        contractDetails: {
          ...createDefaultContractDetails(),
          ...app.contractDetails // Preserve any existing contract details
        }
      }];
    });
  }, [createDefaultContractDetails]);

  const handleRemoveApp = useCallback((appId: string) => {
    setSelectedApps(prev => prev.filter(app => app.id !== appId));
    setCustomApps(prev => prev.filter(app => app.id !== appId));
  }, []);

  const handleBulkSelect = useCallback((apps: App[]) => {
    setCustomApps(prev => {
      const newCustomApps = apps.filter(app => 
        app.category === 'CSV Uploads' && 
        !prev.some(p => p.id === app.id)
      );
      return [...prev, ...newCustomApps];
    });

    setSelectedApps(prev => {
      const newApps = apps
        .filter(app => !prev.some(p => p.id === app.id))
        .map(app => ({
          ...app,
          selected: true,
          contractDetails: {
            ...createDefaultContractDetails(),
            ...app.contractDetails // Preserve any existing contract details
          }
        }));
      return [...prev, ...newApps];
    });
  }, [createDefaultContractDetails]);

  return {
    selectedApps,
    customApps,
    handleSelectApp,
    handleRemoveApp,
    handleUpdateDetails,
    handleBulkSelect,
  };
}