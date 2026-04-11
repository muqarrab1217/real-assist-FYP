import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    CheckCircleIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCreateLead } from '@/hooks/queries/useCommonQueries';

interface EnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ isOpen, onClose, project }) => {
    const { user } = useAuthContext();
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    const createLeadMutation = useCreateLead();
    const loading = createLeadMutation.isPending;

    useEffect(() => {
        if (user) {
            setFormData({
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email || '',
                phone: '', // Phone might not be in auth context yet
                notes: `Interested in enrolling for ${project?.name || 'Project'}`
            });
        }
    }, [user, project]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createLeadMutation.mutateAsync({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                status: 'warm',
                source: 'Website Enrollment',
                notes: formData.notes
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 3000);
        } catch (error) {
            console.error('Failed to enroll:', error);
            alert('Failed to submit enrollment. Please try again.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-lg overflow-hidden relative"
                        style={{
                            background: 'rgba(26,26,26,0.95)',
                            border: '1px solid rgba(212,175,55,0.3)',
                            borderRadius: '28px',
                            boxShadow: '0 25px 50px -12px rgba(212,175,55,0.15)'
                        }}
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gold-500/10 flex justify-between items-center">
                            <div>
                                <h3
                                    className="text-2xl font-bold text-white mb-1"
                                    style={{ fontFamily: 'Playfair Display, serif' }}
                                >
                                    Project Enrollment
                                </h3>
                                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.8)' }}>
                                    Interested in {project?.name}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gold-500/10 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8">
                            {!success ? (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2" style={{ color: '#d4af37' }}>
                                            <UserIcon className="h-4 w-4" /> Full Name
                                        </label>
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="bg-black/50 border-gold-500/20 text-white placeholder:text-gray-600 focus:border-gold-500/50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2" style={{ color: '#d4af37' }}>
                                            <EnvelopeIcon className="h-4 w-4" /> Email Address
                                        </label>
                                        <Input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                            className="bg-black/50 border-gold-500/20 text-white placeholder:text-gray-600 focus:border-gold-500/50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2" style={{ color: '#d4af37' }}>
                                            <PhoneIcon className="h-4 w-4" /> Phone Number
                                        </label>
                                        <Input
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+92 3XX XXXXXXX"
                                            className="bg-black/50 border-gold-500/20 text-white placeholder:text-gray-600 focus:border-gold-500/50"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            disabled={loading}
                                            className="w-full font-bold text-black text-lg h-12"
                                            style={{
                                                background: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                                                borderRadius: '14px',
                                                boxShadow: '0 10px 20px -5px rgba(212,175,55,0.3)'
                                            }}
                                        >
                                            {loading ? 'Processing...' : 'Submit Interest'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-10"
                                >
                                    <div
                                        className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-500/30"
                                    >
                                        <CheckCircleIcon className="h-12 w-12 text-gold-500" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-white mb-2">Enrollment Received!</h4>
                                    <p style={{ color: 'rgba(156, 163, 175, 0.9)' }} className="max-w-xs mx-auto">
                                        Thank you for your interest in {project?.name}. Our relationship manager will contact you shortly.
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer decoration */}
                        <div className="p-4 bg-gold-500/5 text-center">
                            <p className="text-[10px] text-gold-500/50 uppercase tracking-widest font-bold">
                                Premium Real Estate Experience by ABS Developers
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
