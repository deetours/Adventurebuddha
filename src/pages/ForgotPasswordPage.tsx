import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock password reset - in a real app, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just show a success message
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for instructions to reset your password.",
      });
      
      setIsSubmitted(true);
    } catch {
      toast({
        title: "Request Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent password reset instructions to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)} 
              className="w-full"
            >
              Resend Email
            </Button>
            
            <div className="mt-6 text-center text-sm">
              <Link to="/auth/login" className="text-primary font-medium hover:underline">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email and we'll send you instructions to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <Link to="/auth/login" className="text-primary font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}