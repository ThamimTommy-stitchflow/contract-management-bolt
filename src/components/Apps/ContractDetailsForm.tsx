import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ContractDetails, ServiceDetails } from '../../types/app';
import { appService } from '../../services/apps';
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSaveClick = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onSave();
    } catch (error) {
      setError('Failed to save contract details. Please try again.');
      console.error('Error saving contract:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!details.services) {
    return null;
  }
  
  const [stitchflowConnection, setStitchflowConnection] = useState('CSV Upload/API coming soon');

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
    
    checkAppStatus();
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
      
      {/* {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )} */}

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
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveClick}
          disabled={isSaving}
          className={`px-4 py-2 text-white rounded-lg transition-colors ${
            isSaving 
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}