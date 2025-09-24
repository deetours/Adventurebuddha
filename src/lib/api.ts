import { config } from './config';
import type { 
  Trip, 
  SeatMap, 
  SeatStatus, 
  Booking, 
  User,
  FiltersState 
} from './types';

// Dashboard Types
export interface DashboardStats {
  total_bookings: number;
  total_revenue: number;
  active_users: number;
  avg_rating: number;
  monthly_growth: number;
  pending_bookings: number;
}

export interface TripAnalytics {
  trip_id: string;
  trip_title: string;
  bookings_count: number;
  revenue: number;
  rating: number;
  occupancy_rate: number;
}

export interface AgentMetrics {
  agent_type: string;
  status: string;
  active_sessions: number;
  avg_response_time: number;
  user_satisfaction: number;
}

export interface UserDashboardStats {
  total_trips: number;
  total_spent: number;
  loyalty_points: number;
  avg_rating: number;
  next_trip?: {
    id: string;
    title: string;
    start_date: string;
    destination: string;
  };
}

export interface NotificationSettings {
  email_bookings: boolean;
  email_promotions: boolean;
  email_updates: boolean;
  sms_bookings: boolean;
  sms_updates: boolean;
  whatsapp_bookings: boolean;
  whatsapp_updates: boolean;
}

export interface TravelPreferences {
  preferred_trip_types: string[];
  preferred_group_size: string;
  preferred_budget_min: number;
  preferred_budget_max: number;
  preferred_activity_level: string;
  dietary_restrictions: string[];
  accessibility_needs: string;
  special_requests: string;
}

export interface FavoriteTrip {
  id: string;
  trip: {
    id: string;
    title: string;
    destination: string;
    price: number;
    duration: number;
    image?: string;
  };
  added_at: string;
}

export interface DashboardActivity {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface TravelInsight {
  insight_type: string;
  title: string;
  description: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}

// Mock data for development
const mockTrips: Trip[] = [
  {
    id: '1',
    slug: 'ladakh-adventure',
    title: 'Ladakh Adventure - 7 Days',
    description: 'Experience the magical landscapes of Ladakh with this incredible 7-day adventure.',
    images: [
      'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
      'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg',
      'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg',
    ],
    price: 35000,
    duration: 7,
    tags: ['trek', 'adventure', 'mountains'],
    difficulty: 'challenging',
    rating: 4.8,
    reviewCount: 124,
    inclusions: ['Transportation', 'Accommodation', 'Meals', 'Guide'],
    exclusions: ['Personal expenses', 'Insurance', 'Tips'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Leh',
        description: 'Arrive in Leh, acclimatization day',
        activities: ['Airport pickup', 'Hotel check-in', 'Rest'],
        meals: ['Dinner'],
        accommodation: 'Hotel in Leh'
      },
      {
        day: 2,
        title: 'Leh Local Sightseeing',
        description: 'Explore the beautiful monasteries and palaces',
        activities: ['Leh Palace', 'Shanti Stupa', 'Local market'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Hotel in Leh'
      }
    ],
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
        status: 'available'
      }
    ]
  },
  {
    id: '2',
    slug: 'goa-beach-retreat',
    title: 'Goa Beach Retreat - 5 Days',
    description: 'Relax and unwind at the beautiful beaches of Goa.',
    images: [
      'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg',
      'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg',
    ],
    price: 18000,
    duration: 5,
    tags: ['relax', 'beach', 'family'],
    difficulty: 'easy',
    rating: 4.6,
    reviewCount: 89,
    inclusions: ['Accommodation', 'Breakfast', 'Airport transfers'],
    exclusions: ['Lunch & Dinner', 'Activities', 'Personal expenses'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Goa',
        description: 'Check-in and beach time',
        activities: ['Airport pickup', 'Beach walk'],
        meals: ['Welcome drink'],
        accommodation: 'Beach resort'
      }
    ],
    upcomingSlots: [
      {
        id: 'slot-2',
        tripId: '2',
        date: '2024-06-20',
        time: '10:00',
        vehicleType: 'AC Bus',
        totalSeats: 45,
        availableSeats: 12,
        price: 18000,
        status: 'filling_fast'
      }
    ]
  }
];

