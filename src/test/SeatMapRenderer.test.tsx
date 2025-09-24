import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SeatMapRenderer } from '../components/booking/SeatMapRenderer';
import { useBookingStore } from '../stores/bookingStore';
import type { SeatMap } from '../lib/types';

// Mock the booking store
vi.mock('../stores/bookingStore', () => ({
  useBookingStore: vi.fn()
}));

const mockSeatMap: SeatMap = {
  vehicle: 'Tempo Traveller',
  rows: 4,
  cols: 3,
  seats: [
    { id: 'D1', row: 1, col: 1, type: 'driver' },
    { id: 'A1', row: 1, col: 2, type: 'window' },
    { id: 'A2', row: 1, col: 3, type: 'aisle' },
    { id: 'B1', row: 2, col: 1, type: 'window' },
    { id: 'B2', row: 2, col: 2, type: 'aisle' },
    { id: 'B3', row: 2, col: 3, type: 'window' },
    { id: 'C1', row: 3, col: 1, type: 'window' },
    { id: 'C2', row: 3, col: 2, type: 'aisle' },
    { id: 'C3', row: 3, col: 3, type: 'window' },
    { id: 'D2', row: 4, col: 1, type: 'window' },
    { id: 'D3', row: 4, col: 2, type: 'aisle' },
    { id: 'D4', row: 4, col: 3, type: 'window' },
  ]
};

const mockStore = {
  selectedSeats: [],
  seatStatus: {
    available: ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2'],
    locked: ['C3'],
    booked: ['D2', 'D3'],
    blocked: ['D4'],
    selected: [],
  },
  selectSeat: vi.fn(),
  deselectSeat: vi.fn()
};

describe('SeatMapRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBookingStore).mockReturnValue(mockStore);
  });

  it('renders the seat map with correct number of seats', () => {
    render(<SeatMapRenderer seatMap={mockSeatMap} />);

    // Should render seats (excluding driver seat which is not clickable)
    const seats = screen.getAllByRole('button');
    expect(seats.length).toBeGreaterThan(0);
  });

  it('displays vehicle name', () => {
    render(<SeatMapRenderer seatMap={mockSeatMap} />);

    expect(screen.getByText('Tempo Traveller')).toBeInTheDocument();
  });

  it('shows available seats as clickable', () => {
    render(<SeatMapRenderer seatMap={mockSeatMap} />);

    // Find an available seat button
    const availableSeat = screen.getByLabelText(/Seat A1/);
    expect(availableSeat).toBeInTheDocument();
    expect(availableSeat).not.toBeDisabled();
  });

  it('shows booked seats as disabled', () => {
    render(<SeatMapRenderer seatMap={mockSeatMap} />);

    // Find a booked seat button
    const bookedSeat = screen.getByLabelText(/Seat D2/);
    expect(bookedSeat).toBeInTheDocument();
    expect(bookedSeat).toBeDisabled();
  });

  it('calls selectSeat when clicking available seat', () => {
    render(<SeatMapRenderer seatMap={mockSeatMap} />);

    const availableSeat = screen.getByLabelText(/Seat A1/);
    fireEvent.click(availableSeat);

    expect(mockStore.selectSeat).toHaveBeenCalledWith('A1');
  });
});