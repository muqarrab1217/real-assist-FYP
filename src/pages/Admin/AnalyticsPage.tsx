import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/services/api';
import { Analytics } from '@/types';
import { formatCurrency } from '@/lib/utils';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminAPI.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const metrics = [
    {
      title: 'Total Leads',
      value: analytics?.totalLeads || 0,
      change: 12.5,
      changeType: 'increase',
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Clients',
      value: analytics?.activeClients || 0,
      change: 8.3,
      changeType: 'increase',
      icon: UsersIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics?.totalRevenue || 0),
      change: 15.2,
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(analytics?.monthlyRevenue || 0),
      change: 22.1,
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Conversion Rate',
      value: `${analytics?.conversionRate || 0}%`,
      change: 2.1,
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Average Deal Size',
      value: formatCurrency(analytics?.averageDealSize || 0),
      change: 5.7,
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ 
              fontFamily: 'Playfair Display, serif',
              backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>Analytics Dashboard</h1>
            <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Comprehensive insights into your business performance</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <EyeIcon className="h-4 w-4 mr-2" />
              View Report
            </Button>
            <Button variant="outline">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="abs-card-premium hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.9)' }}>{metric.title}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#ffffff' }}>{metric.value}</p>
                      <div className="flex items-center mt-1">
                        {metric.changeType === 'increase' ? (
                          <ArrowUpIcon className="h-4 w-4 mr-1" style={{ color: '#d4af37' }} />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 mr-1" style={{ color: '#ef4444' }} />
                        )}
                        <p className="text-sm" style={{ color: metric.changeType === 'increase' ? '#d4af37' : '#ef4444' }}>
                          +{metric.change}% from last month
                        </p>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{
                      backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                    }}>
                      <IconComponent className="h-6 w-6" style={{ color: '#000000' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="abs-card">
            <CardHeader>
              <CardTitle style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#d4af37'
              }}>Revenue Trend</CardTitle>
              <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Monthly revenue over the last 6 months</p>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
              }}>
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-2" style={{ color: '#d4af37' }} />
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Revenue Chart</p>
                  <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Integration with Chart.js or Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leads Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="abs-card">
            <CardHeader>
              <CardTitle style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#d4af37'
              }}>Lead Generation</CardTitle>
              <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>New leads acquired each month</p>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
              }}>
                <div className="text-center">
                  <UsersIcon className="h-12 w-12 mx-auto mb-2" style={{ color: '#d4af37' }} />
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Leads Chart</p>
                  <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Integration with Chart.js or Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="abs-card">
            <CardHeader>
              <CardTitle style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#d4af37'
              }}>Performance Metrics</CardTitle>
              <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Key performance indicators and benchmarks</p>
            </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
              }}>
                <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>24.5%</p>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Conversion Rate</p>
                <Badge variant="success" className="mt-2">Above Average</Badge>
              </div>
              <div className="text-center p-4 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
              }}>
                <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>2.3 days</p>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Avg Response Time</p>
                <Badge variant="success" className="mt-2">Excellent</Badge>
              </div>
              <div className="text-center p-4 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
              }}>
                <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>87%</p>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Client Satisfaction</p>
                <Badge variant="success" className="mt-2">Very Good</Badge>
              </div>
              <div className="text-center p-4 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
              }}>
                <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>156</p>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Deals Closed</p>
                <Badge variant="info" className="mt-2">On Track</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performing Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>Top Lead Sources</CardTitle>
            <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Performance by lead source</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { source: 'Website', leads: 45, conversion: 28.5, revenue: 125000 },
                { source: 'Referral', leads: 32, conversion: 35.2, revenue: 98000 },
                { source: 'Social Media', leads: 28, conversion: 22.1, revenue: 67000 },
                { source: 'Email Campaign', leads: 23, conversion: 31.8, revenue: 89000 },
                { source: 'Cold Outreach', leads: 18, conversion: 18.9, revenue: 42000 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                }}>
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{
                      backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                    }}>
                      <span className="font-medium text-sm" style={{ color: '#000000' }}>{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#ffffff' }}>{item.source}</p>
                      <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>{item.leads} leads</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: '#d4af37' }}>{item.conversion}% conversion</p>
                    <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>{formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
