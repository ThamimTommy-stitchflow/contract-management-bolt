import React, { useState } from 'react';

interface AppListInputProps {
  onSubmit: (appList: string) => void;
}

export function AppListInput({ onSubmit }: AppListInputProps) {
  const [appList, setAppList] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appList.trim()) {
      onSubmit(appList);
      setAppList('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={appList}
        onChange={(e) => setAppList(e.target.value)}
        placeholder="Enter app names (one per line or comma-separated)"
        className="w-full h-32 p-3 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Add Apps
      </button>
    </form>
  );
}