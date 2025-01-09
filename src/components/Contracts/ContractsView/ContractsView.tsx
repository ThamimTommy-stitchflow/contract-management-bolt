import React, { useState, useCallback, useMemo } from 'react';
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

interface ContractsViewProps {
  contracts: ContractRecord[];
  onEdit?: (appId: string, details: Partial<ContractDetails>) => void;
  onRemove?: (appId: string) => void;
}

export function ContractsView({ contracts, onEdit, onRemove }: ContractsViewProps) {
  // 1. Move all hooks to the top
  const [sortBy, setSortBy] = useState<SortOption>('renewal-priority');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    appId: string;
    appName: string;
  }>({
    isOpen: false,
    appId: '',
    appName: ''
  });

  // 2. Extract app IDs and use app details hook
  const appIds = useMemo(() => contracts.map(contract => contract.app_id), [contracts]);
  const { appDetailsMap, isLoading } = useAppDetails(appIds);
  
  console.log('in ContractsView contracts', contracts);

  // 3. Memoize derived data
  const enrichedContracts = useMemo(() => {
    return contracts.map(contract => {
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
  }, [contracts, appDetailsMap]);

  const groupedContracts = useMemo(() => 
    groupContractsByApp(enrichedContracts), 
    [enrichedContracts]
  );


  const sortedContracts = useMemo(() => 
    sortContracts(groupedContracts, sortBy), 
    [groupedContracts, sortBy]
  );


  const totalContractValue = useMemo(() => 
    calculateTotalContractValue(groupedContracts), 
    [groupedContracts]
  );

  // 4. Event handlers using useCallback
  const handleDeleteClick = useCallback((appId: string, appName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      appId,
      appName
    });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (onRemove && deleteConfirmation.appId) {
      onRemove(deleteConfirmation.appId);
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

  const handleSave = useCallback((appId: string, details: Partial<ContractDetails>) => {
    if (onEdit) {
      onEdit(appId, details);
    }
  }, [onEdit]);

  // 5. Early return for empty state
  if (contracts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">
          No contracts available. Add apps and complete their details to see them here.
        </p>
      </div>
    );
  }

  // 6. Render with memoized data
  return (
    <div className="space-y-6">
      <ContractHeader 
        totalValue={totalContractValue}
        sortValue={sortBy}
        onSortChange={setSortBy}
      />

      <div className="space-y-4">
        {sortedContracts.map((contract) => (
          <EditableContractCard
            key={contract.appId}
            contract={contract}
            onSave={handleSave}
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