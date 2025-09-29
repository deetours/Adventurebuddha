import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, MapPin, Calendar, Star, X, TrendingUp, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { apiClient } from '@/lib/api';

interface SearchResult {
  id: string;
  title: string;
  location: string;
  rating: number;
  price: number;
  duration: string;
  image: string;
  type: 'trip' | 'destination' | 'activity';
  highlights: string[];
}

interface InteractiveSearchProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export function InteractiveSearch({ onSearch, className }: InteractiveSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Hampi Heritage',
    'Coorg Coffee Trail',
    'Udupi Temple Circuit',
    'Chikmagalur Trekking'
  ]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch popular trips for search results
  useEffect(() => {
    const fetchPopularTrips = async () => {
      try {
        setLoadingResults(true);
        const trips = await apiClient.getTrips({ featured: 'popular,both' });
        const results: SearchResult[] = trips.slice(0, 6).map((trip) => ({
          id: trip.id.toString(),
          title: trip.title,
          location: trip.tags?.join(', ') || 'India',
          rating: 4.5 + Math.random() * 0.5, // Mock rating since API doesn't provide
          price: trip.price,
          duration: `${trip.duration} days`,
          image: trip.images?.[0] || '/images/default-trip.jpg',
          type: 'trip' as const,
          highlights: trip.tags?.slice(0, 3) || ['Adventure', 'Culture', 'Nature']
        }));
        setSearchResults(results);
      } catch (error) {
        console.error('Failed to fetch search results:', error);
        setSearchResults([]);
      } finally {
        setLoadingResults(false);
      }
    };

    fetchPopularTrips();
  }, []);

  const popularSearches = [
    'Trekking', 'Beach', 'Family', 'Adventure', 'Cultural', 'Wildlife', 'Photography', 'Solo Travel'
  ];

  const filters = [
    { id: 'budget', label: 'Under ₹30,000', icon: '💰' },
    { id: 'weekend', label: 'Weekend Trips', icon: '📅' },
    { id: 'solo', label: 'Solo Friendly', icon: '👤' },
    { id: 'family', label: 'Family Trips', icon: '👨‍👩‍👧‍👦' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'relaxation', label: 'Relaxation', icon: '🏖️' }
  ];

  // Voice search simulation
  const startVoiceSearch = () => {
    setIsListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      setQuery('Ladakh adventure trip');
      handleSearch('Ladakh adventure trip');
    }, 2000);
  };

  const handleSearch = (searchQuery: string) => {
    setIsSearching(true);
    setShowResults(true);

    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      onSearch?.(searchQuery);

      // Add to recent searches
      if (searchQuery && !recentSearches.includes(searchQuery)) {
        setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
      }
    }, 800);
  };

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearSearch = () => {
    setQuery('');
    setShowResults(false);
    setSelectedFilters([]);
    inputRef.current?.focus();
  };

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative max-w-4xl mx-auto ${className}`}>
      {/* Enhanced Search Input */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-orange-200 overflow-hidden">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-orange-500/5 to-orange-600/10"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% 200%'
            }}
          />

          <div className="relative flex items-center p-2">
            {/* Search Icon with Animation */}
            <motion.div
              className="p-3"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Search className="h-6 w-6 text-orange-600" />
            </motion.div>

            {/* Input Field */}
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search destinations, activities, or experiences..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
              className="flex-1 border-0 bg-transparent text-lg placeholder:text-gray-400 focus:ring-0 focus:outline-none"
            />

            {/* Voice Search Button */}
            <motion.button
              onClick={startVoiceSearch}
              className="p-3 rounded-full hover:bg-orange-100 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={isListening}
            >
              <Mic className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-orange-600'}`} />
            </motion.button>

            {/* Clear Button */}
            {query && (
              <motion.button
                onClick={clearSearch}
                className="p-3 rounded-full hover:bg-orange-100 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <X className="h-5 w-5 text-gray-500" />
              </motion.button>
            )}

            {/* Search Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => handleSearch(query)}
                disabled={isSearching}
                className="ml-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg"
              >
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="h-5 w-5" />
                  </motion.div>
                ) : (
                  'Search'
                )}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Voice Listening Indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white rounded-2xl shadow-xl p-4 border border-orange-200"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Mic className="h-6 w-6 text-red-500" />
                </motion.div>
                <span className="text-gray-700 font-medium">Listening...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Filter Chips */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {filters.map((filter, index) => (
          <motion.div
            key={filter.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge
              variant={selectedFilters.includes(filter.id) ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedFilters.includes(filter.id)
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                  : 'border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400'
              }`}
              onClick={() => handleFilterToggle(filter.id)}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.label}
            </Badge>
          </motion.div>
        ))}
      </motion.div>

      {/* Popular Searches */}
      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-gray-600 mb-4">Popular searches:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {popularSearches.map((search, index) => (
            <motion.button
              key={search}
              onClick={() => {
                setQuery(search);
                handleSearch(search);
              }}
              className="px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm hover:bg-orange-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
            >
              {search}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-orange-200 overflow-hidden z-50"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Searches</h3>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={search}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left p-3 rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-between"
                      whileHover={{ x: 5 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-gray-700">{search}</span>
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {loadingResults ? (
                <div className="p-8 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <Search className="h-8 w-8 text-orange-500" />
                  </motion.div>
                  <p className="text-gray-600 mt-4">Loading amazing adventures...</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid gap-4">
                    {searchResults.map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors cursor-pointer border border-transparent hover:border-orange-200"
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{result.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{result.location}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{result.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{result.duration}</span>
                            </div>
                            <div className="text-sm font-semibold text-orange-600">
                              ₹{result.price.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <Button size="sm" className="rounded-full bg-orange-500 hover:bg-orange-600">
                            View Details
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}