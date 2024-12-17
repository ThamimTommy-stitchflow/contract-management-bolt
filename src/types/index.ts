export interface App {
  id: string;
  name: string;
  category: string;
  notes?: string;
}

export interface SelectedApp extends App {
  selected: boolean;
}

export type Category = 
  | 'Identity Providers'
  | 'HR & Finance'
  | 'Productivity'
  | 'Development'
  | 'Security';