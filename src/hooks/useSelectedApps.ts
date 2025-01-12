import { useState, useEffect, useCallback } from 'react';
import { App, SelectedApp, ContractDetails } from '../types/app';
import { appService } from '../services/apps';
import { contractService } from '../services/contracts';
import { createDefaultService, createDefaultContractDetails } from '../utils/serviceUtils';
import { useCompany } from '../context/CompanyContext';
import { AccessReviewCycle, SecurityTier, StitchflowConnection } from '../types/contracts';

interface ContractService {
  id: string;
  name: string;
  license_type: string;
  pricing_model: string;
  cost_per_user: number | null;
  number_of_licenses: number | null;
  total_cost: number | null;
}

interface Contract {
  id: string;
  app_id: string;
  services: ContractService[];
  overall_total_value: number | null;
  renewal_date: string | null;
  review_date: string | null;
  notes: string | null;
  contact_details: string | null;
  contract_file_url: string | null;
  stitchflow_connection: string;
  primary_app_owner: string | null;
  secondary_app_owner: string | null;
  access_review_cycle: string | null;
  security_tier: string | null;
}

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
        const appsWithDetails = apps.map((app: App) => {
          const contract = contracts.find((c: Contract) => c.app_id === app.id);
          
          return {
            ...app,
            selected: true,
            contractDetails: contract ? {
              services: contract.services.map((service: ContractService) => ({
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
              stitchflowConnection: contract.stitchflow_connection as StitchflowConnection,
              primaryAppOwner: contract.primary_app_owner,
              secondaryAppOwner: contract.secondary_app_owner,
              accessReviewCycle: contract.access_review_cycle,
              securityTier: contract.security_tier
            } : createDefaultContractDetails()
          };
        });

        setSelectedApps(appsWithDetails);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading selected apps:', error);
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
      // First add the app to company_apps
      await appService.selectApp(app.id, company.id);
      
      // Create default contract details
      const defaultContractDetails = createDefaultContractDetails();
      
      // Create contract with default service
      const contractData = {
        contractDetails: {
          ...defaultContractDetails,
          services: [createDefaultService()],
          stitchflowConnection: app.is_predefined ? 'API Supported' as StitchflowConnection : 'CSV Upload/API coming soon' as StitchflowConnection
        }
      };
      
      // Create contract record
      await contractService.createContract(app.id, contractData, company.id);
      
      // Update UI
      setSelectedApps(prev => {
        if (prev.some(a => a.id === app.id)) return prev;
        return [...prev, {
          ...app,
          selected: true,
          contractDetails: defaultContractDetails
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
      // Update backend
      await contractService.updateContract(appId, { contractDetails: details }, company.id);
      
      // Fetch all contracts to ensure we have the latest data
      const contracts = await contractService.getCompanyContracts(company.id);
      const updatedContract = contracts.find(c => c.app_id === appId);
      
      if (updatedContract) {
        // Update local state with the fresh data
        setSelectedApps(prev => prev.map(app => 
          app.id === appId 
            ? { 
                ...app, 
                contractDetails: {
                  services: updatedContract.services.map(s => ({
                    id: s.id,
                    name: s.name,
                    licenseType: s.license_type,
                    pricingModel: s.pricing_model,
                    costPerUser: s.cost_per_user?.toString() || '',
                    numberOfLicenses: s.number_of_licenses?.toString() || '',
                    totalCost: s.total_cost?.toString() || ''
                  })),
                  overallTotalValue: updatedContract.overall_total_value?.toString() || '',
                  renewalDate: updatedContract.renewal_date || '',
                  reviewDate: updatedContract.review_date || '',
                  notes: updatedContract.notes || '',
                  contactDetails: updatedContract.contact_details || '',
                  contractFileUrl: updatedContract.contract_file_url || '',
                  stitchflowConnection: updatedContract.stitchflow_connection as StitchflowConnection,
                  primaryAppOwner: updatedContract.primary_app_owner || '',
                  secondaryAppOwner: updatedContract.secondary_app_owner || '',
                  accessReviewCycle: updatedContract.access_review_cycle as AccessReviewCycle,
                  securityTier: updatedContract.security_tier as SecurityTier
                }
              }
            : app
        ));
      }
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

      // Select all apps and create contracts
      for (const app of apps) {
        if (!selectedApps.some(p => p.id === app.id)) {
          await appService.selectApp(app.id, company.id);
          
          // Create default contract details
          const defaultContractDetails = createDefaultContractDetails();
          
          // Create contract with default service
          const contractData = {
            contractDetails: {
              ...defaultContractDetails,
              services: [createDefaultService()],
              stitchflowConnection: app.is_predefined ? 'API Supported' as StitchflowConnection : 'CSV Upload/API coming soon' as StitchflowConnection
            }
          };
          
          // Create contract record
          await contractService.createContract(app.id, contractData, company.id);
        }
      }

      setSelectedApps(prev => {
        const newApps = apps
          .filter(app => !prev.some(p => p.id === app.id))
          .map(app => ({
            ...app,
            selected: true,
            contractDetails: createDefaultContractDetails()
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
    isLoading
  };
}