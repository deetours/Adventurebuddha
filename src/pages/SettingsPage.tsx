import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Lock, 
  Bell, 
  Shield, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newsletter: true
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    activityStatus: true,
    locationSharing: false
  });

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would call an API to update the password
    console.log('Password updated');
    setSecurityForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    toast({
      title: "Password Updated",
      description: "Your password has been successfully updated.",
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, this would call an API to delete the account
      console.log('Account deleted');
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-gray-500 mr-2" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Update your password and manage security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSecuritySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                      placeholder="Enter your current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                      placeholder="Enter your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                      placeholder="Confirm your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button type="submit">Update Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-500 mr-2" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive email updates about your bookings</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">SMS Notifications</h4>
                  <p className="text-sm text-gray-600">Receive SMS updates about your bookings</p>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-gray-600">Receive push notifications on your devices</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Newsletter</h4>
                  <p className="text-sm text-gray-600">Receive travel tips and special offers</p>
                </div>
                <Switch
                  checked={notificationSettings.newsletter}
                  onCheckedChange={(checked) => handleNotificationChange('newsletter', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-500 mr-2" />
                <CardTitle>Privacy</CardTitle>
              </div>
              <CardDescription>
                Control your privacy settings and what information you share
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select 
                  value={privacySettings.profileVisibility} 
                  onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show Activity Status</h4>
                  <p className="text-sm text-gray-600">Display when you're online</p>
                </div>
                <Switch
                  checked={privacySettings.activityStatus}
                  onCheckedChange={(checked) => handlePrivacyChange('activityStatus', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Location Sharing</h4>
                  <p className="text-sm text-gray-600">Share your location with friends</p>
                </div>
                <Switch
                  checked={privacySettings.locationSharing}
                  onCheckedChange={(checked) => handlePrivacyChange('locationSharing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Trash2 className="h-5 w-5 text-red-500 mr-2" />
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Delete Account</h4>
                  <p className="text-sm text-gray-600">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}