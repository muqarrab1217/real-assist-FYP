import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';

interface DashboardLayoutProps {
  role: 'client' | 'admin';
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
