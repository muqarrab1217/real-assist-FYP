import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Chatbot } from '@/components/ui/Chatbot';
import { useAuthContext } from '@/contexts/AuthContext';
import { PaymentSuccessModal } from '@/components/Client/PaymentSuccessModal';

interface DashboardLayoutProps {
  role: 'client' | 'admin' | 'employee' | 'sales_rep';
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { logout, user } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    amount?: number;
    currency?: string;
    installmentNumber?: string;
  }>({ open: false });

  // Detect payment success from navigation state
  useEffect(() => {
    const state = location.state as { paymentSuccess?: boolean; paymentData?: any } | null;
    if (state?.paymentSuccess) {
      setPaymentModal({
        open: true,
        amount: state.paymentData?.amount,
        currency: state.paymentData?.currency,
        installmentNumber: state.paymentData?.installmentNumber,
      });
      // Clear the state so it doesn't re-trigger on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

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
      <PaymentSuccessModal
        isOpen={paymentModal.open}
        onClose={() => setPaymentModal({ open: false })}
        amount={paymentModal.amount}
        currency={paymentModal.currency}
        installmentNumber={paymentModal.installmentNumber}
      />
    </div>
  );
};
