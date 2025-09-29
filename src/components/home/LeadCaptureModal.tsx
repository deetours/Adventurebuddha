import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, User, Phone, Sparkles, Gift, ChevronRight, ChevronLeft, MapPin, Star, Clock, IndianRupee } from "lucide-react";

interface Trip {
  id: string;
  slug: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  duration: number;
  tags: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  rating: number;
  reviewCount: number;
  featured_status?: 'featured' | 'popular' | 'both' | 'none';
}

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCaptured: (leadData: { name: string; email: string; phone: string; interestedTrips: string[] }) => void;
}

type Step = 'details' | 'trips' | 'confirm';

export function LeadCaptureModal({ isOpen, onClose, onLeadCaptured }: LeadCaptureModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);

  // Reset state when modal opens (do not block page scroll)
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('details');
      setName("");
      setEmail("");
      setPhone("");
      setSelectedTrips([]);
    }
  }, [isOpen]);

  // Fetch trips when moving to trips step
  useEffect(() => {
    if (currentStep === 'trips' && availableTrips.length === 0) {
      fetchTrips();
    }
  }, [currentStep, availableTrips.length]);

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const fetchTrips = async () => {
    setIsLoadingTrips(true);
    try {
      const apiUrls = [
        'http://68.233.115.38:8000/api/trips/',
        'http://127.0.0.1:8000/api/trips/',
        'http://127.0.0.1:3001/api/trips/'
      ];

      for (const url of apiUrls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            const trips = data.results || data;
            // Get featured and popular trips for qualification
            const qualifiedTrips = trips.filter((trip: Trip) => 
              trip.featured_status === 'featured' || 
              trip.featured_status === 'popular' || 
              trip.featured_status === 'both'
            ).slice(0, 6); // Limit to 6 trips for better UX
            setAvailableTrips(qualifiedTrips);
            break;
          }
        } catch {
          continue;
        }
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setIsLoadingTrips(false);
    }
  };

  const handleTripSelection = (tripId: string) => {
    setSelectedTrips(prev => 
      prev.includes(tripId) 
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    );
  };

  const nextStep = () => {
    if (currentStep === 'details' && name && email) {
      setCurrentStep('trips');
    } else if (currentStep === 'trips') {
      setCurrentStep('confirm');
    }
  };

  const prevStep = () => {
    if (currentStep === 'trips') {
      setCurrentStep('details');
    } else if (currentStep === 'confirm') {
      setCurrentStep('trips');
    }
  };

  const canProceedFromDetails = name.trim() && email.trim();
  const canProceedFromTrips = selectedTrips.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Try VM API first, fallback to local API
      const apiUrls = [
        'http://68.233.115.38:8000/api/leads/',
        'http://127.0.0.1:8000/api/leads/',
        'http://127.0.0.1:3001/api/leads/'
      ];

      let response;
      let success = false;

      for (const url of apiUrls) {
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              interested_trips: selectedTrips
            })
          });

          if (response.ok) {
            success = true;
            break;
          }
        } catch {
          console.log(`Failed to connect to ${url}, trying next...`);
          continue;
        }
      }

      if (success && response) {
        const result = await response.json();
        console.log('Lead captured successfully:', result);

        // Show success message (you can integrate with toast here)
        alert('🎉 Thank you! We\'ll send you personalized offers for your selected trips within 24 hours.');

        onLeadCaptured({ name, email, phone, interestedTrips: selectedTrips });
      } else {
        throw new Error('Failed to submit lead');
      }
    } catch (error) {
      console.error('Lead capture error:', error);
      alert('Sorry, there was an error. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        ReactDOM.createPortal(
          <motion.div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            role="dialog"
            aria-modal="true"
          >
            {/* Enhanced backdrop with better blur */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden="true"
            />

            {/* Modal container with improved positioning and larger size */}
            <motion.div
              className="relative w-full max-w-lg mx-auto z-10 pointer-events-auto"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 26,
                duration: 0.25
              }}
              // Modal handles its own interactions; background remains scrollable
            >
            {/* Floating sparkles animation */}
            <div className="absolute -inset-4 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + (i % 2) * 80}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                >
                  <Sparkles className="w-2 h-2 text-yellow-400" />
                </motion.div>
              ))}
            </div>

          {/* Main modal */}
          <div className="relative bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 overflow-hidden">
            {/* Gradient background overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-3xl" />

            {/* Close button */}
            <motion.button
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-200"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-600" />
            </motion.button>

            {/* Step indicator */}
            <div className="relative z-10 mb-6">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  currentStep === 'details' ? 'bg-blue-500 border-blue-500 text-white' :
                  ['trips', 'confirm'].includes(currentStep) ? 'bg-green-500 border-green-500 text-white' :
                  'border-gray-300 text-gray-400'
                }`}>
                  1
                </div>
                <div className={`h-1 w-12 transition-colors ${
                  ['trips', 'confirm'].includes(currentStep) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  currentStep === 'trips' ? 'bg-blue-500 border-blue-500 text-white' :
                  currentStep === 'confirm' ? 'bg-green-500 border-green-500 text-white' :
                  'border-gray-300 text-gray-400'
                }`}>
                  2
                </div>
                <div className={`h-1 w-12 transition-colors ${
                  currentStep === 'confirm' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  currentStep === 'confirm' ? 'bg-blue-500 border-blue-500 text-white' :
                  'border-gray-300 text-gray-400'
                }`}>
                  3
                </div>
              </div>
              <div className="flex justify-center mt-2 text-sm text-gray-600">
                <span className={currentStep === 'details' ? 'font-semibold text-blue-600' : ''}>Details</span>
                <span className="mx-4">•</span>
                <span className={currentStep === 'trips' ? 'font-semibold text-blue-600' : ''}>Interests</span>
                <span className="mx-4">•</span>
                <span className={currentStep === 'confirm' ? 'font-semibold text-blue-600' : ''}>Confirm</span>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <AnimatePresence mode="wait">
                {currentStep === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex flex-col items-center gap-6"
                  >
                    {/* Enhanced header with gift icon */}
                    <motion.div
                      className="flex flex-col items-center gap-3"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="relative">
                        <motion.div
                          className="p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-xl"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Gift className="w-8 h-8" />
                        </motion.div>
                        {/* Pulsing ring */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl"
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        />
                      </div>

                      <div className="text-center">
                        <motion.h2
                          className="text-2xl font-bold text-gray-900 mb-2"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          🎁 Exclusive Adventure Offer!
                        </motion.h2>
                        <motion.p
                          className="text-gray-600 text-center leading-relaxed"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          Get <strong className="text-purple-600">15% OFF</strong> your first trip +
                          <br />
                          <span className="text-green-600 font-semibold">Free personalized consultation</span>
                        </motion.p>
                      </div>
                    </motion.div>

                    {/* Form */}
                    <motion.form
                      className="w-full flex flex-col gap-4"
                      onSubmit={(e) => e.preventDefault()}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {/* Name field */}
                      <motion.div
                        className="relative group"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="relative">
                          <div className="flex items-center gap-3 bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-blue-300 rounded-2xl px-4 py-3 transition-all duration-300 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100/50 focus-within:shadow-lg focus-within:shadow-blue-100/50">
                            <User className="w-5 h-5 text-blue-500 flex-shrink-0 transition-colors duration-200 group-focus-within:text-blue-600" />
                            <input
                              type="text"
                              placeholder="Your full name"
                              className="bg-transparent outline-none flex-1 text-gray-800 placeholder-gray-400 text-sm transition-colors duration-200 focus:placeholder-gray-300"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              required
                            />
                          </div>
                          {/* Focus ring animation */}
                          <motion.div
                            className="absolute inset-0 rounded-2xl border-2 border-transparent"
                            animate={{
                              borderColor: document.activeElement === document.querySelector('input[placeholder="Your full name"]') ? 'rgba(59, 130, 246, 0.5)' : 'transparent'
                            }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      </motion.div>

                      {/* Email field */}
                      <motion.div
                        className="relative group"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="relative">
                          <div className="flex items-center gap-3 bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-purple-300 rounded-2xl px-4 py-3 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-100/50 focus-within:shadow-lg focus-within:shadow-purple-100/50">
                            <Mail className="w-5 h-5 text-purple-500 flex-shrink-0 transition-colors duration-200 group-focus-within:text-purple-600" />
                            <input
                              type="email"
                              placeholder="your@email.com"
                              className="bg-transparent outline-none flex-1 text-gray-800 placeholder-gray-400 text-sm transition-colors duration-200 focus:placeholder-gray-300"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              required
                            />
                          </div>
                          {/* Focus ring animation */}
                          <motion.div
                            className="absolute inset-0 rounded-2xl border-2 border-transparent"
                            animate={{
                              borderColor: document.activeElement === document.querySelector('input[placeholder="your@email.com"]') ? 'rgba(147, 51, 234, 0.5)' : 'transparent'
                            }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      </motion.div>

                      {/* Phone field */}
                      <motion.div
                        className="relative group"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="relative">
                          <div className="flex items-center gap-3 bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl px-4 py-3 transition-all duration-300 focus-within:bg-white focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100/50 focus-within:shadow-lg focus-within:shadow-emerald-100/50">
                            <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0 transition-colors duration-200 group-focus-within:text-emerald-600" />
                            <input
                              type="tel"
                              placeholder="Your phone number (optional)"
                              className="bg-transparent outline-none flex-1 text-gray-800 placeholder-gray-400 text-sm transition-colors duration-200 focus:placeholder-gray-300"
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                            />
                          </div>
                          {/* Focus ring animation */}
                          <motion.div
                            className="absolute inset-0 rounded-2xl border-2 border-transparent"
                            animate={{
                              borderColor: document.activeElement === document.querySelector('input[placeholder="Your phone number (optional)"]') ? 'rgba(16, 185, 129, 0.5)' : 'transparent'
                            }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      </motion.div>

                      {/* Next button */}
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        disabled={!canProceedFromDetails}
                        className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-semibold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                      >
                        {/* Button background animation */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Continue to Trip Selection
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </motion.div>
                        </span>
                      </motion.button>
                    </motion.form>
                  </motion.div>
                )}

                {currentStep === 'trips' && (
                  <motion.div
                    key="trips"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex flex-col items-center gap-6"
                  >
                    <div className="text-center">
                      <motion.h2
                        className="text-2xl font-bold text-gray-900 mb-2"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        🌟 Which Adventures Interest You?
                      </motion.h2>
                      <motion.p
                        className="text-gray-600 text-center leading-relaxed"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        Select the trips you'd like to know more about. We'll send you personalized offers!
                      </motion.p>
                    </div>

                    {isLoadingTrips ? (
                      <motion.div
                        className="flex flex-col items-center justify-center py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="relative"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                          <motion.div
                            className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          />
                        </motion.div>
                        <motion.span
                          className="mt-4 text-gray-600 font-medium"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Loading amazing trips...
                        </motion.span>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="w-full max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="grid grid-cols-1 gap-3 pr-2">
                          {availableTrips.map((trip, index) => (
                            <motion.div
                              key={trip.id}
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                              }}
                              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                                selectedTrips.includes(trip.id)
                                  ? 'border-blue-500 bg-blue-50/80 shadow-xl shadow-blue-100/50'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/80 hover:shadow-lg hover:shadow-gray-100/50'
                              }`}
                              onClick={() => handleTripSelection(trip.id)}
                              whileHover={{
                                scale: 1.02,
                                boxShadow: selectedTrips.includes(trip.id)
                                  ? "0 20px 40px rgba(59, 130, 246, 0.15)"
                                  : "0 10px 30px rgba(0,0,0,0.1)"
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start gap-3">
                                <motion.div
                                  className="flex-shrink-0"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                >
                                  <img
                                    src={trip.images[0] || '/images/default-trip.jpg'}
                                    alt={trip.title}
                                    className="w-16 h-16 rounded-lg object-cover shadow-sm"
                                  />
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
                                    {trip.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                    <div className="flex items-center gap-1">
                                      <IndianRupee className="w-3 h-3" />
                                      <span className="font-medium">{trip.price.toLocaleString()}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{trip.duration} days</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span>{trip.rating}</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                    {trip.description}
                                  </p>
                                </div>
                                <motion.div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                    selectedTrips.includes(trip.id)
                                      ? 'bg-blue-500 border-blue-500 shadow-lg'
                                      : 'border-gray-300 hover:border-blue-400'
                                  }`}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  {selectedTrips.includes(trip.id) && (
                                    <motion.div
                                      className="w-3 h-3 bg-white rounded-full"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500 }}
                                    />
                                  )}
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-3 w-full mt-6">
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                      >
                        <ChevronLeft className="w-4 h-4 inline mr-2" />
                        Back
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        disabled={!canProceedFromTrips}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 20px 40px rgba(59, 130, 246, 0.2)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                      >
                        {/* Button background animation */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Continue
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </motion.div>
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex flex-col items-center gap-6"
                  >
                    <div className="text-center">
                      <motion.h2
                        className="text-2xl font-bold text-gray-900 mb-2"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        🎯 Ready to Start Your Adventure?
                      </motion.h2>
                      <motion.p
                        className="text-gray-600 text-center leading-relaxed"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        We'll send you exclusive offers and personalized recommendations for your selected trips!
                      </motion.p>
                    </div>

                    {/* Summary */}
                    <div className="w-full bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Your Details:</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{email}</span>
                        </div>
                        {phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{phone}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mt-4 mb-3">Interested Trips ({selectedTrips.length}):</h3>
                      <div className="space-y-2">
                        {selectedTrips.map(tripId => {
                          const trip = availableTrips.find(t => t.id === tripId);
                          return trip ? (
                            <div key={tripId} className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-blue-500" />
                              <span>{trip.title}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3 w-full mt-6">
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                      >
                        <ChevronLeft className="w-4 h-4 inline mr-2" />
                        Back
                      </motion.button>
                      <motion.button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white font-semibold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 25px 50px rgba(34, 197, 94, 0.25)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                      >
                        {/* Button background animation */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-green-700 via-blue-700 to-purple-700"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />

                        {/* Loading overlay */}
                        <AnimatePresence>
                          {isSubmitting && (
                            <motion.div
                              className="absolute inset-0 bg-black/20 flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <motion.div
                                className="flex items-center gap-3"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                              >
                                <motion.div
                                  className="relative"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                                  <motion.div
                                    className="absolute inset-0 w-6 h-6 border-3 border-transparent border-t-green-300 rounded-full"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                  />
                                </motion.div>
                                <span className="text-white font-medium text-sm">Sending...</span>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {!isSubmitting && (
                            <>
                              <motion.div
                                animate={{
                                  rotate: [0, 10, -10, 0],
                                  scale: [1, 1.1, 1]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatDelay: 3
                                }}
                              >
                                <Gift className="w-5 h-5" />
                              </motion.div>
                              Get My Free Offers!
                            </>
                          )}
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trust indicators */}
              <motion.div
                className="flex items-center justify-center gap-4 text-xs text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>100% Free</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>No Spam</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Unsubscribe anytime</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        {/* Close overlay wrapper */}
        </motion.div>,
        document.body
        )
      )}
    </AnimatePresence>
  );
}