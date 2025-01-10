import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { ContractDetails, SelectedApp } from '../../types/app';
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
    getLocalChanges: () => localDetails,
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
          />
        </div>
      )}
    </div>
  );
});