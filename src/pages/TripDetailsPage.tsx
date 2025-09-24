import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Car,
  Star,
  CheckCircle,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Heart,
  Share2,
  Shield,
  Award,
  Clock as ClockIcon,
  Mountain,
  Utensils,
  Bed,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Loader } from '@/components/ui/loader';
import type { Slot } from '@/lib/types';
function TripDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [travelerCount, setTravelerCount] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch trip details
  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => apiClient.getTrip(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (trip?.upcomingSlots && trip.upcomingSlots.length > 0) {
      const firstAvailable = trip.upcomingSlots.find((slot: Slot) => slot.availableSeats > 0);
      if (firstAvailable) {
        setSelectedDate(firstAvailable.id);
      }
    }
  }, [trip]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h2>
          <Button onClick={() => navigate('/trips')} className="bg-orange-500 hover:bg-orange-600">
            Back to Trips
          </Button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!selectedDate) {
      toast({
        title: "No Date Selected",
        description: "Please select a date for your trip.",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to seat selection page
    navigate(`/book/${selectedDate}/seat-selection`);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % trip.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + trip.images.length) % trip.images.length);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Trip removed from your favorites" : "Trip added to your favorites",
    });
  };

  const shareTrip = () => {
    if (navigator.share) {
      navigator.share({
        title: trip.title,
        text: trip.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Trip link copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Enhanced Hero Section with Interactive Gallery */}
      <div className="relative">
        <div className="h-[70vh] overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={trip.images[currentImageIndex]}
              alt={trip.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>

          {/* Image Navigation */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-200"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {trip.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={toggleFavorite}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-200"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
            </button>
            <button
              onClick={shareTrip}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-200"
            >
              <Share2 className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-200"
            >
              <ZoomIn className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                    {trip.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-white text-white">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {trip.rating} ({trip.reviewCount} reviews)
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{trip.title}</h1>
                <div className="flex flex-wrap items-center text-white/90 space-x-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="font-medium">Ladakh, India</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{trip.duration} days</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>Max 12 people</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">₹{trip.price.toLocaleString()}</div>
                  <div className="text-white/80 text-sm">per person</div>
                  <div className="text-white/60 text-xs mt-1">All inclusive</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
              <div className="flex">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'itinerary', label: 'Itinerary', icon: MapPin },
                  { id: 'inclusions', label: 'Inclusions', icon: CheckCircle }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex-1 px-6 py-4 font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Overview Section */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-orange-100">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900">Trip Overview</CardTitle>
                    <CardDescription className="text-gray-600">
                      Discover the essence of this incredible journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-700 text-lg leading-relaxed">{trip.description}</p>

                    {/* Trip Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                        <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 text-lg">{trip.duration}</div>
                        <div className="text-sm text-gray-600">Days</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                        <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 text-lg">{trip.rating}</div>
                        <div className="text-sm text-gray-600">Rating</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                        <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 text-lg">{trip.reviewCount}</div>
                        <div className="text-sm text-gray-600">Reviews</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                        <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 text-lg">Expert</div>
                        <div className="text-sm text-gray-600">Guides</div>
                      </div>
                    </div>

                    {/* Trust Signals */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-6 w-6 text-green-600" />
                          <span className="font-semibold text-gray-900">100% Safe & Secure</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="h-6 w-6 text-blue-600" />
                          <span className="font-semibold text-gray-900">Expert Guides</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-6 w-6 text-orange-600" />
                          <span className="font-semibold text-gray-900">24/7 Support</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Enhanced Itinerary Section */}
            {activeTab === 'itinerary' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-orange-100">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900">Detailed Itinerary</CardTitle>
                    <CardDescription className="text-gray-600">
                      Your day-by-day adventure breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {trip.itinerary?.map((day, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative"
                        >
                          <div className="flex">
                            <div className="flex flex-col items-center mr-6">
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-lg shadow-lg">
                                {day.day}
                              </div>
                              {index !== trip.itinerary.length - 1 && (
                                <div className="h-16 w-0.5 bg-gradient-to-b from-orange-300 to-orange-100 my-2" />
                              )}
                            </div>
                            <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-orange-100">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-bold text-xl text-gray-900">{day.title}</h3>
                                <Badge variant="outline" className="border-orange-300 text-orange-700">
                                  Day {day.day}
                                </Badge>
                              </div>
                              <p className="text-gray-700 mb-4 leading-relaxed">{day.description}</p>

                              {/* Activities */}
                              {day.activities && day.activities.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <Mountain className="h-4 w-4 mr-2 text-orange-600" />
                                    Activities
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {day.activities.map((activity, actIndex) => (
                                      <Badge key={actIndex} variant="secondary" className="bg-orange-100 text-orange-800">
                                        {activity}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Meals & Accommodation */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {day.meals && (
                                  <div className="flex items-center space-x-2">
                                    <Utensils className="h-4 w-4 text-orange-600" />
                                    <span className="text-gray-600">Meals: <span className="font-medium text-gray-900">{day.meals}</span></span>
                                  </div>
                                )}
                                {day.accommodation && (
                                  <div className="flex items-center space-x-2">
                                    <Bed className="h-4 w-4 text-orange-600" />
                                    <span className="text-gray-600">Stay: <span className="font-medium text-gray-900">{day.accommodation}</span></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Enhanced Inclusions Section */}
            {activeTab === 'inclusions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-800">
                        <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                        What's Included
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {trip.inclusions?.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
                    <CardHeader>
                      <CardTitle className="text-red-800">What's Not Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {trip.exclusions?.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <Minus className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Interactive Availability Panel */}
            <Card className="border-orange-200 shadow-lg bg-gradient-to-br from-white to-orange-50">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Your Adventure
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Select your preferred date and group size
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Date Selection */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                    Select Date
                  </h4>
                  <div className="space-y-3">
                    {trip?.upcomingSlots?.slice(0, 5).map((slot: Slot) => (
                      <motion.div
                        key={slot.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          selectedDate === slot.id
                            ? 'border-orange-500 bg-orange-50 shadow-md'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                        }`}
                        onClick={() => setSelectedDate(slot.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {new Date(slot.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {slot.time}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-orange-600">
                              ₹{slot.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">per person</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Car className="h-3 w-3 mr-1" />
                            <span>{slot.vehicleType}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                slot.availableSeats > 5
                                  ? 'default'
                                  : slot.availableSeats > 0
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {slot.availableSeats > 5
                                ? 'Available'
                                : slot.availableSeats > 0
                                ? `${slot.availableSeats} left`
                                : 'Full'}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-orange-200" />

                {/* Traveler Selection */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-orange-600" />
                    Number of Travelers
                  </h4>
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{travelerCount} Traveler{travelerCount > 1 ? 's' : ''}</div>
                        <div className="text-sm text-gray-600">Total cost: ₹{(trip.price * travelerCount).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTravelerCount(Math.max(1, travelerCount - 1))}
                        disabled={travelerCount <= 1}
                        className="border-orange-300 hover:bg-orange-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{travelerCount}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTravelerCount(Math.min(10, travelerCount + 1))}
                        disabled={travelerCount >= 10}
                        className="border-orange-300 hover:bg-orange-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trip cost × {travelerCount}</span>
                      <span className="font-medium">₹{(trip.price * travelerCount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium">₹{(trip.price * travelerCount * 0.05).toLocaleString()}</span>
                    </div>
                    <Separator className="bg-orange-300" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-gray-900">Total</span>
                      <span className="text-orange-600">₹{Math.round(trip.price * travelerCount * 1.05).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 text-lg shadow-lg"
                  size="lg"
                  onClick={handleBookNow}
                >
                  Book Now - ₹{Math.round(trip.price * travelerCount * 1.05).toLocaleString()}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-1">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Free cancellation up to 24 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Signals Sidebar */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Why Choose Us?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Expert Local Guides</div>
                    <div className="text-sm text-gray-600">Certified professionals with 10+ years experience</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">100% Safe & Secure</div>
                    <div className="text-sm text-gray-600">Comprehensive travel insurance included</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">24/7 Support</div>
                    <div className="text-sm text-gray-600">Round-the-clock assistance throughout your journey</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Small Groups</div>
                    <div className="text-sm text-gray-600">Maximum 12 travelers for personalized experience</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={trip.images[currentImageIndex]}
                alt={trip.title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-2 transition-all duration-200"
              >
                <EyeOff className="h-6 w-6 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TripDetailsPage;