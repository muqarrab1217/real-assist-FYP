import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthContext();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    smsAlerts: false,
    darkMode: false,
    language: 'en',
    timezone: 'UTC-5',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: '',
  });

  const handleRequestOtp = async () => {
    if (!currentPassword) {
      alert('Please enter your current password first');
      return;
    }

    setIsRequestingOtp(true);
    try {
      // 1. Verify current password
      await authAPI.verifyPassword(user?.email || '', currentPassword);

      // 2. Request OTP
      await authAPI.requestPasswordResetOTP(user?.email || '');
      setIsOtpModalOpen(true);
    } catch (error: any) {
      console.error('Failed to request OTP:', error);
      alert(error.message || 'Verification failed or failed to send OTP. Please try again.');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtpAndReset = async () => {
    if (!otpCode || !passwords.new || !passwords.confirm) {
      alert('Please fill in all fields');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      alert('Passwords do not match');
      return;
    }

    setIsVerifying(true);
    try {
      await authAPI.verifyOTPAndUpdatePassword(user?.email || '', otpCode, passwords.new);
      alert('Password updated successfully!');
      setIsOtpModalOpen(false);
      setCurrentPassword('');
      setOtpCode('');
      setPasswords({ new: '', confirm: '' });
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      alert(error.message || 'Invalid OTP or failed to update password.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{
          fontFamily: 'Playfair Display, serif',
          backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>Settings</h1>
        <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Manage your account preferences and system settings</p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle className="flex items-center" style={{
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>
              <UserIcon className="h-5 w-5 mr-2" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Full Name</label>
                <Input defaultValue={`${user?.firstName || ''} ${user?.lastName || ''}`} style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Email</label>
                <Input defaultValue={user?.email || ''} disabled style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Phone</label>
                <Input defaultValue="" placeholder="Not set" style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Role</label>
                <Input defaultValue={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ''} disabled style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
            </div>
            <Button className="text-black font-semibold" style={{
              backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
            }}>Save Changes</Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle className="flex items-center" style={{
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>
              <BellIcon className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: '#ffffff' }}>Push Notifications</p>
                  <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Receive notifications in the app</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{
                    background: settings.notifications ? '#d4af37' : '#262626',
                    boxShadow: settings.notifications ? '0 0 10px rgba(212,175,55,0.4)' : 'none'
                  }}></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: '#ffffff' }}>Email Updates</p>
                  <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Receive email notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailUpdates}
                    onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{
                    background: settings.emailUpdates ? '#d4af37' : '#262626',
                    boxShadow: settings.emailUpdates ? '0 0 10px rgba(212,175,55,0.4)' : 'none'
                  }}></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: '#ffffff' }}>SMS Alerts</p>
                  <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Receive SMS notifications for urgent matters</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsAlerts}
                    onChange={(e) => handleSettingChange('smsAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{
                    background: settings.smsAlerts ? '#d4af37' : '#262626',
                    boxShadow: settings.smsAlerts ? '0 0 10px rgba(212,175,55,0.4)' : 'none'
                  }}></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle className="flex items-center" style={{
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>
              <PaintBrushIcon className="h-5 w-5 mr-2" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: '#ffffff' }}>Dark Mode</p>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Switch to dark theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{
                  background: settings.darkMode ? '#d4af37' : '#262626',
                  boxShadow: settings.darkMode ? '0 0 10px rgba(212,175,55,0.4)' : 'none'
                }}></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: '#000000',
                    border: '1px solid rgba(212,175,55,0.25)',
                    color: '#ffffff'
                  }}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: '#000000',
                    border: '1px solid rgba(212,175,55,0.25)',
                    color: '#ffffff'
                  }}
                >
                  <option value="UTC-5">UTC-5 (EST)</option>
                  <option value="UTC-8">UTC-8 (PST)</option>
                  <option value="UTC+0">UTC+0 (GMT)</option>
                  <option value="UTC+1">UTC+1 (CET)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle className="flex items-center" style={{
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-md">
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Current Password</label>
              <div className="flex gap-4">
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
                <Button
                  onClick={handleRequestOtp}
                  disabled={isRequestingOtp}
                  style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}
                  className="text-black font-semibold whitespace-nowrap"
                >
                  {isRequestingOtp ? 'Sending...' : 'Change Password'}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">We will send a 6-digit verification code to your email.</p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Modal */}
        <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] border-[#d4af37]/30 text-white">
            <DialogHeader>
              <DialogTitle style={{ color: '#d4af37', fontFamily: 'Playfair Display, serif' }}>Verify Security Code</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter the 6-digit code sent to your email and your new password.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gold-400">6-Digit OTP Code</label>
                <Input
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="bg-black border-gold-200/20 text-center text-xl tracking-widest"
                  maxLength={6}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gold-400">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  className="bg-black border-gold-200/20"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gold-400">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Re-type new password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  className="bg-black border-gold-200/20"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleVerifyOtpAndReset}
                disabled={isVerifying}
                className="w-full text-black font-semibold"
                style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}
              >
                {isVerifying ? 'Updating...' : 'Save New Password'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* System Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle className="flex items-center" style={{
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>
              <GlobeAltIcon className="h-5 w-5 mr-2" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
              }}>
                <p className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>Version</p>
                <p className="font-semibold" style={{ color: '#ffffff' }}>v1.0.0</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
              }}>
                <p className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>Last Updated</p>
                <p className="font-semibold" style={{ color: '#ffffff' }}>Oct 15, 2023</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
              }}>
                <p className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>Status</p>
                <Badge style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }}>Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
