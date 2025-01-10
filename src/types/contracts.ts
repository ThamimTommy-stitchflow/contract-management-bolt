export type LicenseType = 'Monthly' | 'Annual' | 'Quarterly' | 'Other';
export type PricingModel = 'Flat rated' | 'Tiered' | 'Pro-rated' | 'Feature based';
export type StitchflowConnection = 'API Supported' | 'CSV Upload/API coming soon';
export type AccessReviewCycle = 'Ad-Hoc' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
export type SecurityTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export const LICENSE_TYPES: LicenseType[] = ['Monthly', 'Annual', 'Quarterly', 'Other'];
export const PRICING_MODELS: PricingModel[] = ['Flat rated', 'Tiered', 'Pro-rated', 'Feature based'];
export const ACCESS_REVIEW_CYCLES: AccessReviewCycle[] = ['Ad-Hoc', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
export const SECURITY_TIERS: SecurityTier[] = ['Tier 1', 'Tier 2', 'Tier 3'];


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
  primaryAppOwner: string;
  secondaryAppOwner: string;
  accessReviewCycle: AccessReviewCycle;
  securityTier: SecurityTier;
}