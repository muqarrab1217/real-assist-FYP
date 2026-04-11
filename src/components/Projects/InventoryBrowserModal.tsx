import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    TableCellsIcon,
    PhotoIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    ArrowLeftIcon,
    BuildingOffice2Icon,
    HomeModernIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Property, InventoryItem } from '@/types';
import { useProjectInventory } from '@/hooks/queries/useCommonQueries';
import { PaymentPlanModal } from './PaymentPlanModal';

interface InventoryBrowserModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Property | null;
}

type TabType = 'blueprint' | 'inventory';
type Step = 'floor' | 'type' | 'units';

export const InventoryBrowserModal: React.FC<InventoryBrowserModalProps> = ({ isOpen, onClose, project }) => {
    const [activeTab, setActiveTab] = useState<TabType>('inventory');
    const [selectedUnit, setSelectedUnit] = useState<InventoryItem | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Guided step state
    const [step, setStep] = useState<Step>('floor');
    const [selectedFloor, setSelectedFloor] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');

    const { data: inventory = [], isLoading } = useProjectInventory(project?.id);

    const headers = project?.inventoryHeaders || [];
    // Use first header as floor key, third header as type key
    const floorKey = headers[0] || '';
    const typeKey = headers[2] || '';
    const priceKey = project?.priceColumnKey || '';

    const availableItems = useMemo(() => inventory.filter(item => item.status === 'available'), [inventory]);

    // Floor grouping
    const floors = useMemo(() => {
        if (!floorKey) return [];
        const map = new Map<string, number>();
        for (const item of availableItems) {
            const floor = item.rowData[floorKey] || 'Unknown';
            map.set(floor, (map.get(floor) || 0) + 1);
        }
        return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
    }, [availableItems, floorKey]);

    // Type grouping (filtered by selected floor)
    const types = useMemo(() => {
        if (!typeKey || !selectedFloor) return [];
        const floorItems = availableItems.filter(item => item.rowData[floorKey] === selectedFloor);
        const map = new Map<string, { count: number; minPrice: number }>();
        for (const item of floorItems) {
            const type = item.rowData[typeKey] || 'Unknown';
            const price = priceKey ? parseFloat(String(item.rowData[priceKey]).replace(/[^0-9.]/g, '')) || 0 : 0;
            const existing = map.get(type);
            if (existing) {
                existing.count++;
                if (price > 0 && price < existing.minPrice) existing.minPrice = price;
            } else {
                map.set(type, { count: 1, minPrice: price || Infinity });
            }
        }
        return Array.from(map.entries()).map(([name, data]) => ({
            name,
            count: data.count,
            minPrice: data.minPrice === Infinity ? 0 : data.minPrice,
        }));
    }, [availableItems, selectedFloor, floorKey, typeKey, priceKey]);

    // Units filtered by floor + type + search
    const filteredUnits = useMemo(() => {
        let items = availableItems;
        if (selectedFloor) items = items.filter(item => item.rowData[floorKey] === selectedFloor);
        if (selectedType) items = items.filter(item => item.rowData[typeKey] === selectedType);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter(item =>
                Object.values(item.rowData).some(v => String(v).toLowerCase().includes(q))
            );
        }
        return items;
    }, [availableItems, selectedFloor, selectedType, searchQuery, floorKey, typeKey]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);

    const handleSelectUnit = (item: InventoryItem) => {
        setSelectedUnit(item);
    };

    const handleFloorSelect = (floor: string) => {
        setSelectedFloor(floor);
        setSelectedType('');
        setSelectedUnit(null);
        setStep('type');
    };

    const handleTypeSelect = (type: string) => {
        setSelectedType(type);
        setSelectedUnit(null);
        setStep('units');
    };

    const handleStepBack = () => {
        if (step === 'units') {
            setSelectedType('');
            setSelectedUnit(null);
            setSearchQuery('');
            setStep('type');
        } else if (step === 'type') {
            setSelectedFloor('');
            setSelectedUnit(null);
            setStep('floor');
        }
    };

    const handleProceedToPayment = () => {
        if (selectedUnit && project) {
            setIsPaymentModalOpen(true);
        }
    };

    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        setSelectedUnit(null);
        setStep('floor');
        setSelectedFloor('');
        setSelectedType('');
        onClose();
    };

    const totalAvailable = availableItems.length;
    const totalSold = inventory.filter(i => i.status !== 'available').length;

    if (!project) return null;

    const portalTarget = document.getElementById('portal-root') || document.body;

    return createPortal(
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-6xl bg-[#0a0a0a] rounded-3xl border border-gold-500/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gold-500/10 bg-gradient-to-r from-gold-500/10 to-transparent">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                            {project.name}
                                        </h2>
                                        <p className="text-gray-400 text-sm mt-1">{project.location} — {totalAvailable} units available, {totalSold} sold/reserved</p>
                                    </div>
                                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gold-500/10 text-gray-400 hover:text-gold-400 transition-all">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-1 mt-4 bg-[#141414] rounded-xl p-1">
                                    <button
                                        onClick={() => setActiveTab('blueprint')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'blueprint' ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <PhotoIcon className="h-4 w-4" /> Blueprint
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('inventory')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'inventory' ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <TableCellsIcon className="h-4 w-4" /> Inventory
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Blueprint Tab */}
                                {activeTab === 'blueprint' && (
                                    <div className="flex items-center justify-center min-h-[400px]">
                                        {project.blueprintUrl ? (
                                            <img
                                                src={project.blueprintUrl}
                                                alt={`${project.name} Blueprint`}
                                                className="max-w-full max-h-[60vh] object-contain rounded-xl border border-gold-500/10"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-500">
                                                <PhotoIcon className="h-16 w-16 mx-auto mb-3 opacity-30" />
                                                <p className="text-lg">No blueprint uploaded yet</p>
                                                <p className="text-sm">The admin has not uploaded a floor plan for this project.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Inventory Tab */}
                                {activeTab === 'inventory' && (
                                    <div className="space-y-4">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center py-16">
                                                <div className="h-8 w-8 border-2 border-gold-500/30 border-t-gold-400 rounded-full animate-spin" />
                                            </div>
                                        ) : (
                                            <>
                                                {/* Breadcrumb */}
                                                {step !== 'floor' && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <button onClick={() => { setStep('floor'); setSelectedFloor(''); setSelectedType(''); setSelectedUnit(null); }} className="text-gold-400 hover:text-gold-300 transition-colors">
                                                            All Floors
                                                        </button>
                                                        {selectedFloor && (
                                                            <>
                                                                <ChevronRightIcon className="h-3 w-3 text-gray-600" />
                                                                <button onClick={() => { setStep('type'); setSelectedType(''); setSelectedUnit(null); }} className={`transition-colors ${step === 'type' ? 'text-white' : 'text-gold-400 hover:text-gold-300'}`}>
                                                                    {selectedFloor}
                                                                </button>
                                                            </>
                                                        )}
                                                        {selectedType && (
                                                            <>
                                                                <ChevronRightIcon className="h-3 w-3 text-gray-600" />
                                                                <span className="text-white">{selectedType}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Step 1: Choose Floor */}
                                                {step === 'floor' && (
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                            Select a Floor
                                                        </h3>
                                                        {floors.length === 0 ? (
                                                            <div className="text-center py-16 text-gray-500">
                                                                <BuildingOffice2Icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                                                <p>No available units found</p>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                                {floors.map(floor => (
                                                                    <motion.button
                                                                        key={floor.name}
                                                                        whileHover={{ scale: 1.03 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleFloorSelect(floor.name)}
                                                                        className="p-5 rounded-2xl border border-gold-500/10 bg-[#141414] hover:border-gold-400/50 hover:bg-gold-500/5 transition-all text-left group"
                                                                    >
                                                                        <BuildingOffice2Icon className="h-8 w-8 text-gold-400/60 group-hover:text-gold-400 transition-colors mb-3" />
                                                                        <p className="text-white font-bold text-lg">{floor.name} Floor</p>
                                                                        <p className="text-gray-500 text-sm mt-1">{floor.count} unit{floor.count !== 1 ? 's' : ''} available</p>
                                                                    </motion.button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Step 2: Choose Type */}
                                                {step === 'type' && (
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <button onClick={handleStepBack} className="p-1.5 rounded-lg hover:bg-gold-500/10 text-gray-400 hover:text-gold-400 transition-all">
                                                                <ArrowLeftIcon className="h-5 w-5" />
                                                            </button>
                                                            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                                {selectedFloor} Floor — Choose Unit Type
                                                            </h3>
                                                        </div>
                                                        {types.length === 0 ? (
                                                            <div className="text-center py-16 text-gray-500">
                                                                <HomeModernIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                                                <p>No unit types on this floor</p>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {types.map(type => (
                                                                    <motion.button
                                                                        key={type.name}
                                                                        whileHover={{ scale: 1.03 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleTypeSelect(type.name)}
                                                                        className="p-5 rounded-2xl border border-gold-500/10 bg-[#141414] hover:border-gold-400/50 hover:bg-gold-500/5 transition-all text-left group"
                                                                    >
                                                                        <HomeModernIcon className="h-8 w-8 text-gold-400/60 group-hover:text-gold-400 transition-colors mb-3" />
                                                                        <p className="text-white font-bold text-lg">{type.name}</p>
                                                                        <p className="text-gray-500 text-sm mt-1">{type.count} available</p>
                                                                        {type.minPrice > 0 && (
                                                                            <p className="text-gold-400 text-sm font-medium mt-1">From {formatCurrency(type.minPrice)}</p>
                                                                        )}
                                                                    </motion.button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Step 3: Browse Units */}
                                                {step === 'units' && (
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <button onClick={handleStepBack} className="p-1.5 rounded-lg hover:bg-gold-500/10 text-gray-400 hover:text-gold-400 transition-all">
                                                                <ArrowLeftIcon className="h-5 w-5" />
                                                            </button>
                                                            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                                {selectedFloor} Floor — {selectedType}
                                                            </h3>
                                                        </div>

                                                        {/* Search */}
                                                        <div className="relative mb-4">
                                                            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                            <input
                                                                type="text"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                className="w-full bg-[#141414] border border-gold-500/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500/50"
                                                                placeholder="Search units..."
                                                            />
                                                        </div>

                                                        {filteredUnits.length === 0 ? (
                                                            <div className="text-center py-16 text-gray-500">
                                                                <TableCellsIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                                                <p>No matching units found</p>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {filteredUnits.map(item => {
                                                                    const isSelected = selectedUnit?.id === item.id;
                                                                    const unitNum = headers[1] ? item.rowData[headers[1]] : '';
                                                                    const area = headers[3] ? item.rowData[headers[3]] : '';
                                                                    const category = headers[4] ? item.rowData[headers[4]] : '';
                                                                    const price = priceKey ? parseFloat(String(item.rowData[priceKey]).replace(/[^0-9.]/g, '')) || 0 : 0;

                                                                    return (
                                                                        <motion.div
                                                                            key={item.id}
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                            onClick={() => handleSelectUnit(item)}
                                                                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'border-gold-400 bg-gold-500/15 ring-1 ring-gold-400/40' : 'border-gold-500/10 bg-[#141414] hover:border-gold-400/30 hover:bg-gold-500/5'}`}
                                                                        >
                                                                            <div className="flex items-center justify-between mb-3">
                                                                                <span className="text-white font-bold text-base">
                                                                                    Unit {unitNum || '—'}
                                                                                </span>
                                                                                {isSelected && (
                                                                                    <span className="text-xs bg-gold-400 text-black px-2 py-0.5 rounded-full font-bold">Selected</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                                                                {area && (
                                                                                    <div><span className="text-gray-500">Area: </span><span className="text-white">{area} sq.ft</span></div>
                                                                                )}
                                                                                {category && (
                                                                                    <div><span className="text-gray-500">Category: </span><span className="text-white">{category}</span></div>
                                                                                )}
                                                                            </div>
                                                                            {price > 0 && (
                                                                                <p className="text-gold-400 font-bold mt-3 text-lg">{formatCurrency(price)}</p>
                                                                            )}
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer — Selected unit + proceed */}
                            {selectedUnit && step === 'units' && (
                                <div className="p-4 border-t border-gold-500/10 bg-[#0f0f0f] flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-400">Selected Unit:</p>
                                        <p className="text-white font-medium truncate">
                                            {headers.slice(0, 3).map(h => selectedUnit.rowData[h]).filter(Boolean).join(' — ')}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleProceedToPayment}
                                        className="bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold px-6 h-11 rounded-xl hover:shadow-lg hover:shadow-gold-500/20 transition-all shrink-0"
                                    >
                                        Proceed to Payment Plan
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payment Plan Modal (stacked) */}
            <PaymentPlanModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                project={project}
                selectedUnit={selectedUnit}
                onSuccess={handlePaymentSuccess}
            />
        </>,
        portalTarget
    );
};
