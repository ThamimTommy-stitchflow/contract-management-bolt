import React, { useState, useEffect } from 'react';
import { Pencil, Save, Trash2} from 'lucide-react';
import { ContractCard } from './ContractCard';
import { ContractDetailsForm } from '../../Apps/ContractDetailsForm';
import { GroupedContract } from '../../../utils/contractGrouping';
import { ContractDetails, ServiceDetails } from '../../../types/app';
import { createDefaultContractDetails } from '../../../utils/serviceUtils';
import { LicenseType, PricingModel, StitchflowConnection, AccessReviewCycle, SecurityTier } from '../../../types/contracts';

interface EditableContractCardProps {
  contract: GroupedContract;
  onSave: (appId: string, details: Partial<ContractDetails>) => void;
  onRemove?: (appId: string) => void;
}

export function EditableContractCard({ 
  contract, 
  onSave,
  onRemove 
}: EditableContractCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize localDetails with contract data
  const [localDetails, setLocalDetails] = useState<ContractDetails>(() => ({
    services: contract.services.map(s => ({
      id: s.id,
      name: s.name,
      licenseType: s.license_type as LicenseType,
      pricingModel: s.pricing_model as PricingModel,
      costPerUser: s.cost_per_user?.toString() || '',
      numberOfLicenses: s.number_of_licenses?.toString() || '',
      totalCost: s.total_cost?.toString() || ''
    })),
    overallTotalValue: contract.overallTotalValue?.toString(),
    renewalDate: contract.renewalDate || undefined,
    reviewDate: contract.reviewDate || undefined,
    notes: contract.notes || undefined,
    contactDetails: contract.contactDetails || undefined,
    stitchflowConnection: contract.stitchflowConnection as StitchflowConnection,
    primaryAppOwner: contract.primaryAppOwner || undefined,
    secondaryAppOwner: contract.secondaryAppOwner || undefined,
    accessReviewCycle: contract.accessReviewCycle as AccessReviewCycle,
    securityTier: contract.securityTier as SecurityTier,
    contractFileUrl: contract.contractFileUrl || undefined
  }));

  // Update localDetails when contract changes
  useEffect(() => {
    if (!isEditing) {
      setLocalDetails({
        services: contract.services.map(s => ({
          id: s.id,
          name: s.name,
          licenseType: s.license_type as LicenseType,
          pricingModel: s.pricing_model as PricingModel,
          costPerUser: s.cost_per_user?.toString() || '',
          numberOfLicenses: s.number_of_licenses?.toString() || '',
          totalCost: s.total_cost?.toString() || ''
        })),
        overallTotalValue: contract.overallTotalValue?.toString(),
        renewalDate: contract.renewalDate || undefined,
        reviewDate: contract.reviewDate || undefined,
        notes: contract.notes || undefined,
        contactDetails: contract.contactDetails || undefined,
        stitchflowConnection: contract.stitchflowConnection as StitchflowConnection,
        primaryAppOwner: contract.primaryAppOwner || undefined,
        secondaryAppOwner: contract.secondaryAppOwner || undefined,
        accessReviewCycle: contract.accessReviewCycle as AccessReviewCycle,
        securityTier: contract.securityTier as SecurityTier,
        contractFileUrl: contract.contractFileUrl || undefined
      });
    }
  }, [contract, isEditing]);

  const handleSave = async (details: ContractDetails): Promise<void> => {
    try {
      setIsSaving(true);
      await onSave(contract.appId, details);
      setIsEditing(false);
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to save contract:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (details: Partial<ContractDetails>) => {
    setLocalDetails(prev => ({ ...prev, ...details }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If we're currently editing and clicking the save button
      handleSave(localDetails);
    } else {
      setIsEditing(true);
      setIsExpanded(true);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-base font-medium text-gray-900">{contract.appName}</h3>
              <p className="text-xs text-gray-500">{contract.category}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                contract.stitchflowConnection === 'API Supported'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {contract.stitchflowConnection === 'API Supported' ? 'API' : 'CSV'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {contract.securityTier}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditToggle}
              disabled={isSaving}
              className={`p-1.5 rounded-md ${
                isEditing 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-400 hover:text-blue-600'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isEditing ? "Edit contract" : "Edit contract"}
            >
              {isSaving ? (
                <div className="animate-spin h-4 w-4">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <Pencil className="h-4 w-4" />
              )}
            </button>
            {onRemove && !isEditing && (
              <button
                onClick={() => onRemove(contract.appId)}
                disabled={isSaving}
                className={`p-1.5 text-gray-400 hover:text-red-600 rounded-md ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Remove contract"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="p-4">
          <ContractDetailsForm
            details={localDetails}
            onChange={handleChange}
            onCancel={() => {
              setIsEditing(false);
              setIsExpanded(false);
            }}
            appId={contract.appId}
            onSubmit={handleSave}
            disabled={isSaving}
            isSaving={isSaving}
          />
        </div>
      ) : (
        <ContractCard 
          contract={contract}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />
      )}
    </div>
  );
}