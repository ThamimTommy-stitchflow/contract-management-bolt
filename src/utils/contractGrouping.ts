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

export function groupContractsByApp(contracts: ContractRecord[]): GroupedContract[] {
  const groupedMap = new Map<string, GroupedContract>();

  for (const contract of contracts) {
    if (!groupedMap.has(contract.appId)) {
      groupedMap.set(contract.appId, {
        appId: contract.appId,
        appName: contract.appName,
        category: contract.category,
        services: [],
        overallTotalValue: contract.overallTotalValue?.toString() || '',
        renewalDate: contract.renewalDate,
        reviewDate: contract.reviewDate,
        contractFileUrl: contract.contractFileUrl,
        notes: contract.notes || '',
        contactDetails: contract.contactDetails || '',
        stitchflowConnection: contract.stitchflowConnection || 'CSV Upload/API coming soon',
      });
    }

    const group = groupedMap.get(contract.appId)!;
    
    // Only add service if it's not already in the array
    const existingService = group.services.find(s => s.serviceId === contract.serviceId);
    
    if (!existingService && contract.serviceId) {
      group.services.push({
        serviceId: contract.serviceId,
        serviceName: contract.serviceName || 'Default Service',
        licenseType: contract.licenseType || 'Annual',
        pricingModel: contract.pricingModel || 'Flat rated',
        costPerUser: contract.costPerUser,
        numberOfLicenses: contract.numberOfLicenses,
        totalCost: contract.totalCost,
      });
    }
  }

  return Array.from(groupedMap.values());
}