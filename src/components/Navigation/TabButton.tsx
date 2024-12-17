import React from 'react';

interface TabButtonProps {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function TabButton({ active, children, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${
        active 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}