const mockSeatMap: SeatMap = {
  vehicle: 'Tempo Traveller',
  rows: 4,
  cols: 3,
  seats: [
    // Row 1 (Driver row)
    { id: 'D1', row: 1, col: 1, type: 'driver' },
    { id: 'A1', row: 1, col: 2, type: 'window' },
    { id: 'A2', row: 1, col: 3, type: 'aisle' },
    // Row 2
    { id: 'B1', row: 2, col: 1, type: 'window' },
    { id: 'B2', row: 2, col: 2, type: 'aisle' },
    { id: 'B3', row: 2, col: 3, type: 'window' },
    // Row 3
    { id: 'C1', row: 3, col: 1, type: 'window' },
    { id: 'C2', row: 3, col: 2, type: 'aisle' },
    { id: 'C3', row: 3, col: 3, type: 'window' },
    // Row 4
    { id: 'D1', row: 4, col: 1, type: 'window' },
    { id: 'D2', row: 4, col: 2, type: 'aisle' },
    { id: 'D3', row: 4, col: 3, type: 'window' },
  ]
};

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.API_BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (config.USE_MOCK_API) {
      return this.mockRequest<T>(endpoint, options);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async mockRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    const method = options?.method || 'GET';
    const body = options?.body ? JSON.parse(options.body as string) : null;

    // Mock API responses
    if (endpoint.startsWith('/trips') && method === 'GET') {
      if (endpoint.includes('/trips/')) {
        const slug = endpoint.split('/trips/')[1].split('/')[0];
        const trip = mockTrips.find(t => t.slug === slug || t.id === slug);
        if (!trip) throw new Error('Trip not found');
        return trip as T;
      }
      return mockTrips as T;
    }

    if (endpoint.includes('/seatmap') && method === 'GET') {
      const seatStatus: SeatStatus = {
        available: ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2'],
        locked: ['C3'],
        booked: ['D1', 'D2'],
        blocked: ['D3'],
        selected: []
      };
      return { seatMap: mockSeatMap, ...seatStatus } as T;
    }

    if (endpoint.includes('/seat-lock') && method === 'POST') {
      return {
        lock_token: 'mock_token_' + Date.now(),
        expires_in: 300 // 5 minutes
      } as T;
    }

    if (endpoint.includes('/bookings') && method === 'POST') {
      return {
        booking_id: 'booking_' + Date.now(),
        status: 'pending_payment',
        amount: 35000
      } as T;
    }

    if (endpoint.includes('/payments/razorpay/create-order') && method === 'POST') {
      return {
        order_id: 'order_' + Date.now(),
        amount: body.amount || 35000
      } as T;
    }

    throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
  }

  // Trip APIs
  async getTrips(filters?: Partial<FiltersState>): Promise<Trip[]> {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.tags?.length) queryParams.append('tags', filters.tags.join(','));
    
    const endpoint = `/trips?${queryParams.toString()}`;
    return this.request<Trip[]>(endpoint);
  }

  async getTrip(slugOrId: string): Promise<Trip> {
    return this.request<Trip>(`/trips/${slugOrId}`);
  }

  // Seat APIs
  async getSeatMap(slotId: string): Promise<{ seatMap: SeatMap } & SeatStatus> {
    return this.request(`/slots/${slotId}/seatmap`);
  }

  async lockSeats(slotId: string, seatIds: string[]): Promise<{ lock_token: string; expires_in: number }> {
    return this.request('/seat-lock', {
      method: 'POST',
      body: JSON.stringify({ slot_id: slotId, seat_ids: seatIds })
    });
  }

  async unlockSeats(lockToken: string): Promise<{ released: boolean }> {
    return this.request('/seat-unlock', {
      method: 'POST',
      body: JSON.stringify({ lock_token: lockToken })
    });
  }

  // Booking APIs
  async createBooking(data: {
    slot_id: string;
    seat_ids: string[];
    lock_token: string;
    user_id: string;
  }): Promise<{ booking_id: string; status: string; amount: number }> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getBooking(bookingId: string): Promise<Booking> {
    return this.request(`/bookings/${bookingId}`);
  }

  // Payment APIs
  async createRazorpayOrder(bookingId: string): Promise<{ order_id: string; amount: number }> {
    return this.request('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId })
    });
  }

  async verifyRazorpayPayment(data: Record<string, unknown>): Promise<{ success: boolean }> {
    return this.request('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async generateUPIQR(bookingId: string): Promise<{ upi_link: string; qr_image_url?: string }> {
    return this.request('/payments/upiqr', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId })
    });
  }

  // Chat APIs
  async chatWithAgent(data: {
    query: string;
    context?: {
      page?: string;
      tripId?: string;
      bookingId?: string;
      userId?: string;
      conversationHistory?: Array<{
        type: 'user' | 'agent';
        content: string;
        agentType?: string;
      }>;
    };
  }): Promise<{ content: string; agentType: string }> {
    return this.request('/agents/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Auth APIs
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async signup(data: { name: string; email: string; password: string; phone?: string }): Promise<{ user: User; token: string }> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Dashboard APIs
  async getAdminOverview(): Promise<DashboardStats> {
    return this.request('/api/admin/overview/');
  }

  async getRecentBookings(): Promise<Array<{
    id: string;
    user_name: string;
    trip_title: string;
    amount: number;
    status: string;
    created_at: string;
  }>> {
    return this.request('/api/admin/recent-bookings/');
  }

  async getTripPerformance(): Promise<TripAnalytics[]> {
    return this.request('/api/admin/trip-performance/');
  }

  async getAgentStatus(): Promise<AgentMetrics[]> {
    return this.request('/api/admin/agent-status/');
  }

  async getUserOverview(): Promise<UserDashboardStats> {
    return this.request('/api/user/overview/');
  }

  async getUserBookings(status?: string): Promise<Array<{
    id: string;
    trip_title: string;
    trip_destination: string;
    booking_date: string;
    status: string;
    amount: number;
    trip_date: string;
  }>> {
    const queryParams = status ? `?status=${status}` : '';
    return this.request(`/api/user/bookings/${queryParams}`);
  }

  async getTravelInsights(): Promise<TravelInsight[]> {
    return this.request('/api/user/travel-insights/');
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    return this.request('/api/notification-settings/');
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    return this.request('/api/notification-settings/', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  }

  async getTravelPreferences(): Promise<TravelPreferences> {
    return this.request('/api/travel-preferences/');
  }

  async updateTravelPreferences(preferences: Partial<TravelPreferences>): Promise<TravelPreferences> {
    return this.request('/api/travel-preferences/', {
      method: 'PATCH',
      body: JSON.stringify(preferences)
    });
  }

  async getFavoriteTrips(): Promise<FavoriteTrip[]> {
    return this.request('/api/favorite-trips/');
  }

  async toggleFavoriteTrip(tripId: string): Promise<{ is_favorite: boolean }> {
    return this.request('/api/favorite-trips/toggle_favorite/', {
      method: 'POST',
      body: JSON.stringify({ trip_id: tripId })
    });
  }

  async getDashboardActivities(): Promise<DashboardActivity[]> {
    return this.request('/api/activities/');
  }
}

export const apiClient = new ApiClient();