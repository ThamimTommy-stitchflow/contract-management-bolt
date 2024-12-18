import { ContractRecord } from '../types/contracts';
export interface GroupedContract {
  appId: string;
  appName: string;
  category: string;
  services: Array<{
    serviceId: string;
    serviceName: string;
    licenseType: string;
    pricingModel: string;
    costPerUser: string | number | null;
    numberOfLicenses: string | number | null;
    totalCost: string | number | null;
  }>;
  overallTotalValue: string;
  renewalDate: string | null;
  reviewDate: string | null;
  contractFileUrl?: string;
  notes: string;
  contactDetails: string;
  stitchflowConnection: string;
}

interface EnrichedContract extends ContractRecord {
  appName: string;
  category: string;
}

export function groupContractsByApp(contracts: EnrichedContract[]): GroupedContract[] {
  console.log(contracts);
  return contracts.map(contract => ({
    appId: contract.app_id,
    appName: contract.appName,
    category: contract.category,
    services: contract.services.map(service => ({
      serviceId: service.id,
      serviceName: service.name,
      licenseType: service.license_type,
      pricingModel: service.pricing_model,
      costPerUser: service.cost_per_user,
      numberOfLicenses: service.number_of_licenses,
      totalCost: service.total_cost
    })),
    overallTotalValue: contract.overall_total_value?.toString() || '',
    renewalDate: contract.renewal_date,
    reviewDate: contract.review_date,
    contractFileUrl: contract.contract_file_url || 'Not Provided',
    notes: contract.notes || 'Not Provided',
    contactDetails: contract.contact_details || 'Not Provided',
    stitchflowConnection: contract.stitchflow_connection
  }));
}