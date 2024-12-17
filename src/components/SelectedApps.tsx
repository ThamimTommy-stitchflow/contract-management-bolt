import React from 'react';
import { X } from 'lucide-react';
import { SelectedApp } from '../types';

interface SelectedAppsProps {
  selectedApps: SelectedApp[];
  onRemoveApp: (appId: string) => void;
  onAddNote: (appId: string) => void;
}

export function SelectedApps({ selectedApps, onRemoveApp, onAddNote }: SelectedAppsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Selected Apps ({selectedApps.length})</h2>
      <div className="space-y-2">
        {selectedApps.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-900">{app.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAddNote(app.id)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Add Note
              </button>
              <button
                onClick={() => onRemoveApp(app.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}