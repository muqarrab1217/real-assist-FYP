import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { stripeAPI } from '@/services/api';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [error, setError] = useState(false);

  useEffect(() => {
    const returnPath = localStorage.getItem('stripe_return_path') || '/client/payments';

    if (!sessionId) {
      // No session ID — just redirect back
      localStorage.removeItem('stripe_return_path');
      navigate(returnPath, { replace: true, state: { paymentSuccess: true } });
      return;
    }

    stripeAPI
      .getSessionStatus(sessionId)
      .then((data) => {
        localStorage.removeItem('stripe_return_path');
        navigate(returnPath, {
          replace: true,
          state: {
            paymentSuccess: true,
            paymentData: {
              amount: data.amountTotal,
              currency: data.currency,
              installmentNumber: data.metadata?.installment_number,
              status: data.status,
            },
          },
        });
      })
      .catch((err) => {
        console.error('Failed to fetch session status:', err);
        // Still redirect back even on error — the payment likely succeeded
        localStorage.removeItem('stripe_return_path');
        navigate(returnPath, { replace: true, state: { paymentSuccess: true } });
      });
  }, [sessionId, navigate]);

  // Brief loading indicator while verifying and redirecting
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }} />
      <p className="text-gold-400 animate-pulse">Verifying payment...</p>
    </div>
  );
};
