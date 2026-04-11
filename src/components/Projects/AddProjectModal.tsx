import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    PlusIcon,
    PhotoIcon,
    MapPinIcon,
    DocumentTextIcon,
    SparklesIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    TableCellsIcon,
    ArrowUpTrayIcon,
    CheckCircleIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { ImageUpload } from '@/components/Images/ImageUpload';
import { useCreateProperty, useUploadInventory, useUploadBlueprint } from '@/hooks/queries/useAdminQueries';
import { Property } from '@/types';
import * as XLSX from 'xlsx';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newProject: Property) => void;
}

const STEPS = ['Basic Details', 'Inventory & Blueprint', 'Review & Confirm'];

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const createPropertyMutation = useCreateProperty();
    const uploadInventoryMutation = useUploadInventory();
    const uploadBlueprintMutation = useUploadBlueprint();
    const loading = createPropertyMutation.isPending || uploadInventoryMutation.isPending || uploadBlueprintMutation.isPending;

    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<Partial<Property>>({
        name: '',
        type: 'Luxury Residential',
        location: '',
        description: '',
        amenities: [],
        images: [],
        status: 'pending',
    });

    // Inventory state
    const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
    const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
    const [priceColumnKey, setPriceColumnKey] = useState<string | null>(null);
    const [statusColumnKey, setStatusColumnKey] = useState<string | null>(null);
    const [inventoryFileName, setInventoryFileName] = useState('');
    const [inventoryFile, setInventoryFile] = useState<File | null>(null);
    const inventoryFileRef = useRef<HTMLInputElement>(null);

    // Blueprint state
    const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
    const [blueprintPreview, setBlueprintPreview] = useState<string | null>(null);
    const blueprintFileRef = useRef<HTMLInputElement>(null);

    // Amenities
    const [amenityInput, setAmenityInput] = useState('');

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

    // Excel/CSV parsing
    const handleInventoryUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setInventoryFileName(file.name);
        setInventoryFile(file);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

            if (jsonData.length === 0) return;

            // Extract headers from first row keys
            const headers = Object.keys(jsonData[0]);
            setParsedHeaders(headers);

            // Convert all values to strings
            const rows = jsonData.map(row => {
                const stringRow: Record<string, string> = {};
                for (const key of headers) {
                    stringRow[key] = String(row[key] ?? '');
                }
                return stringRow;
            });
            setParsedRows(rows);

            // Auto-detect price column
            const priceHeader = headers.find(h =>
                /price|rate|cost|amount/i.test(h)
            );
            if (priceHeader) setPriceColumnKey(priceHeader);

            // Auto-detect status column
            const statusHeader = headers.find(h =>
                /status/i.test(h)
            );
            if (statusHeader) setStatusColumnKey(statusHeader);
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const handleBlueprintUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBlueprintFile(file);
        const url = URL.createObjectURL(file);
        setBlueprintPreview(url);
    }, []);

    const canProceedStep = (s: number) => {
        if (s === 0) return !!(formData.name && formData.location);
        if (s === 1) return parsedRows.length > 0;
        return true;
    };

    const resetForm = () => {
        setStep(0);
        setFormData({
            name: '', type: 'Luxury Residential', location: '', description: '',
            amenities: [], images: [], status: 'pending',
        });
        setParsedHeaders([]);
        setParsedRows([]);
        setPriceColumnKey(null);
        setStatusColumnKey(null);
        setInventoryFileName('');
        setInventoryFile(null);
        setBlueprintFile(null);
        setBlueprintPreview(null);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.location) return;

        try {
            // 1. Create the property with inventory metadata
            const propertyData: Partial<Property> = {
                ...formData,
                inventoryHeaders: parsedHeaders,
                priceColumnKey: priceColumnKey,
            };
            const newProject = await createPropertyMutation.mutateAsync(propertyData);
            const projectId = newProject.id;

            // 2. Upload blueprint if provided
            if (blueprintFile && projectId) {
                const blueprintUrl = await uploadBlueprintMutation.mutateAsync({ projectId, file: blueprintFile });
                // Update property with blueprint URL
                const { adminAPI } = await import('@/services/api');
                await adminAPI.updateProperty(projectId, { blueprintUrl } as any);
            }

            // 2b. Upload raw inventory file if provided
            if (inventoryFile && projectId) {
                const { inventoryAPI: invAPI } = await import('@/services/api');
                const inventoryFileUrl = await invAPI.uploadInventoryFile(projectId, inventoryFile);
                const { adminAPI } = await import('@/services/api');
                await adminAPI.updateProperty(projectId, { inventoryFileUrl } as any);
            }

            // 3. Upload inventory rows
            if (parsedRows.length > 0 && projectId) {
                await uploadInventoryMutation.mutateAsync({
                    projectId,
                    rows: parsedRows,
                    statusKey: statusColumnKey || undefined,
                });
            }

            onSuccess(newProject);
            onClose();
            resetForm();
        } catch (error) {
            console.error('Failed to create project:', error);
            alert('Failed to create project. Please check console for details.');
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
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        Add New <span className="text-gold-400">Project</span>
                                    </h2>
                                    <p className="text-gray-400 text-sm italic">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
                                </div>
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-gold-500/10 text-gray-400 hover:text-gold-400 transition-all">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            {/* Step indicator */}
                            <div className="flex gap-2">
                                {STEPS.map((s, i) => (
                                    <div key={s} className="flex-1 flex items-center gap-2">
                                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-gold-400' : 'bg-gray-700'}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {/* STEP 1: Basic Details */}
                            {step === 0 && (
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
                                </div>
                            )}

                            {/* STEP 2: Inventory & Blueprint Upload */}
                            {step === 1 && (
                                <div className="space-y-8 text-white">
                                    {/* Excel/CSV Upload */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <TableCellsIcon className="h-5 w-5 text-gold-400" />
                                            Inventory File <span className="text-sm text-red-400">*</span>
                                        </h3>
                                        <p className="text-sm text-gray-400">Upload an Excel (.xlsx) or CSV file containing unit/inventory data. Headers will be auto-detected.</p>

                                        <input ref={inventoryFileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleInventoryUpload} className="hidden" />
                                        <button
                                            type="button"
                                            onClick={() => inventoryFileRef.current?.click()}
                                            className="w-full border-2 border-dashed border-gold-500/30 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-gold-400 hover:bg-gold-500/5 transition-all"
                                        >
                                            <ArrowUpTrayIcon className="h-10 w-10 text-gold-400" />
                                            <span className="text-gold-400 font-medium">{inventoryFileName || 'Click to upload Excel/CSV'}</span>
                                            <span className="text-xs text-gray-500">Supported: .xlsx, .xls, .csv</span>
                                        </button>

                                        {/* Parsed preview */}
                                        {parsedRows.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-green-400">
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                    <span className="text-sm font-medium">{parsedRows.length} rows parsed with {parsedHeaders.length} columns</span>
                                                </div>

                                                {/* Price column selector */}
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className={labelClass}>Price Column</label>
                                                        <CustomDropdown
                                                            value={priceColumnKey || ''}
                                                            onChange={(v) => setPriceColumnKey(v || null)}
                                                            options={[
                                                                { label: '— None —', value: '' },
                                                                ...parsedHeaders.map(h => ({ label: h, value: h }))
                                                            ]}
                                                            placeholder="Select price column"
                                                        />
                                                        <p className="text-xs text-gray-500">Which column contains the unit price?</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className={labelClass}>Status Column</label>
                                                        <CustomDropdown
                                                            value={statusColumnKey || ''}
                                                            onChange={(v) => setStatusColumnKey(v || null)}
                                                            options={[
                                                                { label: '— None (all available) —', value: '' },
                                                                ...parsedHeaders.map(h => ({ label: h, value: h }))
                                                            ]}
                                                            placeholder="Select status column"
                                                        />
                                                        <p className="text-xs text-gray-500">Which column indicates availability?</p>
                                                    </div>
                                                </div>

                                                {/* Preview table */}
                                                <div className="border border-gold-500/10 rounded-xl overflow-hidden">
                                                    <div className="overflow-x-auto max-h-60">
                                                        <table className="w-full text-xs">
                                                            <thead className="bg-gold-500/10 sticky top-0">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left text-gold-400 font-bold">#</th>
                                                                    {parsedHeaders.map(h => (
                                                                        <th key={h} className="px-3 py-2 text-left text-gold-400 font-bold whitespace-nowrap">{h}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {parsedRows.slice(0, 10).map((row, i) => (
                                                                    <tr key={i} className="border-t border-gold-500/5 hover:bg-gold-500/5">
                                                                        <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                                                                        {parsedHeaders.map(h => (
                                                                            <td key={h} className="px-3 py-2 whitespace-nowrap">{row[h]}</td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {parsedRows.length > 10 && (
                                                        <div className="px-3 py-2 text-xs text-gray-500 bg-[#141414] border-t border-gold-500/5">
                                                            ... and {parsedRows.length - 10} more rows
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Blueprint Upload */}
                                    <div className="space-y-4 border-t border-gold-500/10 pt-6">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <PhotoIcon className="h-5 w-5 text-gold-400" />
                                            Blueprint / Floor Plan
                                        </h3>
                                        <p className="text-sm text-gray-400">Upload an image of the project's floor plan or blueprint (optional).</p>

                                        <input ref={blueprintFileRef} type="file" accept="image/*" onChange={handleBlueprintUpload} className="hidden" />
                                        {!blueprintPreview ? (
                                            <button
                                                type="button"
                                                onClick={() => blueprintFileRef.current?.click()}
                                                className="w-full border-2 border-dashed border-gold-500/30 rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-gold-400 hover:bg-gold-500/5 transition-all"
                                            >
                                                <ArrowUpTrayIcon className="h-8 w-8 text-gold-400" />
                                                <span className="text-gold-400 font-medium">Upload Blueprint Image</span>
                                            </button>
                                        ) : (
                                            <div className="relative">
                                                <img src={blueprintPreview} alt="Blueprint preview" className="w-full max-h-60 object-contain rounded-xl border border-gold-500/10" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setBlueprintFile(null); setBlueprintPreview(null); }}
                                                    className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-500"
                                                >
                                                    <XMarkIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Review & Confirm */}
                            {step === 2 && (
                                <div className="space-y-6 text-white">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <CheckCircleIcon className="h-5 w-5 text-gold-400" />
                                        Review Project Details
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3 p-4 rounded-xl bg-[#141414] border border-gold-500/10">
                                            <h4 className="text-sm font-bold text-gold-400 uppercase">Basic Info</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="text-gray-400">Name:</span> {formData.name}</p>
                                                <p><span className="text-gray-400">Type:</span> {formData.type}</p>
                                                <p><span className="text-gray-400">Location:</span> {formData.location}</p>
                                                <p><span className="text-gray-400">Status:</span> {formData.status}</p>
                                                {formData.bookingDeadline && <p><span className="text-gray-400">Booking Deadline:</span> {new Date(formData.bookingDeadline).toLocaleDateString()}</p>}
                                                {formData.description && <p><span className="text-gray-400">Description:</span> {formData.description}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-3 p-4 rounded-xl bg-[#141414] border border-gold-500/10">
                                            <h4 className="text-sm font-bold text-gold-400 uppercase">Inventory</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="text-gray-400">File:</span> {inventoryFileName}</p>
                                                <p><span className="text-gray-400">Total Rows:</span> {parsedRows.length}</p>
                                                <p><span className="text-gray-400">Columns:</span> {parsedHeaders.length}</p>
                                                <p><span className="text-gray-400">Price Column:</span> {priceColumnKey || 'Not set'}</p>
                                                <p><span className="text-gray-400">Status Column:</span> {statusColumnKey || 'Not set'}</p>
                                                <p><span className="text-gray-400">Blueprint:</span> {blueprintFile ? blueprintFile.name : 'Not uploaded'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {(formData.amenities?.length || 0) > 0 && (
                                        <div className="p-4 rounded-xl bg-[#141414] border border-gold-500/10">
                                            <h4 className="text-sm font-bold text-gold-400 uppercase mb-2">Amenities</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.amenities?.map((a, i) => (
                                                    <span key={i} className="px-3 py-1 bg-gold-500/10 text-gold-400 rounded-full text-xs border border-gold-500/20">{a}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(formData.images?.length || 0) > 0 && (
                                        <div className="p-4 rounded-xl bg-[#141414] border border-gold-500/10">
                                            <h4 className="text-sm font-bold text-gold-400 uppercase mb-2">Images ({formData.images?.length})</h4>
                                            <div className="flex gap-2 overflow-x-auto">
                                                {formData.images?.map((img, i) => (
                                                    <img key={i} src={img} alt={`Project ${i + 1}`} className="h-16 w-16 rounded-lg object-cover border border-gold-500/10" />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Column headers preview */}
                                    <div className="p-4 rounded-xl bg-[#141414] border border-gold-500/10">
                                        <h4 className="text-sm font-bold text-gold-400 uppercase mb-2">Detected Headers</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {parsedHeaders.map((h, i) => (
                                                <span key={i} className={`px-3 py-1 rounded-full text-xs border ${h === priceColumnKey ? 'bg-green-500/20 text-green-400 border-green-500/30' : h === statusColumnKey ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gold-500/10 text-gold-400 border-gold-500/20'}`}>
                                                    {h} {h === priceColumnKey ? '(Price)' : h === statusColumnKey ? '(Status)' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer navigation */}
                        <div className="p-6 border-t border-gold-500/10 flex gap-4">
                            {step > 0 ? (
                                <Button type="button" onClick={() => setStep(s => s - 1)} variant="outline" className="flex-1 h-12 rounded-xl border-gold-500/20 text-gray-400 hover:bg-gold-500/10 hover:text-gold-400">
                                    <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back
                                </Button>
                            ) : (
                                <Button type="button" onClick={onClose} variant="outline" className="flex-1 h-12 rounded-xl border-gold-500/20 text-gray-400 hover:bg-gold-500/10 hover:text-gold-400">
                                    Cancel
                                </Button>
                            )}

                            {step < STEPS.length - 1 ? (
                                <Button
                                    type="button"
                                    onClick={() => setStep(s => s + 1)}
                                    disabled={!canProceedStep(step)}
                                    className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold hover:shadow-lg hover:shadow-gold-500/20 transition-all disabled:opacity-50"
                                >
                                    Next <ArrowRightIcon className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold hover:shadow-lg hover:shadow-gold-500/20 transition-all"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                            Creating Project...
                                        </div>
                                    ) : (
                                        'Create Project'
                                    )}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
