import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ContractRecord } from '../../types/contracts';
import { groupContractsByApp } from '../../utils/contractGrouping';
import { sortContracts } from '../../utils/contractSorting';
import { calculateTotalContractValue } from '../../utils/contractCalculations';
import { ContractHeader } from './ContractHeader';
import { RenewalCountdown } from './RenewalCountdown';
import { ContractDetails } from './ContractDetails';
import type { SortOption } from './ContractSort';

interface ContractsViewProps {
  contracts: ContractRecord[];
  onEdit?: (appId: string) => void;
  onRemove?: (appId: string) => void;
}

export function ContractsView({ contracts, onEdit, onRemove }: ContractsViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>('renewal-priority');
  
  const groupedContracts = groupContractsByApp(contracts);
  const sortedContracts = sortContracts(groupedContracts, sortBy);
  const totalContractValue = calculateTotalContractValue(groupedContracts);

  if (contracts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">
          No contracts available. Add apps and complete their details to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ContractHeader 
        totalValue={totalContractValue}
        sortValue={sortBy}
        onSortChange={setSortBy}
      />

      <div className="space-y-4">
        {sortedContracts.map((group) => (
          <div key={group.appId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  {group.renewalDate && (
                    <div className="mb-2">
                      <RenewalCountdown renewalDate={group.renewalDate} />
                    </div>
                  )}
                  <h3 className="text-lg font-medium text-gray-900">{group.appName}</h3>
                  <p className="text-sm text-gray-500">{group.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    group.stitchflowConnection === 'API Supported'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {group.stitchflowConnection === 'API Supported' ? 'API' : 'CSV'}
                  </span>
                  <div className="flex items-center space-x-2 ml-4">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(group.appId)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit contract"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {onRemove && (
                      <button
                        onClick={() => onRemove(group.appId)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove contract"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Renewal Date</label>
                    <p className="mt-1 text-sm text-gray-900">{group.renewalDate || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Review Date</label>
                    <p className="mt-1 text-sm text-gray-900">{group.reviewDate || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Services</label>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">License Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pricing Model</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost/User</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Licenses</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {group.services.map((service) => (
                          <tr key={service.serviceId}>
                            <td className="px-4 py-2 text-sm text-gray-900">{service.serviceName}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{service.licenseType}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{service.pricingModel}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{service.costPerUser ? `$${service.costPerUser}` : '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{service.numberOfLicenses || '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{service.totalCost ? `$${service.totalCost}` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Overall Total Value</label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    {group.overallTotalValue ? `$${group.overallTotalValue}` : '-'}
                  </p>
                </div>

                <ContractDetails 
                  notes={group.notes} 
                  contactDetails={group.contactDetails} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}