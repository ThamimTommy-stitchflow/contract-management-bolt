import { SelectedApp } from '../types/app';
import { ContractRecord } from '../types/contracts';
import { apps as availableApps } from '../data/apps';
import { createDefaultService } from './serviceUtils';

export function transformToContractRecords(selectedApps: SelectedApp[]): ContractRecord[] {
  return selectedApps.flatMap(app => {
    // Create default contract details if none exist
    const defaultDetails = {
      services: [createDefaultService()],
      overallTotalValue: '',
      renewalDate: '',
      reviewDate: '',
      notes: '',
      contactDetails: '',
      contractFileUrl: '',
    };

    // Merge default details with existing details
    const details = {
      ...defaultDetails,
      ...app.contractDetails
    };

    // Ensure services array exists and has at least one service
    const services = details.services?.length > 0 
      ? details.services 
      : [createDefaultService()];

    const isPreDefinedApp = availableApps.some(a => a.id === app.id);
    const stitchflowConnection = isPreDefinedApp ? 'API Supported' : 'CSV Upload/API coming soon';

    return services.map(service => ({
      appId: app.id,
      serviceId: service.id || crypto.randomUUID(),
      appName: app.name,
      category: app.category,
      serviceName: service.name || 'Default Service',
      licenseType: service.licenseType || 'Annual',
      pricingModel: service.pricingModel || 'Flat rated',
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
    }));
  });
}