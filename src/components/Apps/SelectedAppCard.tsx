import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { SelectedApp } from '../../types/app';
import { ContractDetailsForm } from './ContractDetailsForm';
import { useScrollToTop } from '../../hooks/useScrollToTop';

interface SelectedAppCardProps {
  app: SelectedApp;
  onRemove: (appId: string) => void;
  onUpdateDetails: (appId: string, details: any) => void;
  isExpanded?: boolean;
  onExpandChange?: (isExpanded: boolean) => void;
  onSave?: () => void;
}

export function SelectedAppCard({ 
  app, 
  onRemove, 
  onUpdateDetails, 
  isExpanded: defaultExpanded,
  onExpandChange,
  onSave
}: SelectedAppCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || false);
  const [tempDetails, setTempDetails] = useState(app.contractDetails || {});
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    if (defaultExpanded !== undefined) {
      setIsExpanded(defaultExpanded);
    }
  }, [defaultExpanded]);

  useEffect(() => {
    setTempDetails(app.contractDetails || {});
  }, [app.contractDetails]);

  const handleExpandToggle = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandChange?.(newExpandedState);
    if (!newExpandedState) {
      scrollToTop();
    }
  };

  const handleSave = () => {
    onUpdateDetails(app.id, tempDetails);
    onSave?.();
    setIsExpanded(false);
    onExpandChange?.(false);
    scrollToTop();
  };

  const handleCancel = () => {
    setTempDetails(app.contractDetails || {});
    setIsExpanded(false);
    onExpandChange?.(false);
    scrollToTop();
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
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
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
            details={tempDetails}
            onChange={setTempDetails}
            onSave={handleSave}
            onCancel={handleCancel}
            appId={app.id}
          />
        </div>
      )}
    </div>
  );
}