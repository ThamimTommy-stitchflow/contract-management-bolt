import React, { useState } from 'react';
import { Pencil, Save, Trash2} from 'lucide-react';
import { ContractCard } from './ContractCard';
import { ContractDetailsForm } from '../../Apps/ContractDetailsForm';
import { GroupedContract } from '../../../utils/contractGrouping';
import { ContractDetails } from '../../../types/app';
import { createDefaultContractDetails } from '../../../utils/serviceUtils';

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

  const handleSave = (details: Partial<ContractDetails>) => {
    onSave(contract.appId, details);
    setIsEditing(false);
  };

  const initialDetails: ContractDetails = {
    ...createDefaultContractDetails(),
    services: contract.services.map(s => ({
      id: s.serviceId,
      name: s.name,
      licenseType: s.license_type,
      pricingModel: s.pricing_model,
      costPerUser: s.cost_per_user,
      numberOfLicenses: s.number_of_licenses,
      totalCost: s.total_cost
    })),
    overallTotalValue: contract.overallTotalValue,
    renewalDate: contract.renewalDate,
    reviewDate: contract.reviewDate,
    notes: contract.notes,
    contactDetails: contract.contactDetails,
    stitchflowConnection: contract.stitchflowConnection,
    primaryAppOwner: contract.primary_app_owner,
    secondaryAppOwner: contract.secondary_app_owner,
    accessReviewCycle: contract.access_review_cycle,
    securityTier: contract.security_tier,
    contractFileUrl: contract.contractFileUrl
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
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded-md ${
                isEditing 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-400 hover:text-blue-600'
              }`}
              title={isEditing ? "Save changes" : "Edit contract"}
            >
              {isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </button>
            {onRemove && (
              <button
                onClick={() => onRemove(contract.appId)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-md"
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
            details={initialDetails}
            onChange={() => {}}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            appId={contract.appId}
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