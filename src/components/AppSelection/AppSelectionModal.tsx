import React, { useState, useRef } from 'react';
import { X, ListPlus } from 'lucide-react';
import { SearchBar } from '../Search/SearchBar';
import { AppList } from '../Apps/AppList';
import { CategoryChips } from '../Category/CategoryChips';
import { SelectedApps } from '../Apps/SelectedApps';
import { AppListInput } from './AppListInput';
import { CATEGORIES } from '../../constants/categories';
import { App, SelectedApp, ContractDetails } from '../../types/app';
import { ContractRecord } from '../../types/contracts';
import { filterAppsBySearch } from '../../utils/filterApps';
import { appService } from '../../services/apps';
import { useCompany } from '../../context/CompanyContext';

interface AppSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (app: App) => void;
  onUpdateDetails: (appId: string, details: Partial<ContractDetails>) => void;
  onRemoveApp: (appId: string) => void;
  onBulkSelect: (apps: App[]) => void;
  selectedApps: SelectedApp[];
  availableApps: App[];
  editingAppId?: string | null;
  currentContract?: ContractRecord;
}

export function AppSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectApp,
  onUpdateDetails,
  onRemoveApp,
  onBulkSelect,
  selectedApps,
  availableApps 
}: AppSelectionModalProps) {
  const { company } = useCompany();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAppListInput, setShowAppListInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const selectedAppsRef = useRef<{ getLocalChanges: () => Record<string, Partial<ContractDetails>>, hasAnyChanges: () => boolean }>(null);

  const filteredApps = filterAppsBySearch(
    selectedCategory 
      ? availableApps.filter(app => app.category === selectedCategory)
      : availableApps,
    searchQuery
  );

  const handleAppListSubmit = async (appList: string) => {
    try {
      await appService.uploadAppList(appList,company?.id ?? '');
      window.location.reload();
    } catch (error) {
      console.error('Failed to upload app list:', error);
    }
  }
  
  const handleDone = async () => {
    if (!selectedAppsRef.current) return;

    if (!selectedAppsRef.current.hasAnyChanges()) {
      // If no changes were made, just close the modal
      onClose();
      return;
    }

    const localChanges = selectedAppsRef.current.getLocalChanges();
    setIsSaving(true);

    try {
      // Save all changes
      await Promise.all(
        Object.entries(localChanges).map(([appId, details]) =>
          onUpdateDetails(appId, details)
        )
      );
      
      // Force a refresh of the contract view by triggering the useEffect in AppManagement
      const event = new Event('contract-updated');
      window.dispatchEvent(event);
      console.log('contract-updated event dispatched');
      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Manage Apps</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left side - Selected Apps */}
          <div className="w-1/2 p-4 border-r border-gray-200 overflow-y-auto">
            <SelectedApps
              ref={selectedAppsRef}
              selectedApps={selectedApps}
              onRemoveApp={onRemoveApp}
              onUpdateDetails={onUpdateDetails}
            />
          </div>

          {/* Right side - Available Apps */}
          <div className="w-1/2 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Search and other controls */}
              <div className="flex items-center justify-between">
                <SearchBar 
                  value={searchQuery} 
                  onChange={setSearchQuery}
                  onSelectApp={onSelectApp}
                  filteredApps={filteredApps}
                />
                <button
                  onClick={() => setShowAppListInput(!showAppListInput)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  <ListPlus className="h-4 w-4" />
                  Enter List
                </button>
              </div>

              {showAppListInput && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <AppListInput 
                    onSubmit={handleAppListSubmit}
                    onCancel={() => setShowAppListInput(false)}
                  />
                </div>
              )}
              
              <CategoryChips
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedApps={selectedApps}
              />
              
              <div className="space-y-6">
                {CATEGORIES.map((category) => (
                  <AppList
                    key={category}
                    category={category}
                    apps={filteredApps}
                    onSelectApp={onSelectApp}
                    selectedApps={selectedApps}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={handleDone}
            disabled={isSaving}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Saving...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}