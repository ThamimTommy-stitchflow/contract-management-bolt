import React, { useState, useCallback, useEffect } from 'react';
import { AppHeader } from '../../components/Header/AppHeader';
import { ContractsHeader } from '../../components/Contracts/ContractsHeader';
import { ContractsView } from '../../components/Contracts/ContractsView/ContractsView';
import { AppSelectionModal } from '../../components/AppSelection/AppSelectionModal';
import { ContractUploadModal } from '../../components/Upload/ContractUploadModal';
import { useSelectedApps } from '../../hooks/useSelectedApps';
import { useContractStorage } from '../../hooks/useContractStorage';
import { useContractSync } from '../../hooks/useContractSync';
import { fileToApp } from '../../utils/fileToApp';
import { App, ContractDetails } from '../../types/app';
import { appService } from '../../services/apps';
import { contractService } from '../../services/contracts';
import { useCompany } from '../../context/CompanyContext';

export function AppManagement() {
  const [isAppSelectionOpen, setIsAppSelectionOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    selectedApps,
    handleSelectApp,
    handleRemoveApp,
    handleUpdateDetails,
    handleBulkSelect,
    customApps
  } = useSelectedApps();

  const { contracts, removeContract } = useContractStorage();
  const { syncContracts } = useContractSync(selectedApps);
  const { company } = useCompany();

  // Fetch apps from backend
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const fetchedApps = await appService.getAllApps();
        setApps(fetchedApps);
      } catch (err) {
        console.error('Error fetching apps:', err);
      }
    };

    fetchApps();
  }, []);

  // Combine backend apps with custom apps
  const allApps = [...apps, ...customApps];

  const handleContractUpload = useCallback((files: File[]) => {
    if (!company?.id) {
      console.error('No company ID available');
      return;
    }
    const apps = files.map(fileToApp);
    handleBulkSelect(apps);
    setIsUploadModalOpen(false);
  }, [handleBulkSelect]);

  const handleEditContract = useCallback((appId: string) => {
    setEditingAppId(appId);
    setIsAppSelectionOpen(true);
  }, []);

  const handleRemoveContract = useCallback((appId: string) => {
    removeContract(appId);
    handleRemoveApp(appId);
  }, [handleRemoveApp, removeContract]);

  const handleContractUpdate = useCallback(async (appId: string, details: Partial<ContractDetails>) => {
    if (!company?.id) return;

    try {
      console.log('in AppManagement handleContractUpdate', details);
      await handleUpdateDetails(appId, details);
      // await syncContracts();
    } catch (error) {
      console.error('Failed to update contract:', error);
      // You might want to show an error message to the user here
    }
  }, [company?.id, handleUpdateDetails, syncContracts]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AppHeader />
        
        <ContractsHeader 
          totalApps={contracts.length}
          onOpenAppSelection={() => setIsAppSelectionOpen(true)}
          onOpenContractUpload={() => setIsUploadModalOpen(true)}
        />

        <ContractsView 
          contracts={contracts} 
          onEdit={handleEditContract}
          onRemove={handleRemoveContract}
          onUpdateDetails={handleContractUpdate}
        />

        <AppSelectionModal
          isOpen={isAppSelectionOpen}
          onClose={() => {
            setIsAppSelectionOpen(false);
            window.location.reload();
          }}
          onSelectApp={handleSelectApp}
          onUpdateDetails={handleContractUpdate}
          onRemoveApp={handleRemoveApp}
          onBulkSelect={handleBulkSelect}
          selectedApps={selectedApps}
          availableApps={allApps}
        />

        <ContractUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onDone={handleContractUpload}
          companyId={company?.id || ''}
        />
      </div>
    </div>
  );
}