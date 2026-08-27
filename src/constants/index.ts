import type { LawCategory, DocumentType, UserRole } from '@/types';

export const APP_NAME = 'SANAD';
export const APP_TAGLINE = 'منصتك القانونية الذكية في اليمن';
export const APP_DESCRIPTION = 'منصة قانونية يمنية متكاملة تقدم الاستشارات القانونية الذكية، مكتبة القوانين، مولد الوثائق القانونية، ودليل المحامين المعتمدين.';

export const NAV_LINKS = [
  { label: 'الرئيسية', path: '/' },
  { label: 'المساعد القانوني', path: '/assistant' },
  { label: 'القوانين', path: '/laws' },
  { label: 'المحامون', path: '/lawyers' },
  { label: 'الوثائق', path: '/documents' },
  { label: 'الاستشارات', path: '/consultations' },
] as const;

export const LAW_CATEGORIES: Record<LawCategory, string> = {
  civil: 'مدني',
  criminal: 'جنائي',
  commercial: 'تجاري',
  family: 'أحوال شخصية',
  administrative: 'إداري',
  constitutional: 'دستوري',
  labor: 'عمالي',
  procedural: 'إجراءات',
};

export const DOCUMENT_TYPES: Record<DocumentType, string> = {
  marriage_contract: 'عقد زواج',
  sale_contract: 'عقد بيع',
  rental_contract: 'عقد إيجار',
  employment_contract: 'عقد عمل',
  power_of_attorney: 'وكالة',
  declaration: 'إقرار',
  warning_notice: 'إنذار',
  agreement: 'اتفاقية',
};

export const ROLES: Record<UserRole, string> = {
  admin: 'مدير النظام',
  lawyer: 'محامٍ',
  user: 'مستخدم',
};

export const CONSULTATION_STATUSES = {
  pending: { label: 'قيد الانتظار', color: 'gold' as const },
  answered: { label: 'تم الرد', color: 'success' as const },
  closed: { label: 'مغلقة', color: 'navy' as const },
};

export const CONTRACT_STATUSES = {
  draft: { label: 'مسودة', color: 'navy' as const },
  review: { label: 'قيد المراجعة', color: 'gold' as const },
  signed: { label: 'موقعة', color: 'royal' as const },
  completed: { label: 'مكتملة', color: 'success' as const },
};

export const NOTIFICATION_TYPES = {
  info: { label: 'معلومة', color: 'royal' as const },
  success: { label: 'نجاح', color: 'success' as const },
  warning: { label: 'تحذير', color: 'gold' as const },
  error: { label: 'خطأ', color: 'error' as const },
};

export const ADMIN_NAV = [
  { label: 'لوحة المعلومات', path: '/admin', icon: 'LayoutDashboard' },
  { label: 'المستخدمون', path: '/admin/users', icon: 'Users' },
  { label: 'المحامون', path: '/admin/lawyers', icon: 'Scale' },
  { label: 'القوانين', path: '/admin/laws', icon: 'BookOpen' },
  { label: 'الوسائط', path: '/admin/media', icon: 'Image' },
  { label: 'الأخبار', path: '/admin/news', icon: 'Newspaper' },
  { label: 'الصفحات', path: '/admin/pages', icon: 'FileText' },
  { label: 'الإشعارات', path: '/admin/notifications', icon: 'Bell' },
  { label: 'الاستشارات', path: '/admin/consultations', icon: 'MessageSquare' },
  { label: 'العقود', path: '/admin/contracts', icon: 'FileSignature' },
  { label: 'محادثات الذكاء', path: '/admin/ai-conversations', icon: 'Bot' },
  { label: 'الأمان', path: '/admin/security', icon: 'Shield' },
  { label: 'الإعدادات', path: '/admin/settings', icon: 'Settings' },
] as const;

export const DASHBOARD_NAV = [
  { label: 'لوحتي', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'استشاراتي', path: '/dashboard/consultations', icon: 'MessageSquare' },
  { label: 'وثائقي', path: '/dashboard/documents', icon: 'FileText' },
  { label: 'محادثاتي', path: '/dashboard/conversations', icon: 'Bot' },
  { label: 'الإشعارات', path: '/dashboard/notifications', icon: 'Bell' },
  { label: 'الإعدادات', path: '/dashboard/settings', icon: 'Settings' },
] as const;

export const LAWYER_NAV = [
  { label: 'لوحتي', path: '/lawyer', icon: 'LayoutDashboard' },
  { label: 'الاستشارات', path: '/lawyer/consultations', icon: 'MessageSquare' },
  { label: 'الإعدادات', path: '/lawyer/settings', icon: 'Settings' },
] as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
