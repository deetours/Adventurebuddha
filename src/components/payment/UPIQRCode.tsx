import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UPIQRCodeProps {
  upiLink: string;
  amount: number;
  onPaymentComplete: () => void;
}

export function UPIQRCode({ upiLink, amount, onPaymentComplete }: UPIQRCodeProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiLink);
    setIsCopied(true);
    toast({
      title: "UPI Link Copied",
      description: "The UPI payment link has been copied to your clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with UPI</CardTitle>
        <CardDescription>Scan the QR code or copy the UPI link to pay ₹{amount.toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
          {/* In a real app, this would be an actual QR code */}
          <div className="bg-gray-100 border-2 border-dashed rounded-xl w-48 h-48 flex items-center justify-center mb-4">
            <QrCodeIcon />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Scan this QR code with any UPI app to complete your payment
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="upi-link">UPI Payment Link</Label>
          <div className="flex space-x-2">
            <Input
              id="upi-link"
              value={upiLink}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              aria-label={isCopied ? "Copied" : "Copy UPI link"}
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Payment Instructions</h4>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>Open any UPI app on your phone</li>
            <li>Scan the QR code or paste the UPI link</li>
            <li>Verify the amount is ₹{amount.toLocaleString()}</li>
            <li>Complete the payment</li>
            <li>Return to this page after payment</li>
          </ol>
        </div>

        <Button className="w-full" onClick={onPaymentComplete}>
          I've Completed the Payment
        </Button>
      </CardContent>
    </Card>
  );
}

function QrCodeIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="text-gray-400"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <path d="M7 7h3v3H7z" />
      <path d="M14 7h3v3h-3z" />
      <path d="M7 14h3v3H7z" />
      <path d="M14 14h3v3h-3z" />
    </svg>
  );
}