import React, { useState, useCallback, useEffect } from 'react';
import { Navigation } from '../../components/Navigation/Navigation';
import { SearchBar } from '../../components/Search/SearchBar';
import { AppList } from '../../components/Apps/AppList';
import { SelectedApps } from '../../components/Apps/SelectedApps';
import { CategoryChips } from '../../components/Category/CategoryChips';
import { ActionButtons } from '../../components/Actions/ActionButtons';
import { ContractsView } from '../../components/Contracts/ContractsView';
import { AppHeader } from '../../components/Header/AppHeader';
import { CATEGORIES } from '../../constants/categories';
import { useSelectedApps } from '../../hooks/useSelectedApps';
import { useContractStorage } from '../../hooks/useContractStorage';
import { useContractSync } from '../../hooks/useContractSync';
import { filterAppsBySearch } from '../../utils/filterApps';
import { parseAppList } from '../../utils/appListParser';
import { fileToApp } from '../../utils/fileToApp';
import { appService } from '../../services/apps';
import { App } from '../../types/app';

export function AppManagement() {
  const [activeTab, setActiveTab] = useState('apps');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  console.log(contracts)
  // Fetch apps from backend
  useEffect(() => {
    const fetchApps = async () => {
      try {
        setIsLoading(true);
        const fetchedApps = await appService.getAllApps();
        setApps(fetchedApps);
        setError(null);
      } catch (err) {
        setError('Failed to load apps. Please try again later.');
        console.error('Error fetching apps:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, []);

  // Combine backend apps with custom apps
  const allApps = [...apps, ...customApps];

  const filteredApps = filterAppsBySearch(
    selectedCategory 
      ? allApps.filter(app => app.category === selectedCategory)
      : allApps,
    searchQuery
  );

  const handleAppListSubmit = useCallback((appList: string) => {
    const parsedApps = parseAppList(appList);
    handleBulkSelect(parsedApps);
  }, [handleBulkSelect]);

  const handleContractUpload = useCallback((files: File[]) => {
    const apps = files.map(fileToApp);
    handleBulkSelect(apps);
  }, [handleBulkSelect]);

  const handleEditContract = useCallback((appId: string) => {
    setEditingAppId(appId);
    setActiveTab('apps');
  }, []);

  const handleRemoveContract = useCallback((appId: string) => {
    removeContract(appId);
    handleRemoveApp(appId);
  }, [handleRemoveApp, removeContract]);

  const handleSave = useCallback(() => {
    syncContracts();
  }, [syncContracts]);

  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        Loading apps...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AppHeader />
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'apps' ? (
          <>
            <div className="flex gap-4 mb-6">
              <ActionButtons 
                onAppListSubmit={handleAppListSubmit}
                onContractUpload={handleContractUpload}
              />
            </div>

            <div className="mb-8">
              <SelectedApps
                selectedApps={selectedApps}
                onRemoveApp={handleRemoveApp}
                onUpdateDetails={handleUpdateDetails}
                editingAppId={editingAppId}
                onSave={handleSave}
              />
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Available Apps</h2>
                <div className="mb-6">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>
                
                <div className="mb-6">
                  <CategoryChips
                    categories={CATEGORIES}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    selectedApps={selectedApps}
                  />
                </div>
                
                <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4">
                  {CATEGORIES.map((category) => (
                    <AppList
                      key={category}
                      category={category}
                      apps={filteredApps}
                      onSelectApp={handleSelectApp}
                      selectedApps={selectedApps}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <ContractsView 
            contracts={contracts} 
            onEdit={handleEditContract}
            onRemove={handleRemoveContract}
          />
        )}
      </div>
    </div>
  );
}