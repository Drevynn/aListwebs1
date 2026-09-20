export interface Site {
  id: string;
  user_id: string;
  design_summary: string;
  status: string;
  name?: string;
  archetype?: string;
  domain?: string;
  custom_domain?: string;
  created_at?: string;
  updated_at?: string;
  published_url?: string;
  view_count?: number;
  tags?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  hasMailAccess?: boolean;
  subscriptionTier?: 'monthly' | 'biannual' | 'yearly' | 'free' | string;
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  created_at?: string;
}

export interface AdminSubscriptionRecord {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName?: string;
  status: string;
  planId: string;
  planName: string;
  tier: string;
  interval: string;
  amountCents: number;
  currency: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  createdAt: string;
  domainUpsell?: string;
}

export interface AdminAnalyticsSummary {
  isConfigured: boolean;
  mrrCents: number;
  arrCents: number;
  totalSubscribers: number;
  activeSubscribers: number;
  trialingSubscribers: number;
  canceledSubscribers: number;
  tierCounts: {
    monthly: number;
    biannual: number;
    yearly: number;
    free: number;
  };
  subscriptions: AdminSubscriptionRecord[];
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
