import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    PlusIcon,
    PhotoIcon,
    CurrencyDollarIcon,
    MapPinIcon,
    DocumentTextIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/services/api';
import { Property } from '@/types';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newProject: Property) => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Property>>({
        name: '',
        type: 'Luxury Residential',
        location: '',
        priceMin: 0,
        priceMax: 0,
        description: '',
        amenities: [],
        images: [],
        status: 'Upcoming'
    });

    const [amenityInput, setAmenityInput] = useState('');
    const [imageInput, setImageInput] = useState('');

    const handleAddAmenity = () => {
        if (amenityInput.trim()) {
            setFormData(prev => ({
                ...prev,
                amenities: [...(prev.amenities || []), amenityInput.trim()]
            }));
            setAmenityInput('');
        }
    };

    const handleRemoveAmenity = (index: number) => {
        setFormData(prev => ({
            ...prev,
            amenities: (prev.amenities || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddImage = () => {
        if (imageInput.trim()) {
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), imageInput.trim()]
            }));
            setImageInput('');
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.location) {
            alert('Please fill in required fields (Name and Location)');
            return;
        }

        setLoading(true);
        try {
            const newProject = await adminAPI.createProperty(formData);
            onSuccess(newProject);
            onClose();
            // Reset form
            setFormData({
                name: '',
                type: 'Luxury Residential',
                location: '',
                priceMin: 0,
                priceMax: 0,
                description: '',
                amenities: [],
                images: [],
                status: 'Upcoming'
            });
        } catch (error) {
            console.error('Failed to create project:', error);
            alert('Failed to add project. Please check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-[#0a0a0a] rounded-3xl border border-gold-500/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gold-500/10 flex justify-between items-center bg-gradient-to-r from-gold-500/10 to-transparent">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    Add New <span className="text-gold-400">Project</span>
                                </h2>
                                <p className="text-gray-400 text-sm italic">Expand your portfolio with visionary properties</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gold-500/10 text-gray-400 hover:text-gold-400 transition-all"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
                            <div className="grid md:grid-cols-2 gap-8 text-white">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-bold text-gold-400 flex items-center gap-2">
                                            <SparklesIcon className="h-4 w-4" />
                                            Project Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[#141414] border border-gold-500/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors"
                                            placeholder="e.g., Zenith Heights"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest font-bold text-gold-400 flex items-center gap-2">
                                                Property Type
                                            </label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full bg-[#141414] border border-gold-500/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors appearance-none"
                                            >
                                                <option>Luxury Residential</option>
                                                <option>Commercial Plaza</option>
                                                <option>Modern Villa</option>
                                                <option>Corporate Office</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest font-bold text-gold-400 flex items-center gap-2">
                                                Status
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full bg-[#141414] border border-gold-500/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors appearance-none"
                                            >
                                                <option>Upcoming</option>
                                                <option>Under Construction</option>
                                                <option>Ready to Move</option>
                                                <option>Sold Out</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-bold text-gold-400 flex items-center gap-2">
                                            <MapPinIcon className="h-4 w-4" />
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-[#141414] border border-gold-500/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors"
                                            placeholder="e.g., DHA Phase 6, Lahore"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest font-bold text-gold-400 flex items-center gap-2">
                                                <CurrencyDollarIcon className="h-4 w-4" />
                                                Min Price
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.priceMin}
                                                onChange={(e) => setFormData({ ...formData, priceMin: parseInt(e.target.value) })}
                                                className="w-full bg-[#141414] border border-gold-500/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-widest font-bold text-gold-400 flex items-center gap-2">
                                                Max Price
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.priceMax}
                                                onChange={(e) => setFormData({ ...formData, priceMax: parseInt(e.target.value) })}
                                                className="w-full bg-[#141414] border border-gold-500/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Info */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-bold text-gold-400 flex items-center gap-2">
                                            <DocumentTextIcon className="h-4 w-4" />
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-[#141414] border border-gold-500/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors h-32 resize-none"
                                            placeholder="Describe the project's vision and features..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-bold text-gold-400 flex items-center gap-2">
                                            Amenities
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={amenityInput}
                                                onChange={(e) => setAmenityInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                                                className="flex-1 bg-[#141414] border border-gold-500/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors"
                                                placeholder="e.g., Rooftop Pool"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddAmenity}
                                                className="bg-gold-500/10 text-gold-500 hover:bg-gold-500/20"
                                            >
                                                <PlusIcon className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.amenities?.map((amenity, index) => (
                                                <span key={index} className="px-3 py-1 bg-gold-500/10 text-gold-400 rounded-full text-xs flex items-center gap-2 border border-gold-500/20">
                                                    {amenity}
                                                    <button type="button" onClick={() => handleRemoveAmenity(index)} className="hover:text-white">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-bold text-gold-400 flex items-center gap-2">
                                            <PhotoIcon className="h-4 w-4" />
                                            Image URLs
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={imageInput}
                                                onChange={(e) => setImageInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                                                className="flex-1 bg-[#141414] border border-gold-500/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors"
                                                placeholder="https://..."
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddImage}
                                                className="bg-gold-500/10 text-gold-500 hover:bg-gold-500/20"
                                            >
                                                <PlusIcon className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                            {formData.images?.map((url, index) => (
                                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gold-500/20">
                                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xl"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gold-500/10 flex gap-4">
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 py-6 rounded-2xl border-gold-500/20 text-gray-400 hover:bg-gold-500/10 hover:text-gold-400 h-14"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-6 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold h-14 hover:shadow-lg hover:shadow-gold-500/20 transition-all"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        'Create Visionary Project'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
