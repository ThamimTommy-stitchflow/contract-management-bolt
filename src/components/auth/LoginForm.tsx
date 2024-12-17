import React from 'react';
import { LoginFormContent } from './LoginFormContent';

export function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-900">Stitchflow</h1>
        </div>
        <LoginFormContent />
      </div>
    </div>
  );
}