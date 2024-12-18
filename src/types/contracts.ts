export type LicenseType = 'Monthly' | 'Annual' | 'Quarterly' | 'Other';

export type PricingModel = 'Flat rated' | 'Tiered' | 'Pro-rated' | 'Feature based';

export type StitchflowConnection = 'API Supported' | 'CSV Upload/API coming soon';

export interface ServiceRecord {
  id: string;
  name: string;
  license_type: LicenseType;
  pricing_model: PricingModel;
  cost_per_user: number | null;
  number_of_licenses: number | null;
  total_cost: number | null;
  contractId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ContractRecord {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  company_id: string;
  app_id: string;
  renewal_date: string | null;
  review_date: string | null;
  overall_total_value: number | null;
  contract_file_url: string | null;
  notes: string | null;
  contact_details: string | null;
  stitchflow_connection: StitchflowConnection;
  services: ServiceRecord[];
}

export const LICENSE_TYPES: LicenseType[] = ['Monthly', 'Annual', 'Quarterly', 'Other'];

export const PRICING_MODELS: PricingModel[] = ['Flat rated', 'Tiered', 'Pro-rated', 'Feature based'];

export const STITCHFLOW_CONNECTIONS: Record<StitchflowConnection, StitchflowConnection> = {
  'API Supported': 'API Supported',
  'CSV Upload/API coming soon': 'CSV Upload/API coming soon',
} as const;