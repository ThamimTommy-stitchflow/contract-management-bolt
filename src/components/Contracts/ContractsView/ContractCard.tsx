import React from 'react';
import { ChevronDown, ChevronUp, Clock, Download, ExternalLink } from 'lucide-react';
import { ServiceTable } from './ServiceTable';
import { GroupedContract } from '../../../utils/contractGrouping';
import { differenceInDays, differenceInMonths, parseISO, isPast } from 'date-fns';

interface ContractCardProps {
  contract: GroupedContract;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function ContractCard({ 
  contract,
  isExpanded,
  onToggleExpand
}: ContractCardProps) {
  console.log('in ContractCard contract', contract);
  const totalLicenses = contract.services.reduce((sum, service) => 
    sum + (parseInt(service.number_of_licenses) || 0), 0);

  const getRenewalBadge = () => {
    if (!contract.renewalDate) return null;
    
    const renewalDate = parseISO(contract.renewalDate);
    const today = new Date();
    const isPastDue = isPast(renewalDate);
    
    if (isPastDue) {
      const daysOverdue = Math.abs(differenceInDays(renewalDate, today));
      const monthsOverdue = Math.abs(differenceInMonths(renewalDate, today));
      
      return (
        <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          <Clock className="h-3 w-3 mr-0.5" />
          Due {monthsOverdue >= 1 ? `${monthsOverdue}m` : `${daysOverdue}d`} ago
        </span>
      );
    }
    
    const daysUntilRenewal = differenceInDays(renewalDate, today);
    
    if (daysUntilRenewal < 30) {
      return (
        <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          <Clock className="h-3 w-3 mr-0.5" />
          {daysUntilRenewal}d
        </span>
      );
    }
    
    if (daysUntilRenewal < 180) {
      return (
        <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-0.5" />
          {daysUntilRenewal}d
        </span>
      );
    }
    
    return null;
  };

  const renderContractUrl = () => {
    if (!contract.contractFileUrl || contract.contractFileUrl === 'Not Provided') {
      return (
        <div className="flex items-center text-gray-500">
          <span className="text-sm">No contract file available</span>
        </div>
      );
    }

    const isSupabaseUrl = contract.contractFileUrl.includes('supabase.co/storage');

    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Contract File:</span>
        {isSupabaseUrl ? (
          <button 
            onClick={() => window.open(contract.contractFileUrl, '_blank')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Download Contract
            <Download className="h-4 w-4 ml-1" />
          </button>
        ) : (
          <a 
            href={contract.contractFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            View Contract
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 py-2.5">
      {/* Rest of the component remains the same */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-xs text-gray-500 mr-1">Renewal:</span>
            <span className="text-sm text-gray-900">{contract.renewalDate || '-'}</span>
            {getRenewalBadge()}
          </div>
          <div>
            <span className="text-xs text-gray-500 mr-1">Review:</span>
            <span className="text-sm text-gray-900">{contract.reviewDate || '-'}</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-1">Access Review Cycle:</span>
            <span className="text-sm text-gray-900">{contract.accessReviewCycle}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div>
            <span className="text-xs text-gray-500 mr-1">Value:</span>
            <span className="text-sm font-medium text-gray-900">
              ${contract.overallTotalValue || '0.00'}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 mr-1">Licenses:</span>
            <span className="text-sm text-gray-900">{totalLicenses}</span>
          </div>
          <button
            onClick={onToggleExpand}
            className="flex items-center text-xs text-gray-500 hover:text-gray-700 ml-2"
          >
            {isExpanded ? (
              <>
                <span className="mr-1">Less</span>
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                <span className="mr-1">More</span>
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-xs text-gray-500 mr-1">Contract:</span>
              {renderContractUrl()}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">App Owners</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Primary Owner</label>
                <p className="mt-0.5 text-sm text-gray-900">{contract.primaryAppOwner}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Secondary Owner</label>
                <p className="mt-0.5 text-sm text-gray-900">{contract.secondaryAppOwner}</p>
              </div>
            </div>
          </div>

          <ServiceTable services={contract.services} />

          {(contract.notes || contract.contactDetails) && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {contract.notes && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Notes</label>
                  <p className="mt-0.5 text-sm text-gray-900 whitespace-pre-wrap">{contract.notes}</p>
                </div>
              )}
              {contract.contactDetails && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Contact Details</label>
                  <p className="mt-0.5 text-sm text-gray-900 whitespace-pre-wrap">
                    {contract.contactDetails}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}