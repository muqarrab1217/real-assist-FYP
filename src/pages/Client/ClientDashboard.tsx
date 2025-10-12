import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon,
  CheckCircleIcon,
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { clientAPI } from '@/services/api';
import { DashboardStats } from '@/types';

export const ClientDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await clientAPI.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CurrencyDollarIcon':
        return CurrencyDollarIcon;
      case 'CheckCircleIcon':
        return CheckCircleIcon;
      case 'BanknotesIcon':
        return BanknotesIcon;
      case 'ChartBarIcon':
        return ChartBarIcon;
      default:
        return CurrencyDollarIcon;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
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
        }}>Welcome back, John!</h1>
        <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Here's an overview of your investment progress</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = getIcon(stat.icon);
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="abs-card-premium group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'rgba(212,175,55,0.9)' }}>{stat.title}</p>
                      <p className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</p>
                      <p className="text-sm mt-1" style={{ color: '#d4af37' }}>
                        +{stat.change}% from last month
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center group-hover:from-gold-500 group-hover:to-bronze-500 transition-all duration-300" style={{
                      backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                    }}>
                      <IconComponent className="h-6 w-6 text-black" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="abs-card">
            <CardHeader>
              <CardTitle style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#d4af37'
              }}>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="glass">
                <CurrencyDollarIcon className="h-5 w-5 mr-3" />
                Make Payment
              </Button>
              <Button className="w-full justify-start" variant="glass">
                <ChartBarIcon className="h-5 w-5 mr-3" />
                View Ledger
              </Button>
              <Button className="w-full justify-start" variant="glass">
                <CheckCircleIcon className="h-5 w-5 mr-3" />
                Check Project Updates
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="abs-card">
            <CardHeader>
              <CardTitle style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#d4af37'
              }}>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#d4af37' }}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium dark:text-white">Payment #8 Completed</p>
                    <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>September 14, 2023</p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#d4af37' }}>$18,750</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#d4af37' }}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium dark:text-white">Project Update Available</p>
                    <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>October 1, 2023</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#f4e68c' }}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium dark:text-white">Payment #9 Due Soon</p>
                    <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Due October 15, 2023</p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#f4e68c' }}>$18,750</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#d4af37' }}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium dark:text-white">Monthly Statement Generated</p>
                    <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>October 1, 2023</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg" style={{
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
            }}>
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6" style={{ color: '#d4af37' }} />
                <div>
                  <p className="font-medium" style={{ color: '#d4af37' }}>Upcoming Payment Due</p>
                  <p className="text-sm" style={{ color: 'rgba(212,175,55,0.8)' }}>Payment #9 is due on October 15, 2023</p>
                </div>
              </div>
              <Button className="text-black font-semibold" style={{
                backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
              }}>
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
