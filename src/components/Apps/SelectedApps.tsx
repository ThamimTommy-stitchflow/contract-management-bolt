import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { SelectedApp } from '../../types/app';
import { SelectedAppCard } from './SelectedAppCard';
import { ContractDetails } from '../../types/app';

interface SelectedAppsProps {
  selectedApps: SelectedApp[];
  onRemoveApp: (appId: string) => void;
  onUpdateDetails: (appId: string, details: Partial<ContractDetails>) => void;
}

export const SelectedApps = forwardRef<
  { 
    getLocalChanges: () => Record<string, Partial<ContractDetails>>,
    hasAnyChanges: () => boolean
  },
  SelectedAppsProps
>(({ selectedApps, onRemoveApp, onUpdateDetails }, ref) => {
  const cardRefs = useRef<Record<string, React.RefObject<{ 
    getLocalChanges: () => Partial<ContractDetails> | undefined,
    hasChanges: () => boolean 
  }>>>({});

  // Initialize refs for each app
  selectedApps.forEach(app => {
    if (!cardRefs.current[app.id]) {
      cardRefs.current[app.id] = React.createRef();
    }
  });

  useImperativeHandle(ref, () => ({
    getLocalChanges: () => {
      const changes: Record<string, Partial<ContractDetails>> = {};
      
      Object.entries(cardRefs.current).forEach(([appId, cardRef]) => {
        const localChanges = cardRef.current?.getLocalChanges();
        if (localChanges) {
          changes[appId] = localChanges;
        }
      });
      
      return changes;
    },
    hasAnyChanges: () => {
      return Object.values(cardRefs.current).some(
        cardRef => cardRef.current?.hasChanges()
      );
    }
  }));

  return (
    <div className="space-y-4">
      {selectedApps.map((app) => (
        <SelectedAppCard
          key={app.id}
          ref={cardRefs.current[app.id]}
          app={app}
          onRemove={onRemoveApp}
          onUpdateDetails={onUpdateDetails}
        />
      ))}
    </div>
  );
});