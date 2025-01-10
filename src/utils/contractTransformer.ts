import { SelectedApp } from '../types/app';
import { ContractRecord } from '../types/contracts';
import { apps as availableApps } from '../data/apps';
import { createDefaultContractDetails } from './serviceUtils';


export function transformContractResponse(contract: any): ContractRecord {
  const contactDetails = contract.contact_details;
  let formattedContactDetails = '';
  
  if (typeof contactDetails === 'object' && contactDetails !== null) {
    // Filter out null/undefined values and join all values with line breaks
    formattedContactDetails = Object.entries(contactDetails)
      .filter(([_, value]) => value != null && value !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  } else {
    formattedContactDetails = contactDetails || '';
  }

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
    contactDetails: formattedContactDetails,
    stitchflowConnection: contract.stitchflow_connection || 'CSV Upload/API coming soon'
  };
}

export function transformToContractRecords(selectedApps: SelectedApp[]): ContractRecord[] {
  return selectedApps.flatMap(app => {
    const defaultDetails = createDefaultContractDetails();
    const details = app.contractDetails || defaultDetails;

    const services = details.services?.length > 0 
      ? details.services 
      : defaultDetails.services;

    const isPreDefinedApp = availableApps.some(a => a.id === app.id);
    const stitchflowConnection = isPreDefinedApp ? 'API Supported' : 'CSV Upload/API coming soon';

    return services.map(service => ({
      appId: app.id,
      serviceId: service.id || crypto.randomUUID(),
      appName: app.name,
      category: app.category,
      serviceName: service.name || 'Default Service',
      licenseType: service.licenseType || defaultDetails.services[0].licenseType,
      pricingModel: service.pricingModel || defaultDetails.services[0].pricingModel,
      costPerUser: service.costPerUser || '',
      numberOfLicenses: service.numberOfLicenses || '',
      totalCost: service.totalCost || '',
      overallTotalValue: details.overallTotalValue || '',
      renewalDate: details.renewalDate || '',
      reviewDate: details.reviewDate || '',
      contractFileUrl: details.contractFileUrl || '',
      notes: details.notes || '',
      contactDetails: details.contactDetails || '',
      stitchflowConnection,
      // Add new fields with default values
      primaryAppOwner: details.primaryAppOwner || defaultDetails.primaryAppOwner,
      secondaryAppOwner: details.secondaryAppOwner || defaultDetails.secondaryAppOwner,
      accessReviewCycle: details.accessReviewCycle || defaultDetails.accessReviewCycle,
      securityTier: details.securityTier || defaultDetails.securityTier
    }));
  });
}