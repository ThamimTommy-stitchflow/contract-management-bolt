import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface AppListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appList: string) => void;
}

export function AppListModal({ isOpen, onClose, onSubmit }: AppListModalProps) {
  const [appList, setAppList] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(appList);
    setAppList('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add Apps</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={appList}
            onChange={(e) => setAppList(e.target.value)}
            placeholder="Enter app names (comma-separated or as a list)"
            className="w-full h-32 p-3 border border-gray-200 rounded-lg mb-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Apps
          </button>
        </form>
      </div>
    </div>
  );
}