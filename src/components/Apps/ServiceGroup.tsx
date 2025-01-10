import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { ServiceDetails } from '../../types/app';
import { LICENSE_TYPES, PRICING_MODELS } from '../../types/contracts';
import { FormInput, FormLabel, FormSelect } from './FormElements';
import { calculateTotalCost } from '../../utils/costCalculator';

interface ServiceGroupProps {
  service: ServiceDetails;
  onChange: (service: ServiceDetails) => void;
  onRemove: () => void;
  isOnly: boolean;
}

export function ServiceGroup({ service: initialService, onChange, onRemove, isOnly }: ServiceGroupProps) {
  const [localService, setLocalService] = useState<ServiceDetails>(initialService);

  const handleChange = (field: keyof ServiceDetails, value: string) => {
    if (field === 'costPerUser' || field === 'numberOfLicenses') {
      const newTotalCost = calculateTotalCost(
        field === 'costPerUser' ? value : localService.costPerUser,
        field === 'numberOfLicenses' ? value : localService.numberOfLicenses
      );
      const updatedService = { 
        ...localService, 
        [field]: value,
        totalCost: newTotalCost
      };
      setLocalService(updatedService);
      onChange(updatedService);
    } else {
      const updatedService = { ...localService, [field]: value };
      setLocalService(updatedService);
      onChange(updatedService);
    }
  };

  // Calculate total cost when component mounts or when dependencies change
  useEffect(() => {
    const calculatedTotal = calculateTotalCost(localService.costPerUser, localService.numberOfLicenses);
    if (calculatedTotal && calculatedTotal !== localService.totalCost) {
      const updatedService = { ...localService, totalCost: calculatedTotal };
      setLocalService(updatedService);
      onChange(updatedService);
    }
  }, [localService.costPerUser, localService.numberOfLicenses]);

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-gray-900">Service Details</h4>
          <p className="text-xs text-gray-500">Configure service-specific information</p>
        </div>
        {!isOnly && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove service"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div>
        <FormLabel>Service Name</FormLabel>
        <FormInput
          value={localService.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter service name"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormLabel>License/Subscription Type</FormLabel>
          <FormSelect
            value={localService.licenseType}
            onChange={(e) => handleChange('licenseType', e.target.value)}
            options={LICENSE_TYPES}
          />
        </div>

        <div>
          <FormLabel>Pricing Model</FormLabel>
          <FormSelect
            value={localService.pricingModel}
            onChange={(e) => handleChange('pricingModel', e.target.value)}
            options={PRICING_MODELS}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormLabel>Cost per User ($)</FormLabel>
          <FormInput
            value={localService.costPerUser}
            onChange={(e) => handleChange('costPerUser', e.target.value)}
            placeholder="Enter cost per user"
          />
        </div>

        <div>
          <FormLabel>Number of Licenses</FormLabel>
          <FormInput
            value={localService.numberOfLicenses}
            onChange={(e) => handleChange('numberOfLicenses', e.target.value)}
            placeholder="Enter number of licenses"
          />
        </div>
      </div>

      <div>
        <FormLabel>Total Cost ($)</FormLabel>
        <FormInput
          value={localService.totalCost}
          onChange={(e) => handleChange('totalCost', e.target.value)}
          placeholder="Enter total cost"
        />
      </div>
    </div>
  );
}