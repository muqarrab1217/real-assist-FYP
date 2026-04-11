import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ArrowRightIcon,
    HomeIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { useCreateEnrollment } from '@/hooks/queries/useClientQueries';
import { Property } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProjectEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Property | null;
}

interface ValidationError {
    field: string;
    message: string;
}

export const ProjectEnrollmentModal: React.FC<ProjectEnrollmentModalProps> = ({ isOpen, onClose, project }) => {
    const { role } = useAuthContext();
    const [downPaymentPercent, setDownPaymentPercent] = useState(30);
    const [durationYears, setDurationYears] = useState(2);
    const createEnrollmentMutation = useCreateEnrollment();
    const loading = createEnrollmentMutation.isPending;
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState({
        type: '',
        floor: '',
        unitNumber: '',
        bedrooms: '',
        area: '',
        view: ''
    });

    const isClient = role === 'client';

    const totalPrice = project?.price || 5000000;
    const downPaymentAmount = (totalPrice * downPaymentPercent) / 100;
    const remainingAmount = totalPrice - downPaymentAmount;
    const monthlyInstallment = remainingAmount / (durationYears * 12);

    /**
     * Validate all form fields against admin-defined constraints
     */
    const validateForm = (): boolean => {
        const errors: ValidationError[] = [];

        // Validate Unit Type
        if (!selectedUnit.type.trim()) {
            errors.push({
                field: 'Unit Type',
                message: 'Please select a unit type'
            });
        } else if (project?.unitTypeOptions && project.unitTypeOptions.length > 0) {
            // Admin defined specific unit types - user must select from them
            if (!project.unitTypeOptions.includes(selectedUnit.type)) {
                errors.push({
                    field: 'Unit Type',
                    message: `Unit type must be one of: ${project.unitTypeOptions.join(', ')}`
                });
            }
        }

        // Validate Floor
        if (!selectedUnit.floor) {
            errors.push({
                field: 'Floor',
                message: 'Please enter a floor number'
            });
        } else {
            const floor = parseInt(selectedUnit.floor);
            if (project?.floorNumberMin !== undefined && floor < project.floorNumberMin) {
                errors.push({
                    field: 'Floor',
                    message: `Floor must be at least ${project.floorNumberMin}`
                });
            }
            if (project?.floorNumberMax !== undefined && floor > project.floorNumberMax) {
                errors.push({
                    field: 'Floor',
                    message: `Floor cannot exceed ${project.floorNumberMax}`
                });
            }
        }

        // Validate Unit Number
        if (!selectedUnit.unitNumber.trim()) {
            errors.push({
                field: 'Unit Number',
                message: 'Please enter a unit number'
            });
        } else {
            // Check if unit number is within range (if admin set numeric ranges)
            const unitNum = selectedUnit.unitNumber.toLowerCase();
            if (project?.unitNumberMin && project?.unitNumberMax) {
                const minNum = project.unitNumberMin.toLowerCase();
                const maxNum = project.unitNumberMax.toLowerCase();
                if (unitNum < minNum || unitNum > maxNum) {
                    errors.push({
                        field: 'Unit Number',
                        message: `Unit number must be between ${project.unitNumberMin} and ${project.unitNumberMax}`
                    });
                }
            }
        }

        // Validate Area
        if (!selectedUnit.area) {
            errors.push({
                field: 'Area',
                message: 'Please enter an area size'
            });
        } else {
            const area = parseFloat(selectedUnit.area);
            if (project?.areaMin !== undefined && area < project.areaMin) {
                errors.push({
                    field: 'Area',
                    message: `Area must be at least ${project.areaMin} sq ft`
                });
            }
            if (project?.areaMax !== undefined && area > project.areaMax) {
                errors.push({
                    field: 'Area',
                    message: `Area cannot exceed ${project.areaMax} sq ft`
                });
            }
        }

        // Validate Bedrooms
        if (!selectedUnit.bedrooms) {
            errors.push({
                field: 'Bedrooms',
                message: 'Please enter number of bedrooms'
            });
        } else {
            const bedrooms = parseInt(selectedUnit.bedrooms);
            if (project?.roomNumberMin !== undefined && bedrooms < project.roomNumberMin) {
                errors.push({
                    field: 'Bedrooms',
                    message: `Bedrooms must be at least ${project.roomNumberMin}`
                });
            }
            if (project?.roomNumberMax !== undefined && bedrooms > project.roomNumberMax) {
                errors.push({
                    field: 'Bedrooms',
                    message: `Bedrooms cannot exceed ${project.roomNumberMax}`
                });
            }
        }

        if (errors.length > 0) {
            setValidationErrors(errors);
            setShowErrorModal(true);
            return false;
        }

        return true;
    };

    useEffect(() => {
        if (isOpen) {
            setSuccess(false);
            setDownPaymentPercent(30);
            setDurationYears(2);
            setSelectedUnit({
                type: '',
                floor: '',
                unitNumber: '',
                bedrooms: '',
                area: '',
                view: ''
            });
        }
    }, [isOpen]);

    const handleEnroll = async () => {
        if (!project || !isClient) {
            alert('Only registered clients can enroll in projects.');
            return;
        }

        // Validate form before submitting
        if (!validateForm()) {
            return;
        }

        try {
            await createEnrollmentMutation.mutateAsync({
                projectId: project.id,
                totalPrice: totalPrice,
                downPayment: downPaymentAmount,
                installmentDurationYears: durationYears,
                monthlyInstallment: monthlyInstallment,
                unitDetails: selectedUnit
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Enrollment failed:', error);
            alert('Failed to process enrollment. Please try again.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                // Backdrop - fills entire viewport with no gaps, centers modal
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
                    style={{ display: 'flex' }}
                >
                    {/* Error Modal - appears on top of enrollment modal */}
                    <AnimatePresence>
                        {showErrorModal && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                className="absolute z-[60] w-[calc(100%-2rem)] max-w-md rounded-2xl bg-red-950/95 border-2 border-red-500/50 shadow-2xl overflow-hidden"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-red-300 mb-1">
                                                Please Fix the Following Issues
                                            </h3>
                                            <p className="text-xs text-red-200/70">
                                                Your input doesn't match the project requirements
                                            </p>
                                        </div>
                                    </div>

                                    {/* Error List */}
                                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                                        {validationErrors.map((error, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 rounded-lg bg-red-900/40 border border-red-500/30"
                                            >
                                                <p className="text-sm font-semibold text-red-300">
                                                    {error.field}
                                                </p>
                                                <p className="text-xs text-red-200/80 mt-1">
                                                    {error.message}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => setShowErrorModal(false)}
                                        className="w-full px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                                    >
                                        Got it, let me fix this
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        // Modal container - fixed dimensions, centered by parent flex, responsive width
                        className="w-[calc(100%-2rem)] max-w-2xl rounded-3xl border border-gold-500/20 bg-[#0a0a0a] shadow-2xl overflow-hidden flex flex-col"
                        style={{
                            boxShadow: '0 0 50px rgba(212, 175, 55, 0.1)',
                            maxHeight: 'calc(100vh - 2rem)',
                        }}
                    >
                        {/* Header - Fixed, no extra spacing */}
                        <div className="h-32 bg-gradient-to-r from-[#d4af37] to-[#f4e68c] p-8 border-b border-black/10 flex flex-col justify-center relative">
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

                        <div className="flex-1 overflow-y-auto p-8 text-white">
                            {!success ? (
                                <div className="space-y-8">
                                    {/* Unit Selection */}
                                    <div className="space-y-4 pb-6 border-b border-gold-500/10">
                                        <h4 className="font-bold text-gold-400 uppercase tracking-wider text-sm flex items-center gap-2">
                                            <HomeIcon className="h-4 w-4" />
                                            Select Your Unit
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Unit Type Dropdown */}
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400">Unit Type</label>
                                                {project?.unitTypeOptions && project.unitTypeOptions.length > 0 ? (
                                                    <CustomDropdown
                                                        value={selectedUnit.type}
                                                        onChange={(value) => setSelectedUnit({ ...selectedUnit, type: value })}
                                                        options={project.unitTypeOptions.map(type => ({ label: type, value: type }))}
                                                        placeholder="Select a unit type"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., Penthouse, Suite"
                                                        value={selectedUnit.type}
                                                        onChange={(e) => setSelectedUnit({ ...selectedUnit, type: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gold-500/20 text-white focus:border-gold-500/50 outline-none transition-colors"
                                                    />
                                                )}
                                            </div>

                                            {/* Floor Number Range */}
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400">
                                                    Floor {project?.floorNumberMin !== undefined && project?.floorNumberMax !== undefined ? `(${project.floorNumberMin}-${project.floorNumberMax})` : ''}
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g., 5"
                                                    value={selectedUnit.floor}
                                                    onChange={(e) => setSelectedUnit({ ...selectedUnit, floor: e.target.value })}
                                                    min={project?.floorNumberMin}
                                                    max={project?.floorNumberMax}
                                                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gold-500/20 text-white focus:border-gold-500/50 outline-none transition-colors"
                                                />
                                            </div>

                                            {/* Unit Number Range */}
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400">
                                                    Unit # {project?.unitNumberMin && project?.unitNumberMax ? `(${project.unitNumberMin}-${project.unitNumberMax})` : ''}
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., 501-A"
                                                    value={selectedUnit.unitNumber}
                                                    onChange={(e) => setSelectedUnit({ ...selectedUnit, unitNumber: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gold-500/20 text-white focus:border-gold-500/50 outline-none transition-colors"
                                                />
                                            </div>

                                            {/* Area Range */}
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400">
                                                    Area (sq ft) {project?.areaMin && project?.areaMax ? `(${project.areaMin}-${project.areaMax})` : ''}
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g., 1200"
                                                    value={selectedUnit.area}
                                                    onChange={(e) => setSelectedUnit({ ...selectedUnit, area: e.target.value })}
                                                    min={project?.areaMin}
                                                    max={project?.areaMax}
                                                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gold-500/20 text-white focus:border-gold-500/50 outline-none transition-colors"
                                                />
                                            </div>

                                            {/* Room/Bedrooms */}
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400">
                                                    Bedrooms {project?.roomNumberMin !== undefined && project?.roomNumberMax !== undefined ? `(${project.roomNumberMin}-${project.roomNumberMax})` : ''}
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g., 3"
                                                    value={selectedUnit.bedrooms}
                                                    onChange={(e) => setSelectedUnit({ ...selectedUnit, bedrooms: e.target.value })}
                                                    min={project?.roomNumberMin}
                                                    max={project?.roomNumberMax}
                                                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gold-500/20 text-white focus:border-gold-500/50 outline-none transition-colors"
                                                />
                                            </div>

                                            {/* View Preference */}
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400">View Preference</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Sea View, Garden View"
                                                    value={selectedUnit.view}
                                                    onChange={(e) => setSelectedUnit({ ...selectedUnit, view: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gold-500/20 text-white focus:border-gold-500/50 outline-none transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

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
