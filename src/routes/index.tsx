import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LandingPage } from '@/pages/Landing/LandingPage';
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
import { SettingsPage } from '@/pages/Admin/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
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
    element: <DashboardLayout role="client" title="Client Dashboard" />,
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
    ],
  },
  {
    path: '/admin',
    element: <DashboardLayout role="admin" title="Admin Dashboard" />,
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
        path: 'leads',
        element: <LeadManagementPage />,
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
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
