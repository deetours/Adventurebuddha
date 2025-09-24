import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { TripCard } from '../components/trips/TripCard';

const mockTrip = {
  id: '1',
  slug: 'test-trip',
  title: 'Test Trip',
  description: 'A test trip description',
  images: ['https://example.com/image.jpg'],
  price: 25000,
  duration: 5,
  tags: ['adventure', 'mountains'],
  difficulty: 'moderate' as const,
  rating: 4.5,
  reviewCount: 100,
  inclusions: ['Accommodation', 'Meals'],
  exclusions: ['Personal expenses'],
  itinerary: [],
  upcomingSlots: [
    {
      id: 'slot-1',
      tripId: '1',
      date: '2024-06-15',
      time: '06:00',
      vehicleType: 'Bus',
      totalSeats: 40,
      availableSeats: 10,
      price: 25000,
      status: 'available' as const
    }
  ]
};

const renderTripCard = (trip = mockTrip) => {
  return render(
    <BrowserRouter>
      <TripCard trip={trip} />
    </BrowserRouter>
  );
};

describe('TripCard', () => {
  it('renders trip information correctly', () => {
    renderTripCard();

    expect(screen.getByText('Test Trip')).toBeInTheDocument();
    expect(screen.getByText('A test trip description')).toBeInTheDocument();
    expect(screen.getByText('₹25,000')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(100)')).toBeInTheDocument();
  });

  it('displays correct difficulty badge', () => {
    renderTripCard();
    expect(screen.getByText('moderate')).toBeInTheDocument();
  });

  it('shows available status for available trips', () => {
    renderTripCard();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('shows filling fast status when appropriate', () => {
    const fillingFastTrip = {
      ...mockTrip,
      upcomingSlots: [
        {
          ...mockTrip.upcomingSlots[0],
          status: 'filling_fast' as const
        }
      ]
    };
    
    renderTripCard(fillingFastTrip);
    expect(screen.getByText('Filling Fast')).toBeInTheDocument();
  });

  it('renders tags correctly', () => {
    renderTripCard();
    expect(screen.getByText('adventure')).toBeInTheDocument();
    expect(screen.getByText('mountains')).toBeInTheDocument();
  });
});