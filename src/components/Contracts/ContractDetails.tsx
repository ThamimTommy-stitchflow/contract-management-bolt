import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ContractDetailsProps {
  notes?: string;
  contactDetails?: string;
}

export function ContractDetails({ notes, contactDetails }: ContractDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!notes && !contactDetails) return null;

  return (
    <div className="border-t border-gray-200 mt-6 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className="font-medium">Additional Details</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-6 mt-4">
          {notes && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Notes</label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{notes}</p>
              </div>
            </div>
          )}
          {contactDetails && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Contact Details</label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{contactDetails}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}