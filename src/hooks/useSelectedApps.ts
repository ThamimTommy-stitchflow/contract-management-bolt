import { useState, useEffect, useCallback } from 'react';
import { App, SelectedApp, ContractDetails } from '../types/app';
import { appService } from '../services/apps';
import { contractService } from '../services/contracts';
import { createDefaultService } from '../utils/serviceUtils';
import { useCompany } from '../contexts/CompanyContext';

export function useSelectedApps() {
  const [selectedApps, setSelectedApps] = useState<SelectedApp[]>([]);
  const [customApps, setCustomApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { company } = useCompany();

  // Load selected apps on mount
  useEffect(() => {
    const loadSelectedApps = async () => {
      if (!company?.id) return;

      try {
        setIsLoading(true);
        const apps = await appService.getCompanyApps(company.id);
        
        // Fetch contract details for each app
        const appsWithDetails = await Promise.all(
          apps.map(async (app) => {
            try {
              const contractDetails = await contractService.getContract(app.id);
              return {
                ...app,
                selected: true,
                contractDetails: {
                  services: [createDefaultService()],
                  ...contractDetails
                }
              };
            } catch (error) {
              console.error(`Failed to fetch contract details for app ${app.id}:`, error);
              return {
                ...app,
                selected: true,
                contractDetails: {
                  services: [createDefaultService()],
                  overallTotalValue: '',
                  renewalDate: '',
                  reviewDate: '',
                  notes: '',
                  contactDetails: '',
                }
              };
            }
          })
        );

        setSelectedApps(appsWithDetails);
      } catch (error) {
        console.error('Failed to load selected apps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedApps();
  }, [company?.id]);

  const handleSelectApp = useCallback(async (app: App) => {
    if (!company?.id) {
      throw new Error('No company ID available');
    }

    try {
      await appService.selectApp(app.id, company.id);
      
      setSelectedApps(prev => {
        if (prev.some(a => a.id === app.id)) return prev;
        return [...prev, {
          ...app,
          selected: true,
          contractDetails: {
            services: [createDefaultService()],
            overallTotalValue: '',
            renewalDate: '',
            reviewDate: '',
            notes: '',
            contactDetails: '',
          }
        }];
      });
    } catch (error) {
      console.error('Failed to select app:', error);
      throw error;
    }
  }, [company?.id]);

  const handleRemoveApp = useCallback(async (appId: string) => {
    if (!company?.id) {
      throw new Error('No company ID available');
    }

    try {
      await appService.unselectApp(appId, company.id);
      
      setSelectedApps(prev => prev.filter(app => app.id !== appId));
      setCustomApps(prev => prev.filter(app => app.id !== appId));
    } catch (error) {
      console.error('Failed to remove app:', error);
      throw error;
    }
  }, [company?.id]);

  const handleUpdateDetails = useCallback(async (appId: string, details: Partial<ContractDetails>) => {
    if (!company?.id) {
      throw new Error('No company ID available');
    }

    try {
      await contractService.updateContract(appId, { contractDetails: details }, company.id);
      
      setSelectedApps(prev => prev.map(app => 
        app.id === appId 
          ? { 
              ...app, 
              contractDetails: { 
                ...app.contractDetails,
                ...details,
                services: details.services || app.contractDetails?.services || [createDefaultService()]
              } 
            }
          : app
      ));
    } catch (error) {
      console.error('Failed to update contract details:', error);
      throw error;
    }
  }, [company?.id]);

  const handleBulkSelect = useCallback(async (apps: App[]) => {
    if (!company?.id) {
      throw new Error('No company ID available');
    }

    try {
      // Add new custom apps
      const newCustomApps = apps.filter(app => 
        app.category === 'CSV Uploads' && 
        !customApps.some(p => p.id === app.id)
      );

      for (const app of newCustomApps) {
        await appService.createCustomApp(app);
      }

      setCustomApps(prev => [...prev, ...newCustomApps]);

      // Select all apps
      for (const app of apps) {
        if (!selectedApps.some(p => p.id === app.id)) {
          await appService.selectApp(app.id, company.id);
        }
      }

      setSelectedApps(prev => {
        const newApps = apps
          .filter(app => !prev.some(p => p.id === app.id))
          .map(app => ({
            ...app,
            selected: true,
            contractDetails: {
              services: [createDefaultService()],
              overallTotalValue: '',
              renewalDate: '',
              reviewDate: '',
              notes: '',
              contactDetails: '',
            }
          }));
        return [...prev, ...newApps];
      });
    } catch (error) {
      console.error('Failed to bulk select apps:', error);
      throw error;
    }
  }, [company?.id, customApps, selectedApps]);

  return {
    selectedApps,
    customApps,
    handleSelectApp,
    handleRemoveApp,
    handleUpdateDetails,
    handleBulkSelect,
    isLoading,
  };
}