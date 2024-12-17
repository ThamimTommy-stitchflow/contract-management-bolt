import { App } from '../types/app';
import { generateAppId } from './appUtils';
import { createDefaultService } from './serviceUtils';

export function fileToApp(file: File): App {
  const fileUrl = URL.createObjectURL(file);
  const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
  
  return {
    id: generateAppId(fileName),
    name: fileName,
    category: 'CSV Uploads',
    contractDetails: {
      services: [createDefaultService()],
      overallTotalValue: '',
      renewalDate: '',
      reviewDate: '',
      notes: '',
      contactDetails: '',
      contractFileUrl: fileUrl,
      stitchflowConnection: 'CSV Upload/API coming soon'
    }
  };
}