import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ServiceDetails } from '../../types/app';
import { FormInput, FormLabel, FormSelect } from './FormElements';
import { calculateTotalCost } from '../../utils/costCalculator';
import { LICENSE_TYPES, PRICING_MODELS } from '../../types/contracts';

interface ServiceGroupProps {
  service: ServiceDetails;
  onChange: (service: ServiceDetails) => void;
  onRemove: () => void;
  isOnly: boolean;
}

export function ServiceGroup({ service: initialService, onChange, onRemove, isOnly }: ServiceGroupProps) {
  const [localService, setLocalService] = useState(initialService);
  const [isCostPerUserNA, setIsCostPerUserNA] = useState(false);

  const handleChange = (field: keyof ServiceDetails, value: string) => {
    const updatedService = { ...localService, [field]: value };
    
    // Calculate total cost when cost per user or number of licenses changes
    if (field === 'costPerUser' || field === 'numberOfLicenses') {
      updatedService.totalCost = calculateTotalCost(
        field === 'costPerUser' ? value : localService.costPerUser,
        field === 'numberOfLicenses' ? value : localService.numberOfLicenses
      );
    }
    
    setLocalService(updatedService);
    onChange(updatedService);
  };

  const handleCostPerUserNAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCostPerUserNA(e.target.checked);
    if (e.target.checked) {
      const updatedService = {
        ...localService,
        costPerUser: 'N/A',
        totalCost: localService.totalCost || '0'
      };
      setLocalService(updatedService);
      onChange(updatedService);
    } else {
      const updatedService = {
        ...localService,
        costPerUser: ''
      };
      setLocalService(updatedService);
      onChange(updatedService);
    }
  };

  const content = (
    <>
      {!isOnly && (
        <div className="flex justify-end mb-4">
          {!isOnly && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-600 rounded-md"
              title="Remove service"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {!isOnly && (
          <div>
            <FormLabel>Module Name</FormLabel>
            <FormInput
              value={localService.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter module name"
            />
          </div>
        )}

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
          <div className="space-y-2">
            <FormLabel>Cost per user per month ($)</FormLabel>
            <FormInput
              type="text"
              value={isCostPerUserNA ? 'N/A' : localService.costPerUser}
              onChange={(e) => handleChange('costPerUser', e.target.value)}
              placeholder="Enter cost per user"
              disabled={isCostPerUserNA}
            />
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isCostPerUserNA}
                onChange={handleCostPerUserNAChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Pricing not per user</span>
            </label>
          </div>

          <div className="space-y-2">
            <FormLabel>Number of Seats</FormLabel>
            <FormInput
              type="number"
              value={localService.numberOfLicenses}
              onChange={(e) => handleChange('numberOfLicenses', e.target.value)}
              placeholder="Enter number of licenses"
            />
            <div className="h-[1.625rem]"></div>
          </div>
        </div>

        <div>
          <FormLabel>Total Cost ($)</FormLabel>
          <FormInput
            type="number"
            value={localService.totalCost}
            onChange={(e) => handleChange('totalCost', e.target.value)}
            placeholder="Enter total cost"
          />
        </div>
      </div>
    </>
  );

  if (isOnly) {
    return content;
  }

  return (
    <div className="bg-gray-50/70 border border-gray-200 rounded-lg p-4">
      {content}
    </div>
  );
}