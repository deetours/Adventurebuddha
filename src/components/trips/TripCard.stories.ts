import type { Meta, StoryObj } from '@storybook/react';
import { TripCard } from './TripCard';
import { apiClient } from '@/lib/api';

const meta = {
  title: 'Components/TripCard',
  component: TripCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TripCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Fetch a real trip for the story
const getSampleTrip = async () => {
  try {
    const trips = await apiClient.getTrips({ featured: 'popular,both' });
    if (trips.length > 0) {
      const trip = trips[0];
      return {
        id: trip.id,
        slug: trip.slug || trip.id.toString(),
        title: trip.title,
        description: trip.description,
        images: trip.images || [],
        price: trip.price,
        duration: trip.duration,
        tags: trip.tags || [],
        difficulty: (trip.difficulty || 'moderate') as 'easy' | 'moderate' | 'challenging',
        rating: 4.8, // Mock rating
        reviewCount: 124, // Mock review count
        inclusions: ['Transportation', 'Accommodation', 'Meals', 'Guide'],
        exclusions: ['Personal expenses', 'Insurance', 'Tips'],
        itinerary: trip.itinerary || [],
        upcomingSlots: [
          {
            id: 'slot-1',
            tripId: trip.id.toString(),
            date: '2024-06-15',
            time: '06:00',
            vehicleType: 'Tempo Traveller',
            totalSeats: 12,
            availableSeats: 8,
            price: trip.price,
            status: 'available' as const
          }
        ]
      };
    }
  } catch (error) {
    console.error('Failed to fetch sample trip:', error);
  }
  
  // Fallback sample trip
  return {
    id: '1',
    slug: 'sample-trip',
    title: 'Sample Adventure Trip',
    description: 'Experience the magical landscapes with this incredible adventure.',
    images: ['https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg'],
    price: 35000,
    duration: 7,
    tags: ['adventure', 'mountains', 'photography'],
    difficulty: 'challenging' as const,
    rating: 4.8,
    reviewCount: 124,
    inclusions: ['Transportation', 'Accommodation', 'Meals', 'Guide'],
    exclusions: ['Personal expenses', 'Insurance', 'Tips'],
    itinerary: [],
    upcomingSlots: [
      {
        id: 'slot-1',
        tripId: '1',
        date: '2024-06-15',
        time: '06:00',
        vehicleType: 'Tempo Traveller',
        totalSeats: 12,
        availableSeats: 8,
        price: 35000,
        status: 'available' as const
      }
    ]
  };
};

const sampleTrip = await getSampleTrip();

export const Default: Story = {
  args: {
    trip: sampleTrip,
  },
};

export const FillingFast: Story = {
  args: {
    trip: {
      ...sampleTrip,
      upcomingSlots: [
        {
          ...sampleTrip.upcomingSlots[0],
          status: 'filling_fast' as const,
          availableSeats: 2,
        }
      ]
    },
  },
};

export const SoldOut: Story = {
  args: {
    trip: {
      ...sampleTrip,
      upcomingSlots: [
        {
          ...sampleTrip.upcomingSlots[0],
          status: 'sold_out' as const,
          availableSeats: 0,
        }
      ]
    },
  },
};

export const EasyDifficulty: Story = {
  args: {
    trip: {
      ...sampleTrip,
      title: 'Beach Retreat',
      difficulty: 'easy' as const,
      tags: ['beach', 'relax', 'family'],
      price: 18000,
      duration: 5,
    },
  },
};