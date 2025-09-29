import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  User, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Booking {
  id: string;
  trip: {
    title: string;
    image: string;
  };
  date: string;
  time: string;
  location: string;
  seats: string[];
  amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock bookings data - in a real app, this would come from an API
  // For now, showing empty state since we don't have real bookings
  const [bookings] = useState<Booking[]>([]);

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return '';
    }
  };

  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">View and manage your trip bookings</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No bookings match your search criteria.' 
                  : 'You haven\'t made any bookings yet.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link to="/trips">Explore Trips</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      <img 
                        src={booking.trip.image} 
                        alt={booking.trip.title} 
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">{booking.trip.title}</h3>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{booking.date} at {booking.time}</span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{booking.location}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 md:mt-0 flex items-center">
                          <Badge variant={getStatusVariant(booking.status)}>
                            <span className="flex items-center">
                              {getStatusIcon(booking.status)}
                              <span className="ml-1">{getStatusText(booking.status)}</span>
                            </span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-1" />
                          <span>{booking.seats.length} traveler{booking.seats.length !== 1 ? 's' : ''}</span>
                          <span className="mx-2">•</span>
                          <CreditCard className="h-4 w-4 mr-1" />
                          <span>₹{booking.amount.toLocaleString()}</span>
                        </div>
                        
                        <div className="mt-3 md:mt-0 flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/book/${booking.id}/details`}>
                              View Details
                            </Link>
                          </Button>
                          {booking.status === 'confirmed' && (
                            <Button size="sm" asChild>
                              <Link to={`/book/${booking.id}/confirmation`}>
                                View Confirmation
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}