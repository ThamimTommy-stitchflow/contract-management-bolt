import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ContractDetails, ServiceDetails } from '../../types/app';
import { appService } from '../../services/apps';
import { FormInput, FormLabel, FormSelect, FormTextArea } from './FormElements';
import { ServiceGroup } from './ServiceGroup';
import { createDefaultService } from '../../utils/serviceUtils';
import { calculateOverallTotalValue } from '../../utils/costCalculator';
import { calculateReviewDate } from '../../utils/dateUtils';
import { ACCESS_REVIEW_CYCLES, SECURITY_TIERS } from '../../types/contracts';

interface ContractDetailsFormProps {
  details: Partial<ContractDetails>;
  onChange: (details: Partial<ContractDetails>) => void;
  onCancel: () => void;
  appId: string;
  onSubmit?: (details: ContractDetails) => Promise<void>;
}

export function ContractDetailsForm({ 
  details: initialDetails, 
  onChange, 
  onCancel,
  appId,
  onSubmit
}: ContractDetailsFormProps) {
  const [localDetails, setLocalDetails] = useState<Partial<ContractDetails>>(() => ({
    services: [createDefaultService()],
    overallTotalValue: '',
    renewalDate: '',
    reviewDate: '',
    notes: '',
    contactDetails: '',
    primaryAppOwner: '',
    secondaryAppOwner: '',
    accessReviewCycle: 'Quarterly',
    securityTier: 'Tier 2',
    contractFileUrl: '',
    ...initialDetails
  }));
  console.log('in ContractDetailsForm view localDetails', localDetails);

  const handleChange = (field: keyof ContractDetails, value: string) => {
    const newDetails = { ...localDetails, [field]: value };
    
    if (field === 'renewalDate' && value) {
      const reviewDate = calculateReviewDate(value);
      newDetails.reviewDate = reviewDate;
    }
    
    setLocalDetails(newDetails);
    onChange(newDetails);
  };

  const handleServiceChange = (index: number, service: ServiceDetails) => {
    const services = [...(localDetails.services || [])];
    services[index] = service;
    
    const newOverallTotal = calculateOverallTotalValue(services);
    const newDetails = { 
      ...localDetails, 
      services,
      overallTotalValue: newOverallTotal
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

  const [stitchflowConnection, setStitchflowConnection] = useState('API Supported');
  useEffect(() => {
    const checkAppStatus = async () => {
      try {
        const app = await appService.getAppById(appId);
        const isSupported = app.is_predefined || app.api_supported;
        setStitchflowConnection(isSupported ? 'API Supported' : 'CSV Upload/API coming soon');
      } catch (error) {
        console.error('Error fetching app status:', error);
        setStitchflowConnection('CSV Upload/API coming soon');
      }
    };
    
    if (appId) {
      checkAppStatus();
    }
  }, [appId]);

  return (
    <div className="space-y-6">
      <div>
        <FormLabel>Stitchflow Connection</FormLabel>
        <div className={`px-4 py-2.5 rounded-lg border ${
          stitchflowConnection === 'API Supported'
            ? 'bg-green-50 border-green-200 text-green-700 font-medium'
            : 'bg-yellow-50 border-yellow-200 text-yellow-700 font-medium'
        }`}>
          {stitchflowConnection}
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
        
        <button
          onClick={handleAddService}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add new service
        </button>
      </div>

      <div>
        <FormLabel>Overall Total Value ($)</FormLabel>
        <FormInput
          value={localDetails.overallTotalValue || ''}
          onChange={(e) => handleChange('overallTotalValue', e.target.value)}
          placeholder="Enter overall total value"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormLabel>Renewal Date</FormLabel>
          <FormInput
            type="date"
            value={localDetails.renewalDate || ''}
            onChange={(e) => handleChange('renewalDate', e.target.value)}
          />
        </div>
        <div>
          <FormLabel>Access Review Date</FormLabel>
          <FormInput
            type="date"
            value={localDetails.reviewDate || ''}
            onChange={(e) => handleChange('reviewDate', e.target.value)}
          />
        </div>
      </div>

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
        <FormLabel>Contract File URL</FormLabel>
        <FormInput
          type="url"
          value={localDetails.contractFileUrl || ''}
          onChange={(e) => handleChange('contractFileUrl', e.target.value)}
          placeholder="Enter contract URL"
        />
      </div>

      <div>
        <FormLabel>Contact Information</FormLabel>
        <FormTextArea
          value={localDetails.contactDetails || ''}
          onChange={(e) => handleChange('contactDetails', e.target.value)}
          placeholder="Enter contact details for all associated parties"
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

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Close
        </button>
        {/* <button
          onClick={() => onSubmit?.(localDetails as ContractDetails)}
          className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Save Changes
        </button> */}
      </div>
    </div>
  );
}