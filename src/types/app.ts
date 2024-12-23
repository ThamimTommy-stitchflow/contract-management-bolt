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
  category: Category;
  notes?: string;
}

export interface SelectedApp extends App {
  selected: boolean;
  contractDetails?: ContractDetails;
}

export interface ContractDetails {
  services: ServiceDetails[];
  overallTotalValue: string; // Added new field
  renewalDate: string;
  contractFileUrl?: string;
  notes: string;
  reviewDate: string;
  contactDetails: string;
  stitchflowConnection: StitchflowConnection;
}