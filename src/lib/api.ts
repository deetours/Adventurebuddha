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

// Paginated response interface
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.API_BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Add timeout and retry logic for VM API
    const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number = 15000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };
    
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} for ${url}`);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Trip APIs
  async getTrips(filters?: Partial<FiltersState>): Promise<Trip[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.featured) queryParams.append('featured', filters.featured);
      
      const endpoint = `/trips?${queryParams.toString()}`;
      const response = await this.request<PaginatedResponse<Trip> | Trip[]>(endpoint);
      
      let trips: Trip[] = [];
      
      // Handle paginated response - extract results array
      if (response && typeof response === 'object' && 'results' in response) {
        trips = response.results;
      } else if (Array.isArray(response)) {
        // Fallback for non-paginated response (array)
        trips = response;
      } else {
        console.warn('Unexpected API response format for trips:', response);
        return [];
      }
      
      // Process images to convert relative URLs to absolute URLs
      return trips.map(trip => ({
        ...trip,
        images: trip.images?.map((img: string) => 
          img.startsWith('/') ? `http://68.233.115.38:8000${img}` : img
        ) || []
      }));
      
    } catch (error) {
      console.error('Failed to fetch trips from VM API:', error);
      
      // Return empty array for now - UI will handle loading states
      // Could add mock data here if needed
      return [];
    }
  }

  async getTrip(slugOrId: string): Promise<Trip> {
    const response = await this.request<Trip>(`/trips/${slugOrId}/`);
    
    // Process images to convert relative URLs to absolute URLs
    return {
      ...response,
      images: response.images?.map((img: string) => 
        img.startsWith('/') ? `http://68.233.115.38:8000${img}` : img
      ) || []
    };
  }

  async updateTrip(slug: string, tripData: Partial<Trip>): Promise<Trip> {
    return this.request<Trip>(`/trips/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(tripData)
    });
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

// Export as 'api' for backward compatibility
export const api = apiClient;