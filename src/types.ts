export interface Site {
  id: string;
  user_id: string;
  design_summary: string;
  status: string;
  name?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  hasMailAccess: boolean;
}

export interface Contact {
  id: string;
  email: string;
  name?: string;
  user_id: string;
  site_id: string;
}

export interface Email {
  id: string;
  subject: string;
  body: string;
  recipient: string;
  user_id: string;
  site_id: string;
  createdAt: string;
}

export type SiteDocType = 'site_dossier' | 'epk' | 'tech_rider' | 'brand_guide' | 'seo_checklist' | 'custom';

export interface SiteGoogleDoc {
  id: string;
  user_id: string;
  site_id: string;
  site_name: string;
  document_id: string;
  title: string;
  doc_type: SiteDocType;
  doc_url: string;
  created_at: string;
  updated_at?: string;
  summary?: string;
}
