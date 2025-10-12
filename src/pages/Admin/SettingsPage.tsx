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

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    smsAlerts: false,
    darkMode: false,
    language: 'en',
    timezone: 'UTC-5',
  });

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
                <Input defaultValue="Admin User" style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Email</label>
                <Input defaultValue="admin@realassist.com" style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Phone</label>
                <Input defaultValue="+1 (555) 123-4567" style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Role</label>
                <Input defaultValue="Administrator" disabled style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ '--tw-ring-color': 'rgba(212,175,55,0.3)' } as any} data-checked={settings.notifications ? 'true' : 'false'}></div>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ background: settings.emailUpdates ? '#d4af37' : undefined }}></div>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ background: settings.smsAlerts ? '#d4af37' : undefined }}></div>
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ background: settings.darkMode ? '#d4af37' : undefined }}></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Current Password</label>
                <Input type="password" placeholder="Enter current password" style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>New Password</label>
                <Input type="password" placeholder="Enter new password" style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>Confirm New Password</label>
              <Input type="password" placeholder="Confirm new password" style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }} />
            </div>
            <Button variant="outline">Change Password</Button>
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
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
