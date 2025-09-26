import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { AnimatedTripCard } from '../components/trips/AnimatedTripCard';
import { AdvancedFilters } from '../components/trips/AdvancedFilters';
import { InteractiveMap } from '../components/trips/InteractiveMap';
import { Button } from '../components/ui/button';
import { apiClient } from '../lib/api';
import type { FiltersState, Trip } from '../lib/types';

export default function TripsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<number | null>(null);
  const itemsPerPage = 9;

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FiltersState>(() => ({
    search: searchParams.get('search') || '',
    priceRange: [0, 100000],
    featured: searchParams.get('featured') || undefined,
    difficulty: searchParams.get('difficulty') || undefined,
    duration: searchParams.get('duration') ? parseInt(searchParams.get('duration')!) : undefined,
  }));

  // Fetch trips with filters
  const { data: trips = [], error } = useQuery({
    queryKey: ['trips', filters],
    queryFn: () => apiClient.getTrips(filters as Partial<FiltersState>),
  });

  // Update URL params when filters change
  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
    setPage(1); // Reset pagination

    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.featured) params.set('featured', newFilters.featured);
    if (newFilters.difficulty) params.set('difficulty', newFilters.difficulty);
    if (newFilters.duration) params.set('duration', newFilters.duration.toString());
    
    setSearchParams(params);
  };

  // Create dynamic destinations from trips data
  const destinations = useMemo(() => {
    const locationMap: { [key: string]: { count: number; trips: Trip[] } } = {};
    
    // Group trips by location extracted from tags
    trips.forEach(trip => {
      // Extract location from tags (look for known location tags)
      const locationTags = trip.tags.filter((tag: string) => 
        ['kashmir', 'goa', 'rajasthan', 'kerala', 'ladakh', 'himachal', 'uttarakhand', 'sikkim', 'meghalaya', 'arunachal', 'karnataka', 'maharashtra', 'gujarat', 'punjab', 'haryana', 'delhi', 'uttar pradesh', 'bihar', 'jharkhand', 'west bengal', 'odisha', 'chhattisgarh', 'madhya pradesh', 'andhra pradesh', 'telangana', 'tamil nadu', 'kerala', 'puducherry', 'lakshadweep', 'andaman', 'nicobar'].includes(tag.toLowerCase())
      );
      
      // If no specific location tag found, try to extract from title
      let location = locationTags.length > 0 ? locationTags[0] : null;
      if (!location) {
        const titleWords = trip.title.toLowerCase().split(' ');
        for (const word of titleWords) {
          if (['kashmir', 'goa', 'rajasthan', 'kerala', 'ladakh', 'himachal', 'uttarakhand', 'sikkim', 'meghalaya', 'arunachal', 'karnataka', 'maharashtra', 'gujarat', 'punjab', 'haryana', 'delhi', 'uttar pradesh', 'bihar', 'jharkhand', 'west bengal', 'odisha', 'chhattisgarh', 'madhya pradesh', 'andhra pradesh', 'telangana', 'tamil nadu', 'kerala', 'puducherry', 'lakshadweep', 'andaman', 'nicobar'].includes(word)) {
            location = word;
            break;
          }
        }
      }
      
      // Default to 'India' if no location found
      location = location || 'india';
      
      if (!locationMap[location]) {
        locationMap[location] = { count: 0, trips: [] };
      }
      locationMap[location].count += 1;
      locationMap[location].trips.push(trip);
    });
    
    // Location to coordinates mapping
    const coordinatesMap: { [key: string]: [number, number] } = {
      'kashmir': [74.8, 34.1],
      'goa': [74.1, 15.3],
      'rajasthan': [74.2, 27.0],
      'kerala': [76.3, 10.0],
      'ladakh': [77.6, 34.2],
      'himachal': [77.2, 31.1],
      'uttarakhand': [79.0, 30.0],
      'sikkim': [88.5, 27.3],
      'meghalaya': [91.3, 25.6],
      'arunachal': [94.7, 28.2],
      'karnataka': [75.7, 15.3],
      'maharashtra': [75.7, 19.8],
      'gujarat': [71.2, 22.3],
      'punjab': [75.3, 31.1],
      'haryana': [76.1, 29.1],
      'delhi': [77.1, 28.7],
      'uttar pradesh': [80.9, 27.0],
      'bihar': [85.3, 25.1],
      'jharkhand': [85.3, 23.6],
      'west bengal': [87.9, 22.6],
      'odisha': [84.4, 20.3],
      'chhattisgarh': [81.9, 21.3],
      'madhya pradesh': [78.7, 23.3],
      'andhra pradesh': [79.7, 15.9],
      'telangana': [79.0, 18.1],
      'tamil nadu': [78.7, 11.1],
      'puducherry': [79.8, 11.9],
      'lakshadweep': [72.6, 10.6],
      'andaman': [92.7, 11.7],
      'nicobar': [93.9, 7.9],
      'india': [78.9, 20.6] // Center of India
    };
    
    // Convert to destinations array
    return Object.entries(locationMap).map(([location, data], index) => ({
      id: index + 1,
      name: location.charAt(0).toUpperCase() + location.slice(1),
      coordinates: coordinatesMap[location] || coordinatesMap['india'],
      trips: data.count,
      region: getRegionFromLocation(location),
      description: getDescriptionForLocation(location, data.count),
      image: getImageForLocation(location)
    }));
  }, [trips]);
  
  // Helper functions
  function getRegionFromLocation(location: string): string {
    const regionMap: { [key: string]: string } = {
      'kashmir': 'Northern India',
      'ladakh': 'Northern India',
      'himachal': 'Northern India',
      'uttarakhand': 'Northern India',
      'punjab': 'Northern India',
      'haryana': 'Northern India',
      'delhi': 'Northern India',
      'uttar pradesh': 'Northern India',
      'bihar': 'Northern India',
      'jharkhand': 'Northern India',
      'west bengal': 'Eastern India',
      'odisha': 'Eastern India',
      'sikkim': 'Northeastern India',
      'meghalaya': 'Northeastern India',
      'arunachal': 'Northeastern India',
      'rajasthan': 'Western India',
      'gujarat': 'Western India',
      'goa': 'Western India',
      'maharashtra': 'Western India',
      'madhya pradesh': 'Central India',
      'chhattisgarh': 'Central India',
      'karnataka': 'Southern India',
      'andhra pradesh': 'Southern India',
      'telangana': 'Southern India',
      'tamil nadu': 'Southern India',
      'kerala': 'Southern India',
      'puducherry': 'Southern India',
      'lakshadweep': 'Island Territories',
      'andaman': 'Island Territories',
      'nicobar': 'Island Territories'
    };
    return regionMap[location] || 'India';
  }
  
  function getDescriptionForLocation(location: string, _tripCount: number): string { // eslint-disable-line @typescript-eslint/no-unused-vars
    const descriptions: { [key: string]: string } = {
      'kashmir': 'Paradise on earth with stunning valleys and lakes',
      'goa': 'Beaches and vibrant culture with Portuguese heritage',
      'rajasthan': 'Land of kings with rich cultural heritage and palaces',
      'kerala': 'God\'s own country with backwaters and spice gardens',
      'ladakh': 'High altitude desert with monasteries and mountains',
      'himachal': 'Hill stations and adventure sports paradise',
      'uttarakhand': 'Devbhumi with spiritual and adventure destinations',
      'sikkim': 'Hidden paradise with monasteries and biodiversity',
      'meghalaya': 'Abode of clouds with living root bridges',
      'arunachal': 'Land of dawn-lit mountains and tribal culture',
      'karnataka': 'Land of diverse cultures and natural wonders',
      'maharashtra': 'From beaches to forts, a land of diversity',
      'gujarat': 'Home to wildlife sanctuaries and cultural heritage',
      'punjab': 'Land of five rivers with rich history and cuisine',
      'haryana': 'Agricultural heartland with historical monuments',
      'delhi': 'Capital city blending ancient and modern India',
      'uttar pradesh': 'Cradle of Indian civilization and spirituality',
      'bihar': 'Land of ancient universities and Buddhist sites',
      'jharkhand': 'Mineral-rich state with waterfalls and wildlife',
      'west bengal': 'Cultural capital with colonial heritage',
      'odisha': 'Temple city with beaches and tribal culture',
      'chhattisgarh': 'Tribal heartland with waterfalls and forests',
      'madhya pradesh': 'Heart of India with ancient temples and forts',
      'andhra pradesh': 'Rice bowl of India with temples and beaches',
      'telangana': 'High-tech city with ancient fortresses',
      'tamil nadu': 'Dravidian culture with temples and hill stations',
      'puducherry': 'French colonial charm with spiritual centers',
      'lakshadweep': 'Coral paradise with pristine beaches',
      'andaman': 'Tropical islands with cellular jail history',
      'nicobar': 'Remote islands with indigenous tribes'
    };
    return descriptions[location] || `Explore amazing destinations in ${location.charAt(0).toUpperCase() + location.slice(1)}`;
  }
  
  function getImageForLocation(location: string): string {
    const imageMap: { [key: string]: string } = {
      'kashmir': '/images/destinations/kashmir.jpg',
      'goa': '/images/destinations/goa.jpg',
      'rajasthan': '/images/destinations/rajasthan.jpg',
      'kerala': '/images/destinations/kerala.jpg',
      'ladakh': '/images/destinations/ladakh.jpg',
      'himachal': '/images/destinations/himachal.jpg',
      'uttarakhand': '/images/destinations/uttarakhand.jpg',
      'sikkim': '/images/destinations/sikkim.jpg',
      'meghalaya': '/images/destinations/meghalaya.jpg',
      'arunachal': '/images/destinations/arunachal.jpg'
    };
    return imageMap[location] || '/images/destinations/default.jpg';
  }

  // Filter and paginate trips
  const filteredTrips = useMemo(() => {
    let result = trips;

    // Apply client-side filters (in case backend doesn't handle all)
    if (filters.search) {
      result = result.filter(trip => 
        trip.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        trip.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.difficulty) {
      result = result.filter(trip => trip.difficulty === filters.difficulty);
    }

    if (filters.duration) {
      result = result.filter(trip => trip.duration === filters.duration);
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
      result = result.filter(trip => 
        trip.price >= filters.priceRange[0] && trip.price <= filters.priceRange[1]
      );
    }

    return result;
  }, [trips, filters]);

  // Paginate results
  const paginatedTrips = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredTrips.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTrips, page]);

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600">Failed to load trips. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Trips
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            From thrilling adventures to peaceful retreats, find your perfect getaway from our curated collection of trips.
          </p>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalResults={filteredTrips.length}
          isOpen={showAdvancedFilters}
          onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
        />

        {/* Interactive Map */}
        <div className="mb-8">
          <InteractiveMap
            destinations={destinations}
            selectedDestination={selectedDestination || undefined}
            onDestinationSelect={setSelectedDestination}
          />
        </div>

        {/* Results */}
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms to find more trips.
            </p>
            <Button 
              variant="outline" 
              onClick={() => handleFiltersChange({
                search: '',
                priceRange: [0, 100000],
                featured: undefined,
                difficulty: undefined,
                duration: undefined,
              })}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Trips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {paginatedTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AnimatedTripCard trip={trip} index={index} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={page === pageNumber ? "default" : "outline"}
                      onClick={() => setPage(pageNumber)}
                      size="sm"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}