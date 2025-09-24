// ...existing code...
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '../ui/sheet';
import type { FiltersState } from '../../lib/types';

interface TripsFilterBarProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  totalResults: number;
}

export function TripsFilterBar({ filters, onFiltersChange, totalResults }: TripsFilterBarProps) {
  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'challenging', label: 'Challenging' },
  ];

  const tagOptions = [
    'adventure', 'trek', 'beach', 'mountains', 'family', 'relax', 'wildlife', 'culture',
    'photography', 'spiritual', 'camping', 'cycling', 'backpacking'
  ];

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      priceRange: [0, 100000],
      tags: [],
      difficulty: undefined,
      duration: undefined,
    });
  };

  const activeFilterCount = [
    filters.search,
    filters.difficulty,
    filters.duration,
    filters.tags.length > 0 ? 'tags' : null,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 100000 ? 'price' : null,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Price Range</label>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            max={100000}
            min={0}
            step={1000}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>₹{filters.priceRange[0].toLocaleString()}</span>
          <span>₹{filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Difficulty</label>
        <Select 
          value={filters.difficulty || 'all'} 
          onValueChange={(value) => onFiltersChange({ ...filters, difficulty: value === 'all' ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {difficultyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Duration (days)</label>
        <Select 
          value={filters.duration ? filters.duration.toString() : 'any'} 
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            duration: value === 'any' ? undefined : parseInt(value) 
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Duration</SelectItem>
            <SelectItem value="1">1 Day</SelectItem>
            <SelectItem value="2">2 Days</SelectItem>
            <SelectItem value="3">3 Days</SelectItem>
            <SelectItem value="5">5 Days</SelectItem>
            <SelectItem value="7">7 Days</SelectItem>
            <SelectItem value="10">10+ Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tagOptions.map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox
                id={tag}
                checked={filters.tags.includes(tag)}
                onCheckedChange={() => handleTagToggle(tag)}
              />
              <label htmlFor={tag} className="text-sm capitalize cursor-pointer">
                {tag}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search and Mobile Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search trips by name, destination..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Mobile Filter Sheet */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="relative">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Trips</SheetTitle>
              <SheetDescription>
                Refine your search to find the perfect adventure
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block">
        <FilterContent />
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {totalResults} trip{totalResults !== 1 ? 's' : ''} found
        </span>
        
        {/* Active Filter Tags */}
        <div className="flex flex-wrap gap-1">
          {filters.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="cursor-pointer hover:bg-red-100 hover:text-red-800"
              onClick={() => handleTagToggle(tag)}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}