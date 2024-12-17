import { useState, useCallback } from 'react';
import { App, SelectedApp, ContractDetails } from '../types/app';

export function useAppSelection() {
  const [selectedApps, setSelectedApps] = useState<SelectedApp[]>([]);
  const [customApps, setCustomApps] = useState<App[]>([]);

  const handleSelectApp = useCallback((app: App) => {
    setSelectedApps(prev => {
      if (prev.some(a => a.id === app.id)) return prev;
      // Add default values for contract details
      const defaultContractDetails: Partial<ContractDetails> = {
        licenseType: 'Annual',
        pricingModel: 'Flat rated',
      };
      return [...prev, { 
        ...app, 
        selected: true,
        contractDetails: defaultContractDetails 
      }];
    });
  }, []);

  const handleBulkSelect = useCallback((apps: App[]) => {
    // Add new custom apps to the customApps state
    setCustomApps(prev => {
      const newCustomApps = apps.filter(app => 
        app.category === 'CSV Uploads' && 
        !prev.some(p => p.id === app.id)
      );
      return [...prev, ...newCustomApps];
    });

    // Add all apps to selected apps with default contract details
    setSelectedApps(prev => {
      const defaultContractDetails: Partial<ContractDetails> = {
        licenseType: 'Annual',
        pricingModel: 'Flat rated',
      };
      const newApps = apps.filter(app => !prev.some(p => p.id === app.id));
      return [...prev, ...newApps.map(app => ({ 
        ...app, 
        selected: true,
        contractDetails: defaultContractDetails
      }))];
    });
  }, []);

  const handleRemoveApp = useCallback((appId: string) => {
    setSelectedApps(prev => prev.filter(app => app.id !== appId));
    setCustomApps(prev => prev.filter(app => app.id !== appId));
  }, []);

  const handleUpdateDetails = useCallback((appId: string, details: Partial<ContractDetails>) => {
    setSelectedApps(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, contractDetails: { ...app.contractDetails, ...details } }
        : app
    ));
  }, []);

  return {
    selectedApps,
    customApps,
    handleSelectApp,
    handleRemoveApp,
    handleUpdateDetails,
    handleBulkSelect,
  };
}