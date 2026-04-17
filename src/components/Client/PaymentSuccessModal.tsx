import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  currency?: string;
  installmentNumber?: string;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency,
  installmentNumber,
}) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-green-500/20 rounded-[2rem] shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>

            {/* Content */}
            <div className="p-10 text-center">
              {/* Animated success icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                className="mx-auto w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mb-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.3 }}
                >
                  <CheckCircleIcon className="h-10 w-10 text-green-500" />
                </motion.div>
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Payment <span className="text-green-400">Successful</span>
              </h2>

              <p className="text-gray-400 text-sm mb-6">
                Your payment has been processed successfully via Stripe.
              </p>

              {/* Payment details */}
              {(amount != null || installmentNumber) && (
                <div className="space-y-3 mb-8">
                  {amount != null && (
                    <div className="flex justify-between items-center p-4 rounded-xl bg-[#141414] border border-green-500/10">
                      <span className="text-gray-500 text-sm">Amount Paid</span>
                      <span className="text-white font-bold text-lg">
                        {(currency || 'PKR').toUpperCase()} {(amount / 100).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {installmentNumber && (
                    <div className="flex justify-between items-center p-4 rounded-xl bg-[#141414] border border-green-500/10">
                      <span className="text-gray-500 text-sm">Installment</span>
                      <span className="text-green-400 font-semibold">#{installmentNumber}</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-5 rounded-xl transition-colors"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
