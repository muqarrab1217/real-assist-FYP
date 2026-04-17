import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const PaymentCancelPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-[#0a0a0a] border-yellow-500/20 rounded-[2rem] overflow-hidden shadow-2xl">
          <CardContent className="p-10 text-center">
            {/* Cancel Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center mb-6">
              <XCircleIcon className="h-10 w-10 text-yellow-500" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Payment <span className="text-yellow-400">Cancelled</span>
            </h1>

            <p className="text-gray-400 text-sm mb-8">
              Your payment was not processed. No charges have been made to your card.
              You can try again at any time from your payment schedule.
            </p>

            <div className="flex flex-col gap-3">
              <Link to="/client/updates">
                <Button className="w-full bg-gold-500 text-black hover:bg-gold-400 font-bold py-6 rounded-xl flex items-center justify-center gap-2">
                  Return to Payments
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/client/dashboard">
                <Button variant="outline" className="w-full border-gold-500/20 text-gold-400 hover:bg-gold-500/10 py-6 rounded-xl font-bold">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
