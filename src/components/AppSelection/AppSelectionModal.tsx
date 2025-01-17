import React, { useState, useRef } from 'react';
import { X, ListPlus, Upload, File, Trash2, Loader2 } from 'lucide-react';
import { SearchBar } from '../Search/SearchBar';
import { AppCard } from '../Apps/AppCard';
import { SelectedApps } from '../Apps/SelectedApps';
import { AppListInput } from './AppListInput';
import { CATEGORIES } from '../../constants/categories';
import { App, SelectedApp, ContractDetails } from '../../types/app';
import { ContractRecord } from '../../types/contracts';
import { filterAppsBySearch } from '../../utils/filterApps';
import { appService } from '../../services/apps';
import { useCompany } from '../../context/CompanyContext';
import { useContractFiles } from '../../hooks/useContractFiles';
import { contractService } from '../../services/contracts';

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
  const [showAppListInput, setShowAppListInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingCustomApp, setIsAddingCustomApp] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingApps, setLoadingApps] = useState<Record<string, boolean>>({});
  const selectedAppsRef = useRef<{ getLocalChanges: () => Record<string, Partial<ContractDetails>>, hasAnyChanges: () => boolean }>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { files, addFiles, removeFile, clearFiles } = useContractFiles();

  const filteredApps = filterAppsBySearch(availableApps, searchQuery);

  const handleSelectApp = async (app: App) => {
    try {
      setLoadingApps(prev => ({ ...prev, [app.id]: true }));
      await onSelectApp(app);
    } finally {
      setLoadingApps(prev => ({ ...prev, [app.id]: false }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const pdfFiles = selectedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFiles.length > 0) {
      addFiles(pdfFiles);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadDone = async () => {
    try {
      if (!company?.id) {
        throw new Error('Company ID is required');
      }
      
      setIsUploading(true);
      await contractService.uploadContract(files[0], company.id);
      
      clearFiles();
      setShowUploadModal(false);
      onClose();
      // Force a refresh of the contract view
      const event = new Event('contract-updated');
      window.dispatchEvent(event);
    } catch (err) {
      console.error('Error uploading contract:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAppListSubmit = async (appList: string) => {
    setIsAddingCustomApp(true);
    try {
      await appService.uploadAppList(appList, company?.id ?? '');
      window.location.reload();
    } catch (error) {
      console.error('Failed to upload app list:', error);
    } finally {
      setIsAddingCustomApp(false);
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
                  onAddCustomApp={handleAppListSubmit}
                  isAddingApp={isAddingCustomApp}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Contract
                  </button>
                  <button
                    onClick={() => setShowAppListInput(!showAppListInput)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <ListPlus className="h-4 w-4" />
                    Enter List
                  </button>
                </div>
              </div>

              {showAppListInput && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <AppListInput 
                    onSubmit={handleAppListSubmit}
                    onCancel={() => setShowAppListInput(false)}
                  />
                </div>
              )}
              
              {showUploadModal && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Processing your contract</h3>
                      <p className="text-sm text-gray-500 mt-2">Please wait while we parse your document...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">Upload Contract</h3>
                        <button
                          onClick={() => {
                            clearFiles();
                            setShowUploadModal(false);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div 
                        className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF files only
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf"
                          multiple
                        />
                      </div>

                      {files.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-700">
                            Uploaded Files ({files.length})
                          </h3>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {files.map((file, index) => (
                              <div 
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <File className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <button
                                  onClick={() => removeFile(index)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end space-x-4 pt-4">
                            <button
                              onClick={() => {
                                clearFiles();
                                setShowUploadModal(false);
                              }}
                              className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleUploadDone}
                              disabled={files.length === 0 || isUploading}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Upload
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                {filteredApps.map((app) => (
                  <AppCard 
                    key={app.id} 
                    app={app} 
                    onSelect={handleSelectApp}
                    isSelected={selectedApps.some(selectedApp => selectedApp.id === app.id)}
                    isLoading={loadingApps[app.id] || false}
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