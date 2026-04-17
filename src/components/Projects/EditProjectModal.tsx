import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    PlusIcon,
    PhotoIcon,
    MapPinIcon,
    DocumentTextIcon,
    SparklesIcon,
    CalendarIcon,
    TableCellsIcon,
    CheckIcon,
    PencilSquareIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { ImageUpload } from '@/components/Images/ImageUpload';
import { useUpdateProperty, useUpdateInventoryRow } from '@/hooks/queries/useAdminQueries';
import { useProjectInventory } from '@/hooks/queries/useCommonQueries';
import { Property, InventoryItem } from '@/types';

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Property | null;
    onSuccess: (updatedProject: Property) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, project, onSuccess }) => {
    const updatePropertyMutation = useUpdateProperty();
    const updateInventoryRowMutation = useUpdateInventoryRow();
    const loading = updatePropertyMutation.isPending;
    const { data: inventory = [], isLoading: inventoryLoading } = useProjectInventory(project?.id);
    const headers = project?.inventoryHeaders || [];

    const [formData, setFormData] = useState<Partial<Property>>({
        name: '',
        type: 'Luxury Residential',
        location: '',
        description: '',
        amenities: [],
        images: [],
        status: 'pending',
    });

    const [amenityInput, setAmenityInput] = useState('');

    // Inventory editing state
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editRowData, setEditRowData] = useState<Record<string, string>>({});
    const [editRowStatus, setEditRowStatus] = useState<string>('available');

    const handleEditRow = useCallback((item: InventoryItem) => {
        setEditingRowId(item.id);
        setEditRowData({ ...item.rowData });
        setEditRowStatus(item.status);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingRowId(null);
        setEditRowData({});
        setEditRowStatus('available');
    }, []);

    const handleSaveRow = useCallback(async () => {
        if (!editingRowId || !project?.id) return;
        try {
            await updateInventoryRowMutation.mutateAsync({
                itemId: editingRowId,
                rowData: editRowData,
                status: editRowStatus,
                projectId: project.id,
            });
            setEditingRowId(null);
        } catch (error) {
            console.error('Failed to update inventory row:', error);
        }
    }, [editingRowId, editRowData, editRowStatus, project?.id, updateInventoryRowMutation]);

    // Initialize form data when project changes
    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                type: project.type || 'Luxury Residential',
                location: project.location || '',
                description: project.description || '',
                amenities: project.amenities || [],
                images: project.images || [],
                status: project.status || 'pending',
                bookingDeadline: project.bookingDeadline || undefined,
            });
        }
    }, [project, isOpen]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.location || !project?.id) {
            alert('Please fill in required fields (Name and Location)');
            return;
        }

        try {
            const updatedProject = await updatePropertyMutation.mutateAsync({
                id: project.id,
                data: formData
            });
            onSuccess(updatedProject);
            onClose();
        } catch (error) {
            console.error('Failed to update project:', error);
            alert('Failed to update project. Please check console for details.');
        }
    };

    const inputClass = "w-full bg-[#141414] border border-gold-500/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors";
    const labelClass = "text-xs uppercase tracking-widest font-bold text-gold-400 flex items-center gap-2";

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
                        <div className="p-6 border-b border-gold-500/10 bg-gradient-to-r from-gold-500/10 to-transparent">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        Edit <span className="text-gold-400">Project</span>
                                    </h2>
                                    <p className="text-gray-400 text-sm italic">Update project details and management information</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gold-500/10 text-gray-400 hover:text-gold-400 transition-all"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="space-y-6 text-white">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClass}><SparklesIcon className="h-4 w-4" /> Project Name *</label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="e.g., Zenith Heights" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}><MapPinIcon className="h-4 w-4" /> Location *</label>
                                        <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputClass} placeholder="e.g., DHA Phase 6, Lahore" />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Property Type</label>
                                        <CustomDropdown
                                            value={formData.type || 'Luxury Residential'}
                                            onChange={(value) => setFormData({ ...formData, type: value })}
                                            options={[
                                                { label: 'Luxury Residential', value: 'Luxury Residential' },
                                                { label: 'Commercial Plaza', value: 'Commercial Plaza' },
                                                { label: 'Modern Villa', value: 'Modern Villa' },
                                                { label: 'Corporate Office', value: 'Corporate Office' }
                                            ]}
                                            placeholder="Select property type"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Status</label>
                                        <CustomDropdown
                                            value={formData.status || 'pending'}
                                            onChange={(value) => setFormData({ ...formData, status: value })}
                                            options={[
                                                { label: 'Pending', value: 'pending' },
                                                { label: 'Approved', value: 'approved' },
                                                { label: 'Under Construction', value: 'construction' },
                                                { label: 'Completed', value: 'completed' }
                                            ]}
                                            placeholder="Select status"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClass}><DocumentTextIcon className="h-4 w-4" /> Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClass} h-28 resize-none`} placeholder="Describe the project's vision and features..." />
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClass}><CalendarIcon className="h-4 w-4" /> Booking Deadline</label>
                                    <input type="date" value={formData.bookingDeadline ? new Date(formData.bookingDeadline).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({ ...formData, bookingDeadline: e.target.value ? new Date(e.target.value) : undefined })} className={inputClass} />
                                </div>

                                {/* Amenities */}
                                <div className="space-y-2">
                                    <label className={labelClass}>Amenities</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())} className={`flex-1 ${inputClass}`} placeholder="e.g., Rooftop Pool" />
                                        <Button type="button" onClick={handleAddAmenity} className="bg-gradient-to-r from-gold-500 to-gold-400 text-black"><PlusIcon className="h-5 w-5" /></Button>
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

                                {/* Images */}
                                <div className="space-y-3">
                                    <label className={labelClass}><PhotoIcon className="h-4 w-4" /> Project Images</label>
                                    <ImageUpload
                                        maxFiles={10}
                                        onImagesUpload={(urls) => setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }))}
                                        existingImages={formData.images || []}
                                        onRemoveExisting={(index) => setFormData(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== index) }))}
                                        folder="projects"
                                    />
                                </div>

                                {/* Inventory / Units Table */}
                                {headers.length > 0 && (
                                    <div className="space-y-3">
                                        <label className={labelClass}>
                                            <TableCellsIcon className="h-4 w-4" /> Inventory / Units
                                            <span className="text-gray-500 text-[10px] font-normal ml-2">
                                                ({inventory.length} {inventory.length === 1 ? 'row' : 'rows'})
                                            </span>
                                        </label>

                                        {inventoryLoading ? (
                                            <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
                                                <div className="h-4 w-4 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mr-2" />
                                                Loading inventory...
                                            </div>
                                        ) : inventory.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gold-500/10 rounded-xl">
                                                No inventory data uploaded for this project.
                                            </div>
                                        ) : (
                                            <div className="border border-gold-500/10 rounded-xl overflow-hidden">
                                                <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                                                    <table className="w-full text-sm">
                                                        <thead className="sticky top-0 z-10">
                                                            <tr className="bg-[#1a1a1a] border-b border-gold-500/10">
                                                                {headers.map((header) => (
                                                                    <th key={header} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-widest font-bold text-gold-400 whitespace-nowrap">
                                                                        {header}
                                                                    </th>
                                                                ))}
                                                                <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-widest font-bold text-gold-400 whitespace-nowrap">Status</th>
                                                                <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-widest font-bold text-gold-400 whitespace-nowrap w-24">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {inventory.map((item: InventoryItem, idx: number) => {
                                                                const isEditing = editingRowId === item.id;
                                                                return (
                                                                    <tr
                                                                        key={item.id}
                                                                        className={`border-b border-gold-500/5 transition-colors ${
                                                                            isEditing ? 'bg-gold-500/5' : idx % 2 === 0 ? 'bg-[#0f0f0f]' : 'bg-[#141414]'
                                                                        } hover:bg-gold-500/5`}
                                                                    >
                                                                        {headers.map((header) => (
                                                                            <td key={header} className="px-3 py-2">
                                                                                {isEditing ? (
                                                                                    <input
                                                                                        type="text"
                                                                                        value={editRowData[header] || ''}
                                                                                        onChange={(e) => setEditRowData(prev => ({ ...prev, [header]: e.target.value }))}
                                                                                        className="w-full min-w-[80px] bg-[#0a0a0a] border border-gold-500/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-gold-500/50 transition-colors"
                                                                                    />
                                                                                ) : (
                                                                                    <span className="text-gray-300 text-xs whitespace-nowrap">{item.rowData[header] || '—'}</span>
                                                                                )}
                                                                            </td>
                                                                        ))}
                                                                        <td className="px-3 py-2">
                                                                            {isEditing ? (
                                                                                <select
                                                                                    value={editRowStatus}
                                                                                    onChange={(e) => setEditRowStatus(e.target.value)}
                                                                                    className="bg-[#0a0a0a] border border-gold-500/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-gold-500/50"
                                                                                >
                                                                                    <option value="available">Available</option>
                                                                                    <option value="sold">Sold</option>
                                                                                    <option value="reserved">Reserved</option>
                                                                                    <option value="booked">Booked</option>
                                                                                </select>
                                                                            ) : (
                                                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                                                    item.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                                    item.status === 'sold' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                                                    item.status === 'reserved' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                                                }`}>
                                                                                    {item.status}
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center">
                                                                            {isEditing ? (
                                                                                <div className="flex items-center justify-center gap-1">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={handleSaveRow}
                                                                                        disabled={updateInventoryRowMutation.isPending}
                                                                                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                                                                        title="Save"
                                                                                    >
                                                                                        {updateInventoryRowMutation.isPending ? (
                                                                                            <div className="h-3.5 w-3.5 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin" />
                                                                                        ) : (
                                                                                            <CheckIcon className="h-3.5 w-3.5" />
                                                                                        )}
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={handleCancelEdit}
                                                                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                                                        title="Cancel"
                                                                                    >
                                                                                        <XCircleIcon className="h-3.5 w-3.5" />
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleEditRow(item)}
                                                                                    className="p-1.5 rounded-lg bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-colors"
                                                                                    title="Edit row"
                                                                                >
                                                                                    <PencilSquareIcon className="h-3.5 w-3.5" />
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-gold-500/10 flex gap-4">
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-gold-500/20 text-gray-400 hover:bg-gold-500/10 hover:text-gold-400"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold hover:shadow-lg hover:shadow-gold-500/20 transition-all"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                            Updating...
                                        </div>
                                    ) : (
                                        'Update Project'
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
