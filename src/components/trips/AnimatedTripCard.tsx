import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar, Users, Star, Clock, IndianRupee } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import type { Trip } from '../../lib/types';

interface AnimatedTripCardProps {
  trip: Trip;
  index?: number;
}

export function AnimatedTripCard({ trip, index = 0 }: AnimatedTripCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Card className="overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-0">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={trip.images[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.title)}&size=400&background=orange&color=white`}
            alt={trip.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.title)}&size=400&background=orange&color=white`;
              setImageLoaded(true);
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: imageLoaded ? 1 : 1.1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Like Button */}
          <motion.button
            className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            onClick={handleLike}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: isLiked ? 1.1 : 1 }}
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
            />
          </motion.button>

          {/* Difficulty Badge */}
          <div className="absolute top-3 left-3">
            <Badge
              variant={trip.difficulty === 'easy' ? 'secondary' : trip.difficulty === 'moderate' ? 'default' : 'destructive'}
              className="bg-white/90 text-gray-900 hover:bg-white capitalize"
            >
              {trip.difficulty}
            </Badge>
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
            <div className="flex items-center text-sm font-semibold text-gray-900">
              <IndianRupee className="w-3 h-3" />
              {trip.price.toLocaleString()}
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Title and Rating */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
              {trip.title}
            </h3>
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(trip.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-1">
                {trip.rating} ({trip.reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {trip.description}
          </p>

          {/* Trip Details */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{trip.tags.find(tag => tag.includes('Region')) || trip.tags[0] || 'India'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{trip.duration} days</span>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{trip.upcomingSlots?.[0]?.availableSeats || 'Available'}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {trip.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {trip.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{trip.tags.length - 3} more
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Link to={`/trips/${trip.slug}`} className="flex-1">
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                size="sm"
              >
                View Details
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="px-3"
            >
              <Clock className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}