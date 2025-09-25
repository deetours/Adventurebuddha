import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Wifi, Smartphone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useBookingStore } from '@/stores/bookingStore';
import { useSeatWebSocket } from '@/hooks/useSeatWebSocket';
import { SeatMapRenderer } from '@/components/booking/SeatMapRenderer';
import { SeatLegend } from '@/components/booking/SeatLegend';
import { SeatSelectionTimer } from '@/components/booking/SeatSelectionTimer';
import { BookingSummaryPanel } from '@/components/booking/BookingSummaryPanel';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import type { Slot, Seat } from '@/lib/types';

export default function SeatSelectionPage() {
  const { slotId } = useParams<{ slotId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [travelerCount, setTravelerCount] = useState(1);
  const {
    selectedSeats,
    seatStatus,
    setSeatMap,
    updateSeatStatus
  } = useBookingStore();

  // Fetch slot details and seat map
  const { data: slotData, error } = useQuery({
    queryKey: ['slot', slotId],
    queryFn: () => apiClient.getSeatMap(slotId!),
    enabled: !!slotId,
  });

  // Initialize booking store with slot data
  useEffect(() => {
    if (slotData) {
      setSeatMap(slotData.seatMap);
      updateSeatStatus({
        available: slotData.available,
        locked: slotData.locked,
        booked: slotData.booked,
        blocked: slotData.blocked,
        selected: []
      });
    }
  }, [slotData, setSeatMap, updateSeatStatus]);

  // Setup WebSocket connection for real-time seat updates
  const { isConnected } = useSeatWebSocket(slotId || '');  // Proceed to payment
  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No Seats Selected",
        description: "Please select at least one seat to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Lock the selected seats
      const lockResponse = await apiClient.lockSeats(slotId!, selectedSeats);

      if (lockResponse.lock_token) {
        // Navigate to payment page with booking ID (we'll create booking first)
        const bookingResponse = await apiClient.createBooking({
          slot_id: slotId!,
          seat_ids: selectedSeats,
          lock_token: lockResponse.lock_token,
          user_id: 'current_user' // This should come from auth context
        });

        navigate(`/book/${bookingResponse.booking_id}/payment`);
      } else {
        toast({
          title: "Seat Lock Failed",
          description: "Failed to lock selected seats. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mock slot data - in real app this would come from API
  const getMockSlotData = (count: number) => {
    const isBus = count >= 7;
    const vehicleType = isBus ? 'Bus' : 'Tempo Traveller';

    const busSeats: Seat[] = [
      // Row 1 (Driver row)
      { id: 'D1', row: 1, col: 1, type: 'driver' },
      { id: 'A1', row: 1, col: 2, type: 'window' },
      { id: 'A2', row: 1, col: 3, type: 'aisle' },
      { id: 'A3', row: 1, col: 4, type: 'window' },
      { id: 'A4', row: 1, col: 5, type: 'aisle' },
      // Row 2
      { id: 'B1', row: 2, col: 1, type: 'window' },
      { id: 'B2', row: 2, col: 2, type: 'aisle' },
      { id: 'B3', row: 2, col: 3, type: 'window' },
      { id: 'B4', row: 2, col: 4, type: 'aisle' },
      { id: 'B5', row: 2, col: 5, type: 'window' },
      // Row 3
      { id: 'C1', row: 3, col: 1, type: 'window' },
      { id: 'C2', row: 3, col: 2, type: 'aisle' },
      { id: 'C3', row: 3, col: 3, type: 'window' },
      { id: 'C4', row: 3, col: 4, type: 'aisle' },
      { id: 'C5', row: 3, col: 5, type: 'window' },
      // Row 4
      { id: 'D1', row: 4, col: 1, type: 'window' },
      { id: 'D2', row: 4, col: 2, type: 'aisle' },
      { id: 'D3', row: 4, col: 3, type: 'window' },
      { id: 'D4', row: 4, col: 4, type: 'aisle' },
      { id: 'D5', row: 4, col: 5, type: 'window' },
      // Row 5
      { id: 'E1', row: 5, col: 1, type: 'window' },
      { id: 'E2', row: 5, col: 2, type: 'aisle' },
      { id: 'E3', row: 5, col: 3, type: 'window' },
      { id: 'E4', row: 5, col: 4, type: 'aisle' },
      { id: 'E5', row: 5, col: 5, type: 'window' },
      // Row 6
      { id: 'F1', row: 6, col: 1, type: 'window' },
      { id: 'F2', row: 6, col: 2, type: 'aisle' },
      { id: 'F3', row: 6, col: 3, type: 'window' },
      { id: 'F4', row: 6, col: 4, type: 'aisle' },
      { id: 'F5', row: 6, col: 5, type: 'window' },
    ];

    const ttSeats: Seat[] = [
      // Row 1 (Driver row)
      { id: 'D1', row: 1, col: 1, type: 'driver' },
      { id: 'A1', row: 1, col: 2, type: 'window' },
      { id: 'A2', row: 1, col: 3, type: 'aisle' },
      // Row 2
      { id: 'B1', row: 2, col: 1, type: 'window' },
      { id: 'B2', row: 2, col: 2, type: 'aisle' },
      { id: 'B3', row: 2, col: 3, type: 'window' },
      // Row 3
      { id: 'C1', row: 3, col: 1, type: 'window' },
      { id: 'C2', row: 3, col: 2, type: 'aisle' },
      { id: 'C3', row: 3, col: 3, type: 'window' },
      // Row 4
      { id: 'D2', row: 4, col: 1, type: 'window' },
      { id: 'D3', row: 4, col: 2, type: 'aisle' },
      { id: 'D4', row: 4, col: 3, type: 'window' },
    ];

    const totalSeats = isBus ? busSeats.length : ttSeats.length;

    return {
      slot: {
        id: slotId || 'mock-slot-id',
        tripId: '1',
        date: '2024-06-15',
        time: '06:00',
        vehicleType,
        totalSeats,
        availableSeats: totalSeats - 2, // Mock some booked seats
        price: 35000,
        status: 'available' as const,
        seatMap: slotData?.seatMap || {
          vehicle: vehicleType,
          rows: isBus ? 6 : 4,
          cols: isBus ? 5 : 3,
          seats: isBus ? busSeats : ttSeats
        }
      } as Slot,
      trip: {
        id: '1',
        slug: 'ladakh-adventure-7-days',
        title: 'Ladakh Adventure - 7 Days',
        description: 'Experience the breathtaking landscapes of Ladakh',
        images: ['/images/ladakh1.jpg'],
        price: 35000,
        duration: 7,
        tags: ['Adventure', 'Cultural'],
        difficulty: 'moderate' as const,
        rating: 4.5,
        reviewCount: 120,
        inclusions: ['Accommodation', 'Meals', 'Transport'],
        exclusions: ['Personal expenses'],
        itinerary: [],
        upcomingSlots: []
      }
    };
  };

  const mockData = getMockSlotData(travelerCount);
  const mockSlotData = mockData.slot;
  const mockTripData = mockData.trip;

  if (error || !slotData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Seat Map</h2>
          <p className="text-gray-600 mb-6">
            We couldn't load the seat map for this trip. Please try again later or contact support.
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Go Back
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow-lg"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:bg-white/20 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trip Details
            </Button>

            <div className="text-center flex-1">
              <motion.h1
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent"
              >
                🚀 3D Seat Selection
              </motion.h1>
              <p className="text-orange-100 mt-1">
                Interactive seat map for {new Date(mockSlotData.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Connection Status Indicator */}
            <div className="flex items-center space-x-2">
              <motion.div
                animate={isConnected ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span className="text-sm hidden sm:inline">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Traveler Count Selector */}
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1">
              <span className="text-sm text-orange-100">Travelers:</span>
              <select
                value={travelerCount}
                onChange={(e) => setTravelerCount(Number(e.target.value))}
                className="bg-white/20 text-white border-none rounded px-2 py-1 text-sm focus:ring-2 focus:ring-white/50"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num} className="text-gray-900">
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Connection Status Banner */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Wifi className="h-5 w-5 text-yellow-600" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-medium text-yellow-800">
                        Connection lost - seat information may not be up to date
                      </div>
                      <div className="text-sm text-yellow-700">
                        Please refresh the page if you experience issues.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seat Selection Timer - Prominent Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <SeatSelectionTimer />
            </motion.div>

            {/* Enhanced Seat Map Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 border-orange-200 shadow-2xl bg-gradient-to-br from-white to-orange-50/50 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-200 border-b border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-2xl text-gray-900">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          🎭
                        </motion.div>
                        <span className="ml-2">Interactive Seat Map</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        Hover over seats to see details • Click to select • Real-time availability
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      <Smartphone className="h-3 w-3 mr-1" />
                      Touch Enabled
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <SeatMapRenderer
                    className="mb-8"
                    groupSize={travelerCount}
                  />
                  <SeatLegend />
                </CardContent>
              </Card>
            </motion.div>

            {/* Mobile Optimization Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="lg:hidden"
            >
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-800">Mobile Optimized</div>
                      <div className="text-sm text-blue-700">
                        Pinch to zoom • Tap to select • Swipe to navigate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <BookingSummaryPanel
                trip={mockTripData}
                slot={mockSlotData}
                selectedSeats={selectedSeats}
                onProceedToPayment={handleProceedToPayment}
                seatMap={mockSlotData.seatMap}
              />
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Seats</span>
                    <span className="font-bold">{mockSlotData.seatMap?.seats.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available</span>
                    <span className="font-bold text-green-600">
                      {seatStatus.available.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected</span>
                    <span className="font-bold text-orange-600">{selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Premium Seats</span>
                    <span className="font-bold text-purple-600">
                      {mockSlotData.seatMap?.seats.filter(seat => seat.type === 'extra_legroom').length || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}