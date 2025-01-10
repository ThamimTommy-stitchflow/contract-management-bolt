import React from 'react';
import { ServiceDetails } from '../../../types/app';

interface ServiceSummaryProps {
  services: ServiceDetails[];
}

export function ServiceSummary({ services }: ServiceSummaryProps) {
  return (
    <div className="space-y-2">
      {services.length > 1 ? (
        <div className="grid grid-cols-1 gap-2">
          {services.map((service, index) => (
            <div key={service.id} className="grid grid-cols-12 gap-4 text-xs">
              <div className="col-span-3 text-gray-700">
                {service.name || `Service ${index + 1}`}
              </div>
              <div className="col-span-3 text-gray-600">
                ${service.costPerUser} per user
              </div>
              <div className="col-span-3 text-gray-600">
                {service.numberOfLicenses} licenses
              </div>
              <div className="col-span-3 text-gray-700 font-medium">
                ${service.totalCost}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 text-xs">
          <div className="col-span-3 text-gray-600">
            ${services[0]?.costPerUser || '0'} per user
          </div>
          <div className="col-span-3 text-gray-600">
            {services[0]?.numberOfLicenses || '0'} licenses
          </div>
          <div className="col-span-3 text-gray-700 font-medium">
            Total: ${services[0]?.totalCost || '0'}
          </div>
        </div>
      )}
    </div>
  );
}