import React from 'react';

export function LoginFormHeader() {
  return (
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-semibold text-gray-900">
        Stitchflow Onboarding
      </h2>
      <p className="text-sm text-gray-600">
        Please take 2 minutes to indicate apps used in your org
      </p>
    </div>
  );
}