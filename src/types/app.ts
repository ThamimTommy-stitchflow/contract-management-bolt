import { LicenseType, PricingModel, StitchflowConnection, AccessReviewCycle, SecurityTier } from './contracts';
import { CATEGORIES } from '../constants/categories';

export interface ServiceDetails {
  id: string;
  name: string;
  licenseType: LicenseType;
  pricingModel: PricingModel;
  costPerUser: string;
  numberOfLicenses: string;
  totalCost: string;
}

export interface App {
  id: string;
  name: string;
  category: typeof CATEGORIES[number];
  notes?: string;
  is_predefined: boolean;
  api_supported?: boolean;
}
export interface ContractDetails {
  services: ServiceDetails[];
  overallTotalValue: string;
  renewalDate: string;
  contractFileUrl?: string;
  notes: string;
  reviewDate: string;
  contactDetails: string;
  stitchflowConnection: StitchflowConnection;
  primaryAppOwner: string;
  secondaryAppOwner: string;
  accessReviewCycle: AccessReviewCycle;
  securityTier: SecurityTier;
}

export interface SelectedApp extends App {
  selected: boolean;
  contractDetails?: ContractDetails;
}

