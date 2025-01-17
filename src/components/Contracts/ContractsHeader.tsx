import React from 'react';

interface ContractsHeaderProps {
  totalApps: number;
}

export function ContractsHeader({ 
  totalApps
}: ContractsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="text-sm font-medium text-gray-900">
        Total Apps: {totalApps}
      </div>
    </div>
  );
}