import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Chatbot } from '@/components/ui/Chatbot';
import { useAuthContext } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  role: 'client' | 'admin' | 'employee' | 'sales_rep';
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { logout, user } = useAuthContext();

  const handleLogout = async () => {
    console.log('[DEBUG] DashboardLayout: Initiating logout redirect');
    await logout();
    // Use hard refresh for persistent session cleanup as requested
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex h-screen" style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
    }}>
      <Sidebar role={role} onLogout={handleLogout} user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <Chatbot />
    </div>
  );
};
