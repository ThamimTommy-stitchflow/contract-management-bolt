import api from './api';
import { Company, CompanyAuth } from '../types/company';

export const companyService = {
  async authenticate(auth: CompanyAuth): Promise<Company> {
    const response = await api.post('/companies/auth', auth);
    return response.data;
  },

  async register(company: CompanyAuth): Promise<Company> {
    const response = await api.post('/companies/register', company);
    return response.data;
  },

  async getCompany(name: string, accessCode: string): Promise<Company | null> {
    try {
      const response = await this.authenticate({ name, access_code: accessCode });
      return response;
    } catch (error) {
      return null;
    }
  },

  async createCompany(name: string, accessCode: string): Promise<Company> {
    return await this.register({ name, access_code: accessCode });
  }
};