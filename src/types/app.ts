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
  planName: string | undefined;
  overallTotalValue: string | undefined;
  renewalDate: string | undefined;
  contractFileUrl?: string;
  notes: string | undefined;
  reviewDate: string | undefined;
  contactDetails: string | undefined;
  stitchflowConnection: StitchflowConnection | undefined;
  primaryAppOwner: string | undefined;
  secondaryAppOwner: string | undefined;
  accessReviewCycle: AccessReviewCycle | undefined;
  securityTier: SecurityTier | undefined;
}

export interface SelectedApp extends App {
  selected: boolean;
  contractDetails?: ContractDetails;
}

