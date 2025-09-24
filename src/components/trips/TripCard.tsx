import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, ArrowRight, Heart, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Trip } from '../../lib/types';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusInfo = () => {
    const availableSlots = trip.upcomingSlots.filter(slot => slot.status !== 'sold_out');
    if (availableSlots.length === 0) {
      return { text: 'Sold Out', color: 'bg-red-500' };
    }
    
    const fillingFast = availableSlots.some(slot => slot.status === 'filling_fast');
    if (fillingFast) {
      return { text: 'Filling Fast', color: 'bg-orange-500' };
    }
    
    return { text: 'Available', color: 'bg-green-500' };
  };

  const status = getStatusInfo();

  // Get the next available date
  const getNextAvailableDate = () => {
    if (trip.upcomingSlots.length > 0) {
      const sortedSlots = [...trip.upcomingSlots].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const nextSlot = sortedSlots[0];
      return new Date(nextSlot.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
    return 'Coming Soon';
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full group cursor-pointer relative rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all"
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
          />
        </button>

        <Link to={`/trips/${trip.slug}`}>
          <div className="relative">
            <div className="relative overflow-hidden">
              <img
                src={trip.images[0]}
                alt={trip.title}
                className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="absolute top-3 left-3">
              <Badge className={`${status.color} text-white border-none`}>
                {status.text}
              </Badge>
            </div>
            
            <div className="absolute top-3 right-12">
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                {trip.duration} days
              </Badge>
            </div>
            
            {/* Price Tag */}
            <div className="absolute bottom-3 left-3 bg-primary text-white px-3 py-1 rounded-full font-bold text-sm">
              ₹{trip.price.toLocaleString()}
              <span className="text-xs font-normal block">per person</span>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{trip.rating}</span>
                <span className="text-sm text-gray-500">({trip.reviewCount})</span>
              </div>
              <Badge className={getDifficultyColor(trip.difficulty)}>
                {trip.difficulty}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {trip.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {trip.description}
            </p>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {getNextAvailableDate()}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {trip.upcomingSlots.reduce((acc, slot) => acc + slot.availableSeats, 0)} seats left
              </div>
            </div>

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

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white transition-colors rounded-full text-sm">
                View Details
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
              
              <div className="text-right">
                <div className="text-xs text-gray-500">Next departure</div>
                <div className="font-semibold text-sm">{getNextAvailableDate()}</div>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}