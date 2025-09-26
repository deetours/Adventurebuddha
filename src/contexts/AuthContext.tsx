import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { config } from '@/lib/config';
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Firebase auth state listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setFirebaseUser(firebaseUser);

        if (firebaseUser) {
          // User is signed in with Firebase, sync with Django backend
          try {
            const idToken = await firebaseUser.getIdToken();

            // Send Firebase token to Django backend
            const response = await fetch(`${config.API_BASE_URL.replace('/api', '')}/api/auth/firebase/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id_token: idToken }),
            });

            if (response.ok) {
              const data = await response.json();
              localStorage.setItem('auth-token', data.access_token);
              localStorage.setItem('refresh-token', data.refresh_token);
              setUser(data.user);
            } else {
              console.error('Failed to sync with Django backend');
            }
          } catch (error) {
            console.error('Firebase-Django sync error:', error);
          }
        } else {
          // User is signed out from Firebase
          setUser(null);
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');
        }

        setIsLoading(false);
      });
    } catch (error) {
      console.error('Firebase auth initialization failed:', error);
      // Continue without Firebase auth
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Check for existing Django auth token on mount (for non-Firebase logins)
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token && !firebaseUser) {
      // Validate Django token and set user
      validateDjangoToken(token);
    }
  }, [firebaseUser]);

  const validateDjangoToken = async (token: string) => {
    try {
      const response = await fetch(`${config.API_BASE_URL.replace('/api', '')}/api/auth/user/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
      }
    } catch (error) {
      console.error('Django token validation failed:', error);
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL.replace('/api', '')}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth-token', data.access_token);
        localStorage.setItem('refresh-token', data.refresh_token);
        setUser(data.user);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        window.location.href = '/home';
      } else {
        throw new Error(data.detail || 'Login failed');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    if (confirmPassword && password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');

      const response = await fetch(`${config.API_BASE_URL.replace('/api', '')}/api/auth/registration/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password1: password,
          password2: password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth-token', data.access_token);
        localStorage.setItem('refresh-token', data.refresh_token);
        setUser(data.user);
        toast({
          title: "Registration Successful",
          description: "Welcome to Adventure Buddha!",
        });
        window.location.href = '/home';
      } else {
        throw new Error(data.detail || 'Registration failed');
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async () => {
    setIsLoading(true);
    try {
      // Use Firebase for Google authentication
      await signInWithPopup(auth, googleProvider);
      // Firebase auth state listener will handle the rest
      toast({
        title: "Login Successful",
        description: "Welcome to Adventure Buddha!",
      });
      window.location.href = '/home';
    } catch (error) {
      console.error('Firebase Google login error:', error);
      toast({
        title: "Google Login Failed",
        description: "Google login is not available. Please use email login instead.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Sign out from both Firebase and clear Django tokens
      await firebaseSignOut(auth).catch(() => {
        // Ignore Firebase logout errors
      });
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
      setUser(null);
      window.location.href = '/';
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if logout fails
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
      setUser(null);
      window.location.href = '/';
    }
  };

  const value = {
    user,
    firebaseUser,
    login,
    register,
    googleLogin,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};