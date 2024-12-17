export type LicenseType = 'Monthly' | 'Annual' | 'Quarterly' | 'Other';

export type PricingModel = 'Flat rated' | 'Tiered' | 'Pro-rated' | 'Feature based';

export type StitchflowConnection = 'API Supported' | 'CSV Upload/API coming soon';

export interface ContractRecord {
  appId: string;
  serviceId: string;
  appName: string;
  category: string;
  serviceName: string;
  licenseType: LicenseType;
  pricingModel: PricingModel;
  costPerUser: number | null;
  numberOfLicenses: number | null;
  totalCost: number | null;
  overallTotalValue: number | null;
  renewalDate: string | null;
  reviewDate: string | null;
  contractFileUrl?: string | null;
  notes: string | null;
  contactDetails: string | null;
  stitchflowConnection: StitchflowConnection;
}

export const LICENSE_TYPES: LicenseType[] = ['Monthly', 'Annual', 'Quarterly', 'Other'];

export const PRICING_MODELS: PricingModel[] = ['Flat rated', 'Tiered', 'Pro-rated', 'Feature based'];

export const STITCHFLOW_CONNECTIONS: Record<StitchflowConnection, StitchflowConnection> = {
  'API Supported': 'API Supported',
  'CSV Upload/API coming soon': 'CSV Upload/API coming soon',
} as const;