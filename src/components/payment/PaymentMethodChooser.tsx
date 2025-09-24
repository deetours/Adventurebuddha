import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, QrCode, Upload } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'razorpay' | 'upi_qr' | 'manual';
  name: string;
  description: string;
  enabled: boolean;
}

interface PaymentMethodChooserProps {
  onSelect: (method: string) => void;
  selectedMethod?: string;
}

export function PaymentMethodChooser({ onSelect, selectedMethod }: PaymentMethodChooserProps) {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'razorpay',
      type: 'razorpay',
      name: 'Credit/Debit Card',
      description: 'Pay securely with your credit or debit card via Razorpay',
      enabled: true,
    },
    {
      id: 'upi_qr',
      type: 'upi_qr',
      name: 'UPI QR Code',
      description: 'Scan QR code with any UPI app to pay instantly',
      enabled: true,
    },
    {
      id: 'manual',
      type: 'manual',
      name: 'Bank Transfer',
      description: 'Upload screenshot of bank transfer to complete payment',
      enabled: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
        <CardDescription>Choose your preferred way to pay</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedMethod} 
          onValueChange={onSelect}
          className="space-y-4"
        >
          {paymentMethods.map((method) => (
            <div 
              key={method.id} 
              className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMethod === method.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <RadioGroupItem 
                value={method.id} 
                id={method.id} 
                className="mt-1" 
              />
              <Label 
                htmlFor={method.id} 
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center">
                  {method.type === 'razorpay' && <CreditCard className="h-5 w-5 mr-2 text-primary" />}
                  {method.type === 'upi_qr' && <QrCode className="h-5 w-5 mr-2 text-primary" />}
                  {method.type === 'manual' && <Upload className="h-5 w-5 mr-2 text-primary" />}
                  <span className="font-medium">{method.name}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{method.description}</p>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <Button 
          className="w-full mt-6" 
          disabled={!selectedMethod}
          onClick={() => selectedMethod && onSelect(selectedMethod)}
        >
          Continue with Selected Method
        </Button>
      </CardContent>
    </Card>
  );
}