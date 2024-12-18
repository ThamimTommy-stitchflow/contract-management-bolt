import { useState, useCallback, useEffect } from 'react';
import { ContractRecord } from '../types/contracts';
import { SelectedApp } from '../types/app';
import { contractService } from '../services/contracts';
import { useCompany } from '../contexts/CompanyContext';
import { transformContractResponse } from '../utils/contractTransformer';

export function useContractStorage() {
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const { company } = useCompany();

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
      const updatedContracts = [];
      
      for (const app of selectedApps) {
        if (!app.contractDetails) continue;

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
            stitchflowConnection: app.contractDetails.stitchflowConnection || null
          }
        };

        const updatedContract = await contractService.updateContract(
          app.id,
          contractData,
          company.id
        );
        // Need to change the transformContractResponse to match the updatedContract structure
        updatedContracts.push(transformContractResponse(updatedContract));
      }
      
      setContracts(updatedContracts);
      return updatedContracts;
    } catch (error) {
      console.error('Failed to update contracts:', error);
      throw error;
    }
  }, [company?.id]);

  return {
    contracts,
    setContracts,
    updateContracts
  };
}