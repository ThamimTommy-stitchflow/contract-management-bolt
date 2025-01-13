import React from 'react';
import { useCompany } from '../../context/CompanyContext';

export function AppHeader() {
  const { company } = useCompany();

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        {company?.name}'s Managed Apps
      </h1>
      <p className="text-base text-gray-600">
        Track all the apps your organization uses and keep tabs with the renewal cycles
      </p>
    </div>
  );
}