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
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  amount: number;
  installmentNumber: number;
  onPayViaPortal: (paymentId: string, amount: number) => void;
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
  onPayViaPortal,
  onUploadProof,
  isProcessing = false,
}) => {
  const [step, setStep] = useState<Step>('select');
  const [proofType, setProofType] = useState<typeof proofTypes[number]['value']>('bank_transfer');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setStep('select');
    setProofFile(null);
    setNotes('');
    setProofType('bank_transfer');
    onClose();
  };

  const handlePortalPay = () => {
    onPayViaPortal(paymentId, amount);
    handleClose();
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
      // Limit file size to 10MB
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
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-[#0f0f0f] border border-gold-500/20 rounded-[2rem] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-gold-500/10 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white font-serif">
                {step === 'select' && 'Choose Payment Method'}
                {step === 'upload' && 'Upload Payment Proof'}
                {step === 'success' && 'Proof Submitted'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Installment #{installmentNumber} — PKR {amount.toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'select' && (
              <div className="space-y-4">
                {/* Portal Payment */}
                <button
                  onClick={handlePortalPay}
                  disabled={isProcessing}
                  className="w-full p-5 rounded-2xl border border-gold-500/20 bg-gold-500/5 hover:bg-gold-500/10 transition-all text-left flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20">
                    <CreditCardIcon className="h-6 w-6 text-gold-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold">Pay via Portal</h4>
                    <p className="text-xs text-gray-500 mt-1">Instant payment — no verification needed</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Instant</Badge>
                </button>

                {/* Manual Proof */}
                <button
                  onClick={() => setStep('upload')}
                  className="w-full p-5 rounded-2xl border border-gold-500/10 bg-[#141414] hover:bg-[#1a1a1a] transition-all text-left flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <DocumentArrowUpIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold">Upload Payment Proof</h4>
                    <p className="text-xs text-gray-500 mt-1">Bank transfer, JazzCash, Easypaisa, etc.</p>
                  </div>
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Verification</Badge>
                </button>

                {/* Stripe (Coming Soon) */}
                <div className="w-full p-5 rounded-2xl border border-gold-500/5 bg-[#0c0c0c] opacity-50 cursor-not-allowed text-left flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <CreditCardIcon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold">Stripe Payment</h4>
                    <p className="text-xs text-gray-500 mt-1">Credit/Debit card processing</p>
                  </div>
                  <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">Coming Soon</Badge>
                </div>
              </div>
            )}

            {step === 'upload' && (
              <div className="space-y-5">
                {/* Exchange Type Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-3 block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {proofTypes.map(pt => (
                      <button
                        key={pt.value}
                        onClick={() => setProofType(pt.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          proofType === pt.value
                            ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                            : 'bg-[#141414] border-gold-500/5 text-gray-500 hover:border-gold-500/20'
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
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 rounded-2xl border-2 border-dashed border-gold-500/20 hover:border-gold-500/40 transition-all bg-[#141414] flex flex-col items-center gap-3"
                  >
                    {proofFile ? (
                      <>
                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                        <p className="text-sm text-white font-bold">{proofFile.name}</p>
                        <p className="text-xs text-gray-500">{(proofFile.size / 1024).toFixed(1)} KB — Click to change</p>
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="h-8 w-8 text-gold-500/40" />
                        <p className="text-sm text-gray-400">Click to upload receipt or screenshot</p>
                        <p className="text-xs text-gray-600">PNG, JPG, PDF — Max 10MB</p>
                      </>
                    )}
                  </button>
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
                    className="bg-[#141414] border-gold-500/10 rounded-xl h-12 text-sm"
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
                <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </div>
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
