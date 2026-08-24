// Core application types for SANAD Legal Platform

export type UserRole = 'admin' | 'lawyer' | 'user';

export type AppRole = UserRole;

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lawyer {
  id: string;
  profile_id: string;
  license_number: string | null;
  specialization: string | null;
  bio: string | null;
  experience_years: number | null;
  office_address: string | null;
  is_verified: boolean;
  rating: number | null;
  profile?: Profile | null;
}

export type LawCategory =
  | 'civil'
  | 'criminal'
  | 'commercial'
  | 'family'
  | 'administrative'
  | 'constitutional'
  | 'labor'
  | 'procedural';

export interface Law {
  id: string;
  title: string;
  category: LawCategory;
  description: string | null;
  issue_date: string | null;
  effective_date: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  articles?: LawArticle[];
}

export interface LawArticle {
  id: string;
  law_id: string;
  article_number: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export type ConsultationStatus = 'pending' | 'answered' | 'closed';

export interface Consultation {
  id: string;
  user_id: string;
  lawyer_id: string | null;
  subject: string;
  question: string;
  answer: string | null;
  status: ConsultationStatus;
  created_at: string;
  updated_at: string;
  profile?: Profile | null;
  lawyer?: Lawyer | null;
}

export type DocumentType =
  | 'marriage_contract'
  | 'sale_contract'
  | 'rental_contract'
  | 'employment_contract'
  | 'power_of_attorney'
  | 'declaration'
  | 'warning_notice'
  | 'agreement';

export interface Document {
  id: string;
  user_id: string;
  type: DocumentType;
  title: string;
  content: string;
  data: Record<string, string>;
  created_at: string;
  updated_at: string;
  profile?: Profile | null;
}

export type MediaType = 'image' | 'pdf' | 'video' | 'file';

export interface MediaItem {
  id: string;
  type: MediaType;
  name: string;
  url: string;
  size: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export type AIChatStatus = 'active' | 'completed';

export interface AIConversation {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  matched_articles: unknown[] | null;
  rating: number | null;
  status: AIChatStatus;
  created_at: string;
  profile?: Profile | null;
}

export interface Contract {
  id: string;
  user_id: string;
  lawyer_id: string | null;
  title: string;
  type: DocumentType;
  status: 'draft' | 'review' | 'signed' | 'completed';
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile | null;
}

export interface SecurityLog {
  id: string;
  user_id: string | null;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profile?: Profile | null;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_logo: string | null;
  primary_color: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  dark_mode: boolean;
  language: 'ar' | 'en';
  updated_at: string;
}
