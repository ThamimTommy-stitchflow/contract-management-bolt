import api from './api';
import { ContractDetails } from '../types/app';

export const contractService = {
  async getContracts(appId?: string) {
    const params = appId ? { app_id: appId } : {};
    const response = await api.get('/contracts', { params });
    return response.data;
  },

  async createContract(appId: string, details: ContractDetails) {
    const response = await api.post('/contracts', {
      app_id: appId,
      ...details
    });
    return response.data;
  },

  async updateContract(contractId: string, details: Partial<ContractDetails>) {
    const response = await api.put(`/contracts/${contractId}`, details);
    return response.data;
  },

  async deleteContract(contractId: string) {
    const response = await api.delete(`/contracts/${contractId}`);
    return response.data;
  },

  async uploadContractFile(contractId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(
      `/contracts/${contractId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
};