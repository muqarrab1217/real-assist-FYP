import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';

interface DashboardLayoutProps {
  role: 'client' | 'admin';
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={role} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
