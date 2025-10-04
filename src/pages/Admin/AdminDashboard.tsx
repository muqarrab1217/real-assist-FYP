import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/services/api';
import { DashboardStats } from '@/types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminAPI.getDashboardStats();
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
      case 'UsersIcon':
        return UsersIcon;
      case 'UserGroupIcon':
        return UserGroupIcon;
      case 'CurrencyDollarIcon':
        return CurrencyDollarIcon;
      case 'ChartBarIcon':
        return ChartBarIcon;
      default:
        return UsersIcon;
    }
  };

  const recentActivities = [
    {
      id: 1,
      type: 'lead',
      message: 'New lead Sarah Johnson contacted about luxury condos',
      time: '2 hours ago',
      status: 'hot'
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment received from Michael Chen - $18,750',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'client',
      message: 'New client registration - Emily Rodriguez',
      time: '6 hours ago',
      status: 'active'
    },
    {
      id: 4,
      type: 'project',
      message: 'Project update posted for Sunset Towers',
      time: '1 day ago',
      status: 'update'
    }
  ];

  const topLeads = [
    { name: 'Sarah Johnson', score: 95, status: 'hot', source: 'Website' },
    { name: 'Lisa Wang', score: 88, status: 'hot', source: 'Email Campaign' },
    { name: 'Michael Chen', score: 78, status: 'warm', source: 'Referral' },
    { name: 'Emily Rodriguez', score: 45, status: 'cold', source: 'Social Media' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Overview of your real estate business performance</p>
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
              <Card className="hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                      <div className="flex items-center mt-1">
                        {stat.changeType === 'increase' ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <p className={`text-sm ${stat.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          +{stat.change}% from last month
                        </p>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts and Analytics */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-300">Chart visualization would go here</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Integration with Chart.js or Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Leads */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">Top Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topLeads.map((lead, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{lead.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={lead.status === 'hot' ? 'destructive' : lead.status === 'warm' ? 'warning' : 'secondary'}>
                        {lead.status}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{lead.score}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <EyeIcon className="h-4 w-4 mr-2" />
                View All Leads
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Activity</CardTitle>
            </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.status === 'hot' ? 'bg-red-500' :
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'active' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">Quick Actions</CardTitle>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <UsersIcon className="h-6 w-6 mb-2" />
                <span className="text-sm">Manage Leads</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <UserGroupIcon className="h-6 w-6 mb-2" />
                <span className="text-sm">View Clients</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <CurrencyDollarIcon className="h-6 w-6 mb-2" />
                <span className="text-sm">Check Payments</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <ChartBarIcon className="h-6 w-6 mb-2" />
                <span className="text-sm">View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
