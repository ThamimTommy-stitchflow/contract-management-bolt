import React, { useEffect } from 'react';
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

export function ServiceGroup({ service, onChange, onRemove, isOnly }: ServiceGroupProps) {
  const handleChange = (field: keyof ServiceDetails, value: string) => {
    if (field === 'costPerUser' || field === 'numberOfLicenses') {
      const newTotalCost = calculateTotalCost(
        field === 'costPerUser' ? value : service.costPerUser,
        field === 'numberOfLicenses' ? value : service.numberOfLicenses
      );
      onChange({ 
        ...service, 
        [field]: value,
        totalCost: newTotalCost
      });
    } else {
      onChange({ ...service, [field]: value });
    }
  };

  // Calculate total cost when component mounts or when dependencies change
  useEffect(() => {
    const calculatedTotal = calculateTotalCost(service.costPerUser, service.numberOfLicenses);
    if (calculatedTotal && calculatedTotal !== service.totalCost) {
      onChange({ ...service, totalCost: calculatedTotal });
    }
  }, [service.costPerUser, service.numberOfLicenses]);

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
          value={service.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter service name"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormLabel>License/Subscription Type</FormLabel>
          <FormSelect
            value={service.licenseType}
            onChange={(e) => handleChange('licenseType', e.target.value)}
            options={LICENSE_TYPES}
          />
        </div>

        <div>
          <FormLabel>Pricing Model</FormLabel>
          <FormSelect
            value={service.pricingModel}
            onChange={(e) => handleChange('pricingModel', e.target.value)}
            options={PRICING_MODELS}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormLabel>Cost per User ($)</FormLabel>
          <FormInput
            value={service.costPerUser}
            onChange={(e) => handleChange('costPerUser', e.target.value)}
            placeholder="Enter cost per user"
          />
        </div>

        <div>
          <FormLabel>Number of Licenses</FormLabel>
          <FormInput
            value={service.numberOfLicenses}
            onChange={(e) => handleChange('numberOfLicenses', e.target.value)}
            placeholder="Enter number of licenses"
          />
        </div>
      </div>

      <div>
        <FormLabel>Total Cost ($)</FormLabel>
        <FormInput
          value={service.totalCost}
          onChange={(e) => handleChange('totalCost', e.target.value)}
          placeholder="Enter total cost"
        />
      </div>
    </div>
  );
}