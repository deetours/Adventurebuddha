import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { AnimatedTripCard } from '../components/trips/AnimatedTripCard';
import { AdvancedFilters } from '../components/trips/AdvancedFilters';
import { InteractiveMap } from '../components/trips/InteractiveMap';
import { Button } from '../components/ui/button';
import { apiClient } from '../lib/api';
import { config } from '../lib/config';
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

  // Fetch trips data with error handling
  const { data: trips = [], isLoading, error } = useQuery({
    queryKey: ['trips', filters],
    queryFn: async () => {
      console.log('🔍 Fetching trips with filters:', { 
        filters,
        apiUrl: config.API_BASE_URL
      });
      
      try {
        const result = await apiClient.getTrips(filters);
        console.log('✅ Successfully fetched trips:', result.length, 'trips');
        console.log('First trip:', result[0]);
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch trips:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Debug logging
  console.log('🧪 TripsPage Debug:', {
    isLoading,
    error: error?.message,
    tripsCount: trips?.length,
    trips: trips?.slice(0, 2) // First 2 trips for debugging
  });  // Safe array handling for trips data
  const safeTrips = useMemo(() => {
    if (!Array.isArray(trips)) {
      console.warn('Trips data is not an array:', trips);
      return [];
    }
    return trips;
  }, [trips]);

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

  const destinations = useMemo(() => {
    const locationMap: { [key: string]: { count: number; trips: Trip[] } } = {};
    
    // Group trips by location extracted from tags and titles
    safeTrips.forEach(trip => {
      // Extract location from your actual trip tags
      const locationTags = trip.tags.filter((tag: string) => 
        ['hampi', 'coorg', 'chikmagalur', 'udupi', 'uttara-kannada', 'gudibande', 'mangalore', 'agumbe', 'pondicherry', 'auroville', 'pichavaram'].includes(tag.toLowerCase())
      );
      
      // If no specific location tag found, try to extract from title
      let location = locationTags.length > 0 ? locationTags[0] : null;
      if (!location) {
        const titleWords = trip.title.toLowerCase().split(/[\s,–-]+/);
        for (const word of titleWords) {
          if (['hampi', 'coorg', 'chikmagalur', 'udupi', 'uttara', 'kannada', 'gudibande', 'mangalore', 'agumbe', 'pondicherry', 'auroville', 'pichavaram'].includes(word)) {
            location = word;
            break;
          }
        }
      }
      
      // Try to extract from broader category
      if (!location) {
        if (trip.tags.some(tag => ['coastal', 'beach'].includes(tag.toLowerCase()))) {
          location = 'coastal';
        } else if (trip.tags.some(tag => ['cultural', 'heritage'].includes(tag.toLowerCase()))) {
          location = 'cultural';
        } else if (trip.tags.some(tag => ['adventure', 'trekking'].includes(tag.toLowerCase()))) {
          location = 'adventure';
        }
      }
      
      // Default to 'Karnataka' since most of your trips are in Karnataka
      location = location || 'karnataka';
      
      if (!locationMap[location]) {
        locationMap[location] = { count: 0, trips: [] };
      }
      locationMap[location].count += 1;
      locationMap[location].trips.push(trip);
    });
    
    // Location to coordinates mapping for your actual destinations
    const coordinatesMap: { [key: string]: [number, number] } = {
      'hampi': [76.5, 15.3],
      'coorg': [75.8, 12.3],
      'chikmagalur': [75.8, 13.3],
      'udupi': [74.7, 13.3],
      'uttara': [74.7, 14.9],
      'kannada': [74.7, 14.9],
      'gudibande': [77.4, 13.7],
      'mangalore': [74.8, 12.9],
      'agumbe': [75.1, 13.5],
      'pondicherry': [79.8, 11.9],
      'auroville': [79.8, 11.9],
      'pichavaram': [79.8, 11.4],
      'karnataka': [75.7, 15.3],
      'coastal': [74.8, 13.0],
      'cultural': [76.0, 15.0],
      'adventure': [75.5, 13.5],
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
  }, [safeTrips]);
  
  // Helper functions
  function getRegionFromLocation(location: string): string {
    const regionMap: { [key: string]: string } = {
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
      'gujarat': 'Western India',
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
      'nicobar': 'Island Territories',
      'hampi': 'Southern India',
      'coorg': 'Southern India',
      'chikmagalur': 'Southern India',
      'udupi': 'Southern India',
      'uttara-kannada': 'Southern India',
      'gudibande': 'Southern India',
      'mangalore': 'Southern India',
      'agumbe': 'Southern India',
      'pondicherry': 'Southern India',
      'auroville': 'Southern India',
      'pichavaram': 'Southern India'
    };
    return regionMap[location] || 'India';
  }
  
  function getDescriptionForLocation(location: string, _tripCount: number): string { // eslint-disable-line @typescript-eslint/no-unused-vars
    const descriptions: { [key: string]: string } = {
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
      'nicobar': 'Remote islands with indigenous tribes',
      'hampi': 'Ancient Vijayanagara ruins and boulder landscapes',
      'coorg': 'Coffee plantations and misty hills',
      'chikmagalur': 'Gateway to Mullayanagiri and coffee estates',
      'udupi': 'Coastal temples and Yakshagana traditions',
      'uttara-kannada': 'Tribal communities and forest adventures',
      'gudibande': '17th-century fort and Adiyogi temple',
      'mangalore': 'Coastal city with Tulu culture',
      'agumbe': 'Rainforest and sunset viewpoints',
      'pondicherry': 'French colonial charm with spiritual centers',
      'auroville': 'Experimental community with sustainable living',
      'pichavaram': 'Mangrove forests and backwaters'
    };
    return descriptions[location] || `Explore amazing destinations in ${location.charAt(0).toUpperCase() + location.slice(1)}`;
  }
  
  function getImageForLocation(location: string): string {
    const imageMap: { [key: string]: string } = {
      'kerala': '/images/destinations/kerala.jpg',
      'ladakh': '/images/destinations/ladakh.jpg',
      'himachal': '/images/destinations/himachal.jpg',
      'uttarakhand': '/images/destinations/uttarakhand.jpg',
      'sikkim': '/images/destinations/sikkim.jpg',
      'meghalaya': '/images/destinations/meghalaya.jpg',
      'arunachal': '/images/destinations/arunachal.jpg',
      'karnataka': '/images/destinations/karnataka.jpg',
      'hampi': '/images/destinations/hampi.jpg',
      'coorg': '/images/destinations/coorg.jpg',
      'chikmagalur': '/images/destinations/chikmagalur.jpg',
      'udupi': '/images/destinations/udupi.jpg',
      'mangalore': '/images/destinations/mangalore.jpg',
      'agumbe': '/images/destinations/agumbe.jpg',
      'pondicherry': '/images/destinations/pondicherry.jpg',
      'auroville': '/images/destinations/auroville.jpg',
      'pichavaram': '/images/destinations/pichavaram.jpg'
    };
    return imageMap[location] || '/images/destinations/default.jpg';
  }

  // Filter and paginate trips
  const filteredTrips = useMemo(() => {
    let result = safeTrips;

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
  }, [safeTrips, filters]);

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
          <div className="text-xs text-gray-400 mt-2">
            API Endpoint: {config.API_BASE_URL}/trips/
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Loading state display
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading trips from server...</div>
          <div className="text-xs text-gray-400 mt-2">
            Connecting to: {config.API_BASE_URL}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Debug: {trips?.length || 0} trips loaded so far
          </div>
        </div>
      </div>
    );
  }

  // No trips found state
  if (!isLoading && (!trips || trips.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50">
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
            totalResults={0}
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

          {/* Loading message */}
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="text-lg text-gray-600 mb-4">
                Loading amazing trips for you...
              </div>
              <div className="text-sm text-gray-400">
                Connecting to our travel database
              </div>
            </div>
          </div>
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