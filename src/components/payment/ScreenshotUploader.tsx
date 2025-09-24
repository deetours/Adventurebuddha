import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface ScreenshotUploaderProps {
  onUpload: (file: File) => void;
  onPaymentComplete: () => void;
}

export function ScreenshotUploader({ onUpload, onPaymentComplete }: ScreenshotUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (JPEG, PNG, etc.)',
          variant: 'destructive',
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // In a real app, this would upload the file to the server
      await new Promise(resolve => setTimeout(resolve, 1500));
      onUpload(file);
      
      toast({
        title: "Screenshot Uploaded",
        description: "Your payment screenshot has been uploaded successfully.",
      });
      
      // Simulate payment verification
      setTimeout(() => {
        onPaymentComplete();
      }, 2000);
    } catch {
      toast({
        title: "Upload Failed",
        description: "Failed to upload screenshot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Payment Screenshot</CardTitle>
        <CardDescription>Upload a screenshot of your bank transfer to complete the payment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {previewUrl ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-64 mx-auto rounded-lg"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 font-medium">Drag and drop your screenshot here</p>
              <p className="text-sm text-gray-600 mt-2">
                or <span className="text-primary font-medium">browse files</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPEG, PNG (max 5MB)
              </p>
            </>
          )}
        </div>

        {file && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Payment Instructions</h4>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>Transfer ₹{/* amount would be passed as prop */} to the provided bank account</li>
                <li>Take a screenshot of the transaction confirmation</li>
                <li>Upload the screenshot using the area above</li>
                <li>Our team will verify the payment and confirm your booking</li>
              </ol>
            </div>

            <Button 
              className="w-full" 
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Screenshot & Complete Payment'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}