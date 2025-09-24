import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Users,
  Settings,
  Bell,
  TrendingUp,
  BarChart3,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { apiClient } from '@/lib/api';
import { useRealtimeDashboard } from '@/hooks/useWebSocket';

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  avgRating: number;
  monthlyGrowth: number;
  pendingBookings: number;
}

interface RecentBooking {
  id: string;
  customerName: string;
  tripName: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  date: string;
  avatar?: string;
}

interface TripPerformance {
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
  occupancy: number;
}

interface AgentMetrics {
  totalChats: number;
  avgResponseTime: number;
  userSatisfaction: number;
  activeAgents: number;
  topQueries: Array<{ query: string; count: number }>;
}

export function AdminDashboard() {
  // Real-time dashboard data
  const { dashboardData, activities, isConnected, requestUpdate } = useRealtimeDashboard();

  // API queries
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: apiClient.getAdminOverview,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: recentBookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: apiClient.getRecentBookings,
    refetchInterval: 30000,
  });

  const { data: tripPerformanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['trip-performance'],
    queryFn: apiClient.getTripPerformance,
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: agentStatusData, isLoading: agentLoading } = useQuery({
    queryKey: ['agent-status'],
    queryFn: apiClient.getAgentStatus,
    refetchInterval: 30000,
  });

  // Use real-time data if available, otherwise fall back to API data
  const stats = dashboardData?.overview || overviewData || {
    total_bookings: 0,
    total_revenue: 0,
    active_users: 0,
    avg_rating: 0,
    monthly_growth: 0,
    pending_bookings: 0
  };

  const recentBookings = recentBookingsData || [];
  const tripPerformance = tripPerformanceData || [];
  const agentMetrics = agentStatusData || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your business performance and manage operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={requestUpdate}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_bookings?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+{stats.monthly_growth || 0}%</span> from last month
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
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(stats.total_revenue / 100000)?.toFixed(1) || '0'}L</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+18.2%</span> from last month
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
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_users?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+5.4%</span> from last month
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
                <div className="text-2xl font-bold">{stats.avg_rating || 0}/5.0</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+0.2</span> from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest booking activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{booking.user_name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{booking.user_name || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{booking.trip_title || 'Unknown Trip'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{booking.amount?.toLocaleString() || '0'}</p>
                        <Badge className={getStatusColor(booking.status || 'pending')}>
                          {getStatusIcon(booking.status || 'pending')}
                          <span className="ml-1 capitalize">{booking.status || 'pending'}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {recentBookings.length === 0 && !bookingsLoading && (
                    <p className="text-center text-muted-foreground py-4">No recent bookings</p>
                  )}
                  {bookingsLoading && (
                    <div className="flex items-center justify-center py-4">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trip Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Trip Performance</CardTitle>
                  <CardDescription>Top performing trips this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tripPerformance.slice(0, 3).map((trip) => (
                    <div key={trip.trip_id || trip.trip_title} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{trip.trip_title || 'Unknown Trip'}</span>
                        <span className="text-sm text-muted-foreground">{trip.bookings_count || 0} bookings</span>
                      </div>
                      <Progress value={trip.occupancy_rate || 0} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{trip.occupancy_rate || 0}% occupied</span>
                        <span>₹{(trip.revenue / 100000)?.toFixed(1) || '0'}L revenue</span>
                      </div>
                    </div>
                  ))}
                  {tripPerformance.length === 0 && !performanceLoading && (
                    <p className="text-center text-muted-foreground py-4">No trip performance data</p>
                  )}
                  {performanceLoading && (
                    <div className="flex items-center justify-center py-4">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>Manage all bookings and their statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{booking.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground">{booking.tripName}</p>
                          <p className="text-sm text-muted-foreground">{booking.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">₹{booking.amount.toLocaleString()}</p>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Monthly revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>Revenue chart will be implemented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                      <p>Growth chart will be implemented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Performance</CardTitle>
                  <CardDescription>AI agent metrics and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Chats</span>
                    <span className="font-medium">{agentMetrics.reduce((sum, agent) => sum + (agent.total_chats || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="font-medium">
                      {(agentMetrics.reduce((sum, agent) => sum + (agent.avg_response_time || 0), 0) / Math.max(agentMetrics.length, 1)).toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Satisfaction</span>
                    <span className="font-medium">
                      {(agentMetrics.reduce((sum, agent) => sum + (agent.user_satisfaction || 0), 0) / Math.max(agentMetrics.length, 1)).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Agents</span>
                    <span className="font-medium">{agentMetrics.length}</span>
                  </div>
                  {agentLoading && (
                    <div className="flex items-center justify-center py-2">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Queries</CardTitle>
                  <CardDescription>Most frequent user questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agentMetrics.topQueries.map((query, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{query.query}</span>
                      <Badge variant="secondary">{query.count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agent Status</CardTitle>
                  <CardDescription>Current agent availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {agentMetrics.map((agent) => (
                    <div key={agent.agent_type} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm capitalize">{agent.agent_type?.replace('_', ' ') || 'Unknown Agent'}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {agent.active_sessions || 0} active
                      </span>
                    </div>
                  ))}
                  {agentMetrics.length === 0 && !agentLoading && (
                    <p className="text-center text-muted-foreground py-4">No agent data available</p>
                  )}
                  {agentLoading && (
                    <div className="flex items-center justify-center py-4">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}