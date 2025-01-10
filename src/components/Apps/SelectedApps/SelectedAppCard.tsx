import React, { useEffect, useState } from 'react';
import { X, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { SelectedApp } from '../../../types/app';
import { ServiceSummary } from './ServiceSummary';
import { ContractDetailsForm } from '../ContractDetailsForm';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

interface SelectedAppCardProps {
  app: SelectedApp;
  isExpanded?: boolean;
  onToggleExpand: () => void;
  onRemove: (appId: string) => void;
  onUpdateDetails: (appId: string, details: any) => void;
}

export function SelectedAppCard({ 
  app, 
  isExpanded:defaultExpanded, 
  onToggleExpand, 
  onRemove,
  onUpdateDetails
}: SelectedAppCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || false);
  const [tempDetails, setTempDetails] = useState(app.contractDetails || {});
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    setTempDetails(app.contractDetails || {});
  }, [app.contractDetails]);

  const totalServices = app.contractDetails?.services?.length || 0;
  const services = app.contractDetails?.services || [];
  
  const totalCost = services.reduce((sum, service) => 
    sum + (parseFloat(service.totalCost) || 0), 0);
  const totalLicenses = services.reduce((sum, service) => 
    sum + (parseInt(service.numberOfLicenses) || 0), 0);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-2.5 grid grid-cols-12 gap-4 items-center">
        {/* App Info - 3 columns */}
        <div className="col-span-3">
          <h3 className="text-sm font-medium text-gray-900">{app.name}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{app.category}</span>
            {totalServices > 0 && (
              <span className="text-xs text-gray-400">
                • {totalServices} service{totalServices > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* License Info - 2 columns */}
        <div className="col-span-2">
          <div className="text-xs">
            <span className="text-gray-500">Type:</span>
            <span className="ml-1 text-gray-900">{services[0]?.licenseType || '-'}</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">Model:</span>
            <span className="ml-1 text-gray-900">{services[0]?.pricingModel || '-'}</span>
          </div>
        </div>

        {/* Cost Info - 2 columns */}
        <div className="col-span-2">
          <div className="text-xs">
            <span className="text-gray-500">Total Cost:</span>
            <span className="ml-1 font-medium text-gray-900">${totalCost.toFixed(2)}</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">Licenses:</span>
            <span className="ml-1 text-gray-900">{totalLicenses}</span>
          </div>
        </div>

        {/* Dates - 4 columns */}
        <div className="col-span-4">
          <div className="text-xs">
            <span className="text-gray-500">Renewal:</span>
            <span className="ml-1 text-gray-900">{app.contractDetails?.renewalDate || '-'}</span>
            {app.contractDetails?.renewalDate && (
              <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                <Clock className="h-3 w-3 mr-0.5" />
                Active
              </span>
            )}
          </div>
          <div className="text-xs">
            <span className="text-gray-500">Review:</span>
            <span className="ml-1 text-gray-900">{app.contractDetails?.reviewDate || '-'}</span>
          </div>
        </div>

        {/* Actions - 1 column */}
        <div className="col-span-1 flex justify-end space-x-1">
          <button
            onClick={onToggleExpand}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onRemove(app.id)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100">
          <ContractDetailsForm
            details={app.contractDetails || {}}
            onChange={(details) => onUpdateDetails(app.id, details)}
            onSave={onToggleExpand}
            onCancel={onToggleExpand}
            appId={app.id}
          />
        </div>
      )}
    </div>
  );
}