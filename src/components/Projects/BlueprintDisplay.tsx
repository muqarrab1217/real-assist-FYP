import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

type RoomStatus = 'vacant' | 'occupied' | 'maintenance';
type FlatType = 'economy' | 'premium' | 'penthouse';

interface RoomData {
  id: string;
  status: RoomStatus;
  area?: string;
  floor?: string;
  price?: string;
  tenant?: string;
  flatType: FlatType;
}

interface BlueprintDisplayProps {
  projectId: string;
  useSvgBlueprint?: boolean;
  project?: any;
  activeTab?: FlatType;
  showTabs?: boolean;
}

// Mock data for room statuses (in production, this would come from API)
const mockRoomData: Record<string, RoomData[]> = {
  economy: [
    { id: '101', status: 'occupied', area: '500 sq ft', floor: '1st', price: 'PKR 50 Lakh', flatType: 'economy' },
    { id: '102', status: 'vacant', area: '500 sq ft', floor: '1st', price: 'PKR 50 Lakh', flatType: 'economy' },
    { id: '103', status: 'maintenance', area: '520 sq ft', floor: '1st', price: 'PKR 52 Lakh', flatType: 'economy' },
    { id: '201', status: 'occupied', area: '500 sq ft', floor: '2nd', price: 'PKR 50 Lakh', flatType: 'economy', tenant: 'Ahmad Khan' },
    { id: '202', status: 'vacant', area: '500 sq ft', floor: '2nd', price: 'PKR 50 Lakh', flatType: 'economy' },
    { id: '203', status: 'occupied', area: '520 sq ft', floor: '2nd', price: 'PKR 52 Lakh', flatType: 'economy', tenant: 'Sarah Ali' },
    { id: '301', status: 'vacant', area: '500 sq ft', floor: '3rd', price: 'PKR 50 Lakh', flatType: 'economy' },
    { id: '302', status: 'vacant', area: '500 sq ft', floor: '3rd', price: 'PKR 50 Lakh', flatType: 'economy' },
    { id: '303', status: 'occupied', area: '520 sq ft', floor: '3rd', price: 'PKR 52 Lakh', flatType: 'economy' },
  ],
  premium: [
    { id: '401', status: 'occupied', area: '800 sq ft', floor: '4th', price: 'PKR 1.2 Cr', flatType: 'premium', tenant: 'Fatima Sheikh' },
    { id: '402', status: 'vacant', area: '850 sq ft', floor: '4th', price: 'PKR 1.3 Cr', flatType: 'premium' },
    { id: '403', status: 'occupied', area: '800 sq ft', floor: '4th', price: 'PKR 1.2 Cr', flatType: 'premium' },
    { id: '501', status: 'vacant', area: '800 sq ft', floor: '5th', price: 'PKR 1.2 Cr', flatType: 'premium' },
    { id: '502', status: 'occupied', area: '850 sq ft', floor: '5th', price: 'PKR 1.3 Cr', flatType: 'premium', tenant: 'Hassan Malik' },
    { id: '503', status: 'maintenance', area: '800 sq ft', floor: '5th', price: 'PKR 1.2 Cr', flatType: 'premium' },
  ],
  penthouse: [
    { id: 'PH1', status: 'occupied', area: '2500 sq ft', floor: 'Top', price: 'PKR 5 Cr', flatType: 'penthouse', tenant: 'Exclusive Client' },
    { id: 'PH2', status: 'vacant', area: '2800 sq ft', floor: 'Top', price: 'PKR 5.5 Cr', flatType: 'penthouse' },
    { id: 'PH3', status: 'occupied', area: '2500 sq ft', floor: 'Top', price: 'PKR 5 Cr', flatType: 'penthouse', tenant: 'VIP Client' },
  ],
};

const statusColors = {
  vacant: '#9ca3af', // Gray
  occupied: '#d4af37', // Gold
  maintenance: '#facc15', // Yellow
};

