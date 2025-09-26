import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  CreditCard,
  Settings,
  Bell,
  Star,
  Clock,
  CheckCircle,
  Plane,
  IndianRupee,
  Award,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api';
import { useRealtimeDashboard } from '@/hooks/useWebSocket';
import { useAuthStore } from '@/stores/authStore';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserBooking {
  id: string;
  tripName: string;
  tripSlug: string;
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  amount: number;
  travelers: number;
  vehicleType: string;
  rating?: number;
  image: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserStats {
  totalTrips: number;
  totalSpent: number;
  favoriteDestination: string;
  loyaltyPoints: number;
  avgRating: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface NotificationSettings {
  emailBookings: boolean;
  emailPromotions: boolean;
  smsUpdates: boolean;
  whatsappUpdates: boolean;
}

export function UserDashboard() {
  const { user } = useAuthStore();

  // Real-time dashboard data
  const { dashboardData, isConnected } = useRealtimeDashboard();

  // API queries
  const { data: overviewData } = useQuery({
    queryKey: ['user-overview'],
    queryFn: apiClient.getUserOverview,
    refetchInterval: 30000,
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: () => apiClient.getUserBookings(),
    refetchInterval: 30000,
  });

  const { data: insightsData } = useQuery({
    queryKey: ['user-insights'],
    queryFn: apiClient.getTravelInsights,
    refetchInterval: 60000,
  });

  const { data: notificationSettings } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: apiClient.getNotificationSettings,
  });

  const { data: travelPreferences } = useQuery({
    queryKey: ['travel-preferences'],
    queryFn: apiClient.getTravelPreferences,
  });

  const { data: favoriteTrips } = useQuery({
    queryKey: ['favorite-trips'],
    queryFn: apiClient.getFavoriteTrips,
  });

  // Use real-time data if available, otherwise fall back to API data
  const userStats = dashboardData?.overview || overviewData || {
    total_trips: 0,
    total_spent: 0,
    loyalty_points: 0,
    avg_rating: 0,
  };

  const allBookings = bookingsData || [];
  const upcomingBookings = allBookings.filter(booking => booking.status === 'confirmed');
  const pastBookings = allBookings.filter(booking => booking.status === 'completed');
  const travelInsights = insightsData || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-gray-600">Manage your trips and preferences</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                <Plane className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.total_trips || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2</span> this year
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(userStats.total_spent / 1000)?.toFixed(0) || '0'}K</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+15%</span> vs last year
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.loyalty_points?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Worth ₹{Math.floor((userStats.loyalty_points || 0) / 10)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.avg_rating || 0}/5.0</div>
                <p className="text-xs text-muted-foreground">
                  Based on {userStats.total_trips || 0} trips
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Plane className="mr-2 h-4 w-4" />
                    Book a New Trip
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Upcoming Trips
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Methods
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Trips */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Trips</CardTitle>
                  <CardDescription>Your next adventures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Plane className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{booking.trip_title || 'Unknown Trip'}</h4>
                          <p className="text-sm text-muted-foreground">{booking.trip_date || 'Date TBD'}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(booking.status || 'confirmed')}>
                              {getStatusIcon(booking.status || 'confirmed')}
                              <span className="ml-1 capitalize">{booking.status || 'confirmed'}</span>
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{booking.amount?.toLocaleString() || '0'}</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Plane className="h-12 w-12 mx-auto mb-4" />
                      <p>No upcoming trips</p>
                      <Button className="mt-4">Book Your Next Trip</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Travel Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Travel Insights</CardTitle>
                <CardDescription>Your travel patterns and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {travelInsights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="text-center">
                      <div className={`text-2xl font-bold ${
                        insight.trend === 'up' ? 'text-green-600' :
                        insight.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {insight.value || 'N/A'}
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.title || 'Insight'}</p>
                    </div>
                  ))}
                  {travelInsights.length === 0 && (
                    <div className="col-span-3 text-center text-muted-foreground py-4">
                      No travel insights available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Trips</CardTitle>
                  <CardDescription>Trips you're excited about</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Plane className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-lg">{booking.trip_title || 'Unknown Trip'}</h4>
                            <p className="text-sm text-muted-foreground">{booking.trip_date || 'Date TBD'}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm">
                                Booked on {new Date(booking.booking_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">₹{booking.amount?.toLocaleString() || '0'}</p>
                            <Badge className={getStatusColor(booking.status || 'confirmed')}>
                              {getStatusIcon(booking.status || 'confirmed')}
                              <span className="ml-1 capitalize">{booking.status || 'confirmed'}</span>
                            </Badge>
                            <div className="flex space-x-2 mt-2">
                              <Button variant="outline" size="sm">Modify</Button>
                              <Button variant="outline" size="sm">Cancel</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No upcoming trips</h3>
                      <p className="mb-4">Ready for your next adventure?</p>
                      <Button>Explore Trips</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Past Trips</CardTitle>
                  <CardDescription>Your travel history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Plane className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{booking.trip_title || 'Unknown Trip'}</h4>
                          <p className="text-sm text-muted-foreground">{booking.trip_date || 'Date TBD'}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(booking.status || 'completed')}>
                              {getStatusIcon(booking.status || 'completed')}
                              <span className="ml-1 capitalize">{booking.status || 'completed'}</span>
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{booking.amount?.toLocaleString() || '0'}</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pastBookings.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No past trips yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Trips</CardTitle>
                <CardDescription>Trips you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteTrips?.map((trip) => (
                    <div key={trip.id} className="border rounded-lg overflow-hidden">
                      {trip.trip?.image ? (
                        <img
                          src={trip.trip.image}
                          alt={trip.trip.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Plane className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-medium text-lg">{trip.trip?.title || 'Unknown Trip'}</h4>
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm ml-1">4.8</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ₹{trip.trip?.price?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <Button className="w-full mt-4">Book Now</Button>
                      </div>
                    </div>
                  ))}
                  {(!favoriteTrips || favoriteTrips.length === 0) && (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4" />
                      <p>No favorite trips yet</p>
                      <Button className="mt-4">Explore Trips</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Email - Booking Updates</label>
                      <p className="text-sm text-muted-foreground">Receive booking confirmations and updates</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.email_bookings || false}
                      onCheckedChange={(checked) =>
                        apiClient.updateNotificationSettings({
                          ...notificationSettings,
                          email_bookings: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Email - Promotions</label>
                      <p className="text-sm text-muted-foreground">Special offers and travel deals</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.email_promotions || false}
                      onCheckedChange={(checked) =>
                        apiClient.updateNotificationSettings({
                          ...notificationSettings,
                          email_promotions: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">SMS Updates</label>
                      <p className="text-sm text-muted-foreground">Important trip updates via SMS</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.sms_updates || false}
                      onCheckedChange={(checked) =>
                        apiClient.updateNotificationSettings({
                          ...notificationSettings,
                          sms_updates: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">WhatsApp Updates</label>
                      <p className="text-sm text-muted-foreground">Real-time updates via WhatsApp</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.whatsapp_updates || false}
                      onCheckedChange={(checked) =>
                        apiClient.updateNotificationSettings({
                          ...notificationSettings,
                          whatsapp_updates: checked
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Travel Preferences</CardTitle>
                  <CardDescription>Customize your travel experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Preferred Trip Types</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {travelPreferences?.preferred_trip_types?.map((type, index) => (
                        <Badge key={index} variant="secondary">{type}</Badge>
                      )) || (
                        <span className="text-sm text-muted-foreground">No preferences set</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Group Size Preference</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {travelPreferences?.preferred_group_size || 'Not set'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Budget Range</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      ₹{travelPreferences?.preferred_budget_min?.toLocaleString() || '0'} - ₹{travelPreferences?.preferred_budget_max?.toLocaleString() || '0'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Activity Level</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {travelPreferences?.preferred_activity_level || 'Not set'}
                    </p>
                  </div>

                  <Button className="w-full mt-4">Update Preferences</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}