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

  // Load selected apps and their contracts on mount
  useEffect(() => {
    const loadSelectedApps = async () => {
      if (!company?.id) return;

      try {
        setIsLoading(true);
        const apps = await appService.getCompanyApps(company.id);
        const contracts = await contractService.getCompanyContracts(company.id);
        console.log('apps', apps);
        const appsWithDetails = apps.map(app => {
          const contract = contracts.find(c => c.app_id === app.id);
          
          return {
            ...app,
            selected: true,
            contractDetails: contract ? {
              services: contract.services.map(service => ({
                id: service.id,
                name: service.name,
                licenseType: service.license_type,
                pricingModel: service.pricing_model,
                costPerUser: service.cost_per_user?.toString() || '',
                numberOfLicenses: service.number_of_licenses?.toString() || '',
                totalCost: service.total_cost?.toString() || ''
              })),
              overallTotalValue: contract.overall_total_value?.toString() || '',
              renewalDate: contract.renewal_date || '',
              reviewDate: contract.review_date || '',
              notes: contract.notes || '',
              contactDetails: contract.contact_details || '',
              contractFileUrl: contract.contract_file_url || '',
              stitchflowConnection: contract.stitchflow_connection
            } : {
              services: [createDefaultService()],
              overallTotalValue: '',
              renewalDate: '',
              reviewDate: '',
              notes: '',
              contactDetails: '',
              stitchflowConnection: 'API Supported'
            }
          };
        });
        console.log('appsWithDetails', appsWithDetails);
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
            stitchflowConnection: 'API Supported'
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
                ...details
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