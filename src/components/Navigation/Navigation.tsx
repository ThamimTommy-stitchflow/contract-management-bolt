import React from 'react';
import { TabButton } from './TabButton';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="flex border-b border-gray-200 mb-8">
      <TabButton
        active={activeTab === 'apps'}
        onClick={() => onTabChange('apps')}
      >
        App Selection
      </TabButton>
      <TabButton
        active={activeTab === 'contracts'}
        onClick={() => onTabChange('contracts')}
      >
        Contracts
      </TabButton>
    </div>
  );
}