export interface Company {
  id: string;
  name: string;
  access_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyAuth {
  name: string;
  access_code: string;
}