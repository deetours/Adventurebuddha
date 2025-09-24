import type { Meta, StoryObj } from '@storybook/react';
import { TripCard } from './TripCard';

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

const sampleTrip = {
  id: '1',
  slug: 'ladakh-adventure',
  title: 'Ladakh Adventure - 7 Days',
  description: 'Experience the magical landscapes of Ladakh with this incredible 7-day adventure through pristine valleys and majestic mountains.',
  images: [
    'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
    'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg',
  ],
  price: 35000,
  duration: 7,
  tags: ['trek', 'adventure', 'mountains', 'photography'],
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
      title: 'Goa Beach Retreat - 5 Days',
      difficulty: 'easy' as const,
      tags: ['beach', 'relax', 'family'],
      price: 18000,
      duration: 5,
    },
  },
};