import { ContractRecord } from '../types/contracts';
import { AccessReviewCycle, SecurityTier } from '../types/contracts';

export interface GroupedContract {
  appId: string;
  appName: string;
  category: string;
  services: Array<{
    id: string;
    name: string;
    license_type: string;
    pricing_model: string;
    cost_per_user: string | number | null;
    number_of_licenses: string | number | null;
    total_cost: string | number | null;
  }>;
  overallTotalValue: string;
  renewalDate: string | null;
  reviewDate: string | null;
  contractFileUrl?: string;
  notes: string;
  contactDetails: string;
  stitchflowConnection: string;
  primaryAppOwner: string;
  secondaryAppOwner: string;
  accessReviewCycle: AccessReviewCycle;
  securityTier: SecurityTier;
}

interface EnrichedContract extends ContractRecord {
  appName: string;
  category: string;
}

export function groupContractsByApp(contracts: EnrichedContract[]): GroupedContract[] {
  console.log(contracts);
  return contracts.map(contract => {
    const contactDetails = typeof contract.contact_details === 'object' && contract.contact_details !== null
      ? Object.entries(contract.contact_details)
          .filter(([_, value]) => value != null && value !== '')
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n') || 'Not Provided'
      : contract.contact_details || 'Not Provided';

    return {
      appId: contract.app_id,
      appName: contract.appName,
      category: contract.category,
      services: contract.services.map(service => ({
        id: service.id,
        name: service.name,
        license_type: service.license_type,
        pricing_model: service.pricing_model,
        cost_per_user: service.cost_per_user,
        number_of_licenses: service.number_of_licenses,
        total_cost: service.total_cost
      })),
      overallTotalValue: contract.overall_total_value?.toString() || '',
      renewalDate: contract.renewal_date,
      reviewDate: contract.review_date,
      contractFileUrl: contract.contract_file_url || 'Not Provided',
      notes: contract.notes || 'Not Provided',
      contactDetails,
      stitchflowConnection: contract.stitchflow_connection,
      primaryAppOwner: contract.primaryAppOwner || 'Not Provided',
      secondaryAppOwner: contract.secondaryAppOwner|| 'Not Provided',
      accessReviewCycle: contract.accessReviewCycle,
      securityTier: contract.securityTier
    };
  });
}