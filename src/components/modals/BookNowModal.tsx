import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import './modal-center.css';
import {
  X,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  Award,
  Share2
} from 'lucide-react';
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
  rating?: number;
  tripsCount?: number;
  duration?: number;
  description?: string;
  video?: string;
}

interface BookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDestination?: Destination;
}

const BookNowModal: React.FC<BookNowModalProps> = ({ isOpen, onClose, initialDestination }) => {
  const [currentStep, setCurrentStep] = useState('destination');
  const [selectedDestination, setSelectedDestination] = useState(initialDestination?.id || '');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(initialDestination?.duration || 7);
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
        const destinationData: Destination[] = trips.slice(0, 8).map((trip) => ({
          id: trip.id.toString(),
          name: trip.title.split(' ').slice(0, 2).join(' '),
          country: 'India',
          price: trip.price,
          image: trip.images?.[0] || '/images/default-trip.jpg',
          highlights: trip.tags?.slice(0, 3) || ['Adventure', 'Culture', 'Nature'],
          bestTime: 'Oct - Mar',
          difficulty: trip.difficulty === 'easy' ? 'Easy' : trip.difficulty === 'moderate' ? 'Moderate' : 'Challenging',
          rating: 4.5,
          tripsCount: Math.floor(Math.random() * 50) + 10,
          duration: trip.duration || 7,
          description: trip.description || 'An amazing adventure awaits you'
        }));
        setDestinations(destinationData);
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
        setDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    };

    if (isOpen) {
      fetchDestinations();
    }
  }, [isOpen]);

  // Prevent body scroll and ensure modal visibility
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Ensure modal appears on top of everything
      const modalElement = document.querySelector('[data-modal="book-now"]');
      if (modalElement) {
        (modalElement as HTMLElement).style.zIndex = '10000';
      }
      
      // Small delay to ensure DOM is updated, then ensure modal is visible
      setTimeout(() => {
        const modalContainer = document.querySelector('[data-modal="book-now"]');
        if (modalContainer) {
          modalContainer.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      }, 50);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
    const durationMultiplier = Math.max(1, duration / 7);
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
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2500));
    setCurrentStep('confirmation');
    setIsBooking(false);
  };

  const resetModal = () => {
    setCurrentStep('destination');
    setSelectedDestination(initialDestination?.id || '');
    setStartDate('');
    setDuration(initialDestination?.duration || 7);
    setTravelers(1);
    setContactInfo({ name: '', email: '', phone: '' });
    setSpecialRequests('');
    setErrors({});
    setIsBooking(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Force scroll to top when modal opens
  useEffect(() => {
    if (isOpen) {
      // Immediately scroll to top
      window.scrollTo(0, 0);
      // Lock scroll
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-modal="book-now"
          className="fixed inset-0 z-[99999] modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              maxHeight: '90vh',
              maxWidth: '64rem',
              width: '100%',
              position: 'relative',
              zIndex: 100000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Book Your Adventure</h2>
                <p className="text-orange-100">Discover amazing destinations and create unforgettable memories</p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center space-x-8 mt-6">
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
                        isActive ? 'bg-white text-orange-600 shadow-lg' : 'bg-white/30 text-white'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div className="ml-3 hidden sm:block">
                        <span className={`text-sm font-medium block ${
                          isActive ? 'text-white' : isCompleted ? 'text-green-200' : 'text-orange-100'
                        }`}>
                          Step {index + 1}
                        </span>
                        <span className={`text-xs block ${
                          isActive ? 'text-orange-100' : isCompleted ? 'text-green-200' : 'text-orange-200'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {index < 2 && (
                        <div className={`w-12 h-1 mx-4 rounded-full transition-all ${
                          isCompleted ? 'bg-green-500' : 'bg-white/30'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {currentStep === 'destination' && (
                  <motion.div
                    key="destination"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Destination</h3>
                      <p className="text-gray-600">Select the perfect adventure for your journey</p>
                    </div>

                    {errors.destination && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                        {errors.destination}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {loadingDestinations ? (
                        Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="rounded-xl overflow-hidden border-2 border-gray-200">
                            <div className="w-full h-32 bg-gray-200 animate-pulse" />
                            <div className="p-4">
                              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                            </div>
                          </div>
                        ))
                      ) : destinations.length === 0 ? (
                        <div className="col-span-2 text-center py-12">
                          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No destinations available at the moment.</p>
                        </div>
                      ) : (
                        destinations.map((dest) => (
                          <motion.div
                            key={dest.id}
                            className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                              selectedDestination === dest.id ? 'border-orange-500 ring-2 ring-orange-200 shadow-lg' : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                            }`}
                            onClick={() => {
                              setSelectedDestination(dest.id);
                              setErrors({ ...errors, destination: '' });
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="relative h-32">
                              <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                              {/* Rating Badge */}
                              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                <span className="text-xs font-bold text-gray-800">{dest.rating}</span>
                              </div>

                              {/* Selected Indicator */}
                              {selectedDestination === dest.id && (
                                <motion.div
                                  className="absolute top-3 left-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                >
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </div>

                            <div className="p-4 bg-white">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-bold text-gray-900 text-lg">{dest.name}</h4>
                                  <p className="text-sm text-gray-600">{dest.country}</p>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  dest.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {dest.difficulty}
                                </div>
                              </div>

                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dest.description}</p>

                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {dest.duration} days
                                </div>
                                <div className="text-sm text-gray-600">{dest.bestTime}</div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="text-xl font-bold text-orange-600">
                                  ₹{dest.price.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">{dest.tripsCount} trips</div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    {selectedDestination && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200"
                      >
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Award className="h-5 w-5 mr-2 text-orange-600" />
                          Experience Highlights
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {getSelectedDestination()?.highlights.map((highlight, index) => (
                            <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
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
                    className="p-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Trip Details</h3>
                      <p className="text-gray-600">Complete your booking information</p>
                    </div>

                    {/* Trip Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                              setStartDate(e.target.value);
                              setErrors({ ...errors, startDate: '' });
                            }}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                              errors.startDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                            min={new Date().toISOString().split('T')[0]}
                          />
                          {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                          <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          >
                            {[3, 5, 7, 10, 14, 21].map(days => (
                              <option key={days} value={days}>{days} days</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Travelers</label>
                          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                            <button
                              onClick={() => setTravelers(Math.max(1, travelers - 1))}
                              className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
                              disabled={travelers <= 1}
                            >
                              -
                            </button>
                            <div className="text-center">
                              <div className="flex items-center">
                                <Users className="h-5 w-5 text-gray-500 mr-2" />
                                <span className="text-xl font-bold text-gray-900">{travelers}</span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {travelers === 1 ? 'person' : 'people'}
                              </span>
                            </div>
                            <button
                              onClick={() => setTravelers(Math.min(12, travelers + 1))}
                              className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
                              disabled={travelers >= 12}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                          <textarea
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-colors"
                            rows={3}
                            placeholder="Dietary needs, accessibility, preferences..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={contactInfo.name}
                            onChange={(e) => {
                              setContactInfo({ ...contactInfo, name: e.target.value });
                              setErrors({ ...errors, name: '' });
                            }}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                              errors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Your full name"
                          />
                          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={contactInfo.email}
                            onChange={(e) => {
                              setContactInfo({ ...contactInfo, email: e.target.value });
                              setErrors({ ...errors, email: '' });
                            }}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                              errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="your@email.com"
                          />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={contactInfo.phone}
                            onChange={(e) => {
                              setContactInfo({ ...contactInfo, phone: e.target.value });
                              setErrors({ ...errors, phone: '' });
                            }}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                              errors.phone ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="+91 9876543210"
                          />
                          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    {selectedDestination && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200"
                      >
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-orange-600" />
                          Price Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Destination:</span>
                              <span className="font-semibold text-gray-900">{getSelectedDestination()?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Travelers:</span>
                              <span className="font-semibold">{travelers} × ₹{destinations.find(d => d.id === selectedDestination)?.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-semibold">{duration} days ({(duration / 7).toFixed(1)}×)</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center md:justify-end">
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                              <div className="text-3xl font-bold text-orange-600">₹{calculatePrice().toLocaleString()}</div>
                              <div className="text-sm text-gray-500">per person</div>
                            </div>
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
                    className="p-6 text-center"
                  >
                    {/* Success Animation */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>

                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                      <p className="text-gray-600">
                        Your adventure to {getSelectedDestination()?.name} has been successfully booked.
                      </p>
                    </div>

                    {/* Booking Details Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 mb-6"
                    >
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center justify-center">
                        <Calendar className="w-5 mr-2 text-green-600" />
                        Booking Details
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-3">
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

                        <div className="space-y-3">
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
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <h5 className="font-semibold text-gray-900 mb-2">Special Requests:</h5>
                          <p className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg">{specialRequests}</p>
                        </div>
                      )}
                    </motion.div>

                    {/* Next Steps */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6"
                    >
                      <h5 className="font-semibold text-blue-900 mb-3">What's Next?</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
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
                      className="flex flex-col sm:flex-row gap-3 justify-center"
                    >
                      <button
                        onClick={() => window.print()}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4 rotate-90" />
                        Print Details
                      </button>
                      <button
                        onClick={() => {
                          navigator.share?.({
                            title: 'My Adventure Booking',
                            text: `I'm excited for my trip to ${getSelectedDestination()?.name}!`,
                            url: window.location.href
                          });
                        }}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Share Booking
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>

              <div className="flex gap-3">
                {currentStep !== 'destination' && currentStep !== 'confirmation' && (
                  <button
                    onClick={() => setCurrentStep('destination')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                )}

                {currentStep === 'destination' && selectedDestination && (
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {currentStep === 'details' && (
                  <button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
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
                    onClick={handleClose}
                    className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default BookNowModal;