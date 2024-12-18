import api from './api';
import { App, ContractDetails } from '../types/app';

export const appService = {
  async getAllApps() {
    const response = await api.get('/apps');
    return response.data;
  },

  async getCompanyApps(companyId: string) {
    const response = await api.get(`/apps/company/${companyId}`);
    return response.data;
  },

  async selectApp(appId: string, companyId: string) {
    const response = await api.post('/apps/select', {
      app_id: appId,
      company_id: companyId
    });
    return response.data;
  },

  async unselectApp(appId: string, companyId: string) {
    const response = await api.delete(`/apps/select/${companyId}/${appId}`);
    return response.data;
  },

  async createCustomApp(app: Omit<App, 'id'>) {
    const response = await api.post('/apps', app);
    return response.data;
  },

  async getAppById(appId: string): Promise<App> {
    const response = await api.get(`/apps/${appId}`);
    return response.data;
  },
};