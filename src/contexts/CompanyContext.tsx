import React, { createContext, useContext, useState, useCallback } from 'react';
import { Company } from '../types/company';
import { companyService } from '../services/company';

interface CompanyContextType {
  company: Company | null;
  authenticate: (name: string, accessCode: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<Company | null>(() => {
    const stored = localStorage.getItem('company');
    return stored ? JSON.parse(stored) : null;
  });

  const authenticate = useCallback(async (name: string, accessCode: string) => {
    try {
      const authenticatedCompany = await companyService.getCompany(name, accessCode);
      if (authenticatedCompany) {
        setCompany(authenticatedCompany);
        localStorage.setItem('company', JSON.stringify(authenticatedCompany));
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setCompany(null);
    localStorage.removeItem('company');
  }, []);

  return (
    <CompanyContext.Provider 
      value={{ 
        company, 
        authenticate, 
        logout,
        isAuthenticated: !!company 
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
} 