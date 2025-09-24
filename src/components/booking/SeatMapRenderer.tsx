import React, { useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, User, X, Check, Crown, Zap, Star, Bus, Truck, Users, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Seat } from '../../lib/types';
import { useBookingStore } from '../../stores/bookingStore';

interface SeatMapRendererProps {
  className?: string;
  groupSize?: number;
}

export function SeatMapRenderer({ className, groupSize = 1 }: SeatMapRendererProps) {
  const {
    selectedSeats,
    seatStatus,
    selectSeat,
    deselectSeat
  } = useBookingStore();

  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  // Generate dynamic seat map based on group size
  const dynamicSeatMap = useMemo(() => {
    let vehicle;
    if (groupSize <= 6) {
      vehicle = {
        type: 'Tempo Traveller',
        icon: Car,
        capacity: 12,
        description: 'Perfect for small groups',
        layout: 'compact'
      };
    } else if (groupSize <= 15) {
      vehicle = {
        type: 'AC Bus',
        icon: Bus,
        capacity: 45,
        description: 'Comfortable for medium groups',
        layout: 'standard'
      };
    } else {
      vehicle = {
        type: 'Luxury Coach',
        icon: Truck,
        capacity: 50,
        description: 'Spacious for large groups',
        layout: 'luxury'
      };
    }

    // Generate seats based on vehicle type
    const generateSeats = () => {
      const seats: Seat[] = [];

      if (vehicle.type === 'Tempo Traveller') {
        // 4 rows, 3 columns for Tempo Traveller
        seats.push({ id: 'D1', row: 1, col: 1, type: 'driver' });
        seats.push({ id: 'A1', row: 1, col: 2, type: 'window' });
        seats.push({ id: 'A2', row: 1, col: 3, type: 'aisle' });

        seats.push({ id: 'B1', row: 2, col: 1, type: 'window' });
        seats.push({ id: 'B2', row: 2, col: 2, type: 'aisle' });
        seats.push({ id: 'B3', row: 2, col: 3, type: 'window' });

        seats.push({ id: 'C1', row: 3, col: 1, type: 'window' });
        seats.push({ id: 'C2', row: 3, col: 2, type: 'aisle' });
        seats.push({ id: 'C3', row: 3, col: 3, type: 'window' });

        seats.push({ id: 'D2', row: 4, col: 1, type: 'window' });
        seats.push({ id: 'D3', row: 4, col: 2, type: 'aisle' });
        seats.push({ id: 'D4', row: 4, col: 3, type: 'window' });
      } else if (vehicle.type === 'AC Bus') {
        // 6 rows, 5 columns for AC Bus
        seats.push({ id: 'D1', row: 1, col: 1, type: 'driver' });
        seats.push({ id: 'A1', row: 1, col: 2, type: 'window' });
        seats.push({ id: 'A2', row: 1, col: 3, type: 'aisle' });
        seats.push({ id: 'A3', row: 1, col: 4, type: 'window' });
        seats.push({ id: 'A4', row: 1, col: 5, type: 'aisle' });

        for (let row = 2; row <= 6; row++) {
          const rowLetter = String.fromCharCode(65 + row - 1); // A, B, C, D, E, F
          seats.push({ id: `${rowLetter}1`, row, col: 1, type: 'window' });
          seats.push({ id: `${rowLetter}2`, row, col: 2, type: 'aisle' });
          seats.push({ id: `${rowLetter}3`, row, col: 3, type: 'window' });
          seats.push({ id: `${rowLetter}4`, row, col: 4, type: 'aisle' });
          seats.push({ id: `${rowLetter}5`, row, col: 5, type: 'window' });
        }
      } else {
        // Luxury Coach - 7 rows, 5 columns
        seats.push({ id: 'D1', row: 1, col: 1, type: 'driver' });
        seats.push({ id: 'A1', row: 1, col: 2, type: 'window', priceDelta: 500 });
        seats.push({ id: 'A2', row: 1, col: 3, type: 'aisle', priceDelta: 300 });
        seats.push({ id: 'A3', row: 1, col: 4, type: 'window', priceDelta: 500 });
        seats.push({ id: 'A4', row: 1, col: 5, type: 'aisle', priceDelta: 300 });

        for (let row = 2; row <= 7; row++) {
          const rowLetter = String.fromCharCode(65 + row - 1);
          seats.push({ id: `${rowLetter}1`, row, col: 1, type: 'window', priceDelta: row <= 3 ? 300 : 0 });
          seats.push({ id: `${rowLetter}2`, row, col: 2, type: 'aisle', priceDelta: row <= 3 ? 200 : 0 });
          seats.push({ id: `${rowLetter}3`, row, col: 3, type: 'extra_legroom', priceDelta: 800 });
          seats.push({ id: `${rowLetter}4`, row, col: 4, type: 'aisle', priceDelta: row <= 3 ? 200 : 0 });
          seats.push({ id: `${rowLetter}5`, row, col: 5, type: 'window', priceDelta: row <= 3 ? 300 : 0 });
        }
      }

      return seats;
    };

    return {
      vehicle: vehicle.type,
      rows: vehicle.type === 'Tempo Traveller' ? 4 : vehicle.type === 'AC Bus' ? 6 : 7,
      cols: vehicle.type === 'Tempo Traveller' ? 3 : 5,
      seats: generateSeats(),
      vehicleInfo: vehicle
    };
  }, [groupSize]);

  const getSeatStatus = useCallback((seatId: string) => {
    if (selectedSeats.includes(seatId)) return 'selected';
    if (seatStatus.booked.includes(seatId)) return 'booked';
    if (seatStatus.locked.includes(seatId)) return 'locked';
    if (seatStatus.blocked.includes(seatId)) return 'blocked';
    return 'available';
  }, [selectedSeats, seatStatus]);

  const getSeatCategory = useCallback((seat: Seat) => {
    if (seat.type === 'extra_legroom') return 'premium';
    if (seat.type === 'window') return 'standard';
    return 'budget';
  }, []);

  const getSeatPrice = useCallback((seat: Seat) => {
    const basePrice = 35000; // This should come from props
    return basePrice + (seat.priceDelta || 0);
  }, []);

  const getSeatLabel = useCallback((seat: Seat) => {
    const status = getSeatStatus(seat.id);
    const category = getSeatCategory(seat);
    const price = getSeatPrice(seat);
    return `Seat ${seat.id} - ${category} - ₹${price.toLocaleString()} - ${status}`;
  }, [getSeatStatus, getSeatCategory, getSeatPrice]);

  const handleSeatClick = useCallback((seat: Seat) => {
    const status = getSeatStatus(seat.id);

    if (status === 'booked' || status === 'blocked') {
      return; // Cannot select
    }

    if (status === 'locked' && !selectedSeats.includes(seat.id)) {
      return; // Cannot select locked seats by others
    }

    if (selectedSeats.includes(seat.id)) {
      deselectSeat(seat.id);
    } else {
      selectSeat(seat.id);
    }
  }, [getSeatStatus, selectedSeats, selectSeat, deselectSeat]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, seat: Seat) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSeatClick(seat);
    }
  }, [handleSeatClick]);

  // Create a grid representation
  const seatGrid: (Seat | null)[][] = Array.from({ length: dynamicSeatMap.rows }, () =>
    Array.from({ length: dynamicSeatMap.cols }, () => null)
  );

  // Populate the grid with seats
  dynamicSeatMap.seats.forEach(seat => {
    if (seat.row <= dynamicSeatMap.rows && seat.col <= dynamicSeatMap.cols) {
      seatGrid[seat.row - 1][seat.col - 1] = seat;
    }
  });

  const getSeatIcon = (seat: Seat, status: string) => {
    if (seat.type === 'driver') return <User className="h-4 w-4" />;
    if (status === 'selected') return <Check className="h-4 w-4" />;
    if (status === 'booked' || status === 'blocked') return <X className="h-4 w-4" />;
    if (seat.type === 'extra_legroom') return <Crown className="h-4 w-4" />;
    if (seat.type === 'window') return <Star className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getSeatColors = (seat: Seat, status: string) => {
    const category = getSeatCategory(seat);

    if (status === 'selected') {
      return {
        bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
        border: 'border-orange-400',
        text: 'text-white',
        shadow: 'shadow-orange-500/50'
      };
    }

    if (status === 'booked') {
      return {
        bg: 'bg-gradient-to-br from-red-500 to-red-600',
        border: 'border-red-400',
        text: 'text-white',
        shadow: 'shadow-red-500/50'
      };
    }

    if (status === 'locked') {
      return {
        bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
        border: 'border-yellow-300',
        text: 'text-white',
        shadow: 'shadow-yellow-500/50'
      };
    }

    if (status === 'blocked') {
      return {
        bg: 'bg-gradient-to-br from-gray-600 to-gray-700',
        border: 'border-gray-500',
        text: 'text-white',
        shadow: 'shadow-gray-500/50'
      };
    }

    // Available seats with category colors
    if (category === 'premium') {
      return {
        bg: 'bg-gradient-to-br from-purple-100 to-purple-200',
        border: 'border-purple-300',
        text: 'text-purple-800',
        shadow: 'shadow-purple-500/20'
      };
    }

    if (category === 'standard') {
      return {
        bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
        border: 'border-blue-300',
        text: 'text-blue-800',
        shadow: 'shadow-blue-500/20'
      };
    }

    // Budget
    return {
      bg: 'bg-gradient-to-br from-green-100 to-green-200',
      border: 'border-green-300',
      text: 'text-green-800',
      shadow: 'shadow-green-500/20'
    };
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Enhanced Vehicle Header with Dynamic Selection */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-xl p-6 border border-orange-200 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 bg-orange-100 rounded-full"
            >
              <dynamicSeatMap.vehicleInfo.icon className="h-8 w-8 text-orange-600" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                {dynamicSeatMap.vehicleInfo.type}
              </h3>
              <p className="text-sm text-gray-600">{dynamicSeatMap.vehicleInfo.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Capacity: {dynamicSeatMap.vehicleInfo.capacity} seats</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600">Group Size</div>
            <div className="text-2xl font-bold text-orange-600">{groupSize}</div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Seat Map - 2D Layout */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-200"
      >
        {/* Seat Map Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-bold text-gray-900">Choose Your Seats</h4>
            <p className="text-sm text-gray-600">Click on available seats to select them</p>
          </div>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Info className="h-4 w-4" />
            <span className="text-sm">Legend</span>
          </button>
        </div>

        {/* Legend */}
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <h5 className="font-semibold text-blue-900 mb-3">Seat Types & Status</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 border border-orange-400 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 border border-red-400 rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400 border border-yellow-300 rounded"></div>
                  <span>Held</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seat Grid - Clean 2D Layout */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-inner">
          <div
            className="grid gap-4 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${dynamicSeatMap.cols}, 1fr)`,
              maxWidth: `${Math.min(dynamicSeatMap.cols * 80, 800)}px`,
            }}
          >
            {seatGrid.map((row, rowIndex) =>
              row.map((seat, colIndex) => {
                if (!seat) {
                  return (
                    <div
                      key={`empty-${rowIndex}-${colIndex}`}
                      className="w-16 h-16"
                    />
                  );
                }

                const status = getSeatStatus(seat.id);
                const category = getSeatCategory(seat);
                const colors = getSeatColors(seat, status);
                const isDriver = seat.type === 'driver';
                const isClickable = status === 'available' || status === 'selected' ||
                                   (status === 'locked' && selectedSeats.includes(seat.id));
                const isHovered = hoveredSeat === seat.id;

                return (
                  <motion.div
                    key={seat.id}
                    className="relative flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (rowIndex * dynamicSeatMap.cols + colIndex) * 0.03 }}
                  >
                    <motion.button
                      type="button"
                      className={cn(
                        "relative w-16 h-16 rounded-xl text-sm font-bold",
                        "flex flex-col items-center justify-center",
                        "focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-offset-2",
                        "transition-all duration-200 ease-out",
                        colors.bg,
                        colors.border,
                        colors.text,
                        colors.shadow,
                        "shadow-md hover:shadow-lg",
                        {
                          'cursor-not-allowed opacity-60': !isClickable && !isDriver,
                          'ring-4 ring-orange-400 ring-opacity-50': isHovered && isClickable,
                          'transform scale-105': isHovered && isClickable,
                        }
                      )}
                      onClick={() => !isDriver && handleSeatClick(seat)}
                      onKeyDown={(e) => !isDriver && handleKeyDown(e, seat)}
                      onMouseEnter={() => setHoveredSeat(seat.id)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      disabled={!isClickable && !isDriver}
                      aria-label={getSeatLabel(seat)}
                      tabIndex={isDriver ? -1 : 0}
                      whileHover={isClickable ? { scale: 1.1 } : undefined}
                      whileTap={isClickable ? { scale: 0.95 } : undefined}
                      animate={selectedSeats.includes(seat.id) ? {
                        scale: [1, 1.05, 1],
                        transition: { duration: 0.3 }
                      } : undefined}
                    >
                      {/* Seat Icon */}
                      <div className="flex items-center justify-center mb-1">
                        {getSeatIcon(seat, status)}
                      </div>

                      {/* Seat ID */}
                      <div className="text-xs font-bold leading-none">
                        {seat.id}
                      </div>

                      {/* Category Indicator */}
                      {!isDriver && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                             style={{
                               backgroundColor: category === 'premium' ? '#9333ea' :
                                              category === 'standard' ? '#3b82f6' : '#10b981'
                             }}
                             title={`${category} seat`} />
                      )}

                      {/* Price Delta */}
                      {seat.priceDelta && seat.priceDelta > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-2 -right-2 text-xs bg-orange-500 text-white px-1 py-0.5 rounded-md font-bold shadow-lg"
                        >
                          +₹{seat.priceDelta}
                        </motion.div>
                      )}

                      {/* Selection Glow Effect */}
                      <AnimatePresence>
                        {selectedSeats.includes(seat.id) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1.2 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 rounded-xl bg-orange-400 opacity-20"
                            style={{
                              boxShadow: '0 0 20px rgba(249, 115, 22, 0.6)',
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Enhanced Hover Tooltip */}
                    <AnimatePresence>
                      {isHovered && isClickable && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 z-20"
                        >
                          <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                            <div className="font-bold text-center mb-2">{seat.id}</div>
                            <div className="space-y-1 text-xs">
                              <div className="capitalize font-medium">{category} Seat</div>
                              <div>₹{getSeatPrice(seat).toLocaleString()}</div>
                              {seat.type === 'window' && <div className="flex items-center space-x-1">
                                <span>🌅</span><span>Window View</span>
                              </div>}
                              {seat.type === 'extra_legroom' && <div className="flex items-center space-x-1">
                                <span>🦵</span><span>Extra Legroom</span>
                              </div>}
                              <div className="text-orange-300 font-medium mt-2">
                                Click to {selectedSeats.includes(seat.id) ? 'deselect' : 'select'}
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Front Indicator */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
              <Car className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Front of Vehicle</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}