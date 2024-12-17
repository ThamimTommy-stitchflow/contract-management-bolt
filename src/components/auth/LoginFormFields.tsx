import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoginFormFieldsProps {
  companyName: string;
  accessCode: string;
  error: string;
  isLoading: boolean;
  onCompanyNameChange: (value: string) => void;
  onAccessCodeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginFormFields({
  companyName,
  accessCode,
  error,
  isLoading,
  onCompanyNameChange,
  onAccessCodeChange,
  onSubmit
}: LoginFormFieldsProps) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-900 mb-1">
            Organization Name
          </label>
          <input
            id="companyName"
            type="text"
            required
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            placeholder="Enter your organization name"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="accessCode" className="block text-sm font-medium text-gray-900 mb-1">
            Access Code
          </label>
          <input
            id="accessCode"
            type="text"
            required
            maxLength={4}
            value={accessCode}
            onChange={(e) => onAccessCodeChange(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            placeholder="Enter 4-character code"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </form>
  );
}