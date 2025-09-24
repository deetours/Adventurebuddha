import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Calendar, MapPin, User, CreditCard } from 'lucide-react';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();

  // Mock booking data - in a real app, this would come from an API
  const bookingData = {
    id: bookingId,
    pnr: 'AB-789456',
    trip: {
      title: 'Ladakh Adventure',
      date: 'June 15, 2024',
      time: '06:00 AM',
      location: 'Leh, Ladakh',
    },
    seats: ['A1', 'B2'],
    travelers: 2,
    amount: 70500,
    status: 'confirmed',
    bookingDate: 'June 1, 2024',
  };

  const handleDownloadInvoice = () => {
    // In a real app, this would download the actual invoice
    alert('Invoice download would start now');
  };

  const handleAddToCalendar = () => {
    // In a real app, this would add the event to the user's calendar
    alert('Event would be added to your calendar');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Your adventure is booked! A confirmation email has been sent to your registered email address.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {bookingData.trip.title}
                      <Badge className="ml-2" variant="secondary">
                        Confirmed
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Booking ID: {bookingData.id} | PNR: {bookingData.pnr}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium">{bookingData.trip.date} at {bookingData.trip.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{bookingData.trip.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Travelers</p>
                      <p className="font-medium">{bookingData.travelers} People</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="font-medium">₹{bookingData.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Selected Seats</h3>
                  <div className="flex flex-wrap gap-2">
                    {bookingData.seats.map((seat) => (
                      <Badge key={seat} variant="outline" className="text-lg py-1 px-3">
                        {seat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={handleAddToCalendar} variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
              <Button onClick={handleDownloadInvoice} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Check your email for the booking confirmation and travel guidelines
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Arrive at the pickup point 30 minutes before departure
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Bring a valid ID and your booking confirmation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you have any questions about your booking, our support team is here to help.
                </p>
                <Button className="w-full" asChild>
                  <Link to="/support">
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}