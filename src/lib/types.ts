export interface Trip {
  id: string;
  slug: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  duration: number;
  tags: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  rating: number;
  reviewCount: number;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  upcomingSlots: Slot[];
  featured_status?: 'featured' | 'popular' | 'both' | 'none';
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
}

export interface Slot {
  id: string;
  tripId: string;
  date: string;
  time: string;
  vehicleType: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  status: 'available' | 'filling_fast' | 'sold_out';
  seatMap?: SeatMap;
}

export interface Seat {
  id: string;
  row: number;
  col: number;
  type?: 'window' | 'aisle' | 'extra_legroom' | 'driver' | 'blank';
  priceDelta?: number;
  meta?: Record<string, unknown>;
}

export interface SeatMap {
  vehicle: string;
  rows: number;
  cols: number;
  seats: Seat[];
}

export interface SeatStatus {
  available: string[];
  locked: string[];
  booked: string[];
  blocked: string[];
  selected: string[];
}

export interface Booking {
  id: string;
  slotId: string;
  userId: string;
  seatIds: string[];
  amount: number;
  status: 'draft' | 'pending_payment' | 'confirmed' | 'cancelled';
  lockToken?: string;
  lockExpiry?: string;
  pnr?: string;
  createdAt: string;
  trip: Trip;
  slot: Slot;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'razorpay' | 'upi_qr' | 'manual';
  name: string;
  description: string;
  enabled: boolean;
}

export interface WSMessage {
  event: 'seat_locked' | 'seat_unlocked' | 'seat_booked';
  seat_id: string;
  by_user?: string;
  timestamp: string;
}

export interface FiltersState {
  search: string;
  dateRange?: [string, string];
  priceRange: [number, number];
  duration?: number;
  featured?: string;
  difficulty?: string;
}