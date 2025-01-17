import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { ContractDetails, SelectedApp, ServiceDetails } from '../../types/app';
import { StitchflowConnection, AccessReviewCycle, SecurityTier } from '../../types/contracts';
import { ContractDetailsForm } from './ContractDetailsForm';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { isEqual } from 'lodash';

interface SelectedAppCardProps {
  app: SelectedApp;
  onRemove: (appId: string) => void;
  onUpdateDetails: (appId: string, details: Partial<ContractDetails>) => void;
  isExpanded?: boolean;
  onExpandChange?: (isExpanded: boolean) => void;
}

export const SelectedAppCard = forwardRef<{ 
  getLocalChanges: () => Partial<ContractDetails> | undefined,
  hasChanges: () => boolean 
}, SelectedAppCardProps>(({ 
  app, 
  onRemove, 
  onUpdateDetails, 
  isExpanded: defaultExpanded,
  onExpandChange
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || false);
  const [localDetails, setLocalDetails] = useState<Partial<ContractDetails> | undefined>(app.contractDetails);
  const scrollToTop = useScrollToTop();

  useImperativeHandle(ref, () => ({
    getLocalChanges: () => {
      if (!localDetails || !app.contractDetails) return undefined;
      
      // Only include fields that have actually changed
      const changes: Partial<ContractDetails> = {};
      const fields: Array<keyof ContractDetails> = [
        'services', 'overallTotalValue', 'renewalDate', 'contractFileUrl',
        'notes', 'reviewDate', 'contactDetails', 'stitchflowConnection',
        'primaryAppOwner', 'secondaryAppOwner', 'accessReviewCycle', 'securityTier'
      ];
      
      let hasChanges = false;
      fields.forEach(key => {
        const localValue = localDetails[key];
        const originalValue = app.contractDetails?.[key];
        
        // Only include the field if it has changed and is not undefined
        if (localValue !== undefined && !isEqual(localValue, originalValue)) {
          hasChanges = true;
          // Ensure we're only including fields that exist in ContractDetails
          if (key === 'services') {
            changes.services = localValue as ServiceDetails[];
          } else if (key === 'stitchflowConnection') {
            changes.stitchflowConnection = localValue as StitchflowConnection;
          } else if (key === 'accessReviewCycle') {
            changes.accessReviewCycle = localValue as AccessReviewCycle;
          } else if (key === 'securityTier') {
            changes.securityTier = localValue as SecurityTier;
          } else {
            changes[key] = localValue as string;
          }
        }
      });
      
      return hasChanges ? changes : undefined;
    },
    hasChanges: () => !isEqual(localDetails, app.contractDetails)
  }));

  useEffect(() => {
    if (defaultExpanded !== undefined) {
      setIsExpanded(defaultExpanded);
    }
  }, [defaultExpanded]);

  useEffect(() => {
    setLocalDetails(app.contractDetails);
  }, [app.contractDetails]);

  const handleUpdateDetails = (details: Partial<ContractDetails>) => {
    setLocalDetails(details);
  };

  const handleExpandToggle = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandChange?.(newExpandedState);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-900">{app.name}</span>
          <span className="text-xs text-gray-500">{app.category}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExpandToggle}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <div className="flex items-center gap-1">
                <ChevronUp className="h-5 w-5" />
                <span className="text-sm">Hide details</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <ChevronDown className="h-5 w-5" />
                <span className="text-sm">Add details</span>
              </div>
            )}
          </button>
          <button
            onClick={() => onRemove(app.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          <ContractDetailsForm
            details={localDetails || {}}
            onChange={handleUpdateDetails}
            onCancel={handleExpandToggle}
            appId={app.id}
            showActions={false}
          />
        </div>
      )}
    </div>
  );
});