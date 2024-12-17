import { create } from 'zustand';
import { AuthState } from '../types/auth';
import { companyService } from '../services/company';

const initialState = {
  user: null,
  company: null,
  isAuthenticated: false,
  deployments: []
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...initialState,

  login: async (companyName: string, accessCode: string) => {
    if (!companyName.trim()) {
      throw new Error('Organization name is required');
    }

    if (!accessCode.trim() || accessCode.length !== 4) {
      throw new Error('Access code must be exactly 4 characters');
    }

    try {
      // Try to get existing company
      let company = await companyService.getCompany(companyName, accessCode);

      // If company doesn't exist, create it
      if (!company) {
        company = await companyService.createCompany(companyName, accessCode);
        if (!company) {
          throw new Error('Failed to create organization');
        }
      }

      const user = {
        id: company.id,
        companyName: company.name,
        companyId: company.id
      };

      set({
        user,
        company,
        isAuthenticated: true,
        deployments: []
      });

    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate key') || 
            error.message.includes('already exists')) {
          throw new Error('Organization name already exists');
        }
        throw error;
      }
      
      throw new Error('Login failed. Please try again.');
    }
  },

  logout: () => {
    set(initialState);
  },

  addDeployment: (deployId: string) => {
    set(state => ({
      deployments: [...state.deployments, {
        id: deployId,
        timestamp: Date.now()
      }]
    }));
  },

  getDeployments: () => get().deployments
}));