import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ArrowRight, MapPin, Calendar, Users, X, DollarSign, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Destination {
  id: string;
  name: string;
  country: string;
  price: number;
  image: string;
  highlights: string[];
  bestTime: string;
  difficulty: string;
}

// Booking Form Component
const BookingForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  
  const [currentStep, setCurrentStep] = useState('destination');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(7);
  const [travelers, setTravelers] = useState(1);
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '' });
  const [specialRequests, setSpecialRequests] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isBooking, setIsBooking] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  // Fetch destinations from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const trips = await apiClient.getTrips({ featured: 'popular,both' });
        // Convert trips to destination format
        const destinationData: Destination[] = trips.slice(0, 6).map((trip) => ({
          id: trip.id.toString(),
          name: trip.title.split(' ').slice(0, 2).join(' '), // Use first 2 words as destination name
          country: 'India',
          price: trip.price,
          image: trip.images?.[0] || '/images/default-trip.jpg',
          highlights: trip.tags?.slice(0, 3) || ['Adventure', 'Culture', 'Nature'],
          bestTime: 'Oct - Mar',
          difficulty: trip.difficulty === 'easy' ? 'Easy' : trip.difficulty === 'moderate' ? 'Moderate' : 'Challenging'
        }));
        setDestinations(destinationData);
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
        // Fallback to empty array
        setDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    };

    fetchDestinations();
  }, []);

  const validateStep = (step: string) => {
    const newErrors: {[key: string]: string} = {};
    
    if (step === 'destination' && !selectedDestination) {
      newErrors.destination = 'Please select a destination';
    }
    
    if (step === 'details') {
      if (!startDate) newErrors.startDate = 'Please select a start date';
      if (!contactInfo.name.trim()) newErrors.name = 'Name is required';
      if (!contactInfo.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) newErrors.email = 'Invalid email format';
      if (!contactInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePrice = () => {
    const basePrice = destinations.find(d => d.id === selectedDestination)?.price || 0;
    const travelerMultiplier = travelers;
    const durationMultiplier = Math.max(1, duration / 7); // Base is 7 days
    return Math.round(basePrice * travelerMultiplier * durationMultiplier);
  };

  const getSelectedDestination = () => {
    return destinations.find(d => d.id === selectedDestination);
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 'destination') setCurrentStep('details');
    }
  };

  const handleBooking = async () => {
    if (!validateStep('details')) return;
    
    setIsBooking(true);
    // Simulate booking process with realistic timing
    await new Promise(resolve => setTimeout(resolve, 2500));
    setCurrentStep('confirmation');
    setIsBooking(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Steps */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-center space-x-8">
          {[
            { key: 'destination', label: 'Choose Destination', icon: MapPin },
            { key: 'details', label: 'Trip Details', icon: Users },
            { key: 'confirmation', label: 'Confirmation', icon: CheckCircle }
          ].map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted = 
              (step.key === 'destination' && (currentStep === 'details' || currentStep === 'confirmation')) ||
              (step.key === 'details' && currentStep === 'confirmation');

            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  isCompleted ? 'bg-green-500 text-white shadow-lg' :
                  isActive ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="ml-3">
                  <span className={`text-sm font-medium block ${
                    isActive ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    Step {index + 1}
                  </span>
                  <span className={`text-xs block ${
                    isActive ? 'text-orange-500' : isCompleted ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-6 rounded-full transition-all ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Content - No scrolling */}
      <div className="flex-1 p-4" style={{ height: 'calc(100% - 80px)', overflow: 'visible' }}>
        <AnimatePresence mode="wait">
          {currentStep === 'destination' && (
            <motion.div
              key="destination"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Choose Your Destination</h3>
                <p className="text-sm text-gray-600 mt-1">Select the perfect adventure for your journey</p>
              </div>
              
              {errors.destination && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {errors.destination}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {loadingDestinations ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-lg overflow-hidden border-2 border-gray-200">
                      <div className="w-full h-20 bg-gray-200 animate-pulse" />
                      <div className="p-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))
                ) : destinations.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500">No destinations available at the moment.</p>
                  </div>
                ) : (
                  destinations.map((dest) => (
                    <motion.div
                      key={dest.id}
                      className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedDestination === dest.id ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'
                      }`}
                      onClick={() => {
                        setSelectedDestination(dest.id);
                        setErrors({ ...errors, destination: '' });
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <img src={dest.image} alt={dest.name} className="w-full h-20 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm">{dest.name}</h4>
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            dest.difficulty === 'Easy' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}>
                            {dest.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">₹{dest.price.toLocaleString()}</span>
                          <span className="text-xs opacity-75">{dest.bestTime}</span>
                        </div>
                      </div>

                      {selectedDestination === dest.id && (
                        <motion.div
                          className="absolute top-1 right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {selectedDestination && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-orange-50 p-3 rounded-lg border border-orange-200"
                >
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Highlights:</h4>
                  <div className="flex flex-wrap gap-1">
                    {getSelectedDestination()?.highlights.map((highlight, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h3 className="text-base font-semibold text-gray-900">Trip Details</h3>
                <p className="text-xs text-gray-600">Complete your booking</p>
              </div>

              {/* Trip Configuration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setErrors({ ...errors, startDate: '' });
                    }}
                    className={`w-full px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.startDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    {[3, 5, 7, 10, 14, 21].map(days => (
                      <option key={days} value={days}>{days} days</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Travelers */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Travelers</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-sm"
                    disabled={travelers <= 1}
                  >
                    -
                  </button>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-gray-500" />
                    <span className="text-sm font-semibold w-6 text-center">{travelers}</span>
                    <span className="text-xs text-gray-600">
                      {travelers === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                  <button
                    onClick={() => setTravelers(Math.min(10, travelers + 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-sm"
                    disabled={travelers >= 10}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Info</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactInfo.name}
                      onChange={(e) => {
                        setContactInfo({ ...contactInfo, name: e.target.value });
                        setErrors({ ...errors, name: '' });
                      }}
                      className={`w-full px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => {
                          setContactInfo({ ...contactInfo, email: e.target.value });
                          setErrors({ ...errors, email: '' });
                        }}
                        className={`w-full px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => {
                          setContactInfo({ ...contactInfo, phone: e.target.value });
                          setErrors({ ...errors, phone: '' });
                        }}
                        className={`w-full px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+91 9876543210"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-colors"
                  rows={2}
                  placeholder="Dietary needs, accessibility, preferences..."
                />
              </div>

              {/* Price Summary */}
              {selectedDestination && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200"
                >
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1 text-sm">
                    <DollarSign className="w-3 h-3" />
                    Price Summary
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Destination:</span>
                      <span className="font-medium">{getSelectedDestination()?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Travelers:</span>
                      <span>{travelers} × ₹{destinations.find(d => d.id === selectedDestination)?.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{duration} days ({(duration / 7).toFixed(1)}×)</span>
                    </div>
                    <div className="border-t border-orange-300 pt-1 flex justify-between font-semibold text-sm">
                      <span>Total:</span>
                      <span className="text-orange-600">₹{calculatePrice().toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-4"
            >
              {/* Success Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Booking Confirmed!</h3>
                <p className="text-sm text-gray-600">
                  Your adventure to {getSelectedDestination()?.name} has been successfully booked.
                </p>
              </div>

              {/* Booking Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
              >
                <h4 className="font-bold text-gray-900 mb-3 flex items-center justify-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Booking Details
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destination:</span>
                      <span className="font-semibold text-gray-900">{getSelectedDestination()?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Travelers:</span>
                      <span className="font-semibold">{travelers} {travelers === 1 ? 'person' : 'people'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-semibold">{startDate ? new Date(startDate).toLocaleDateString('en-IN', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'TBD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{duration} days</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                        getSelectedDestination()?.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getSelectedDestination()?.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Best Time:</span>
                      <span className="font-semibold">{getSelectedDestination()?.bestTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-semibold text-xs">{contactInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Paid:</span>
                      <span className="font-bold text-green-600">₹{calculatePrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {specialRequests && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <h5 className="font-semibold text-gray-900 mb-2 text-sm">Special Requests:</h5>
                    <p className="text-sm text-gray-700 bg-white/50 p-2 rounded-lg">{specialRequests}</p>
                  </div>
                )}
              </motion.div>

              {/* Next Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-50 p-3 rounded-lg border border-blue-200"
              >
                <h5 className="font-semibold text-blue-900 mb-2 text-sm">What's Next?</h5>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Confirmation email sent to {contactInfo.email}</li>
                  <li>• Detailed itinerary will be shared within 24 hours</li>
                  <li>• Payment confirmation and receipt attached</li>
                  <li>• Travel agent will contact you for final arrangements</li>
                </ul>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-2 justify-center"
              >
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <ArrowRight className="w-3 h-3 rotate-90" />
                  Print Details
                </button>
                <button
                  onClick={() => {
                    // Could implement sharing functionality
                    navigator.share?.({
                      title: 'My Adventure Booking',
                      text: `I'm excited for my trip to ${getSelectedDestination()?.name}!`,
                      url: window.location.href
                    });
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle className="w-3 h-3" />
                  Share Booking
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Footer */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
        <button
          onClick={onClose}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          Cancel
        </button>
        
        <div className="flex gap-3">
          {currentStep !== 'destination' && currentStep !== 'confirmation' && (
            <button
              onClick={() => setCurrentStep('destination')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>
          )}
          
          {currentStep === 'destination' && selectedDestination && (
            <button
              onClick={handleNextStep}
              className="px-8 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          
          {currentStep === 'details' && (
            <button
              onClick={handleBooking}
              disabled={isBooking}
              className="px-8 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              {isBooking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Book Now - ₹{calculatePrice().toLocaleString()}
                </>
              )}
            </button>
          )}
          
          {currentStep === 'confirmation' && (
            <button
              onClick={onClose}
              className="px-8 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              <CheckCircle className="w-4 h-4" />
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MorphingCTAButtons: React.FC = () => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Debug modal state changes
  useEffect(() => {
  }, [showBookingModal]);

  // Close modal handler
  const closeBookingModal = () => {
    document.body.style.overflow = 'unset';
    document.body.style.position = 'static';
    setShowBookingModal(false);
  };

  const buttons = [
    {
      id: 'explore',
      text: 'Explore Destinations',
      icon: MapPin,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'from-orange-600 to-orange-700',
      features: ['200+ Destinations', 'Local Guides', 'Authentic Experiences']
    },
    {
      id: 'book',
      text: 'Book Your Trip',
      icon: Calendar,
      color: 'from-orange-400 to-orange-500',
      hoverColor: 'from-orange-500 to-orange-600',
      features: ['Instant Booking', 'Best Prices', 'Flexible Dates']
    },
    {
      id: 'join',
      text: 'Join Community',
      icon: Users,
      color: 'from-orange-600 to-orange-700',
      hoverColor: 'from-orange-700 to-orange-800',
      features: ['Travel Stories', 'Photo Sharing', 'Adventure Groups']
    }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {buttons.map((button) => {
        const Icon = button.icon;
        const isHovered = hoveredButton === button.id;

        return (
          <motion.button
            key={button.id}
            className={`relative px-8 py-4 rounded-full font-bold text-white overflow-hidden shadow-lg ${
              isHovered ? 'shadow-2xl' : 'shadow-lg'
            }`}
            onMouseEnter={() => setHoveredButton(button.id)}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (button.id === 'book') {
                // Open booking modal with proper scroll management
                if (!showBookingModal) {
                  document.body.style.overflow = 'hidden';
                  document.body.style.position = 'fixed';
                  document.body.style.width = '100%';
                  setShowBookingModal(true);
                }
                return;
              }
              if (button.id === 'explore') {
                // Smooth scroll to featured destinations section
                const el = document.getElementById('featured-destinations');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  // Fallback navigate if section not on this page
                  if (window.location.pathname !== '/trips') {
                    window.location.href = '/trips';
                  }
                }
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {/* Background gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${button.color}`}
              animate={{
                background: isHovered
                  ? `linear-gradient(to right, ${button.hoverColor.split(' ')[0]}, ${button.hoverColor.split(' ')[1]})`
                  : `linear-gradient(to right, ${button.color.split(' ')[0]}, ${button.color.split(' ')[1]})`
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Morphing background shape */}
            <motion.div
              className="absolute inset-0 bg-white opacity-10 rounded-full"
              animate={{
                scale: isHovered ? [1, 1.2, 1] : 1,
                rotate: isHovered ? [0, 180, 360] : 0
              }}
              transition={{
                duration: 2,
                repeat: isHovered ? Infinity : 0,
                ease: "easeInOut"
              }}
            />

            {/* Button content */}
            <div className="relative flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: isHovered ? 360 : 0,
                  scale: isHovered ? 1.2 : 1
                }}
                transition={{ duration: 0.5 }}
              >
                <Icon size={20} />
              </motion.div>

              <span className="text-lg">{button.text}</span>

              <motion.div
                animate={{
                  x: isHovered ? 5 : 0,
                  opacity: isHovered ? 1 : 0.7
                }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight size={18} />
              </motion.div>
            </div>

            {/* Expanding feature reveal */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl p-3 z-10"
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-gray-800 text-sm space-y-1">
                    {button.features.map((feature, index) => (
                      <motion.div
                        key={feature}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white opacity-0"
              animate={isHovered ? {
                scale: [1, 2],
                opacity: [0.3, 0]
              } : {}}
              transition={{
                duration: 0.6,
                repeat: isHovered ? Infinity : 0,
                repeatDelay: 1
              }}
            />
          </motion.button>
        );
      })}
      
      {/* Booking Modal - Fixed positioning, mobile-friendly */}
      {showBookingModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBookingModal}
          />
          
          {/* Modal Content */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-orange-200"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ 
              maxHeight: 'calc(100vh - 2rem)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeBookingModal}
              className="absolute top-3 right-3 z-[10000] w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
              aria-label="Close booking modal"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            
            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto bg-white">
              <BookingForm onClose={closeBookingModal} />
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MorphingCTAButtons;