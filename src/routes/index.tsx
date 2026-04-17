import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { LandingPage } from '@/pages/Landing/LandingPage';

// ── Lazy-loaded pages (code-split into separate chunks) ─────────────
const ProjectsPage = React.lazy(() => import('@/pages/Projects/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ProjectDetailPage = React.lazy(() => import('@/pages/Projects/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const AboutPage = React.lazy(() => import('@/pages/About/AboutPage').then(m => ({ default: m.AboutPage })));
const LoginPage = React.lazy(() => import('@/pages/Auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('@/pages/Auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('@/pages/Auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ClientDashboard = React.lazy(() => import('@/pages/Client/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const PaymentsPage = React.lazy(() => import('@/pages/Client/PaymentsPage').then(m => ({ default: m.PaymentsPage })));
const LedgerPage = React.lazy(() => import('@/pages/Client/LedgerPage').then(m => ({ default: m.LedgerPage })));
const ProjectUpdatesPage = React.lazy(() => import('@/pages/Client/ProjectUpdatesPage').then(m => ({ default: m.ProjectUpdatesPage })));
const AdminDashboard = React.lazy(() => import('@/pages/Admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const LeadManagementPage = React.lazy(() => import('@/pages/Admin/LeadManagementPage').then(m => ({ default: m.LeadManagementPage })));
const CustomerManagementPage = React.lazy(() => import('@/pages/Admin/CustomerManagementPage').then(m => ({ default: m.CustomerManagementPage })));
const PaymentsManagementPage = React.lazy(() => import('@/pages/Admin/PaymentsManagementPage').then(m => ({ default: m.PaymentsManagementPage })));
const AnalyticsPage = React.lazy(() => import('@/pages/Admin/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const SettingsPage = React.lazy(() => import('@/pages/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const RagUploadPage = React.lazy(() => import('@/pages/Admin/RagUploadPage').then(m => ({ default: m.RagUploadPage })));
const RagChatHistoryPage = React.lazy(() => import('@/pages/Admin/RagChatHistoryPage').then(m => ({ default: m.RagChatHistoryPage })));
const TeamManagementPage = React.lazy(() => import('@/pages/Admin/TeamManagementPage').then(m => ({ default: m.TeamManagementPage })));
const EnrollmentRequestsPage = React.lazy(() => import('@/pages/Admin/EnrollmentRequestsPage').then(m => ({ default: m.EnrollmentRequestsPage })));
const DashboardProjectsPage = React.lazy(() => import('@/pages/Dashboard/Projects/DashboardProjectsPage').then(m => ({ default: m.DashboardProjectsPage })));
const SubmitResponse = React.lazy(() => import('@/pages/SubmitResponse').then(m => ({ default: m.SubmitResponse })));
const GetHelpPage = React.lazy(() => import('@/pages/Support/GetHelpPage').then(m => ({ default: m.GetHelpPage })));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const SalesRepDashboard = React.lazy(() => import('@/pages/SalesRep/SalesRepDashboard').then(m => ({ default: m.SalesRepDashboard })));
const VerificationsPage = React.lazy(() => import('@/pages/SalesRep/VerificationsPage').then(m => ({ default: m.VerificationsPage })));
const PaymentSuccessPage = React.lazy(() => import('@/pages/Client/PaymentSuccessPage').then(m => ({ default: m.PaymentSuccessPage })));
const PaymentCancelPage = React.lazy(() => import('@/pages/Client/PaymentCancelPage').then(m => ({ default: m.PaymentCancelPage })));

const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500"></div>
  </div>
);

const S: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LazyFallback />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'projects',
        element: <S><ProjectsPage /></S>,
      },

      {
        path: 'projects/:projectId',
        element: <S><ProjectDetailPage /></S>,
      },
      {
        path: 'about',
        element: <S><AboutPage /></S>,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <PublicRoute>
            <S><LoginPage /></S>
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <S><RegisterPage /></S>
          </PublicRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <PublicRoute>
            <S><ForgotPasswordPage /></S>
          </PublicRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/register',
    element: <Navigate to="/auth/register" replace />,
  },
  {
    path: '/forgot-password',
    element: <Navigate to="/auth/forgot-password" replace />,
  },
  {
    path: '/client',
    element: (
      <ProtectedRoute requiredRole="client">
        <DashboardLayout role="client" title="Client Dashboard" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/client/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <S><ClientDashboard /></S>,
      },
      {
        path: 'payments',
        element: <S><PaymentsPage /></S>,
      },
      {
        path: 'ledger',
        element: <S><LedgerPage /></S>,
      },
      {
        path: 'updates',
        element: <S><ProjectUpdatesPage /></S>,
      },
      {
        path: 'submit-feedback',
        element: <S><SubmitResponse /></S>,
      },
      {
        path: 'get-help',
        element: <S><GetHelpPage /></S>,
      },
      {
        path: 'projects',
        element: <S><DashboardProjectsPage /></S>,
      },
      {
        path: 'settings',
        element: <S><SettingsPage /></S>,
      },
      {
        path: 'chat-history',
        element: <S><RagChatHistoryPage /></S>,
      },
      {
        path: 'payment-success',
        element: <S><PaymentSuccessPage /></S>,
      },
      {
        path: 'payment-cancel',
        element: <S><PaymentCancelPage /></S>,
      },
    ],

  },
  {
    path: '/employee',
    element: (
      <ProtectedRoute requiredRole="employee">
        <DashboardLayout role="employee" title="Staff Dashboard" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/employee/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <div className="text-white p-6">Staff Dashboard Content Incoming...</div>,
      },
      {
        path: 'settings',
        element: <S><SettingsPage /></S>,
      },
      {
        path: 'submit-feedback',
        element: <S><SubmitResponse /></S>,
      },
      {
        path: 'get-help',
        element: <S><GetHelpPage /></S>,
      },
      {
        path: 'chat-history',
        element: <S><RagChatHistoryPage /></S>,
      },
    ],

  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout role="admin" title="Admin Dashboard" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <S><AdminDashboard /></S>,
      },
      {
        path: 'teams',
        element: <S><TeamManagementPage /></S>,
      },
      {
        path: 'leads',
        element: <S><LeadManagementPage /></S>,
      },
      {
        path: 'enrollments',
        element: <S><EnrollmentRequestsPage /></S>,
      },
      {
        path: 'customers',
        element: <S><CustomerManagementPage /></S>,
      },
      {
        path: 'payments',
        element: <S><PaymentsManagementPage /></S>,
      },
      {
        path: 'analytics',
        element: <S><AnalyticsPage /></S>,
      },
      {
        path: 'projects',
        element: <S><DashboardProjectsPage /></S>,
      },
      {
        path: 'settings',
        element: <S><SettingsPage /></S>,
      },
      {
        path: 'rag-upload',
        element: <S><RagUploadPage /></S>,
      },
      {
        path: 'chat-history',
        element: <S><RagChatHistoryPage /></S>,
      },

      {
        path: 'submit-feedback',
        element: <S><SubmitResponse /></S>,
      },
      {
        path: 'get-help',
        element: <S><GetHelpPage /></S>,
      },
    ],
  },
  {
    path: '/sales-rep',
    element: (
      <ProtectedRoute requiredRole="sales_rep">
        <DashboardLayout role="sales_rep" title="Sales Rep Dashboard" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/sales-rep/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <S><SalesRepDashboard /></S>,
      },
      {
        path: 'verifications',
        element: <S><VerificationsPage /></S>,
      },
      {
        path: 'settings',
        element: <S><SettingsPage /></S>,
      },
      {
        path: 'chat-history',
        element: <S><RagChatHistoryPage /></S>,
      },
      {
        path: 'submit-feedback',
        element: <S><SubmitResponse /></S>,
      },
      {
        path: 'get-help',
        element: <S><GetHelpPage /></S>,
      },
    ],
  },
  {
    path: '*',
    element: <S><NotFoundPage /></S>,
  },
]);
