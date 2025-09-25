import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { AnimatedTripCard } from '../components/trips/AnimatedTripCard';
import { AdvancedFilters } from '../components/trips/AdvancedFilters';
import { InteractiveMap } from '../components/trips/InteractiveMap';
import { Button } from '../components/ui/button';
import { apiClient } from '../lib/api';
import type { FiltersState } from '../lib/types';

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
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    difficulty: searchParams.get('difficulty') || undefined,
    duration: searchParams.get('duration') ? parseInt(searchParams.get('duration')!) : undefined,
  }));

  // Fetch trips with filters
  const { data: trips = [], error } = useQuery({
    queryKey: ['trips', filters],
    queryFn: () => apiClient.getTrips(filters),
  });

  // Update URL params when filters change
  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
    setPage(1); // Reset pagination

    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.tags.length) params.set('tags', newFilters.tags.join(','));
    if (newFilters.difficulty) params.set('difficulty', newFilters.difficulty);
    if (newFilters.duration) params.set('duration', newFilters.duration.toString());
    
    setSearchParams(params);
  };

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

    if (filters.tags.length > 0) {
      result = result.filter(trip => 
        filters.tags.some(tag => trip.tags.includes(tag))
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
            destinations={[
              { id: 1, name: 'Himalayas', coordinates: [79.0, 28.0], trips: 15, region: 'Northern India', description: 'Experience the majestic Himalayan ranges', image: '/images/destinations/himalayas.jpg' },
              { id: 2, name: 'Kashmir', coordinates: [74.8, 34.1], trips: 8, region: 'Northern India', description: 'Paradise on earth with stunning valleys', image: '/images/destinations/kashmir.jpg' },
              { id: 3, name: 'Rajasthan', coordinates: [74.2, 27.0], trips: 12, region: 'Western India', description: 'Land of kings with rich cultural heritage', image: '/images/destinations/rajasthan.jpg' },
              { id: 4, name: 'Kerala', coordinates: [76.3, 10.0], trips: 10, region: 'Southern India', description: 'God\'s own country with backwaters', image: '/images/destinations/kerala.jpg' },
              { id: 5, name: 'Goa', coordinates: [74.1, 15.3], trips: 6, region: 'Western India', description: 'Beaches and vibrant culture', image: '/images/destinations/goa.jpg' }
            ]}
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
                tags: [],
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