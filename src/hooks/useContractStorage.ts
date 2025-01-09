import { useState, useCallback, useEffect } from 'react';
import { ContractRecord } from '../types/contracts';
import { SelectedApp } from '../types/app';
import { transformToContractRecords, transformContractResponse } from '../utils/contractTransformer';
import { contractService } from '../services/contracts';
import { useCompany } from '../context/CompanyContext';


export function useContractStorage() {
  // const [contracts, setContracts] = useState<ContractRecord[]>(() => {
  //   const storedContracts = storage.get<ContractRecord[]>(STORAGE_KEY);
  //   return storedContracts || [];
  // });

  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const { company } = useCompany();

  // Persist contracts whenever they change
  // useEffect(() => {
  //   storage.set(STORAGE_KEY, contracts);
  // }, [contracts]);

  // Load contracts on mount
  useEffect(() => {
    const loadContracts = async () => {
      if (!company?.id) return;
      
      try {
        const response = await contractService.getCompanyContracts(company.id);
        // const transformedContracts = response.map(transformContractResponse);
        console.log(response)
        setContracts(response);
      } catch (error) {
        console.error('Failed to load contracts:', error);
      }
    };
    loadContracts();
  }, [company?.id]);

  const updateContracts = useCallback(async (selectedApps: SelectedApp[]) => {
    if (!company?.id) {
      throw new Error('No company ID available');
    }

    try {
      const updatedContracts:any[] = [];
      
      await Promise.all(selectedApps.map(async (app) => {
        if (!app.contractDetails) return;

        const contractData = {
          contractDetails: {
            renewalDate: app.contractDetails.renewalDate || '',
            reviewDate: app.contractDetails.reviewDate || '',
            overallTotalValue: app.contractDetails.overallTotalValue || '',
            notes: app.contractDetails.notes || '',
            contactDetails: app.contractDetails.contactDetails || '',
            services: app.contractDetails.services.map(service => ({
              name: service.name,
              licenseType: service.licenseType,
              pricingModel: service.pricingModel,
              costPerUser: service.costPerUser,
              numberOfLicenses: service.numberOfLicenses,
              totalCost: service.totalCost
            })),
            stitchflowConnection: app.contractDetails.stitchflowConnection || null,
            primaryAppOwner: app.contractDetails.primaryAppOwner || '',
            secondaryAppOwner: app.contractDetails.secondaryAppOwner || '',
            accessReviewCycle: app.contractDetails.accessReviewCycle || 'Monthly',
            securityTier: app.contractDetails.securityTier || 'Tier 3'
          }
        };

        try {
          const updatedContract = await contractService.updateContract(
            app.id,
            contractData,
            company.id
          );
        // Need to change the transformContractResponse to match the updatedContract structure
        updatedContracts.push(transformContractResponse(updatedContract));
      }catch (error) {
        console.error(`Failed to update contract for app ${app.id}:`, error);
        // Consider how you want to handle partial failures
        }
      }));
      
      setContracts(updatedContracts);
      return updatedContracts;
    } catch (error) {
      console.error('Failed to update contracts:', error);
      throw error;
    }
  }, [company?.id]);

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