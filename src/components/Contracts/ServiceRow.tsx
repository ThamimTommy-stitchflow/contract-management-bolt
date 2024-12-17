import React from 'react';

interface ServiceRowProps {
  service: {
    serviceName: string;
    licenseType: string;
    pricingModel: string;
    costPerUser: string | number | null;
    numberOfLicenses: string | number | null;
    totalCost: string | number | null;
  };
}

export function ServiceRow({ service }: ServiceRowProps) {
  return (
    <tr>
      <td className="px-4 py-2 text-sm text-gray-900">{service.serviceName}</td>
      <td className="px-4 py-2 text-sm text-gray-500">{service.licenseType}</td>
      <td className="px-4 py-2 text-sm text-gray-500">{service.pricingModel}</td>
      <td className="px-4 py-2 text-sm text-gray-900">{service.costPerUser ? `$${service.costPerUser}` : '-'}</td>
      <td className="px-4 py-2 text-sm text-gray-900">{service.numberOfLicenses || '-'}</td>
      <td className="px-4 py-2 text-sm text-gray-900">{service.totalCost ? `$${service.totalCost}` : '-'}</td>
    </tr>
  );
}