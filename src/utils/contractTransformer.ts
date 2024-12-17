import { SelectedApp } from '../types/app';
import { ContractRecord } from '../types/contracts';

export function transformContractResponse(contract: any): ContractRecord {
  return {
    appId: contract.app_id,
    serviceId: contract.service_id || crypto.randomUUID(),
    appName: contract.app_name,
    category: contract.category,
    serviceName: contract.service_name || 'Default Service',
    licenseType: contract.license_type || 'Annual',
    pricingModel: contract.pricing_model || 'Flat rated',
    costPerUser: contract.cost_per_user,
    numberOfLicenses: contract.number_of_licenses,
    totalCost: contract.total_cost,
    overallTotalValue: contract.overall_total_value,
    renewalDate: contract.renewal_date,
    reviewDate: contract.review_date,
    contractFileUrl: contract.contract_file_url,
    notes: contract.notes,
    contactDetails: contract.contact_details,
    stitchflowConnection: contract.stitchflow_connection || 'CSV Upload/API coming soon'
  };
}

export function transformToContractRecords(selectedApps: SelectedApp[]): ContractRecord[] {
  return selectedApps.flatMap(app => {
    if (!app.contractDetails?.services) {
      return [];
    }

    return app.contractDetails.services.map(service => ({
      appId: app.id,
      serviceId: service.id || crypto.randomUUID(),
      appName: app.name,
      category: app.category,
      serviceName: service.name || 'Default Service',
      licenseType: service.licenseType || 'Annual',
      pricingModel: service.pricingModel || 'Flat rated',
      costPerUser: service.costPerUser || null,
      numberOfLicenses: service.numberOfLicenses || null,
      totalCost: service.totalCost || null,
      overallTotalValue: app.contractDetails.overallTotalValue || null,
      renewalDate: app.contractDetails.renewalDate || null,
      reviewDate: app.contractDetails.reviewDate || null,
      contractFileUrl: app.contractDetails.contractFileUrl || null,
      notes: app.contractDetails.notes || null,
      contactDetails: app.contractDetails.contactDetails || null,
      stitchflowConnection: app.contractDetails.stitchflowConnection || 'CSV Upload/API coming soon'
    }));
  });
}