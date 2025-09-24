import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, MapPin, Calendar, DollarSign, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import type { FiltersState } from '../../lib/types';

interface AdvancedFiltersProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  totalResults: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  totalResults,
  isOpen,
  onToggle
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FiltersState>(filters);

  const difficultyLevels = ['Easy', 'Moderate', 'Challenging', 'Expert'];
  const durationOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const activityTags = [
    'Trekking', 'Cultural', 'Wildlife', 'Adventure', 'Spiritual', 'Photography',
    'Camping', 'Rafting', 'Paragliding', 'Scuba Diving', 'Skiing', 'Cycling'
  ];
  const regions = [
    'Himalayas', 'Kashmir', 'Rajasthan', 'Kerala', 'Goa', 'Ladakh',
    'Uttarakhand', 'Sikkim', 'Arunachal Pradesh', 'Meghalaya'
  ];

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onToggle();
  };

  const handleResetFilters = () => {
    const resetFilters: FiltersState = {
      search: '',
      priceRange: [0, 100000],
      tags: [],
      difficulty: undefined,
      duration: undefined,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const updateLocalFilters = (updates: Partial<FiltersState>) => {
    setLocalFilters(prev => ({ ...prev, ...updates }));
  };

  return (
    <>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onToggle}
            className="flex items-center space-x-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Advanced Filters</span>
            {(filters.tags.length > 0 || filters.difficulty || filters.duration) && (
              <Badge variant="secondary" className="ml-2">
                {[
                  filters.tags.length,
                  filters.difficulty ? 1 : 0,
                  filters.duration ? 1 : 0
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>

          <div className="text-sm text-gray-600">
            {totalResults} trip{totalResults !== 1 ? 's' : ''} found
          </div>
        </div>

        {(filters.tags.length > 0 || filters.difficulty || filters.duration) && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {(filters.tags.length > 0 || filters.difficulty || filters.duration) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {filters.difficulty && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>{filters.difficulty}</span>
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, difficulty: undefined })}
                />
              </Badge>
            )}

            {filters.duration && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{filters.duration} days</span>
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, duration: undefined })}
                />
              </Badge>
            )}

            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => onFiltersChange({
                    ...filters,
                    tags: filters.tags.filter(t => t !== tag)
                  })}
                />
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border rounded-lg p-6 mb-6 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Difficulty Filter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Difficulty
                </h4>
                <div className="space-y-2">
                  {difficultyLevels.map(level => (
                    <label key={level} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={localFilters.difficulty === level}
                        onCheckedChange={(checked) =>
                          updateLocalFilters({
                            difficulty: checked ? level : undefined
                          })
                        }
                      />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Duration (Days)
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {durationOptions.map(days => (
                    <label key={days} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={localFilters.duration === days}
                        onCheckedChange={(checked) =>
                          updateLocalFilters({
                            duration: checked ? days : undefined
                          })
                        }
                      />
                      <span className="text-sm">{days} days</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Activities Filter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Activities</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activityTags.map(activity => (
                    <label key={activity} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={localFilters.tags.includes(activity)}
                        onCheckedChange={(checked) => {
                          const newTags = checked
                            ? [...localFilters.tags, activity]
                            : localFilters.tags.filter(t => t !== activity);
                          updateLocalFilters({ tags: newTags });
                        }}
                      />
                      <span className="text-sm">{activity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Regions Filter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Regions
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {regions.map(region => (
                    <label key={region} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={localFilters.tags.includes(region)}
                        onCheckedChange={(checked) => {
                          const newTags = checked
                            ? [...localFilters.tags, region]
                            : localFilters.tags.filter(t => t !== region);
                          updateLocalFilters({ tags: newTags });
                        }}
                      />
                      <span className="text-sm">{region}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Price Range: ₹{localFilters.priceRange[0].toLocaleString()} - ₹{localFilters.priceRange[1].toLocaleString()}
              </h4>
              <Slider
                value={localFilters.priceRange}
                onValueChange={(value) => updateLocalFilters({ priceRange: value as [number, number] })}
                max={100000}
                min={0}
                step={1000}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={onToggle}>
                Cancel
              </Button>
              <Button onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}