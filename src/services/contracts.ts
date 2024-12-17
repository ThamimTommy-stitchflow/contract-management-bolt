import api from './api';
import { ContractDetails } from '../types/app';

export const contractService = {
  async updateContract(appId: string, data: { contractDetails: Partial<ContractDetails> }, companyId: string) {
    try {
      const transformedData = {
        company_id: companyId,
        app_id: appId,
        renewal_date: data.contractDetails.renewalDate ? new Date(data.contractDetails.renewalDate).toISOString().split('T')[0] : null,
        review_date: data.contractDetails.reviewDate ? new Date(data.contractDetails.reviewDate).toISOString().split('T')[0] : null,
        overall_total_value: data.contractDetails.overallTotalValue ? parseFloat(data.contractDetails.overallTotalValue.toString()) : null,
        contract_file_url: data.contractDetails.contractFileUrl || null,
        notes: data.contractDetails.notes || null,
        contact_details: data.contractDetails.contactDetails || null,
        services: data.contractDetails.services?.map(service => ({
          name: service.name,
          license_type: service.licenseType,
          pricing_model: service.pricingModel,
          cost_per_user: service.costPerUser ? parseFloat(service.costPerUser.toString()) : null,
          number_of_licenses: service.numberOfLicenses ? parseInt(service.numberOfLicenses.toString(), 10) : null,
          total_cost: service.totalCost ? parseFloat(service.totalCost.toString()) : null
        }))
      };
      
      const response = await api.post('/contracts', transformedData);
      return response.data;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  },

  async getCompanyContracts(companyId: string) {
    try {
      const response = await api.get(`/contracts/company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting company contracts:', error);
      throw error;
    }
  },

  async getContract(contractId: string) {
    try {
      const response = await api.get(`/contracts/${contractId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
};