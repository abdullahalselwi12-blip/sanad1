import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PageLoader } from '@/components/ui/Spinner';

import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import { DASHBOARD_NAV, LAWYER_NAV } from '@/constants';

// ============================================================
// Public pages
// ============================================================

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((m) => ({
    default: m.HomePage,
  }))
);

const LawsPage = lazy(() =>
  import('@/pages/LawsPage').then((m) => ({
    default: m.LawsPage,
  }))
);

// صفحات القوانين الجديدة لتحسين SEO
const LawDetailsPage = lazy(() =>
  import('@/pages/LawDetailsPage').then((m) => ({
    default: m.LawDetailsPage,
  }))
);

const ArticlePage = lazy(() =>
  import('@/pages/ArticlePage').then((m) => ({
    default: m.ArticlePage,
  }))
);

// دليل المحامين
const LawyersPage = lazy(() =>
  import('@/pages/LawyersPage').then((m) => ({
    default: m.LawyersPage,
  }))
);

// صفحة السيرة الذاتية للمحامي
const LawyerProfilePage = lazy(() =>
  import('@/pages/LawyerProfilePage').then((m) => ({
    default: m.LawyerProfilePage,
  }))
);

const AssistantPage = lazy(() =>
  import('@/pages/AssistantPage').then((m) => ({
    default: m.AssistantPage,
  }))
);

const DocumentsPage = lazy(() =>
  import('@/pages/DocumentsPage').then((m) => ({
    default: m.DocumentsPage,
  }))
);

const ConsultationsPage = lazy(() =>
  import('@/pages/ConsultationsPage').then((m) => ({
    default: m.ConsultationsPage,
  }))
);

const NotificationsPage = lazy(() =>
  import('@/pages/NotificationsPage').then((m) => ({
    default: m.NotificationsPage,
  }))
);

const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  }))
);

const StaticPage = lazy(() =>
  import('@/pages/StaticPage').then((m) => ({
    default: m.StaticPage,
  }))
);

// ============================================================
// Auth pages
// ============================================================

const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({
    default: m.LoginPage,
  }))
);

const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({
    default: m.RegisterPage,
  }))
);

const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);

const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  }))
);

// ============================================================
// Dashboard pages
// ============================================================

const UserDashboard = lazy(() =>
  import('@/pages/dashboard/UserDashboard').then((m) => ({
    default: m.UserDashboard,
  }))
);

const DashboardConsultations = lazy(() =>
  import('@/pages/dashboard/DashboardConsultations').then((m) => ({
    default: m.DashboardConsultations,
  }))
);

const DashboardDocuments = lazy(() =>
  import('@/pages/dashboard/DashboardDocuments').then((m) => ({
    default: m.DashboardDocuments,
  }))
);

const DashboardConversations = lazy(() =>
  import('@/pages/dashboard/DashboardConversations').then((m) => ({
    default: m.DashboardConversations,
  }))
);

// ============================================================
// Lawyer pages
// ============================================================

const LawyerDashboard = lazy(() =>
  import('@/pages/lawyer/LawyerDashboard').then((m) => ({
    default: m.LawyerDashboard,
  }))
);

const LawyerConsultations = lazy(() =>
  import('@/pages/lawyer/LawyerConsultations').then((m) => ({
    default: m.LawyerConsultations,
  }))
);

// ============================================================
// Admin pages
// ============================================================

const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({
    default: m.AdminDashboard,
  }))
);

const AdminUsers = lazy(() =>
  import('@/pages/admin/AdminUsers').then((m) => ({
    default: m.AdminUsers,
  }))
);

const AdminLawyers = lazy(() =>
  import('@/pages/admin/AdminLawyers').then((m) => ({
    default: m.AdminLawyers,
  }))
);

const AdminLaws = lazy(() =>
  import('@/pages/admin/AdminLaws').then((m) => ({
    default: m.AdminLaws,
  }))
);

const AdminMedia = lazy(() =>
  import('@/pages/admin/AdminMedia').then((m) => ({
    default: m.AdminMedia,
  }))
);

const AdminNews = lazy(() =>
  import('@/pages/admin/AdminNews').then((m) => ({
    default: m.AdminNews,
  }))
);

const AdminPages = lazy(() =>
  import('@/pages/admin/AdminPages').then((m) => ({
    default: m.AdminPages,
  }))
);

const AdminNotifications = lazy(() =>
  import('@/pages/admin/AdminNotifications').then((m) => ({
    default: m.AdminNotifications,
  }))
);

const AdminConsultations = lazy(() =>
  import('@/pages/admin/AdminConsultations').then((m) => ({
    default: m.AdminConsultations,
  }))
);

const AdminContracts = lazy(() =>
  import('@/pages/admin/AdminContracts').then((m) => ({
    default: m.AdminContracts,
  }))
);

const AdminAIConversations = lazy(() =>
  import('@/pages/admin/AdminAIConversations').then((m) => ({
    default: m.AdminAIConversations,
  }))
);

const AdminSecurity = lazy(() =>
  import('@/pages/admin/AdminSecurity').then((m) => ({
    default: m.AdminSecurity,
  }))
);

