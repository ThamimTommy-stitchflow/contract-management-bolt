import React from 'react';

interface Service {
  id: string;
  name: string;
  license_type: string;
  pricing_model: string;
  cost_per_user: string;
  number_of_licenses: string;
  total_cost: string;
}

interface ServiceTableProps {
  services: Service[];
}

export function ServiceTable({ services }: ServiceTableProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-2">Modules</label>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing Model</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/User</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{service.name || '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{service.license_type}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{service.pricing_model}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{service.cost_per_user ? `$${service.cost_per_user}` : '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{service.number_of_licenses || '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{service.total_cost ? `$${service.total_cost}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}