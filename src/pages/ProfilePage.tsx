import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuthStore } from '../stores/authStore';
import { useChainPrompting } from '../hooks/useChainPrompting';
import { Camera, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { executePageEnhancement, results } = useChainPrompting();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    bio: '',
  });

  // Chain prompting enhanced content
  const enhancedBioPlaceholder = results.bio_suggestion || "Tell us about yourself and your travel interests";

  useEffect(() => {
    // Initialize chain prompting for this page
    executePageEnhancement("ProfilePage", { user });
  }, [executePageEnhancement, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update the user profile
    console.log('Profile updated:', formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative inline-block">
                  <Avatar className="h-32 w-32 mx-auto">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-2xl">
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="sm" 
                    className="absolute bottom-2 right-2 rounded-full p-2"
                    variant="secondary"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  JPG, GIF or PNG. Max size of 5MB
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details here
                    </CardDescription>
                  </div>
                  <Button 
                    variant={isEditing ? "outline" : "default"} 
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder={enhancedBioPlaceholder as string || "Tell us about yourself"}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium">{user?.name || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium">{user?.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium">{user?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{formData.address || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-medium">January 2024</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        <div className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bio</p>
                        <p className="font-medium">{formData.bio || 'No bio provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Manage your communication and notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive email updates about your bookings</p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Receive SMS updates about your bookings</p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Newsletter</h4>
                      <p className="text-sm text-gray-600">Receive travel tips and special offers</p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
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