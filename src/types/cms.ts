export type ContentType = "article" | "announcement" | "page" | "media" | "event";

export type ContentStatus = "draft" | "published" | "scheduled" | "archived";

export interface CustomContentFields {
  mediaUrl?: string;
  mediaType?: "audio" | "video" | "image" | "document";
  eventVenue?: string;
  eventLocation?: string;
  eventDate?: string;
  eventTicketUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  readingTimeMinutes?: number;
  badgeText?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: ContentType;
  status: ContentStatus;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  coverImage?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledFor?: string;
  views: number;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  customFields?: CustomContentFields;
  user_id?: string;
}
