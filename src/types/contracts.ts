export type LicenseType = 'Monthly' | 'Annual' | 'Quarterly' | 'Other';
export type PricingModel = 'Flat rated' | 'Tiered' | 'Pro-rated' | 'Feature based';
export type StitchflowConnection = 'API Supported' | 'CSV Upload/API coming soon' | 'Not Connected';
export type AccessReviewCycle = 'Ad-Hoc' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
export type SecurityTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export const LICENSE_TYPES = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Annual', label: 'Annual' },
  { value: 'Other', label: 'Other' }
];

export const PRICING_MODELS = [
  { value: 'Flat rated', label: 'Flat rated' },
  { value: 'Tiered', label: 'Tiered' },
  { value: 'Pro-rated', label: 'Pro-rated' },
  { value: 'Feature based', label: 'Feature based' }
];

export const ACCESS_REVIEW_CYCLES = [
  { value: 'Ad-Hoc', label: 'Ad-Hoc' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Yearly', label: 'Yearly' }
];

export const SECURITY_TIERS = [
  { value: 'Tier 1', label: 'Tier 1' },
  { value: 'Tier 2', label: 'Tier 2' },
  { value: 'Tier 3', label: 'Tier 3' }
];

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
  plan_name: string | null;
  renewal_date: string | null;
  review_date: string | null;
  overall_total_value: number | null;
  contract_file_url: string | null;
  notes: string | null;
  contact_details: string | null;
  stitchflow_connection: StitchflowConnection;
  services: ServiceRecord[];
  primaryAppOwner: string;
  secondaryAppOwner: string;
  accessReviewCycle: AccessReviewCycle;
  securityTier: SecurityTier;
}