import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { LandingPage } from '@/pages/Landing/LandingPage';
import { ProjectsPage } from '@/pages/Projects/ProjectsPage';
import { ProjectDetailPage } from '@/pages/Projects/ProjectDetailPage';
import { AboutPage } from '@/pages/About/AboutPage';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { RegisterPage } from '@/pages/Auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/Auth/ForgotPasswordPage';
import { ClientDashboard } from '@/pages/Client/ClientDashboard';
import { PaymentsPage } from '@/pages/Client/PaymentsPage';
import { LedgerPage } from '@/pages/Client/LedgerPage';
import { ProjectUpdatesPage } from '@/pages/Client/ProjectUpdatesPage';
import { AdminDashboard } from '@/pages/Admin/AdminDashboard';
import { LeadManagementPage } from '@/pages/Admin/LeadManagementPage';
import { CustomerManagementPage } from '@/pages/Admin/CustomerManagementPage';
import { PaymentsManagementPage } from '@/pages/Admin/PaymentsManagementPage';
import { AnalyticsPage } from '@/pages/Admin/AnalyticsPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { RagUploadPage } from '@/pages/Admin/RagUploadPage';
import { RagChatHistoryPage } from '@/pages/Admin/RagChatHistoryPage';
import { TeamManagementPage } from '@/pages/Admin/TeamManagementPage';
import { EnrollmentRequestsPage } from '@/pages/Admin/EnrollmentRequestsPage';
import { DashboardProjectsPage } from '@/pages/Dashboard/Projects/DashboardProjectsPage';
import { SubmitResponse } from '@/pages/SubmitResponse';
import { GetHelpPage } from '@/pages/Support/GetHelpPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SalesRepDashboard } from '@/pages/SalesRep/SalesRepDashboard';
import { VerificationsPage } from '@/pages/SalesRep/VerificationsPage';

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
        element: <ProjectsPage />,
      },

      {
        path: 'projects/:projectId',
        element: <ProjectDetailPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
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
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <PublicRoute>
            <ForgotPasswordPage />
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
        element: <ClientDashboard />,
      },
      {
        path: 'payments',
        element: <PaymentsPage />,
      },
      {
        path: 'ledger',
        element: <LedgerPage />,
      },
      {
        path: 'updates',
        element: <ProjectUpdatesPage />,
      },
      {
        path: 'submit-feedback',
        element: <SubmitResponse />,
      },
      {
        path: 'get-help',
        element: <GetHelpPage />,
      },
      {
        path: 'projects',
        element: <DashboardProjectsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'chat-history',
        element: <RagChatHistoryPage />,
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
        element: <SettingsPage />,
      },
      {
        path: 'submit-feedback',
        element: <SubmitResponse />,
      },
      {
        path: 'get-help',
        element: <GetHelpPage />,
      },
      {
        path: 'chat-history',
        element: <RagChatHistoryPage />,
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
        element: <AdminDashboard />,
      },
      {
        path: 'teams',
        element: <TeamManagementPage />,
      },
      {
        path: 'leads',
        element: <LeadManagementPage />,
      },
      {
        path: 'enrollments',
        element: <EnrollmentRequestsPage />,
      },
      {
        path: 'customers',
        element: <CustomerManagementPage />,
      },
      {
        path: 'payments',
        element: <PaymentsManagementPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'projects',
        element: <DashboardProjectsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'rag-upload',
        element: <RagUploadPage />,
      },
      {
        path: 'chat-history',
        element: <RagChatHistoryPage />,
      },

      {
        path: 'submit-feedback',
        element: <SubmitResponse />,
      },
      {
        path: 'get-help',
        element: <GetHelpPage />,
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
        element: <SalesRepDashboard />,
      },
      {
        path: 'verifications',
        element: <VerificationsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'chat-history',
        element: <RagChatHistoryPage />,
      },
      {
        path: 'submit-feedback',
        element: <SubmitResponse />,
      },
      {
        path: 'get-help',
        element: <GetHelpPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
