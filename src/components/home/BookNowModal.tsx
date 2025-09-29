import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, MapPin, Star, CreditCard, Shield, CheckCircle, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useToast } from '../ui/use-toast';
import { apiClient } from '../../lib/api';
import type { Trip, Slot } from '../../lib/types';

interface BookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  selectedSlot?: Slot;
}

export function BookNowModal({ isOpen, onClose, trip, selectedSlot }: BookNowModalProps) {
  const [step, setStep] = useState(1);
  const [travelerCount, setTravelerCount] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
    emergencyContact: '',
    dietaryRestrictions: '',
    experienceLevel: 'beginner'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const { toast } = useToast();

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTravelerCount(1);
      setSelectedDate(selectedSlot?.id || '');
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialRequests: '',
        emergencyContact: '',
        dietaryRestrictions: '',
        experienceLevel: 'beginner'
      });
      // Fetch available slots if trip is provided
      if (trip) {
        const fetchAvailableSlots = async () => {
          try {
            const slots = await apiClient.getTripSlots(trip.id);
            setAvailableSlots(slots.filter(slot => slot.availableSeats > 0));
          } catch (error) {
            console.error('Failed to fetch slots:', error);
          }
        };
        fetchAvailableSlots();
      }
    }
  }, [isOpen, trip, selectedSlot]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    if (!trip) return 0;
    const basePrice = trip.price * travelerCount;
    const serviceFee = basePrice * 0.05; // 5% service fee
    return Math.round(basePrice + serviceFee);
  };

  const handleSubmit = async () => {
    if (!trip || !selectedDate) return;

    setIsSubmitting(true);
    try {
      const bookingData = {
        tripId: trip.id,
        slotId: selectedDate,
        travelerCount,
        customerDetails: formData,
        totalAmount: calculateTotal(),
        specialRequests: formData.specialRequests
      };

      await apiClient.createBooking(bookingData);

      toast({
        title: "Booking Confirmed! 🎉",
        description: `Your adventure to ${trip.title} has been booked successfully.`,
      });

      onClose();
    } catch (error) {
      console.error('Booking failed:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !selectedDate) {
      toast({
        title: "Select a Date",
        description: "Please select your preferred travel date.",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  if (!trip) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Book Your Adventure</h2>
                  <p className="text-orange-100 mt-1">{trip.title}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center space-x-4 mt-6">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step >= stepNumber ? 'bg-white text-orange-600' : 'bg-white/30 text-white'
                    }`}>
                      {stepNumber}
                    </div>
                    <span className={`ml-2 text-sm ${step >= stepNumber ? 'text-white' : 'text-white/60'}`}>
                      {stepNumber === 1 ? 'Details' : stepNumber === 2 ? 'Travelers' : 'Payment'}
                    </span>
                    {stepNumber < 3 && <div className={`w-12 h-0.5 ml-4 ${step > stepNumber ? 'bg-white' : 'bg-white/30'}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
              {step === 1 && (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Trip Summary */}
                    <Card className="border-orange-200">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                          Trip Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="aspect-video rounded-xl overflow-hidden">
                          <img
                            src={trip.images?.[0] || '/images/default-trip.svg'}
                            alt={trip.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Destination</span>
                            <span className="font-semibold">{trip.tags?.join(', ') || 'India'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-semibold">{trip.duration} days</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Difficulty</span>
                            <Badge variant="outline">{trip.difficulty}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Rating</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span className="font-semibold">{trip.rating}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Date & Travelers Selection */}
                    <div className="space-y-6">
                      <Card className="border-orange-200">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                            Select Travel Date
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {availableSlots.slice(0, 5).map((slot) => (
                              <motion.div
                                key={slot.id}
                                whileHover={{ scale: 1.02 }}
                                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                                  selectedDate === slot.id
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-orange-300'
                                }`}
                                onClick={() => setSelectedDate(slot.id)}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-semibold">
                                      {new Date(slot.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </div>
                                    <div className="text-sm text-gray-600">{slot.time}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-orange-600">₹{slot.price.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">{slot.availableSeats} seats left</div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-orange-200">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Users className="h-5 w-5 mr-2 text-orange-600" />
                            Number of Travelers
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-orange-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-lg">{travelerCount} Traveler{travelerCount > 1 ? 's' : ''}</div>
                                <div className="text-sm text-gray-600">Max 10 travelers</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setTravelerCount(Math.max(1, travelerCount - 1))}
                                disabled={travelerCount <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold">{travelerCount}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setTravelerCount(Math.min(10, travelerCount + 1))}
                                disabled={travelerCount >= 10}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="p-6">
                  <div className="max-w-2xl mx-auto space-y-6">
                    <Card className="border-orange-200">
                      <CardHeader>
                        <CardTitle>Traveler Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Enter your full name"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="your@email.com"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+91 9876543210"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="emergencyContact">Emergency Contact</Label>
                            <Input
                              id="emergencyContact"
                              value={formData.emergencyContact}
                              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                              placeholder="Emergency contact number"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="experienceLevel">Experience Level</Label>
                          <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner - First time traveler</SelectItem>
                              <SelectItem value="intermediate">Intermediate - Some travel experience</SelectItem>
                              <SelectItem value="advanced">Advanced - Experienced traveler</SelectItem>
                              <SelectItem value="expert">Expert - Frequent adventurer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                          <Input
                            id="dietaryRestrictions"
                            value={formData.dietaryRestrictions}
                            onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                            placeholder="Any dietary restrictions or preferences"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="specialRequests">Special Requests</Label>
                          <textarea
                            id="specialRequests"
                            value={formData.specialRequests}
                            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                            placeholder="Any special requests or requirements..."
                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg resize-none"
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="p-6">
                  <div className="max-w-2xl mx-auto space-y-6">
                    <Card className="border-orange-200">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
                          Booking Summary & Payment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex justify-between">
                            <span>Trip Cost × {travelerCount}</span>
                            <span>₹{(trip.price * travelerCount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Service Fee (5%)</span>
                            <span>₹{(trip.price * travelerCount * 0.05).toLocaleString()}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total Amount</span>
                            <span className="text-orange-600">₹{calculateTotal().toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <div className="font-semibold text-green-800">Secure Booking Guarantee</div>
                              <div className="text-sm text-green-700 mt-1">
                                Your booking is protected with our 100% satisfaction guarantee.
                                Free cancellation up to 24 hours before departure.
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold">What's Included:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {trip.inclusions?.slice(0, 6).map((item, index) => (
                              <div key={index} className="flex items-center text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {step > 1 && (
                    <Button variant="ghost" onClick={prevStep}>
                      ← Back
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-bold text-orange-600">₹{calculateTotal().toLocaleString()}</span>
                  </div>

                  {step < 3 ? (
                    <Button onClick={nextStep} className="bg-orange-500 hover:bg-orange-600">
                      Continue →
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}