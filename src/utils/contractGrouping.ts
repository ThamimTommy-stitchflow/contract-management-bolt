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
    costPerUser: string;
    numberOfLicenses: string;
    totalCost: string;
  }>;
  overallTotalValue: string;
  renewalDate: string;
  reviewDate: string;
  contractFileUrl?: string;
  notes: string;
  contactDetails: string;
  stitchflowConnection: string;
}

export function groupContractsByApp(contracts: ContractRecord[]): GroupedContract[] {
  const groupedMap = contracts.reduce((acc, contract) => {
    if (!acc[contract.appId]) {
      acc[contract.appId] = {
        appId: contract.appId,
        appName: contract.appName,
        category: contract.category,
        services: [],
        overallTotalValue: contract.overallTotalValue || '',
        renewalDate: contract.renewalDate || '',
        reviewDate: contract.reviewDate || '',
        contractFileUrl: contract.contractFileUrl || '',
        notes: contract.notes || '',
        contactDetails: contract.contactDetails || '',
        stitchflowConnection: contract.stitchflowConnection || 'CSV Upload/API coming soon',
      };
    }

    // Only add service if it's not already in the array
    const existingService = acc[contract.appId].services.find(
      s => s.serviceId === contract.serviceId
    );

    if (!existingService) {
      acc[contract.appId].services.push({
        serviceId: contract.serviceId,
        serviceName: contract.serviceName || 'Default Service',
        licenseType: contract.licenseType || 'Annual',
        pricingModel: contract.pricingModel || 'Flat rated',
        costPerUser: contract.costPerUser || '',
        numberOfLicenses: contract.numberOfLicenses || '',
        totalCost: contract.totalCost || '',
      });
    }

    return acc;
  }, {} as Record<string, GroupedContract>);

  return Object.values(groupedMap);
}