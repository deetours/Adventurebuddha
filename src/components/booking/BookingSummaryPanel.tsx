import { motion, AnimatePresence } from 'framer-motion';
import { Car, MapPin, Calendar, Clock, User, CreditCard, TrendingUp, Shield, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import type { Trip, Slot, Seat } from '../../lib/types';

interface BookingSummaryPanelProps {
  trip: Trip;
  slot: Slot;
  selectedSeats: string[];
  onProceedToPayment: () => void;
  className?: string;
  seatMap?: SeatMap;
}

export function BookingSummaryPanel({
  trip,
  slot,
  selectedSeats,
  onProceedToPayment,
  className,
  seatMap
}: BookingSummaryPanelProps) {
  // Calculate pricing
  const basePrice = typeof trip.price === 'number' ? trip.price : Number(trip.price) || 0;

  // Use the provided seatMap when computing seat premiums
  const seatPremiums = selectedSeats.reduce((total, seatId) => {
    const found = seatMap?.seats?.find((s: Seat) => s.id === seatId);
    if (!found) return total;
    return total + (found.priceDelta ?? 0);
  }, 0);

  const subtotal = (basePrice * selectedSeats.length) + seatPremiums;
  const serviceFee = subtotal * 0.05; // 5% service fee
  const totalPrice = subtotal + serviceFee;
  const perPersonPrice = selectedSeats.length > 0 ? totalPrice / selectedSeats.length : 0;

  // Calculate savings or premium indicators
  const hasPremiumSeats = seatPremiums > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="sticky top-6 overflow-hidden bg-gradient-to-br from-white via-orange-50/30 to-white border-2 border-orange-100 shadow-2xl">
        {/* Animated Header */}
        <CardHeader className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent animate-pulse" />
          <div className="relative z-10">
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="h-5 w-5" />
                </motion.div>
                <span>Booking Summary</span>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {selectedSeats.length} Seat{selectedSeats.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Trip Info with Enhanced Styling */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl p-4 border border-orange-100">
              <h3 className="font-bold text-xl text-gray-900 mb-3 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                {trip.title}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg">
                  <Car className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">{slot.vehicleType}</div>
                    <div className="text-gray-600">Vehicle</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">Ladakh, India</div>
                    <div className="text-gray-600">Destination</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(slot.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-gray-600">Date</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">{slot.time}</div>
                    <div className="text-gray-600">Departure</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Selected Seats with Enhanced Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-600" />
                Selected Seats ({selectedSeats.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat, index) => {
                  const seatInfo = seatMap?.seats?.find((s: Seat) => s.id === seat);
                  const isPremium = seatInfo?.type === 'extra_legroom';
                  const isWindow = seatInfo?.type === 'window';

                  return (
                    <motion.div
                      key={seat}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={`relative px-3 py-2 rounded-lg font-bold text-sm shadow-md ${
                        isPremium
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                          : isWindow
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      }`}
                    >
                      {seat}
                      {isPremium && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-xs">👑</span>
                        </div>
                      )}
                      {isWindow && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-300 rounded-full flex items-center justify-center">
                          <span className="text-xs">🪟</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {selectedSeats.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No seats selected yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Pricing Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200"
          >
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Price Breakdown
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Base Price × {selectedSeats.length}</span>
                <span className="font-medium">₹{(basePrice * selectedSeats.length).toLocaleString()}</span>
              </div>

              <AnimatePresence>
                {seatPremiums > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between items-center py-2 text-purple-600"
                  >
                    <span className="flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Premium Seat Upgrades
                    </span>
                    <span className="font-medium">+₹{seatPremiums.toLocaleString()}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center py-2 text-blue-600">
                <span>Service Fee (5%)</span>
                <span className="font-medium">₹{serviceFee.toLocaleString()}</span>
              </div>

              <Separator className="bg-gray-300" />

              <div className="flex justify-between items-center py-3 text-lg font-bold text-gray-900">
                <span>Total Amount</span>
                <motion.span
                  key={totalPrice}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent"
                >
                  ₹{totalPrice.toLocaleString()}
                </motion.span>
              </div>

              <div className="text-center text-sm text-gray-600 bg-orange-50 rounded-lg py-2">
                ₹{perPersonPrice.toLocaleString()} per person
                {hasPremiumSeats && (
                  <span className="block text-xs text-purple-600 mt-1">
                    ✨ Includes premium seat benefits
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200"
          >
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-green-700">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Secure</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-700">
                <Clock className="h-4 w-4" />
                <span className="font-medium">5min Hold</span>
              </div>
              <div className="flex items-center space-x-1 text-orange-700">
                <Star className="h-4 w-4" />
                <span className="font-medium">Best Price</span>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white font-bold py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-orange-400"
              size="lg"
              onClick={onProceedToPayment}
              disabled={selectedSeats.length === 0}
            >
              <motion.div
                className="flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CreditCard className="h-5 w-5" />
                <span>
                  {selectedSeats.length === 0
                    ? 'Select Seats to Continue'
                    : `Book Now - ₹${totalPrice.toLocaleString()}`
                  }
                </span>
              </motion.div>
            </Button>

            <div className="text-center text-xs text-gray-500 mt-3">
              <div className="flex items-center justify-center space-x-1">
                <Shield className="h-3 w-3 text-green-600" />
                <span>Free cancellation up to 24 hours • Secure payment</span>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}