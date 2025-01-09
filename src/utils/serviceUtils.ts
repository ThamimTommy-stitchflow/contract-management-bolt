import { ServiceDetails, ContractDetails } from '../types/app';

export function createDefaultService(): ServiceDetails {
  return {
    id: crypto.randomUUID(),
    name: '',
    licenseType: 'Annual',
    pricingModel: 'Flat rated',
    costPerUser: '',
    numberOfLicenses: '',
    totalCost: '',
  };
}

export function createDefaultContractDetails(): ContractDetails {
  return {
    services: [createDefaultService()],
    overallTotalValue: '',
    renewalDate: '',
    reviewDate: '',
    notes: '',
    contactDetails: '',
    stitchflowConnection: 'CSV Upload/API coming soon',
    contractFileUrl: '',
    primaryAppOwner: '',
    secondaryAppOwner: '',
    accessReviewCycle: 'Quarterly',
    securityTier: 'Tier 2'
  };
}