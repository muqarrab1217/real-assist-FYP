import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CreditCardIcon,
  DocumentArrowUpIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { stripeAPI } from '@/services/api';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  amount: number;
  installmentNumber: number;
  clientId?: string;
  onPayViaPortal?: (paymentId: string, amount: number) => void;
  onUploadProof: (data: {
    paymentId: string;
    proofFile: File;
    proofType: 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'cheque' | 'cash_receipt' | 'other';
    notes?: string;
  }) => void;
  isProcessing?: boolean;
}

type Step = 'select' | 'upload' | 'success';

const proofTypes = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'cash_receipt', label: 'Cash Receipt' },
  { value: 'other', label: 'Other' },
] as const;

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  paymentId,
  amount,
  installmentNumber,
  clientId,
  onUploadProof,
  isProcessing = false,
}) => {
  const [step, setStep] = useState<Step>('select');
  const [proofType, setProofType] = useState<typeof proofTypes[number]['value']>('bank_transfer');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setStep('select');
    setProofFile(null);
    setNotes('');
    setProofType('bank_transfer');
    setStripeError(null);
    onClose();
  };

  const handleStripePay = async () => {
    if (!clientId) {
      setStripeError('Client record not found. Please try again.');
      return;
    }
    setStripeLoading(true);
    setStripeError(null);
    try {
      const { url } = await stripeAPI.createCheckoutSession(paymentId, clientId);
      if (url) {
        // Save current path so PaymentSuccessPage can redirect back here
        localStorage.setItem('stripe_return_path', window.location.pathname);
        window.location.href = url;
      } else {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe failed to load');
        setStripeError('Redirect URL not available. Please try again.');
      }
    } catch (err: any) {
      console.error('[STRIPE] Checkout error:', err);
      const msg = err?.message || 'Failed to initiate Stripe checkout';
      if (msg.includes('exceeds') || msg.includes('amount_too_large')) {
        setStripeError(msg + ' Switching to proof upload...');
        setTimeout(() => setStep('upload'), 1500);
      } else {
        setStripeError(msg);
      }
    } finally {
      setStripeLoading(false);
    }
  };

  const handleSubmitProof = () => {
    if (!proofFile) return;
    onUploadProof({
      paymentId,
      proofFile,
      proofType,
      notes: notes.trim() || undefined,
    });
    setStep('success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setProofFile(file);
    }
  };

  if (!isOpen) return null;

  const portalRoot = document.getElementById('portal-root') || document.body;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={handleClose} />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-gold-500/20 rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)]"
        >
          {/* Decorative top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent rounded-full" />

          {/* Header */}
          <div className="px-6 pt-7 pb-5 text-center relative">
            <button
              onClick={handleClose}
              className="absolute right-4 top-5 p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-white transition-colors" />
            </button>
            <h3 className="text-xl font-bold text-white font-serif">
              {step === 'select' && 'Choose Payment Method'}
              {step === 'upload' && 'Upload Payment Proof'}
              {step === 'success' && 'Proof Submitted'}
            </h3>
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/15">
              <span className="text-xs text-gold-400 font-semibold">
                Installment #{installmentNumber}
              </span>
              <span className="w-1 h-1 rounded-full bg-gold-500/40" />
              <span className="text-xs text-gold-300 font-bold">
                PKR {amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-7">
            {step === 'select' && (
              <div className="space-y-3">
                {/* Upload Payment Proof Card */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('upload')}
                  className="w-full group relative rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-5 border border-blue-500/15 group-hover:border-blue-500/30 rounded-2xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                        <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20">
                          <PhotoIcon className="h-7 w-7 text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold text-[15px]">Upload Payment Proof</h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                          Bank transfer, JazzCash, Easypaisa — Upload receipt screenshot or PDF
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <DocumentArrowUpIcon className="h-3.5 w-3.5" />
                            <span>PNG, JPG, PDF</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <CloudArrowUpIcon className="h-3.5 w-3.5" />
                            <span>Max 10MB</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-600 group-hover:text-blue-400 transition-colors mt-1">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
                </div>

                {/* Stripe Card Payment */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStripePay}
                  disabled={isProcessing || stripeLoading || !clientId}
                  className="w-full group relative rounded-2xl overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-violet-500/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-5 border border-purple-500/15 group-hover:border-purple-500/30 rounded-2xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                        <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-600/10 border border-purple-500/20">
                          <CreditCardIcon className="h-7 w-7 text-purple-400" />
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold text-[15px]">
                            {stripeLoading ? 'Redirecting...' : 'Pay with Card'}
                          </h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                            Secure
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                          Credit or debit card via Stripe — Instant & encrypted checkout
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <ShieldCheckIcon className="h-3.5 w-3.5 text-green-500/60" />
                          <span className="text-[10px] text-gray-500">
                            256-bit SSL Encrypted
                          </span>
                          <span className="text-[10px] text-gray-600 ml-1">•</span>
                          <span className="text-[10px] text-gray-500">Powered by Stripe</span>
                        </div>
                      </div>
                      <div className="text-gray-600 group-hover:text-purple-400 transition-colors mt-1">
                        {stripeLoading ? (
                          <div className="h-5 w-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Stripe Error */}
                {stripeError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-400">{stripeError}</p>
                  </motion.div>
                )}

                {/* Security Footer */}
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  <ShieldCheckIcon className="h-3.5 w-3.5 text-gray-600" />
                  <p className="text-[10px] text-gray-600">All payments are secure and encrypted</p>
                </div>
              </div>
            )}

            {step === 'upload' && (
              <div className="space-y-5">
                {/* Payment Type Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3 block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {proofTypes.map(pt => (
                      <button
                        key={pt.value}
                        onClick={() => setProofType(pt.value)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          proofType === pt.value
                            ? 'bg-gold-500/10 border-gold-500/30 text-gold-400 shadow-[0_0_12px_rgba(212,175,55,0.1)]'
                            : 'bg-[#141414] border-gold-500/5 text-gray-500 hover:border-gold-500/20 hover:text-gray-400'
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3 block">
                    Proof Document
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 rounded-2xl border-2 border-dashed border-gold-500/20 hover:border-gold-500/40 transition-all bg-[#0e0e0e] flex flex-col items-center gap-3"
                  >
                    {proofFile ? (
                      <>
                        <div className="p-2 rounded-full bg-green-500/10">
                          <CheckCircleIcon className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="text-sm text-white font-bold">{proofFile.name}</p>
                        <p className="text-xs text-gray-500">{(proofFile.size / 1024).toFixed(1)} KB — Click to change</p>
                      </>
                    ) : (
                      <>
                        <div className="p-2 rounded-full bg-gold-500/5">
                          <CloudArrowUpIcon className="h-8 w-8 text-gold-500/40" />
                        </div>
                        <p className="text-sm text-gray-400">Click to upload receipt or screenshot</p>
                        <p className="text-xs text-gray-600">PNG, JPG, PDF — Max 10MB</p>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3 block">
                    Notes (Optional)
                  </label>
                  <Input
                    placeholder="Transaction ID, reference number, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-[#0e0e0e] border-gold-500/10 rounded-xl h-12 text-sm"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('select')}
                    className="flex-1 border-gold-500/20 text-gray-400 hover:bg-gold-500/5 rounded-xl h-12"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmitProof}
                    disabled={!proofFile || isProcessing}
                    className="flex-1 bg-gold-500 text-black hover:bg-gold-400 font-bold rounded-xl h-12"
                  >
                    {isProcessing ? 'Submitting...' : 'Submit Proof'}
                  </Button>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-500/80">
                    Your proof will be reviewed by our sales team. The payment will be verified within 24-48 hours.
                  </p>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8 space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="mx-auto w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"
                >
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </motion.div>
                <h4 className="text-xl font-bold text-white">Proof Submitted Successfully</h4>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Our sales team will verify your payment proof. You'll see the updated status once it's reviewed.
                </p>
                <Button
                  onClick={handleClose}
                  className="bg-gold-500 text-black hover:bg-gold-400 font-bold rounded-xl px-8 h-12 mt-4"
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    portalRoot
  );
};