export const BlueprintDisplay: React.FC<BlueprintDisplayProps> = ({ 
  projectId, 
  activeTab: controlledTab,
  showTabs = true 
}) => {
  const [internalTab, setInternalTab] = useState<FlatType>('economy');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredRoom, setHoveredRoom] = useState<RoomData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Load mock room data
  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true);
      // Using mock data - in production: const response = await fetch(`/api/projects/${projectId}/rooms`);
      await new Promise(resolve => setTimeout(resolve, 800));
      setRooms(mockRoomData[activeTab]);
      setLoading(false);
    };

    fetchRoomData();
  }, [projectId, activeTab]);


  const handleRoomClick = (room: RoomData) => {
    setSelectedRoom(room);
  };

  const handleRoomHover = (room: RoomData, event: React.MouseEvent) => {
    setHoveredRoom(room);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleTabChange = (type: FlatType) => {
    if (controlledTab === undefined) {
      setInternalTab(type);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs - Only show if showTabs is true */}
      {showTabs && (
        <div className="flex gap-3 flex-wrap justify-center">
          {(['economy', 'premium', 'penthouse'] as FlatType[]).map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTabChange(type)}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 capitalize"
              style={
                activeTab === type
                  ? {
                      background: 'linear-gradient(135deg, #d4af37, #f4e5a1)',
                      color: '#0a0a0a',
                      boxShadow: '0 10px 25px rgba(212,175,55,0.4)'
                    }
                  : {
                      background: 'rgba(26,26,26,0.75)',
                      color: 'rgba(156, 163, 175, 0.9)',
                      border: '1px solid rgba(212,175,55,0.25)'
                    }
              }
            >
              {type} Flats
            </motion.button>
          ))}
        </div>
      )}

      {/* Blueprint Container */}
      <div 
        className="rounded-2xl p-8 border backdrop-blur"
        style={{
            background: 'rgba(26,26,26,0.75)',
            borderColor: 'rgba(212,175,55,0.25)'
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Half - Blueprint/Image */}
            <div className="lg:w-1/2">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2 capitalize" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Floor Plan
                </h3>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                  {activeTab} apartments layout
                </p>
              </div>
              <div 
                className="rounded-xl p-6 border sticky top-4"
                style={{
                  background: '#ffffff',
                  borderColor: 'rgba(212,175,55,0.2)'
                }}
              >
                <img 
                  src={
                    activeTab === 'economy' 
                      ? "/blueprints/ECONOMY_FLATS.png"
                      : activeTab === 'premium'
                      ? "/blueprints/PREMIUM_FLATS.png"
                      : "/blueprints/PENTHOUSE.png"
                  }
                  alt={`${activeTab} Floor Plan`}
                  className="w-full h-auto"
                  style={{ background: '#ffffff', minHeight: '500px', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Right Half - Unit List */}
            <div className="lg:w-1/2">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2 capitalize" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Available Units
                </h3>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                  Click on any unit for details
                </p>
              </div>
              <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
                {rooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleRoomClick(room)}
                    onMouseEnter={(e) => handleRoomHover(room, e)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    className="cursor-pointer rounded-lg p-4 border transition-all duration-300"
                    style={{
                      background: `${statusColors[room.status]}15`,
                      borderColor: `${statusColors[room.status]}50`,
                      borderWidth: '2px'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                          style={{
                            background: statusColors[room.status],
                            color: '#0a0a0a'
                          }}
                        >
                          {room.id}
                        </div>
                        <div>
                          <p className="font-semibold text-white">Unit {room.id}</p>
                          <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>{room.floor} Floor</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: statusColors[room.status] }}>
                          {room.status === 'occupied' ? 'SOLD' : room.status === 'vacant' ? 'AVAILABLE' : 'RESERVED'}
                        </p>
                        <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>{room.area}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(212,175,55,0.25)' }}>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: statusColors.vacant }}></div>
              <span className="text-sm text-white">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: statusColors.occupied }}></div>
              <span className="text-sm text-white">Sold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredRoom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="fixed pointer-events-none z-50 rounded-lg p-3 shadow-lg border"
            style={{
              left: tooltipPosition.x + 15,
              top: tooltipPosition.y + 15,
              background: 'rgba(10,10,10,0.95)',
              borderColor: 'rgba(212,175,55,0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <p className="font-semibold text-white text-sm">Unit {hoveredRoom.id}</p>
            <p className="text-xs" style={{ color: statusColors[hoveredRoom.status] }}>
              {hoveredRoom.status === 'occupied' ? 'SOLD' : hoveredRoom.status === 'vacant' ? 'AVAILABLE' : 'RESERVED'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRoom(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-8 max-w-md w-full shadow-2xl border"
              style={{
                background: 'rgba(26,26,26,0.95)',
                borderColor: 'rgba(212,175,55,0.3)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Unit {selectedRoom.id}
                </h3>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Status</span>
                  <span 
                    className="px-4 py-2 rounded-full text-sm font-semibold capitalize"
                    style={{
                      background: `${statusColors[selectedRoom.status]}30`,
                      color: statusColors[selectedRoom.status]
                    }}
                  >
                    {selectedRoom.status === 'occupied' ? 'SOLD' : selectedRoom.status === 'vacant' ? 'AVAILABLE' : 'RESERVED'}
                  </span>
                </div>

                {/* Floor */}
                {selectedRoom.floor && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Floor</span>
                    <span className="text-sm font-semibold text-white">{selectedRoom.floor}</span>
                  </div>
                )}

                {/* Area */}
                {selectedRoom.area && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Area</span>
                    <span className="text-sm font-semibold text-white">{selectedRoom.area}</span>
                  </div>
                )}

                {/* Price */}
                {selectedRoom.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Price</span>
                    <span className="text-sm font-semibold" style={{ color: '#d4af37' }}>{selectedRoom.price}</span>
                  </div>
                )}

                {/* Tenant Info */}
                {selectedRoom.tenant && (
                  <div 
                    className="mt-4 p-4 rounded-lg border"
                    style={{
                      background: 'rgba(212,175,55,0.05)',
                      borderColor: 'rgba(212,175,55,0.2)'
                    }}
                  >
                    <p className="text-xs mb-1" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Tenant</p>
                    <p className="font-semibold text-white">{selectedRoom.tenant}</p>
                  </div>
                )}

                {/* Info Note */}
                <div 
                  className="flex items-start gap-3 p-4 rounded-lg mt-6"
                  style={{
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.3)'
                  }}
                >
                  <InformationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#d4af37' }} />
                  <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                    {selectedRoom.status === 'vacant' 
                      ? 'This unit is available for booking. Contact our sales team for more information.'
                      : selectedRoom.status === 'occupied'
                      ? 'This unit has been sold and is currently occupied.'
                      : 'This unit is currently under maintenance and will be available soon.'
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

