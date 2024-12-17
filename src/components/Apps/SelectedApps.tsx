import React, { useState } from 'react';
import { SelectedAppCard } from './SelectedAppCard';
import { SelectedApp, ContractDetails } from '../../types/app';

interface SelectedAppsProps {
  selectedApps: SelectedApp[];
  onRemoveApp: (appId: string) => void;
  onUpdateDetails: (appId: string, details: Partial<ContractDetails>) => void;
  editingAppId?: string | null;
  onSave: () => void;
}

export function SelectedApps({ 
  selectedApps, 
  onRemoveApp, 
  onUpdateDetails,
  editingAppId,
  onSave
}: SelectedAppsProps) {
  const [expandedAppId, setExpandedAppId] = useState<string | null>(editingAppId || null);

  // Update expanded app when editingAppId changes
  React.useEffect(() => {
    if (editingAppId) {
      setExpandedAppId(editingAppId);
    }
  }, [editingAppId]);

  const handleExpandChange = (appId: string, isExpanded: boolean) => {
    setExpandedAppId(isExpanded ? appId : null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Selected Apps ({selectedApps.length})</h2>
      
      <div className="space-y-4">
        {selectedApps.map((app) => (
          <SelectedAppCard
            key={app.id}
            app={app}
            onRemove={onRemoveApp}
            onUpdateDetails={onUpdateDetails}
            isExpanded={app.id === expandedAppId}
            onExpandChange={(isExpanded) => handleExpandChange(app.id, isExpanded)}
            onSave={onSave}
          />
        ))}
        {selectedApps.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No apps selected. Select apps from the list below.
          </p>
        )}
      </div>
    </div>
  );
}