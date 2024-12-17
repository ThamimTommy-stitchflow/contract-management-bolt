import { useState, useCallback, useEffect } from 'react';
import { ContractRecord } from '../types/contracts';
import { SelectedApp } from '../types/app';
import { transformToContractRecords } from '../utils/contractTransformer';
import { contractService } from '../services/contracts';
import { useCompany } from '../contexts/CompanyContext';

export function useContractStorage() {
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const { company } = useCompany();

  // Load contracts on mount
  useEffect(() => {
    const loadContracts = async () => {
      console.log('company', company)
      if (!company?.id) return;
      
      try {
        const response = await contractService.getContract(company.id);
        if (response) {
          setContracts([response]);
        }
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
      const updatedContracts: ContractRecord[] = [];
      
      // Update each contract in the backend
      for (const app of selectedApps) {
        if (!app.contractDetails) continue;

        const contractData = {
          contractDetails: {
            renewalDate: app.contractDetails.renewalDate || '',
            reviewDate: app.contractDetails.reviewDate || '',
            overallTotalValue: app.contractDetails.overallTotalValue || '',
            notes: app.contractDetails.notes || '',
            contactDetails: app.contractDetails.contactDetails || '',
            services: app.contractDetails.services || [],
            stitchflowConnection: app.contractDetails.stitchflowConnection || null
          }
        };

        const updatedContract = await contractService.updateContract(
          app.id,
          contractData,
          company.id
        );
        
        updatedContracts.push(updatedContract);
      }
      
      setContracts(updatedContracts);
      return updatedContracts;
    } catch (error) {
      console.error('Failed to update contracts:', error);
      throw error;
    }
  }, [company?.id]);

  const removeContract = useCallback(async (appId: string) => {
    if (!company?.id) return;

    try {
      await contractService.updateContract(
        appId, 
        { 
          contractDetails: {
            renewalDate: '',
            reviewDate: '',
            overallTotalValue: '',
            notes: '',
            contactDetails: '',
            services: [],
            stitchflowConnection: null
          } 
        }, 
        company.id
      );
      setContracts(prev => prev.filter(contract => contract.appId !== appId));
    } catch (error) {
      console.error('Failed to remove contract:', error);
    }
  }, [company?.id]);

  return {
    contracts,
    setContracts,
    updateContracts,
    removeContract,
  };
}