import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Download, ExternalLink, ChevronRight } from 'lucide-react';
import { ServiceTable } from './ServiceTable';
import { GroupedContract } from '../../../utils/contractGrouping';
import { differenceInDays, differenceInMonths, parseISO, isPast } from 'date-fns';
// import { supabase } from '../../../lib/supabaseClient';
import { formatToUSDate } from '../../../utils/dateUtils';
// import { supabase } from '';

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
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  
  const totalLicenses = contract.services.reduce((sum, service) => 
    sum + (service.number_of_licenses ? parseInt(service.number_of_licenses.toString()) : 0), 0);

  const getRenewalBadge = () => {
    if (!contract.renewalDate || contract.renewalDate === 'N/A') return null;
    
    try {
      const renewalDate = parseISO(contract.renewalDate);
      if (isNaN(renewalDate.getTime())) return null;
      
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
    } catch (error) {
      console.error('Error parsing renewal date:', error);
      return null;
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const pathMatch = url.match(/public\/contract-files\/(.+?)(?:https:|$)/);
      if (!pathMatch) {
        console.error('Could not extract path from URL');
        return;
      }
      const path = decodeURIComponent(pathMatch[1].replace(/\/$/, ''));

      const { data, error } = await supabase.storage
        .from('contract-files')
        .download(path);

      if (error) {
        console.error('Supabase download error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from Supabase');
      }

      const blob = new Blob([data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const fileName = 'contract.pdf';
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
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
        <span className="text-sm text-gray-500"></span>
        {isSupabaseUrl ? (
          <button 
            onClick={() => handleDownload(contract.contractFileUrl || '')}
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
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-5 gap-6 min-w-0 flex-1">
          <div className="min-w-0">
            <span className="text-xs text-gray-500 block">Renewal</span>
            <div className="flex items-center">
              <span className="text-sm text-gray-900 truncate">
                {contract.renewalDate && contract.services[0]?.license_type !== 'Monthly' && contract.renewalDate !== 'N/A' 
                  ? formatToUSDate(contract.renewalDate) 
                  : <span className="text-xs text-gray-400">N/A</span>}
              </span>
              {contract.services[0]?.license_type !== 'Monthly' && getRenewalBadge()}
            </div>
          </div>
          <div className="min-w-0">
            <span className="text-xs text-gray-500 block">Owner</span>
            <span className="text-sm text-gray-900 truncate" title={contract.primaryAppOwner || '-'}>
              {contract.primaryAppOwner || '-'}
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-xs text-gray-500 block">License Type</span>
            <span className="text-sm text-gray-900 truncate">
              {contract.services[0]?.license_type || '-'}
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-xs text-gray-500 block">Cost per user per month($)</span>
            <span className="text-sm text-gray-900 truncate">
              {contract.services.some(s => s.cost_per_user) ? 
                `$${contract.services.reduce((sum, service) => 
                  sum + (Number(service.cost_per_user) || 0), 0)}`
                : <span className="text-xs text-gray-400">N/A</span>}
            </span>
          </div>
        </div>

        <button
          onClick={onToggleExpand}
          className="flex items-center text-xs text-gray-500 hover:text-gray-700 ml-6 flex-shrink-0"
        >
          {isExpanded ? (
            <>
              <span className="mr-1">Less</span>
              <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              <span className="mr-1">Show More</span>
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
          {/* Additional Details Grid */}
          <div className="grid grid-cols-5">
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">Security Tier</span>
              <span className="text-sm text-gray-900 truncate" title={contract.securityTier || '-'}>
                {contract.securityTier || '-'}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">No. of Seats</span>
              <span className="text-sm text-gray-900 truncate">
                {totalLicenses}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">Value</span>
              <span className="text-sm font-medium text-gray-900 truncate">
                ${contract.overallTotalValue || '0.00'}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">Review Cycle</span>
              <span className="text-sm text-gray-900 truncate" title={contract.accessReviewCycle || '-'}>
                {contract.accessReviewCycle || '-'}
              </span>
            </div>
          </div>

          {/* Secondary Owner */}
          <div className="px-4">
            <span className="text-xs text-gray-500 block">Secondary Owner</span>
            <span className="text-sm text-gray-900 truncate" title={contract.secondaryAppOwner || '-'}>
              {contract.secondaryAppOwner || '-'}
            </span>
          </div>

          {/* Contract File Section */}
          <div className="px-4">
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">Contract details:</span>
              {renderContractUrl()}
            </div>
          </div>

          {/* Services Section */}
          <div className="px-4">
            <button 
              onClick={() => setIsServicesExpanded(!isServicesExpanded)}
              className="flex items-center text-sm font-medium text-gray-900 hover:text-gray-600"
            >
              <ChevronRight className={`h-4 w-4 mr-1 transform transition-transform ${isServicesExpanded ? 'rotate-90' : ''}`} />
              Plan Details
            </button>
            {isServicesExpanded && (
              <div className="mt-2">
                <ServiceTable services={contract.services} />
              </div>
            )}
          </div>

          {/* Notes and Contact Details Section */}
          {(contract.notes || contract.contactDetails) && (
            <div className="px-4">
              <button 
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="flex items-center text-sm font-medium text-gray-900 hover:text-gray-600"
              >
                <ChevronRight className={`h-4 w-4 mr-1 transform transition-transform ${isDetailsExpanded ? 'rotate-90' : ''}`} />
                Additional Details
              </button>
              {isDetailsExpanded && (
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {contract.notes && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Notes</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{contract.notes}</p>
                    </div>
                  )}
                  {contract.contactDetails && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Contact Details</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {contract.contactDetails}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}