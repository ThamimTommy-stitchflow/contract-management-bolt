import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AppListInputProps {
  onSubmit: (appList: string) => void;
  onCancel: () => void;
}

export function AppListInput({ onSubmit, onCancel }: AppListInputProps) {
  const [appList, setAppList] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appList.trim()) {
      onSubmit(appList);
      setAppList('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="space-y-3">
        <label htmlFor="appList" className="block text-base font-medium text-gray-900">
          Enter app names (comma-separated or as a list)
        </label>
        <textarea
          id="appList"
          value={appList}
          onChange={(e) => setAppList(e.target.value)}
          className="w-full h-32 p-4 text-base border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          placeholder="e.g. Slack, Google Workspace, Notion"
        />
      </div>
      
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Apps
        </button>
      </div>
    </form>
  );
}