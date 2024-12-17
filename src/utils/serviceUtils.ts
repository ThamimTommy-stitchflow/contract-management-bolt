import { ServiceDetails } from '../types/app';

export function createDefaultService(): ServiceDetails {
  return {
    id: crypto.randomUUID(),
    name: '',  // Added default empty name
    licenseType: 'Annual',
    pricingModel: 'Flat rated',
    costPerUser: '',
    numberOfLicenses: '',
    totalCost: '',
  };
}