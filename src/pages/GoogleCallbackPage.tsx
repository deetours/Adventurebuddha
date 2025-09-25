import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        toast({
          title: "Google Login Failed",
          description: `Authentication error: ${error}`,
          variant: "destructive",
        });
        navigate('/auth/login');
        return;
      }

      if (!code) {
        toast({
          title: "Google Login Failed",
          description: "No authorization code received",
          variant: "destructive",
        });
        navigate('/auth/login');
        return;
      }

      try {
        // Exchange the authorization code for tokens
        const response = await fetch('http://localhost:8000/api/auth/social/google/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store tokens and user data
          localStorage.setItem('auth-token', data.access_token);
          localStorage.setItem('refresh-token', data.refresh_token);

          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });

          navigate('/home');
        } else {
          throw new Error(data.detail || 'Failed to authenticate with Google');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        toast({
          title: "Google Login Failed",
          description: error instanceof Error ? error.message : "An error occurred during Google login",
          variant: "destructive",
        });
        navigate('/auth/login');
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Completing Google login...</p>
      </div>
    </div>
  );
}