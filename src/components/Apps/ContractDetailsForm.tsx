import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { ContractDetails, ServiceDetails } from '../../types/app';
import { FormInput, FormLabel, FormSelect, FormTextArea } from './FormElements';
import { ServiceGroup } from './ServiceGroup';
import { createDefaultService } from '../../utils/serviceUtils';
import { calculateOverallTotalValue } from '../../utils/costCalculator';
import { ACCESS_REVIEW_CYCLES, SECURITY_TIERS } from '../../types/contracts';

const STITCHFLOW_CONNECTION_OPTIONS = [
  { value: 'API Supported', label: 'API' },
  { value: 'CSV Upload/API coming soon', label: 'CSV' },
  { value: 'Not Connected', label: 'Not Connected' }
];

// Helper functions for date formatting
const formatToUSDate = (isoDate: string): string => {
  if (!isoDate || isoDate === 'N/A') return isoDate;
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

const parseUSDate = (usDate: string): string => {
  if (!usDate || usDate === 'N/A') return usDate;
  const [month, day, year] = usDate.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

interface ContractDetailsFormProps {
  details: Partial<ContractDetails>;
  onChange: (details: Partial<ContractDetails>) => void;
  onCancel: () => void;
  appId: string;
  onSubmit?: (details: ContractDetails) => Promise<void>;
  disabled?: boolean;
  isSaving?: boolean;
  showActions?: boolean;
}

export function ContractDetailsForm({ 
  details: initialDetails, 
  onChange, 
  onCancel,
  appId,
  onSubmit,
  disabled = false,
  isSaving = false,
  showActions = true
}: ContractDetailsFormProps) {
  const [localDetails, setLocalDetails] = useState<Partial<ContractDetails>>(() => ({
    services: [createDefaultService()],
    overallTotalValue: '',
    renewalDate: '',
    notes: '',
    contactDetails: '',
    primaryAppOwner: '',
    secondaryAppOwner: '',
    accessReviewCycle: 'Quarterly',
    securityTier: 'Tier 2',
    contractFileUrl: '',
    planName: '',
    stitchflowConnection: 'CSV Upload/API coming soon',
    ...initialDetails
  }));

  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  const handleChange = (field: keyof ContractDetails, value: string) => {
    const newDetails = { ...localDetails, [field]: value };
    
    // Special handling for renewal date
    if (field === 'renewalDate') {
      if (value === 'N/A') {
        newDetails.renewalDate = 'N/A';
        newDetails.reviewDate = 'N/A';
      } else if (value) {
        // Allow typing but only process when it's a complete date
        if (value.length === 10) {  // Only process when format is complete MM/DD/YYYY
          try {
            // Convert from MM/DD/YYYY to YYYY-MM-DD for storage
            const isoDate = parseUSDate(value);
            const dateValue = new Date(isoDate);
            
            if (!isNaN(dateValue.getTime())) {
              newDetails.renewalDate = isoDate;
              // Calculate review date (2 months before renewal)
              const reviewDate = new Date(dateValue);
              reviewDate.setMonth(reviewDate.getMonth() - 2);
              newDetails.reviewDate = reviewDate.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Error parsing date:', e);
            return;
          }
        } else {
          // Just update the display value while user is typing
          newDetails.renewalDate = value;
        }
      }
    }
    
    setLocalDetails(newDetails);
    onChange(newDetails);
  };

  const handleServiceChange = (index: number, service: ServiceDetails) => {
    const services = [...(localDetails.services || [])];
    services[index] = service;
    
    const newDetails = { 
      ...localDetails, 
      services,
      overallTotalValue: hasMultipleServices ? 
        services.reduce((sum, s) => sum + (parseFloat(s.totalCost) || 0), 0).toString() 
        : services[0]?.totalCost || '0'
    };
    
    setLocalDetails(newDetails);
    onChange(newDetails);
  };

  const handleAddService = () => {
    const newService = createDefaultService();
    const services = [...(localDetails.services || []), newService];
    const newDetails = { ...localDetails, services };
    
    setLocalDetails(newDetails);
    onChange(newDetails);
  };

  const handleRemoveService = (index: number) => {
    const services = (localDetails.services || []).filter((_, i) => i !== index);
    const newOverallTotal = calculateOverallTotalValue(services);
    const newDetails = { 
      ...localDetails, 
      services,
      overallTotalValue: newOverallTotal
    };
    
    setLocalDetails(newDetails);
    onChange(newDetails);
  };

  const handleSave = () => {
    onSubmit?.(localDetails as ContractDetails);
  };

  const isApiSupported = localDetails.stitchflowConnection === 'API Supported';
  const hasMultipleServices = (localDetails.services?.length || 0) > 1;
  const isAnnualLicense = localDetails.services?.[0]?.licenseType === 'Annual';

  // Update renewal date when license type changes
  React.useEffect(() => {
    if (!isAnnualLicense && localDetails.renewalDate && localDetails.renewalDate !== 'N/A') {
      const newDetails = { ...localDetails, renewalDate: 'N/A', reviewDate: 'N/A' };
      setLocalDetails(newDetails);
      onChange(newDetails);
    }
  }, [isAnnualLicense]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-3 max-w-2xl">
        <div className="col-span-8">
          <FormLabel>Plan Name</FormLabel>
          <FormInput
            value={localDetails.planName || ''}
            onChange={(e) => handleChange('planName', e.target.value)}
            placeholder="Enter plan name"
          />
        </div>
        <div className="col-span-4">
          <FormLabel>Connection Type</FormLabel>
          <FormSelect
            value={localDetails.stitchflowConnection || 'CSV Upload/API coming soon'}
            onChange={(e) => handleChange('stitchflowConnection', e.target.value)}
            options={STITCHFLOW_CONNECTION_OPTIONS}
          />
        </div>
      </div>

      <div className="space-y-4">
        {localDetails.services?.map((service, index) => (
          <ServiceGroup
            key={service.id}
            service={service}
            onChange={(updated) => handleServiceChange(index, updated)}
            onRemove={() => handleRemoveService(index)}
            isOnly={localDetails.services?.length === 1}
          />
        ))}
        
        {/* <button
          onClick={handleAddService}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add new service
        </button> */}
      </div>

      {hasMultipleServices && (
        <div>
          <FormLabel>Overall Total Value ($)</FormLabel>
          <FormInput
            value={localDetails.overallTotalValue || ''}
            onChange={(e) => handleChange('overallTotalValue', e.target.value)}
            placeholder="Enter overall total value"
          />
        </div>
      )}

      {isAnnualLicense && (
        <div>
          <FormLabel>Renewal Date</FormLabel>
          <FormInput
            type="date"
            value={localDetails.renewalDate === 'N/A' ? '' : 
              localDetails.renewalDate ? 
                // Convert MM/DD/YYYY to YYYY-MM-DD for date input
                localDetails.renewalDate.split('/').reverse().join('-') : 
                ''
            }
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                // Convert YYYY-MM-DD to MM/DD/YYYY
                const [year, month, day] = value.split('-');
                handleChange('renewalDate', `${month}/${day}/${year}`);
              } else {
                handleChange('renewalDate', '');
              }
            }}
            placeholder="Select date"
          />
          {/* {localDetails.renewalDate && 
           localDetails.renewalDate !== 'N/A' && 
           localDetails.reviewDate } */}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormLabel>Primary App Owner</FormLabel>
          <FormInput
            value={localDetails.primaryAppOwner || ''}
            onChange={(e) => handleChange('primaryAppOwner', e.target.value)}
            placeholder="Enter primary app owner"
          />
        </div>

        <div>
          <FormLabel>Secondary App Owner</FormLabel>
          <FormInput
            value={localDetails.secondaryAppOwner || ''}
            onChange={(e) => handleChange('secondaryAppOwner', e.target.value)}
            placeholder="Enter secondary app owner"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormLabel>Access Review Cycle</FormLabel>
          <FormSelect
            value={localDetails.accessReviewCycle || 'Quarterly'}
            onChange={(e) => handleChange('accessReviewCycle', e.target.value)}
            options={ACCESS_REVIEW_CYCLES}
          />
        </div>

        <div>
          <FormLabel>Security Tier</FormLabel>
          <FormSelect
            value={localDetails.securityTier || 'Tier 2'}
            onChange={(e) => handleChange('securityTier', e.target.value)}
            options={SECURITY_TIERS}
          />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {showAdditionalDetails ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {showAdditionalDetails ? 'Hide Additional Details' : 'Show Additional Details'}
        </button>

        {showAdditionalDetails && (
          <div className="mt-4 space-y-6 border-t pt-4">
            <div>
              <FormLabel>Contract File URL</FormLabel>
              <FormInput
                value={localDetails.contractFileUrl || ''}
                onChange={(e) => handleChange('contractFileUrl', e.target.value)}
                placeholder="Enter contract file URL"
              />
            </div>

            <div>
              <FormLabel>Contact Information</FormLabel>
              <FormTextArea
                value={localDetails.contactDetails || ''}
                onChange={(e) => handleChange('contactDetails', e.target.value)}
                placeholder="Enter contact information"
              />
            </div>

            <div>
              <FormLabel>Additional Notes</FormLabel>
              <FormTextArea
                value={localDetails.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Enter any additional notes or comments"
              />
            </div>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            disabled={disabled}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={disabled || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ContractDetailsForm;