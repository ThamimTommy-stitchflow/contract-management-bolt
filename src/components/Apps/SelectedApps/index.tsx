import React, { useState } from 'react';
import { SelectedApp, ContractDetails } from '../../../types/app';
import { SelectedAppCard } from './SelectedAppCard';

interface SelectedAppsProps {
  selectedApps: SelectedApp[];
  onRemoveApp: (appId: string) => void;
  onUpdateDetails: (appId: string, details: Partial<ContractDetails>) => void;
  editingAppId?: string | null;
}

export function SelectedApps({ 
  selectedApps, 
  onRemoveApp,
  onUpdateDetails,
  editingAppId 
}: SelectedAppsProps) {
  const [expandedAppId, setExpandedAppId] = useState<string | null>(editingAppId || null);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Selected Apps ({selectedApps.length})
        </h2>
      </div>
      
      <div className="space-y-2">
        {selectedApps.map((app) => (
          <SelectedAppCard
            key={app.id}
            app={app}
            isExpanded={app.id === expandedAppId}
            onToggleExpand={() => setExpandedAppId(app.id === expandedAppId ? null : app.id)}
            onRemove={onRemoveApp}
            onUpdateDetails={onUpdateDetails}
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