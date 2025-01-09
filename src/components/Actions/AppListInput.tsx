import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AppListInputProps {
  onSubmit: (appList: string) => void;
}

export function AppListInput({ onSubmit }: AppListInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [appList, setAppList] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appList.trim()) {
      onSubmit(appList);
      setAppList('');
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        <Plus className="h-4 w-4" />
        Enter your app list
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="space-y-2">
        <label htmlFor="appList" className="block text-sm font-medium text-gray-700">
          Enter app names (comma-separated or as a list)
        </label>
        <textarea
          id="appList"
          value={appList}
          onChange={(e) => setAppList(e.target.value)}
          className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. Slack, Google Workspace, Notion"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Apps
        </button>
      </div>
    </form>
  );
}