const AdminSettings = lazy(() =>
  import('@/pages/admin/AdminSettings').then((m) => ({
    default: m.AdminSettings,
  }))
);

// ============================================================
// Application
// ============================================================

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>

              <Routes>

                {/* ==================================================
                    Public routes
                   ================================================== */}

                <Route element={<MainLayout />}>

                  {/* الصفحة الرئيسية */}
                  <Route
                    path="/"
                    element={<HomePage />}
                  />

                  {/* مكتبة القوانين */}
                  <Route
                    path="/laws"
                    element={<LawsPage />}
                  />

                  {/* صفحة القانون - SEO */}
                  <Route
                    path="/laws/:lawId"
                    element={<LawDetailsPage />}
                  />

                  {/* صفحة المادة القانونية - SEO */}
                  <Route
                    path="/laws/:lawId/article/:articleNumber"
                    element={<ArticlePage />}
                  />

                  {/* دليل المحامين */}
                  <Route
                    path="/lawyers"
                    element={<LawyersPage />}
                  />

                  {/* السيرة الذاتية للمحامي */}
                  <Route
                    path="/lawyers/:id"
                    element={<LawyerProfilePage />}
                  />

                  {/* المساعد القانوني */}
                  <Route
                    path="/assistant"
                    element={<AssistantPage />}
                  />

                  {/* الوثائق القانونية */}
                  <Route
                    path="/documents"
                    element={<DocumentsPage />}
                  />

                  {/* الاستشارات */}
                  <Route
                    path="/consultations"
                    element={<ConsultationsPage />}
                  />

                  {/* الإشعارات */}
                  <Route
                    path="/notifications"
                    element={<NotificationsPage />}
                  />

                  {/* الإعدادات */}
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* الصفحات الثابتة */}
                  <Route
                    path="/page/:slug"
                    element={<StaticPage />}
                  />

                </Route>

                {/* ==================================================
                    Auth routes
                   ================================================== */}

                <Route element={<AuthLayout />}>

                  <Route
                    path="/login"
                    element={<LoginPage />}
                  />

                  <Route
                    path="/register"
                    element={<RegisterPage />}
                  />

                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />

                  <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                  />

                </Route>

                {/* ==================================================
                    User dashboard
                   ================================================== */}

                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayout
                        navItems={DASHBOARD_NAV}
                        title="لوحة المستخدم"
                        basePath="/dashboard"
                      />
                    </ProtectedRoute>
                  }
                >

                  <Route
                    path="/dashboard"
                    element={<UserDashboard />}
                  />

                  <Route
                    path="/dashboard/consultations"
                    element={<DashboardConsultations />}
                  />

                  <Route
                    path="/dashboard/documents"
                    element={<DashboardDocuments />}
                  />

                  <Route
                    path="/dashboard/conversations"
                    element={<DashboardConversations />}
                  />

                  <Route
                    path="/dashboard/notifications"
                    element={<NotificationsPage />}
                  />

                  <Route
                    path="/dashboard/settings"
                    element={<SettingsPage />}
                  />

                </Route>

                {/* ==================================================
                    Lawyer dashboard
                   ================================================== */}

                <Route
                  element={
                    <ProtectedRoute
                      roles={['lawyer', 'admin']}
                    >
                      <DashboardLayout
                        navItems={LAWYER_NAV}
                        title="لوحة المحامي"
                        basePath="/lawyer"
                      />
                    </ProtectedRoute>
                  }
                >

                  <Route
                    path="/lawyer"
                    element={<LawyerDashboard />}
                  />

                  <Route
                    path="/lawyer/consultations"
                    element={<LawyerConsultations />}
                  />

                  <Route
                    path="/lawyer/settings"
                    element={<SettingsPage />}
                  />

                </Route>

                {/* ==================================================
                    Admin panel
                   ================================================== */}

                <Route
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >

                  <Route
                    path="/admin"
                    element={<AdminDashboard />}
                  />

                  <Route
                    path="/admin/users"
                    element={<AdminUsers />}
                  />

                  <Route
                    path="/admin/lawyers"
                    element={<AdminLawyers />}
                  />

                  <Route
                    path="/admin/laws"
                    element={<AdminLaws />}
                  />

                  <Route
                    path="/admin/media"
                    element={<AdminMedia />}
                  />

                  <Route
                    path="/admin/news"
                    element={<AdminNews />}
                  />

                  <Route
                    path="/admin/pages"
                    element={<AdminPages />}
                  />

                  <Route
                    path="/admin/notifications"
                    element={<AdminNotifications />}
                  />

                  <Route
                    path="/admin/consultations"
                    element={<AdminConsultations />}
                  />

                  <Route
                    path="/admin/contracts"
                    element={<AdminContracts />}
                  />

                  <Route
                    path="/admin/ai-conversations"
                    element={<AdminAIConversations />}
                  />

                  <Route
                    path="/admin/security"
                    element={<AdminSecurity />}
                  />

                  <Route
                    path="/admin/settings"
                    element={<AdminSettings />}
                  />

                </Route>

              </Routes>

            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}