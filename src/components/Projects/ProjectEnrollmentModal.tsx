import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { enrollmentAPI } from '@/services/api';
import { Property } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProjectEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Property | null;
}

export const ProjectEnrollmentModal: React.FC<ProjectEnrollmentModalProps> = ({ isOpen, onClose, project }) => {
    const { role } = useAuthContext();
    const [downPaymentPercent, setDownPaymentPercent] = useState(30);
    const [durationYears, setDurationYears] = useState(2);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const isClient = role === 'client';

    const totalPrice = project?.price || 5000000;
    const downPaymentAmount = (totalPrice * downPaymentPercent) / 100;
    const remainingAmount = totalPrice - downPaymentAmount;
    const monthlyInstallment = remainingAmount / (durationYears * 12);

    useEffect(() => {
        if (isOpen) {
            setSuccess(false);
            setDownPaymentPercent(30);
            setDurationYears(2);
        }
    }, [isOpen]);

    const handleEnroll = async () => {
        if (!project || !isClient) {
            alert('Only registered clients can enroll in projects.');
            return;
        }
        setLoading(true);
        try {
            await enrollmentAPI.createEnrollment({
                projectId: project.id,
                totalPrice: totalPrice,
                downPayment: downPaymentAmount,
                installmentDurationYears: durationYears,
                monthlyInstallment: monthlyInstallment
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Enrollment failed:', error);
            alert('Failed to process enrollment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-start bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-2xl overflow-hidden rounded-b-3xl border-x border-b border-gold-500/20 bg-[#0a0a0a] shadow-2xl"
                        style={{ boxShadow: '0 0 50px rgba(212, 175, 55, 0.1)' }}
                    >
                        {/* Header */}
                        <div className="relative h-32 bg-gradient-to-r from-[#d4af37] to-[#f4e68c] p-8 border-b border-black/10">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 rounded-full bg-black/20 p-2 text-white hover:bg-black/40 transition-colors z-20"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                            <h2 className="text-3xl font-bold text-black" style={{ fontFamily: 'Playfair Display, serif' }}>
                                Project Enrollment
                            </h2>
                            <p className="font-medium text-black/70">
                                {project?.name}
                            </p>
                        </div>

                        <div className="p-8 text-white">
                            {!success ? (
                                <div className="space-y-8">
                                    {/* Financial Config */}
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-sm font-semibold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                                                <CurrencyDollarIcon className="h-4 w-4" />
                                                Down Payment ({downPaymentPercent}%)
                                            </label>
                                            <input
                                                type="range"
                                                min="30"
                                                max="45"
                                                step="5"
                                                value={downPaymentPercent}
                                                onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
                                                className="w-full accent-[#d4af37] bg-charcoal-800 rounded-lg h-2"
                                            />
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>30%</span>
                                                <span>35%</span>
                                                <span>40%</span>
                                                <span>45%</span>
                                            </div>
                                            <div className="p-4 rounded-xl bg-gold-900/10 border border-gold-500/20">
                                                <p className="text-xs text-gray-400">Upfront Payment</p>
                                                <p className="text-xl font-bold font-serif text-white">
                                                    PKR {downPaymentAmount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-semibold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                                                <ClockIcon className="h-4 w-4" />
                                                Installment Plan
                                            </label>
                                            <div className="flex gap-4">
                                                {[2, 3].map(years => (
                                                    <button
                                                        key={years}
                                                        onClick={() => setDurationYears(years)}
                                                        className={`flex-1 py-3 rounded-xl border font-bold transition-all ${durationYears === years
                                                            ? 'bg-[#d4af37] text-black border-transparent shadow-lg shadow-gold-500/20'
                                                            : 'bg-transparent text-gray-400 border-gold-500/20 hover:border-gold-500/50'
                                                            }`}
                                                    >
                                                        {years} Years
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="p-4 rounded-xl bg-charcoal-900/50 border border-gold-500/10">
                                                <p className="text-xs text-gray-400">Monthly Installment</p>
                                                <p className="text-xl font-bold font-serif text-gold-400">
                                                    PKR {Math.round(monthlyInstallment).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="p-6 rounded-2xl bg-[#141414] border border-gold-500/10 text-white">
                                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4 text-gold-400" />
                                            Enrollment Summary
                                        </h4>
                                        <div className="grid grid-cols-2 gap-y-3">
                                            <span className="text-sm text-gray-500">Total Price:</span>
                                            <span className="text-sm font-bold text-white text-right">PKR {totalPrice.toLocaleString()}</span>
                                            <span className="text-sm text-gray-500">Down Payment:</span>
                                            <span className="text-sm font-bold text-white text-right">PKR {downPaymentAmount.toLocaleString()}</span>
                                            <span className="text-sm text-gray-500">Installment Duration:</span>
                                            <span className="text-sm font-bold text-white text-right">{durationYears} Years ({durationYears * 12} Months)</span>
                                            <div className="col-span-2 border-t border-gold-500/20 my-2 pt-2 flex justify-between">
                                                <span className="text-sm font-bold text-gold-400">Monthly Installment:</span>
                                                <span className="text-lg font-bold text-gold-400">PKR {Math.round(monthlyInstallment).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleEnroll}
                                        disabled={loading}
                                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-black font-bold text-lg hover:shadow-2xl hover:shadow-gold-500/40 transition-all group"
                                    >
                                        {loading ? 'Processing...' : (
                                            <>
                                                Confirm Enrollment
                                                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-gold-500/20 flex items-center justify-center mb-6">
                                        <CheckCircleIcon className="h-12 w-12 text-gold-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        Enrollment Successful!
                                    </h3>
                                    <p className="text-gray-400 max-w-sm">
                                        Your interest has been registered. An investment consultant will contact you shortly to finalize the documents.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
