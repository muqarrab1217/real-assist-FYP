import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import { authAPI, adminAPI } from '@/services/api';

export const SettingsPage: React.FC = () => {
  const { user, login } = useAuthContext();
  const needsProfileCompletion = (user?.role === 'employee' || user?.role === 'sales_rep') && !user?.profileCompleted;

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  // Re-sync form when user profile loads from DB (auth is async, user starts minimal)
  useEffect(() => {
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    });
  }, [user?.firstName, user?.lastName, user?.phone]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    smsAlerts: false,
    darkMode: false,
    language: 'en',
    timezone: 'UTC-5',
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdatePassword = async () => {
    setPasswordMsg(null);
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (passwords.new.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwords.current === passwords.new) {
      setPasswordMsg({ type: 'error', text: 'New password must differ from the current password.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authAPI.updatePassword(passwords.current, passwords.new);
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error('Failed to update password:', error);
      setPasswordMsg({ type: 'error', text: error.message || 'Failed to update password. Please try again.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    setProfileMsg(null);
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setProfileMsg({ type: 'error', text: 'First Name and Last Name are required.' });
      return;
    }
    if (!user) return;

    setIsSavingProfile(true);
    try {
      await adminAPI.updateProfile(user.id, {
        first_name: profileForm.firstName.trim(),
        last_name: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
        profile_completed: true,
      });

      const updatedUser = {
        ...user,
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
        profileCompleted: true,
      };
      login(updatedUser);
      setProfileMsg({ type: 'success', text: 'Profile saved successfully.' });
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      setProfileMsg({ type: 'error', text: error.message || 'Failed to save profile. Please try again.' });
    } finally {
      setIsSavingProfile(false);
    }
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

      {/* Profile Completion Banner */}
      {needsProfileCompletion && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border flex items-start gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(0,0,0,0.8))',
            borderColor: 'rgba(212,175,55,0.4)',
          }}
        >
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white text-lg">Complete Your Profile</h3>
            <p className="text-gray-400 text-sm mt-1">
              Please fill in your profile details below before accessing other sections. All fields are required.
            </p>
          </div>
        </motion.div>
      )}

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="abs-card" style={needsProfileCompletion ? { borderColor: 'rgba(212,175,55,0.5)', boxShadow: '0 0 20px rgba(212,175,55,0.15)' } : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center" style={{
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>
              <UserIcon className="h-5 w-5 mr-2" />
              Profile Settings
              {needsProfileCompletion && (
                <Badge className="ml-3" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>Required</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>First Name <span className="text-red-400">*</span></label>
                <Input
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Last Name <span className="text-red-400">*</span></label>
                <Input
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Email</label>
                <Input defaultValue={user?.email || ''} disabled style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Phone <span className="text-red-400">*</span></label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Role</label>
                <Input defaultValue={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} disabled style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="text-black font-semibold"
                style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}
              >
                {isSavingProfile ? 'Saving...' : (needsProfileCompletion ? 'Complete Profile & Continue' : 'Save Changes')}
              </Button>
              {profileMsg && (
                <div className={`flex items-center gap-2 text-sm ${profileMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {profileMsg.type === 'success'
                    ? <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                    : <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />}
                  {profileMsg.text}
                </div>
              )}
            </div>
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
                <CustomDropdown
                  value={settings.language}
                  onChange={(value) => handleSettingChange('language', value)}
                  options={[
                    { label: 'English', value: 'en' },
                    { label: 'Spanish', value: 'es' },
                    { label: 'French', value: 'fr' },
                    { label: 'German', value: 'de' }
                  ]}
                  placeholder="Select language"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Timezone</label>
                <CustomDropdown
                  value={settings.timezone}
                  onChange={(value) => handleSettingChange('timezone', value)}
                  options={[
                    { label: 'UTC-5 (EST)', value: 'UTC-5' },
                    { label: 'UTC-8 (PST)', value: 'UTC-8' },
                    { label: 'UTC+0 (GMT)', value: 'UTC+0' },
                    { label: 'UTC+1 (CET)', value: 'UTC+1' }
                  ]}
                  placeholder="Select timezone"
                />
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
            <div className="max-w-md space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Current Password</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min. 6 characters)"
                    value={passwords.new}
                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    className="pr-10"
                    style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-300"
                    style={{ color: 'rgba(212,175,55,0.7)' }}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    className="pr-10"
                    style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-300"
                    style={{ color: 'rgba(212,175,55,0.7)' }}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <Button
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}
                  className="text-black font-semibold"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
                {passwordMsg && (
                  <div className={`flex items-center gap-2 text-sm ${passwordMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordMsg.type === 'success'
                      ? <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                      : <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />}
                    {passwordMsg.text}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
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
