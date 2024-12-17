import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ContractDetails, ServiceDetails } from '../../types/app';
import { apps as availableApps } from '../../data/apps';
import { FormInput, FormLabel, FormSelect, FormTextArea } from './FormElements';
import { ServiceGroup } from './ServiceGroup';
import { createDefaultService } from '../../utils/serviceUtils';
import { calculateOverallTotalValue } from '../../utils/costCalculator';
import { calculateReviewDate, formatDate, parseDate } from '../../utils/dateUtils';

interface ContractDetailsFormProps {
  details: Partial<ContractDetails>;
  onChange: (details: Partial<ContractDetails>) => void;
  onSave: () => void;
  onCancel: () => void;
  appId: string;
}

export function ContractDetailsForm({ 
  details: initialDetails, 
  onChange, 
  onSave,
  onCancel,
  appId 
}: ContractDetailsFormProps) {
  const [details, setDetails] = useState<Partial<ContractDetails>>(() => ({
    services: [createDefaultService()],
    overallTotalValue: '',
    renewalDate: '',
    reviewDate: '',
    notes: '',
    contactDetails: '',
    ...initialDetails
  }));

  const handleServiceChange = (index: number, service: ServiceDetails) => {
    const services = [...(details.services || [])];
    services[index] = service;
    
    const newOverallTotal = calculateOverallTotalValue(services);
    const newDetails = { 
      ...details, 
      services,
      overallTotalValue: newOverallTotal
    };
    
    setDetails(newDetails);
    onChange(newDetails);
  };

  const handleAddService = () => {
    const services = [...(details.services || []), createDefaultService()];
    const newDetails = { ...details, services };
    setDetails(newDetails);
    onChange(newDetails);
  };

  const handleRemoveService = (index: number) => {
    const services = (details.services || []).filter((_, i) => i !== index);
    const newOverallTotal = calculateOverallTotalValue(services);
    const newDetails = { 
      ...details, 
      services,
      overallTotalValue: newOverallTotal
    };
    
    setDetails(newDetails);
    onChange(newDetails);
  };

  const handleDateChange = (field: 'renewalDate' | 'reviewDate', value: string) => {
    const date = value ? formatDate(new Date(value)) : '';
    const newDetails = { ...details, [field]: date };

    // If renewal date is changed, calculate review date
    if (field === 'renewalDate' && date) {
      const reviewDate = calculateReviewDate(date);
      newDetails.reviewDate = reviewDate;
    }

    setDetails(newDetails);
    onChange(newDetails);
  };

  const handleChange = (field: keyof ContractDetails, value: string) => {
    const newDetails = { ...details, [field]: value };
    setDetails(newDetails);
    onChange(newDetails);
  };

  const isPreDefinedApp = availableApps.some(app => app.id === appId);
  const stitchflowConnection = isPreDefinedApp ? 'API Supported' : 'CSV Upload/API coming soon';

  if (!details.services) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <FormLabel>Stitchflow Connection</FormLabel>
        <div className={`px-4 py-2.5 rounded-lg border ${
          isPreDefinedApp 
            ? 'bg-green-50 border-green-200 text-green-700 font-medium'
            : 'bg-yellow-50 border-yellow-200 text-yellow-700 font-medium'
        }`}>
          {stitchflowConnection}
        </div>
      </div>

      <div className="space-y-4">
        {details.services.map((service, index) => (
          <ServiceGroup
            key={service.id}
            service={service}
            onChange={(updated) => handleServiceChange(index, updated)}
            onRemove={() => handleRemoveService(index)}
            isOnly={details.services.length === 1}
          />
        ))}
        
        <button
          onClick={handleAddService}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add another service
        </button>
      </div>

      <div>
        <FormLabel>Overall Total Value ($)</FormLabel>
        <FormInput
          value={details.overallTotalValue || ''}
          onChange={(e) => handleChange('overallTotalValue', e.target.value)}
          placeholder="Enter overall total value"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormLabel>Renewal Date</FormLabel>
          <FormInput
            type="date"
            value={details.renewalDate ? parseDate(details.renewalDate)?.toISOString().split('T')[0] : ''}
            onChange={(e) => handleDateChange('renewalDate', e.target.value)}
          />
        </div>

        <div>
          <FormLabel>Access Review Date</FormLabel>
          <FormInput
            type="date"
            value={details.reviewDate ? parseDate(details.reviewDate)?.toISOString().split('T')[0] : ''}
            onChange={(e) => handleDateChange('reviewDate', e.target.value)}
          />
        </div>
      </div>

      <div>
        <FormLabel>Contract File URL</FormLabel>
        <FormInput
          type="url"
          value={details.contractFileUrl || ''}
          onChange={(e) => handleChange('contractFileUrl', e.target.value)}
          placeholder="Enter contract URL"
        />
      </div>

      <div>
        <FormLabel>Notes/Comments</FormLabel>
        <FormTextArea
          value={details.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Enter notes or comments"
        />
      </div>

      <div>
        <FormLabel>Contact Details</FormLabel>
        <FormTextArea
          value={details.contactDetails || ''}
          onChange={(e) => handleChange('contactDetails', e.target.value)}
          placeholder="Enter contact details for all associated parties"
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}