import api from './api';
import { ContractDetails } from '../types/app';

interface Contract {
  id: string;
  app_id: string;
}

export const contractService = {
  async createContract(appId: string, data: { contractDetails: Partial<ContractDetails> }, companyId: string) {
    try {
      // Transform the data to match the backend's expected format
      const createData = {
        company_id: companyId,
        app_id: appId,
        renewal_date: data.contractDetails.renewalDate ? new Date(data.contractDetails.renewalDate).toISOString().split('T')[0] : null,
        review_date: data.contractDetails.reviewDate ? new Date(data.contractDetails.reviewDate).toISOString().split('T')[0] : null,
        overall_total_value: data.contractDetails.overallTotalValue ? parseFloat(data.contractDetails.overallTotalValue.toString()) : null,
        contract_file_url: data.contractDetails.contractFileUrl || null,
        notes: data.contractDetails.notes || null,
        contact_details: data.contractDetails.contactDetails || '',
        stitchflow_connection: data.contractDetails.stitchflowConnection || null,
        primary_app_owner: data.contractDetails.primaryAppOwner || null,
        secondary_app_owner: data.contractDetails.secondaryAppOwner || null,
        access_review_cycle: data.contractDetails.accessReviewCycle || null,
        security_tier: data.contractDetails.securityTier || null,
        services: data.contractDetails.services?.map(service => ({
          name: service.name || 'Default Service',
          license_type: service.licenseType,
          pricing_model: service.pricingModel,
          cost_per_user: service.costPerUser ? parseFloat(service.costPerUser.toString()) : null,
          number_of_licenses: service.numberOfLicenses ? parseInt(service.numberOfLicenses.toString(), 10) : null,
          total_cost: service.totalCost ? parseFloat(service.totalCost.toString()) : null
        })) || []
      };

      const response = await api.post('/contracts', createData);
      return response.data;
    } catch (error: unknown) {
      console.error('Error creating contract:', error);
      throw error;
    }
  },

  async updateContract(appId: string, data: { contractDetails: Partial<ContractDetails> }, companyId: string) {
    try {
      // First get the contract ID for this app
      const contracts = await this.getCompanyContracts(companyId);
      const contract = contracts.find((c: Contract) => c.app_id === appId);
      
      // Transform the data to match the backend's expected format
      const transformedData = {
        renewal_date: data.contractDetails.renewalDate ? new Date(data.contractDetails.renewalDate).toISOString().split('T')[0] : null,
        review_date: data.contractDetails.reviewDate ? new Date(data.contractDetails.reviewDate).toISOString().split('T')[0] : null,
        overall_total_value: data.contractDetails.overallTotalValue ? parseFloat(data.contractDetails.overallTotalValue.toString()) : null,
        contract_file_url: data.contractDetails.contractFileUrl || null,
        notes: data.contractDetails.notes || null,
        contact_details: typeof data.contractDetails.contactDetails === 'string' 
          ? { notes: data.contractDetails.contactDetails }
          : data.contractDetails.contactDetails || null,
        stitchflow_connection: data.contractDetails.stitchflowConnection || null,
        primary_app_owner: data.contractDetails.primaryAppOwner || null,
        secondary_app_owner: data.contractDetails.secondaryAppOwner || null,
        access_review_cycle: data.contractDetails.accessReviewCycle || null,
        security_tier: data.contractDetails.securityTier || null,
        plan_name: data.contractDetails.planName || null
      };

      if (!contract) {
        // If no contract exists, create one
        return await this.createContract(appId, data, companyId);
      }
      
      // If contract exists, update both contract and services
      const [contractResponse] = await Promise.all([
        // Update contract details
        api.put(`/contracts/${contract.id}?company_id=${companyId}`, transformedData),
        // Update services if they exist
        data.contractDetails.services ? 
          api.put(`/contracts/${contract.id}/services?company_id=${companyId}`, 
            data.contractDetails.services.map(service => ({
              name: service.name || 'Default Service',
              license_type: service.licenseType,
              pricing_model: service.pricingModel,
              cost_per_user: service.costPerUser ? parseFloat(service.costPerUser.toString()) : null,
              number_of_licenses: service.numberOfLicenses ? parseInt(service.numberOfLicenses.toString(), 10) : null,
              total_cost: service.totalCost ? parseFloat(service.totalCost.toString()) : null
            }))
          ) : Promise.resolve()
      ]);

      return contractResponse.data;
    } catch (error: unknown) {
      console.error('Error updating contract:', error);
      throw error;
    }
  },

  async getCompanyContracts(companyId: string) {
    try {
      const response = await api.get(`/contracts/company/${companyId}`);
      console.log('in contracts service', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting company contracts:', error);
      throw error;
    }
  },

  async getContract(contractId: string) {
    try {
      const response = await api.get(`/contracts/${contractId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async uploadContract(file: File, companyId: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/contracts/process?company_id=${companyId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error uploading contract:', error);
      throw error;
    }
  }
};