import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentMethodChooser } from '@/components/payment/PaymentMethodChooser';
import { UPIQRCode } from '@/components/payment/UPIQRCode';
import { ScreenshotUploader } from '@/components/payment/ScreenshotUploader';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/components/ui/use-toast';

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePaymentComplete = () => {
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully.",
    });
    
    // Navigate to confirmation page
    navigate(`/book/${bookingId}/confirmation`);
  };

  const handleScreenshotUpload = (file: File) => {
    // In a real app, this would upload the file to the server
    console.log('Uploading file:', file.name);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Processing payment..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">Booking ID: {bookingId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!selectedMethod ? (
              <PaymentMethodChooser 
                onSelect={setSelectedMethod} 
              />
            ) : (
              <>
                {selectedMethod === 'upi_qr' && (
                  <UPIQRCode 
                    upiLink="upi://pay?pa=adventurebuddha@upi&pn=Adventure+Buddha&am=35000&cu=INR" 
                    amount={35000}
                    onPaymentComplete={handlePaymentComplete}
                  />
                )}
                
                {selectedMethod === 'manual' && (
                  <ScreenshotUploader 
                    onUpload={handleScreenshotUpload}
                    onPaymentComplete={handlePaymentComplete}
                  />
                )}
                
                {selectedMethod === 'razorpay' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pay with Razorpay</CardTitle>
                      <CardDescription>Complete your payment securely with Razorpay</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">Payment Instructions</h4>
                        <p className="text-sm text-blue-700">
                          You will be redirected to Razorpay to complete your payment securely.
                          After payment, you'll be redirected back to the confirmation page.
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => {
                          // In a real app, this would initialize the Razorpay checkout
                          setTimeout(() => {
                            handlePaymentComplete();
                          }, 2000);
                        }}
                      >
                        Pay with Razorpay
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedMethod(null)}
                      >
                        Choose Different Payment Method
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Trip:</span>
                    <span className="font-medium">Ladakh Adventure</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">June 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats:</span>
                    <span className="font-medium">A1, B2</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Base Price (2 travelers):</span>
                    <span>₹70,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seat Premiums:</span>
                    <span>₹500</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>₹70,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}