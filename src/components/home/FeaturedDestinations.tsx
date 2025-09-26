import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Users, Play, Heart, MapPin, Calendar, ArrowRight, Eye, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import type { Trip } from '../../lib/types';

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  video?: string;
  rating: number;
  tripsCount: number;
  description: string;
  highlights: string[];
  bestTime: string;
  duration: string;
  price: number;
}

interface DestinationCardProps {
  destination: Destination;
  index: number;
}

function DestinationCard({ destination, index }: DestinationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.1,
        duration: 0.5
      }}
      whileHover={{ y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative cursor-pointer"
      data-destination-card
    >
      <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl transform-gpu">
        {/* Front Card */}
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={destination.image || '/images/default-trip.jpg'}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {/* Floating Elements */}
              <div className="absolute top-4 left-4 z-20">
                <Badge className="bg-white/90 text-gray-800 border-0 shadow-lg backdrop-blur-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {destination.country || 'India'}
                </Badge>
              </div>

              {/* Rating Badge */}
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center shadow-lg">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-bold text-gray-800">4.5</span>
                </div>
              </div>

              {/* Like Button */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className="absolute top-4 right-16 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={isLiked ? { backgroundColor: "rgba(249, 115, 22, 0.9)" } : {}}
              >
                <Heart
                  className={`h-4 w-4 ${isLiked ? 'fill-current text-white' : 'text-gray-600'}`}
                />
              </motion.button>

              {/* Video Play Button */}
              {destination.video && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVideo(true);
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl">
                    <Play className="h-6 w-6 text-orange-600 ml-1" />
                  </div>
                </motion.button>
              )}

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                <h3 className="text-2xl font-bold mb-2">
                  {destination.name}
                </h3>

                <p className="text-white/90 mb-4 line-clamp-2">
                  {destination.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {destination.tripsCount || 1} trips
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {destination.duration || `${destination.duration || 3} days`}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="rounded-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-3xl"
                initial={{ opacity: 0 }}
                animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ) : (
            /* Back Card */
            <motion.div
              key="back"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 p-6 flex flex-col justify-between"
            >
              <div>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                  className="mb-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowRight className="h-4 w-4 text-white rotate-180" />
                </motion.button>

                <h3 className="text-2xl font-bold text-white mb-4">{destination.name}</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-white/90">
                    <span className="font-medium">Best Time to Visit:</span>
                    <span>{destination.bestTime || 'Year-round'}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/90">
                    <span className="font-medium">Duration:</span>
                    <span>{destination.duration || `${destination.duration || 3} days`}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/90">
                    <span className="font-medium">Starting from:</span>
                    <span className="font-bold">₹{destination.price?.toLocaleString() || 'Contact for price'}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">Highlights:</h4>
                  <ul className="space-y-2">
                    {(destination.highlights || ['Adventure', 'Culture', 'Nature']).map((highlight, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center text-white/90 text-sm"
                      >
                        <div className="w-2 h-2 bg-white rounded-full mr-3 flex-shrink-0" />
                        {highlight}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  className="flex-1 bg-white text-orange-600 hover:bg-gray-100 rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  Book Now
                </Button>
                <Button
                  variant="outline"
                  className="px-4 border-white/30 text-white hover:bg-white/10 rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Modal */}
        <AnimatePresence>
          {showVideo && destination.video && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-30 rounded-3xl"
              onClick={(e) => {
                e.stopPropagation();
                setShowVideo(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-full h-full max-w-md max-h-64 bg-black rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <video
                  src={destination.video}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function FeaturedDestinations() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch popular trips from API
  const { data: popularTrips = [], isLoading, error } = useQuery({
    queryKey: ['popular-trips'],
    queryFn: () => apiClient.getTrips({ featured: 'popular' }),
  });

  // Convert trips to destination format
  const destinations: Destination[] = popularTrips.slice(0, 4).map((trip: Trip) => ({
    id: trip.id.toString(),
    name: trip.title,
    country: 'India',
    image: trip.images?.[0] || '/images/default-trip.jpg',
    rating: 4.5,
    tripsCount: 1,
    description: trip.description || trip.overview || 'Amazing adventure experience',
    highlights: trip.tags || ['Adventure', 'Culture'],
    bestTime: 'Year-round',
    duration: `${trip.duration} days`,
    price: trip.price
  }));

  const categories = [
    { id: 'all', name: 'All Destinations' },
    { id: 'mountains', name: 'Mountains' },
    { id: 'beaches', name: 'Beaches' },
    { id: 'cultural', name: 'Cultural' },
    { id: 'adventure', name: 'Adventure' }
  ];

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-white via-orange-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading popular destinations...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-white via-orange-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Unable to load popular destinations at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="featured-destinations"
      className="py-20 bg-gradient-to-br from-white via-orange-50/30 to-white relative overflow-hidden transition-all duration-500"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-orange-200/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-48 h-48 bg-orange-300/10 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-6 shadow-lg"
          >
            <MapPin className="h-8 w-8 text-white" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Popular{' '}
            <motion.span
              className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              Destinations
            </motion.span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our most sought-after travel destinations around the world.
            Each destination tells a unique story of adventure and discovery.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg border-0'
                    : 'border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400'
                }`}
              >
                {category.name}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {destinations.map((destination, index) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              index={index}
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-10 py-4 text-lg font-semibold border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="mr-3">Explore All Destinations</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}