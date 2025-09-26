import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, User, Calendar, MapPin, Gift, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { config } from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  destination: string;
  travelDate: string;
  travelers: string;
  interests: string[];
  budget: string;
  experience: string;
  leadId?: string;
}

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCaptured: (leadData: LeadData) => void;
}

export function LeadCaptureModal({ isOpen, onClose, onLeadCaptured }: LeadCaptureModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    travelDate: '',
    travelers: '1',
    interests: [] as string[],
    budget: '',
    experience: ''
  });
  const { toast } = useToast();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store original overflow and position
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;

      // Prevent scroll and maintain position
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = '100%';

      // Restore on cleanup
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;

        // Restore scroll position
        window.scrollTo(0, parseInt(originalTop || '0', 10) * -1);
      };
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the modal when it opens
      const modal = document.querySelector('[role="dialog"]') as HTMLElement;
      if (modal) {
        modal.focus();
      }

      // Prevent tabbing outside modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }

        if (e.key === 'Tab') {
          const modal = document.querySelector('[role="dialog"]') as HTMLElement;
          if (modal) {
            const focusableElements = modal.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
              }
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/leads/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        onLeadCaptured({ ...formData, leadId: result.lead_id });

        toast({
          title: "🎉 Welcome to Adventure Buddha!",
          description: "We'll send you personalized trip recommendations within 24 hours!",
        });

        // Reset form
        setFormData({
          name: '', email: '', phone: '', destination: '', travelDate: '',
          travelers: '1', interests: [], budget: '', experience: ''
        });
        setStep(1);
        onClose();
      } else {
        throw new Error('Failed to submit lead');
      }
    } catch (error) {
      console.error('Lead capture error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly at +91-9876543210",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch destinations from backend trips
  const { data: trips = [] } = useQuery({
    queryKey: ['trips-for-destinations'],
    queryFn: () => apiClient.getTrips(),
  });

  // Extract unique destinations from trips
  const destinations = Array.from(new Set(
    trips.flatMap(trip => 
      trip.tags.filter(tag => 
        ['kashmir', 'goa', 'rajasthan', 'kerala', 'ladakh', 'himachal', 'uttarakhand', 'sikkim', 'meghalaya', 'arunachal', 'karnataka', 'maharashtra', 'gujarat', 'punjab', 'haryana', 'delhi', 'uttar pradesh', 'bihar', 'jharkhand', 'west bengal', 'odisha', 'chhattisgarh', 'madhya pradesh', 'andhra pradesh', 'telangana', 'tamil nadu', 'puducherry', 'lakshadweep', 'andaman', 'nicobar'].includes(tag.toLowerCase())
      )
    )
  )).map(dest => dest.charAt(0).toUpperCase() + dest.slice(1)).sort();

  const interests = [
    'Trekking', 'Photography', 'Cultural Tours', 'Adventure Sports',
    'Wildlife', 'Spiritual Retreats', 'Luxury Travel', 'Budget Travel'
  ];

  const budgetRanges = [
    'Under ₹25,000', '₹25,000 - ₹50,000', '₹50,000 - ₹1,00,000',
    '₹1,00,000 - ₹2,00,000', 'Above ₹2,00,000'
  ];

  const experienceLevels = [
    'First Time Traveler', 'Some Experience', 'Frequent Traveler', 'Expert'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden sm:max-w-md md:max-w-lg"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: 'calc(100vh - 1rem)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with special offer */}
            <div className="flex-shrink-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-4 sm:p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5" />
                      <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                        LIMITED TIME
                      </span>
                    </div>
                    <h2 id="modal-title" className="text-2xl font-bold mb-1">🌟 Exclusive Offer!</h2>
                    <p className="text-orange-100 text-sm">Get 15% off your first adventure trip + Free travel consultation</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full ml-2 flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex-shrink-0 px-4 sm:px-6 pt-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                {[1, 2].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNum
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > stepNum ? <CheckCircle className="h-4 w-4" /> : stepNum}
                    </div>
                    {stepNum < 2 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        step > stepNum ? 'bg-orange-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-gray-600 mb-4">
                {step === 1 ? "Tell us about yourself" : "Plan your perfect trip"}
              </div>
            </div>

            {/* Form Content - Scrollable area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6" id="modal-description">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="pl-10 h-12"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="pl-10 h-12"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="Your phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="pl-10 h-12"
                        required
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Star className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900 text-sm">Why share your details?</h4>
                          <p className="text-blue-700 text-xs mt-1">
                            We'll create a personalized itinerary and send exclusive deals just for you.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-medium"
                      disabled={!formData.name || !formData.email || !formData.phone}
                    >
                      Continue to Trip Details →
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Trip Preferences */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Select value={formData.destination} onValueChange={(value) => setFormData({...formData, destination: value})}>
                        <SelectTrigger className="pl-10 h-12">
                          <SelectValue placeholder="Preferred destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {destinations.map(dest => (
                            <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        value={formData.travelDate}
                        onChange={(e) => setFormData({...formData, travelDate: e.target.value})}
                        className="pl-10 h-12"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Select value={formData.travelers} onValueChange={(value) => setFormData({...formData, travelers: value})}>
                          <SelectTrigger className="pl-10 h-12">
                            <SelectValue placeholder="Travelers" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Select value={formData.experience} onValueChange={(value) => setFormData({...formData, experience: value})}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Experience" />
                        </SelectTrigger>
                        <SelectContent>
                          {experienceLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Select value={formData.budget} onValueChange={(value) => setFormData({...formData, budget: value})}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Budget per person" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map(range => (
                          <SelectItem key={range} value={range}>{range}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Interests (optional)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {interests.map(interest => (
                          <label key={interest} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={formData.interests.includes(interest)}
                              onChange={(e) => {
                                const newInterests = e.target.checked
                                  ? [...formData.interests, interest]
                                  : formData.interests.filter(i => i !== interest);
                                setFormData({...formData, interests: newInterests});
                              }}
                              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            {interest}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 h-12"
                      >
                        ← Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-orange-500 hover:bg-orange-600 h-12 text-base font-medium"
                        disabled={isSubmitting || !formData.destination}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            Get My Free Quote!
                          </div>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </form>

              {/* Footer - Fixed at bottom */}
              <div className="flex-shrink-0 mt-4 sm:mt-6 pt-4 border-t border-gray-200 px-4 sm:px-6">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>100% Free Consultation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>No Spam Guarantee</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Expert Guidance</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  We respect your privacy. Unsubscribe anytime. | 📞 Call us: +91-9876543210
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}