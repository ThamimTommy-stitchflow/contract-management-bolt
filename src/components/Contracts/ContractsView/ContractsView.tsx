import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ContractRecord } from '../../../types/contracts';
import { ContractDetails } from '../../../types/app';
import { groupContractsByApp } from '../../../utils/contractGrouping';
import { sortContracts } from '../../../utils/contractSorting';
import { calculateTotalContractValue } from '../../../utils/contractCalculations';
import { ContractHeader } from '../ContractHeader';
import { EditableContractCard } from './EditableContractCard';
import { DeleteConfirmationModal } from '../../Modals/DeleteConfirmationModal';
import type { SortOption } from '../ContractSort';
import { useAppDetails } from '../../../hooks/useAppDetails';
import { formatToUSDate } from '../../../utils/dateUtils';

interface ContractsViewProps {
  contracts: ContractRecord[];
  onEdit?: (appId: string) => void;
  onRemove?: (appId: string) => void;
  onUpdateDetails: (appId: string, details: Partial<ContractDetails>) => Promise<void>;
  onOpenAppSelection: () => void;
}

export function ContractsView({ contracts, onEdit, onRemove, onUpdateDetails, onOpenAppSelection }: ContractsViewProps) {
  // 1. Move all hooks to the top
  const [sortBy, setSortBy] = useState<SortOption>('renewal-priority');
  const [localContracts, setLocalContracts] = useState(contracts);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    appId: string;
    appName: string;
  }>({
    isOpen: false,
    appId: '',
    appName: ''
  });

  // Update localContracts when contracts prop changes
  useEffect(() => {
    setLocalContracts(contracts);
  }, [contracts]);

  // 2. Extract app IDs and use app details hook
  const appIds = useMemo(() => localContracts.map(contract => contract.app_id), [localContracts]);
  const { appDetailsMap, isLoading: isLoadingApps } = useAppDetails(appIds);
  
  console.log('in ContractsView contracts', contracts);
  // 3. Memoize derived data
  const enrichedContracts = useMemo(() => {
    return localContracts.map(contract => {
      const appDetails = appDetailsMap.get(contract.app_id);
      return {
        ...contract,
        appId: contract.app_id,
        appName: appDetails?.name || 'Unknown App',
        category: appDetails?.category || 'Unknown Category',
        accessReviewCycle: contract.access_review_cycle,
        contractFileUrl: contract.contract_file_url || 'Not Provided',
        contactDetails: contract.contact_details || 'Not Provided',
        notes: contract.notes || 'Not Provided',
        primaryAppOwner: contract.primary_app_owner || 'Not Provided',
        secondaryAppOwner: contract.secondary_app_owner || 'Not Provided',
        securityTier: contract.security_tier,
        stitchflowConnection: contract.stitchflow_connection,
        planName: contract.plan_name,
        services: contract.services.map(service => ({
          ...service,
          id: service.id,
          name: service.name,
          licenseType: service.license_type,
          pricingModel: service.pricing_model,
          costPerUser: service.cost_per_user,
          numberOfLicenses: service.number_of_licenses,
          totalCost: service.total_cost,
          contractId: contract.id,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt
        }))
      };
    });
  }, [localContracts, appDetailsMap]);


  console.log('in ContractsView enrichedContracts', enrichedContracts);
  const groupedContracts = useMemo(() => 
    groupContractsByApp(enrichedContracts), 
    [enrichedContracts]
  );

  console.log("Grouped Contracts", groupedContracts)

  const sortedContracts = useMemo(() => 
    sortContracts(groupedContracts, sortBy), 
    [groupedContracts, sortBy]
  );
  console.log('in ContractsView sortedContracts', sortedContracts);
  const totalContractValue = useMemo(() => 
    calculateTotalContractValue(groupedContracts), 
    [groupedContracts]
  );

  
  // Handle contract update
  const handleContractUpdate = async (appId: string, details: Partial<ContractDetails>) => {
    try {
      await onUpdateDetails(appId, details);
      // Update local state after successful backend update
      setLocalContracts(prevContracts => 
        prevContracts.map(contract => {
          if (contract.app_id === appId) {
            // Transform the services to match ServiceRecord type
            const updatedServices = details.services?.map(service => ({
              id: service.id,
              name: service.name,
              license_type: service.licenseType,
              pricing_model: service.pricingModel,
              cost_per_user: service.costPerUser ? parseFloat(service.costPerUser) : null,
              number_of_licenses: service.numberOfLicenses ? parseFloat(service.numberOfLicenses) : null,
              total_cost: service.totalCost ? parseFloat(service.totalCost) : null,
              contractId: contract.id,
              createdAt: contract.createdAt,
              updatedAt: new Date().toISOString()
            }));

            return {
              ...contract,
              overall_total_value: details.overallTotalValue ? parseFloat(details.overallTotalValue) : contract.overall_total_value,
              renewal_date: details.renewalDate || contract.renewal_date,
              review_date: details.reviewDate || contract.review_date,
              notes: details.notes || contract.notes,
              contact_details: details.contactDetails || contract.contact_details,
              primaryAppOwner: details.primaryAppOwner || contract.primaryAppOwner,
              secondaryAppOwner: details.secondaryAppOwner || contract.secondaryAppOwner,
              accessReviewCycle: details.accessReviewCycle || contract.accessReviewCycle,
              securityTier: details.securityTier || contract.securityTier,
              services: updatedServices || contract.services,
              planName: details.planName || contract.planName
            };
          }
          return contract;
        })
      );
    } catch (error) {
      console.error('Failed to update contract:', error);
      throw error;
    }
  };

  // 4. Event handlers using useCallback
  const handleDeleteClick = useCallback((appId: string, appName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      appId,
      appName
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (onRemove && deleteConfirmation.appId) {
      await onRemove(deleteConfirmation.appId);
      // Update local state after successful deletion
      setLocalContracts(prevContracts => 
        prevContracts.filter(contract => contract.app_id !== deleteConfirmation.appId)
      );
    }
    setDeleteConfirmation({
      isOpen: false,
      appId: '',
      appName: ''
    });
  }, [onRemove, deleteConfirmation.appId]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmation({
      isOpen: false,
      appId: '',
      appName: ''
    });
  }, []);

  // 5. Early return for empty state
  if (localContracts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">
          No contracts available. Add apps and complete their details to see them here.
        </p>
      </div>
    );
  }

  // 6. Early return for loading state
  if (isLoadingApps) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 7. Render with memoized data
  return (
    <div className="space-y-6">
      <ContractHeader 
        totalApps={localContracts.length}
        sortValue={sortBy}
        onSortChange={setSortBy}
        onOpenAppSelection={onOpenAppSelection}
      />

      <div className="space-y-4">
        {sortedContracts.map((contract) => (
          <EditableContractCard
            key={contract.appId}
            contract={contract}
            onSave={handleContractUpdate}
            onRemove={onRemove ? 
              () => handleDeleteClick(contract.appId, contract.appName) : 
              undefined
            }
          />
        ))}
      </div>

      {deleteConfirmation.isOpen && (
        <DeleteConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          appName={deleteConfirmation.appName}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}