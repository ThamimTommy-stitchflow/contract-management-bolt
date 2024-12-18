import React, { useState } from 'react';
import { X, Upload, File, Trash2, Loader2 } from 'lucide-react';
import { useContractFiles } from '../../hooks/useContractFiles';
import { contractService } from '../../services/contracts';

interface ContractUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: (files: File[]) => void;
  companyId: string;
}

export function ContractUploadModal({ isOpen, onClose, onDone, companyId }: ContractUploadModalProps) {
  const { files, addFiles, removeFile, clearFiles } = useContractFiles();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const pdfFiles = selectedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFiles.length > 0) {
      addFiles(pdfFiles);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDone = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      await contractService.uploadContract(files[0], companyId);
      
      clearFiles();
      onDone([files[0]]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process contract');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Upload Contracts</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isProcessing ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Your contract is being parsed, please wait...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div 
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF files only
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf"
                multiple
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Uploaded Files ({files.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <File className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDone}
                disabled={files.length === 0 || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}