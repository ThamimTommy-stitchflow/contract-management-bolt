import { Company } from './company';

export interface User {
  id: string;
  companyName: string;
  companyId: string;
}

export interface Deployment {
  id: string;
  timestamp: number;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  deployments: Deployment[];
  login: (companyName: string, accessCode: string) => Promise<void>;
  logout: () => void;
  addDeployment: (deployId: string) => void;
  getDeployments: () => Deployment[];
}