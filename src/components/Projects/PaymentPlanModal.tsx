import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    BanknotesIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Property, InventoryItem } from '@/types';
import { useCreateEnrollment } from '@/hooks/queries/useClientQueries';

interface PaymentPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Property;
    selectedUnit: InventoryItem | null;
    onSuccess: () => void;
}

type PlanType = '2year' | '3year' | 'flexible';
type Frequency = 'monthly' | 'yearly';

export const PaymentPlanModal: React.FC<PaymentPlanModalProps> = ({
    isOpen,
    onClose,
    project,
    selectedUnit,
    onSuccess,
}) => {
    const [planType, setPlanType] = useState<PlanType>('2year');
    const [downPaymentPct, setDownPaymentPct] = useState(10);
    const [frequency, setFrequency] = useState<Frequency>('monthly');
    const [flexibleMonths, setFlexibleMonths] = useState(30);
    const [showSuccess, setShowSuccess] = useState(false);

    const createEnrollment = useCreateEnrollment();

    const headers = project?.inventoryHeaders || [];

    // Extract price from selected unit using priceColumnKey
    const unitPrice = useMemo(() => {
        if (!selectedUnit || !project?.priceColumnKey) return 0;
        const raw = selectedUnit.rowData[project.priceColumnKey];
        if (!raw) return 0;
        const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
    }, [selectedUnit, project?.priceColumnKey]);

    // Calculations
    const calculations = useMemo(() => {
        const durationMonths = planType === '2year' ? 24 : planType === '3year' ? 36 : flexibleMonths;
        const downPaymentAmount = unitPrice * (downPaymentPct / 100);
        const remaining = unitPrice - downPaymentAmount;
        const installmentCount = frequency === 'monthly' ? durationMonths : Math.ceil(durationMonths / 12);
        const perInstallment = installmentCount > 0 ? remaining / installmentCount : 0;
        const durationYears = durationMonths / 12;

        return {
            durationMonths,
            durationYears,
            downPaymentAmount,
            remaining,
            installmentCount,
            perInstallment,
        };
    }, [unitPrice, planType, downPaymentPct, frequency, flexibleMonths]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);

    const handleConfirm = async () => {
        if (!selectedUnit || !project) return;

        try {
            await createEnrollment.mutateAsync({
                projectId: project.id,
                totalPrice: unitPrice,
                downPayment: calculations.downPaymentAmount,
                installmentDurationYears: calculations.durationYears,
                monthlyInstallment: frequency === 'monthly' ? calculations.perInstallment : calculations.perInstallment / 12,
                unitDetails: selectedUnit.rowData,
                inventoryItemId: selectedUnit.id,
                paymentFrequency: frequency,
                isFlexiblePlan: planType === 'flexible',
                downPaymentPercentage: downPaymentPct,
            });
            setShowSuccess(true);
        } catch (err: any) {
            alert(err?.message || 'Failed to submit enrollment');
        }
    };

    if (!selectedUnit) return null;

    const portalTarget = document.getElementById('portal-root') || document.body;

    const plans: { key: PlanType; label: string; desc: string }[] = [
        { key: '2year', label: '2-Year Plan', desc: '24-month installment period' },
        { key: '3year', label: '3-Year Plan', desc: '36-month installment period' },
        { key: 'flexible', label: 'Flexible', desc: 'Custom duration' },
    ];

    const handleSuccessDismiss = () => {
        setShowSuccess(false);
        onSuccess();
    };

    return createPortal(
        <AnimatePresence>
            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[70] flex justify-center items-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-sm bg-[#0a0a0a] rounded-3xl border border-gold-500/20 shadow-2xl p-8 text-center"
                    >
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircleIcon className="h-10 w-10 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Enrollment Submitted!
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Your enrollment request has been submitted successfully. Please wait for admin approval.
                        </p>
                        <Button
                            onClick={handleSuccessDismiss}
                            className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold h-11 rounded-xl hover:shadow-lg hover:shadow-gold-500/20 transition-all"
                        >
                            OK
                        </Button>
                    </motion.div>
                </div>
            )}

            {isOpen && !showSuccess && (
                <div className="fixed inset-0 z-[60] flex justify-center items-center bg-black/70 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0a0a0a] rounded-3xl border border-gold-500/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gold-500/10 bg-gradient-to-r from-gold-500/10 to-transparent">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        Configure Payment Plan
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">{project.name}</p>
                                </div>
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-gold-500/10 text-gray-400 hover:text-gold-400 transition-all">
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Unit Summary */}
                            <div className="bg-[#141414] rounded-2xl p-4 border border-gold-500/10">
                                <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">Selected Unit</h3>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                    {headers.map(h => {
                                        const val = selectedUnit.rowData[h];
                                        if (!val) return null;
                                        return (
                                            <div key={h} className="flex justify-between text-sm">
                                                <span className="text-gray-500">{h}</span>
                                                <span className={`text-white font-medium ${h === project.priceColumnKey ? 'text-gold-400' : ''}`}>
                                                    {val}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {unitPrice > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gold-500/10 flex justify-between">
                                        <span className="text-gray-400 font-medium">Total Price</span>
                                        <span className="text-gold-400 font-bold text-lg">{formatCurrency(unitPrice)}</span>
                                    </div>
                                )}
                            </div>

                            {unitPrice === 0 && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-400 text-sm">
                                    No price column detected. Contact admin to set a price column for this project.
                                </div>
                            )}

                            {/* Plan Selection */}
                            <div>
                                <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CalendarDaysIcon className="h-4 w-4" /> Payment Plan
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {plans.map(p => (
                                        <button
                                            key={p.key}
                                            onClick={() => setPlanType(p.key)}
                                            className={`p-3 rounded-xl border text-left transition-all ${
                                                planType === p.key
                                                    ? 'border-gold-400 bg-gold-500/10'
                                                    : 'border-gold-500/10 bg-[#141414] hover:border-gold-500/30'
                                            }`}
                                        >
                                            <p className={`text-sm font-bold ${planType === p.key ? 'text-gold-400' : 'text-white'}`}>{p.label}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                                        </button>
                                    ))}
                                </div>

                                {planType === 'flexible' && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <label className="text-sm text-gray-400 whitespace-nowrap">Duration (months):</label>
                                        <input
                                            type="number"
                                            min={6}
                                            max={120}
                                            value={flexibleMonths}
                                            onChange={e => setFlexibleMonths(Math.max(6, Math.min(120, parseInt(e.target.value) || 6)))}
                                            className="w-24 bg-[#141414] border border-gold-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500/50"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Down Payment */}
                            <div>
                                <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <BanknotesIcon className="h-4 w-4" /> Down Payment — {downPaymentPct}%
                                </h3>
                                <input
                                    type="range"
                                    min={10}
                                    max={100}
                                    step={5}
                                    value={downPaymentPct}
                                    onChange={e => setDownPaymentPct(parseInt(e.target.value))}
                                    className="w-full accent-gold-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>10%</span>
                                    <span className="text-gold-400 font-medium">{formatCurrency(calculations.downPaymentAmount)}</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Frequency */}
                            {downPaymentPct < 100 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">Payment Frequency</h3>
                                    <div className="flex gap-3">
                                        {(['monthly', 'yearly'] as Frequency[]).map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setFrequency(f)}
                                                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                                    frequency === f
                                                        ? 'border-gold-400 bg-gold-500/10 text-gold-400'
                                                        : 'border-gold-500/10 bg-[#141414] text-gray-400 hover:border-gold-500/30'
                                                }`}
                                            >
                                                {f === 'monthly' ? 'Monthly' : 'Yearly'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Financial Summary */}
                            <div className="bg-gradient-to-br from-gold-500/10 to-gold-500/5 rounded-2xl p-5 border border-gold-500/20">
                                <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">Financial Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Unit Price</span>
                                        <span className="text-white font-medium">{formatCurrency(unitPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Down Payment ({downPaymentPct}%)</span>
                                        <span className="text-white font-medium">{formatCurrency(calculations.downPaymentAmount)}</span>
                                    </div>
                                    {downPaymentPct < 100 && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Remaining Balance</span>
                                                <span className="text-white font-medium">{formatCurrency(calculations.remaining)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Plan Duration</span>
                                                <span className="text-white font-medium">
                                                    {calculations.durationMonths} months ({calculations.durationYears.toFixed(1)} years)
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Number of Installments</span>
                                                <span className="text-white font-medium">
                                                    {calculations.installmentCount} {frequency === 'monthly' ? 'monthly' : 'yearly'} payments
                                                </span>
                                            </div>
                                            <div className="border-t border-gold-500/20 pt-3 flex justify-between">
                                                <span className="text-gold-400 font-semibold">Per Installment</span>
                                                <span className="text-gold-400 font-bold text-lg">{formatCurrency(calculations.perInstallment)}</span>
                                            </div>
                                        </>
                                    )}
                                    {downPaymentPct === 100 && (
                                        <div className="border-t border-gold-500/20 pt-3 text-center text-sm text-green-400">
                                            Full payment — no installments needed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gold-500/10 bg-[#0f0f0f] flex items-center justify-between gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="border-gold-500/20 text-gray-400 hover:text-white"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={unitPrice === 0 || createEnrollment.isPending}
                                className="bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold px-8 h-11 rounded-xl hover:shadow-lg hover:shadow-gold-500/20 transition-all disabled:opacity-50"
                            >
                                {createEnrollment.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Submitting...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <CheckCircleIcon className="h-5 w-5" />
                                        Confirm Enrollment
                                    </span>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        portalTarget
    );
};
