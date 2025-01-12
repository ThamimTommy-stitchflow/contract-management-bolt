import { useState, useCallback, useEffect } from 'react';
import { ContractRecord } from '../types/contracts';
import { SelectedApp } from '../types/app';
import { transformToContractRecords, transformContractResponse } from '../utils/contractTransformer';
import { contractService } from '../services/contracts';
import { useCompany } from '../context/CompanyContext';

export function useContractStorage() {
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const { company } = useCompany();

  // Load contracts on mount
  useEffect(() => {
    const loadContracts = async () => {
      if (!company?.id) return;
      
      try {
        const response = await contractService.getCompanyContracts(company.id);
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
      const updatedContracts: ContractRecord[] = [];
      
      await Promise.all(selectedApps.map(async (app) => {
        if (!app.contractDetails) return;

        const contractData = {
          contractDetails: {
            renewalDate: app.contractDetails.renewalDate,
            reviewDate: app.contractDetails.reviewDate,
            overallTotalValue: app.contractDetails.overallTotalValue,
            notes: app.contractDetails.notes,
            contactDetails: app.contractDetails.contactDetails,
            services: app.contractDetails.services?.map(service => ({
              ...service,
              id: service.id || crypto.randomUUID()
            })),
            stitchflowConnection: app.contractDetails.stitchflowConnection,
            primaryAppOwner: app.contractDetails.primaryAppOwner,
            secondaryAppOwner: app.contractDetails.secondaryAppOwner,
            accessReviewCycle: app.contractDetails.accessReviewCycle,
            securityTier: app.contractDetails.securityTier
          }
        };

        try {
          const updatedContract = await contractService.updateContract(
            app.id,
            contractData,
            company.id
          );
          if (updatedContract) {
            updatedContracts.push(transformContractResponse(updatedContract));
          }
        } catch (error) {
          console.error(`Failed to update contract for app ${app.id}:`, error);
        }
      }));
      
      if (updatedContracts.length > 0) {
        setContracts(prev => {
          const updated = [...prev];
          updatedContracts.forEach(newContract => {
            const index = updated.findIndex(c => c.app_id === newContract.app_id);
            if (index !== -1) {
              updated[index] = newContract;
            } else {
              updated.push(newContract);
            }
          });
          return updated;
        });
      }
      return updatedContracts;
    } catch (error) {
      console.error('Failed to update contracts:', error);
      throw error;
    }
  }, [company?.id]);

  const removeContract = useCallback((appId: string) => {
    setContracts(prev => prev.filter(contract => contract.app_id !== appId));
  }, []);

  return {
    contracts,
    setContracts,
    updateContracts,
    removeContract,
  };
}