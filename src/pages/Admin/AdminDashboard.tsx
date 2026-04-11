import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  DocumentCheckIcon,
  BuildingOfficeIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useAdminStats,
  useAdminLeads,
  useAdminClients,
  useAdminPayments,
  useAdminEnrollments
} from '@/hooks/queries/useAdminQueries';
import { useProperties } from '@/hooks/queries/useCommonQueries';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // TanStack Queries (fully cached with intelligent revalidation)
  const { data: stats = [], isLoading: loadingStats } = useAdminStats();
  const { data: allLeads = [], isLoading: loadingLeads } = useAdminLeads();
  const { data: clients = [], isLoading: loadingClients } = useAdminClients();
  const { data: payments = [], isLoading: loadingPayments } = useAdminPayments();
  const { data: projects = [], isLoading: loadingProjects } = useProperties();
  const { data: enrollments = [], isLoading: loadingEnrollments } = useAdminEnrollments();

  const loading = (loadingStats || loadingLeads || loadingClients || loadingPayments || loadingProjects || loadingEnrollments)
    && stats.length === 0 && allLeads.length === 0 && clients.length === 0
    && payments.length === 0 && projects.length === 0 && enrollments.length === 0;

  const leads = allLeads.slice(0, 4); // Top 4 leads

  // Derived metrics dynamically calculated (no need for useState)
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const monthlyRevenue = payments
    .filter(p => p.status === 'paid' && new Date(p.paidDate || new Date()) >= thisMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCount = enrollments.filter(e => e.status === 'pending').length;
  const activeCount = enrollments.filter(e => e.status === 'active').length;

  const metrics = {
    totalLeads: allLeads.length,
    totalClients: clients.length,
    totalProjects: projects.length,
    totalRevenue,
    pendingEnrollments: pendingCount,
    activeEnrollments: activeCount,
    monthlyRevenue,
    revenueChange: 12 // Placeholder
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return '#ef4444';
      case 'warm':
        return '#f59e0b';
      case 'cold':
        return '#6b7280';
      case 'dead':
        return '#374151';
      default:
        return '#d4af37';
    }
  };

  const recentActivities = [
    {
      id: 1,
      type: 'enrollment',
      message: `${metrics?.pendingEnrollments || 0} Pending Enrollment Requests`,
      time: 'Awaiting Review',
      status: 'pending',
      icon: DocumentCheckIcon
    },
    {
      id: 2,
      type: 'payment',
      message: `PKR ${(metrics?.monthlyRevenue || 0).toLocaleString()} Collected This Month`,
      time: 'Current Period',
      status: 'completed',
      icon: CurrencyDollarIcon
    },
    {
      id: 3,
      type: 'client',
      message: `${metrics?.totalClients || 0} Active Clients`,
      time: 'Total Count',
      status: 'active',
      icon: UserGroupIcon
    },
    {
      id: 4,
      type: 'project',
      message: `${metrics?.totalProjects || 0} Active Projects`,
      time: 'In Portfolio',
      status: 'update',
      icon: BuildingOfficeIcon
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-3" style={{
          fontFamily: 'Playfair Display, serif',
          backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>Admin Dashboard</h1>
        <p className="text-lg" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Real-time overview of your real estate business</p>
      </motion.div>

      {/* Key Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Leads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <Card className="abs-card-premium group cursor-pointer hover:border-gold-500/60 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'rgba(212,175,55,0.9)' }}>Total Leads</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#ffffff' }}>{metrics.totalLeads}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpIcon className="h-4 w-4 mr-1" style={{ color: '#d4af37' }} />
                      <p className="text-sm font-medium" style={{ color: '#d4af37' }}>+{metrics.totalLeads > 0 ? '5' : '0'}% this month</p>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300" style={{
                    backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                  }}>
                    <UsersIcon className="h-7 w-7" style={{ color: '#000000' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="abs-card-premium group cursor-pointer hover:border-gold-500/60 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'rgba(212,175,55,0.9)' }}>Active Clients</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#ffffff' }}>{metrics.totalClients}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpIcon className="h-4 w-4 mr-1" style={{ color: '#d4af37' }} />
                      <p className="text-sm font-medium" style={{ color: '#d4af37' }}>+{Math.ceil(metrics.totalClients * 0.08)}% this month</p>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300" style={{
                    backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                  }}>
                    <UserGroupIcon className="h-7 w-7" style={{ color: '#000000' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Enrollments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="abs-card-premium group cursor-pointer hover:border-gold-500/60 transition-all"
              onClick={() => navigate('/admin/enrollments')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'rgba(212,175,55,0.9)' }}>Pending Enrollments</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#ffffff' }}>{metrics.pendingEnrollments}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm font-medium" style={{ color: '#f59e0b' }}>Awaiting review</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300" style={{
                    backgroundImage: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                  }}>
                    <DocumentCheckIcon className="h-7 w-7" style={{ color: '#000000' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="abs-card-premium group cursor-pointer hover:border-gold-500/60 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'rgba(212,175,55,0.9)' }}>Monthly Revenue</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#ffffff' }}>PKR {(metrics.monthlyRevenue / 1000).toFixed(1)}K</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpIcon className="h-4 w-4 mr-1" style={{ color: '#d4af37' }} />
                      <p className="text-sm font-medium" style={{ color: '#d4af37' }}>+{metrics.revenueChange}% from last</p>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300" style={{
                    backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                  }}>
                    <CurrencyDollarIcon className="h-7 w-7" style={{ color: '#000000' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Charts and Key Info */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Market Overview */}
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
              }}>Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                }}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Active Projects</span>
                    <span className="text-xl font-bold" style={{ color: '#d4af37' }}>{metrics?.totalProjects || 0}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gold-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                }}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Active Enrollments</span>
                    <span className="text-xl font-bold" style={{ color: '#d4af37' }}>{metrics?.activeEnrollments || 0}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gold-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                }}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Total Revenue (All Time)</span>
                    <span className="text-xl font-bold" style={{ color: '#d4af37' }}>PKR {(metrics?.totalRevenue || 0) / 1000}K</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gold-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Leads Section */}
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
              }}>Top Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leads.length > 0 ? (
                  leads.map((lead, index) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl transition-all duration-300" style={{
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                    }}>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium" style={{
                          backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                          color: '#000000'
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: '#ffffff' }}>{lead.name}</p>
                          <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>{lead.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge style={{
                          backgroundColor: getStatusColor(lead.status),
                          color: '#ffffff'
                        }}>
                          {lead.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'rgba(156, 163, 175, 0.7)' }}>No leads yet</p>
                )}
              </div>
              <Button
                onClick={() => navigate('/admin/leads')}
                variant="outline"
                className="w-full mt-4"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View All Leads
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Real-time Activity */}
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
            }}>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-xl transition-all duration-300" style={{
                    background: 'transparent'
                  }} onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%)';
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}>
                    <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{
                      backgroundImage: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)'
                    }}>
                      <IconComponent className="h-5 w-5" style={{ color: '#d4af37' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{activity.message}</p>
                      <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                );
              })}
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
        <Card className="abs-card">
          <CardHeader>
            <CardTitle style={{
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => navigate('/admin/leads')}
                variant="glass"
                className="h-20 flex-col hover:bg-gold-500/20 transition-all"
              >
                <UsersIcon className="h-6 w-6 mb-2" />
                <span className="text-xs text-center">Manage Leads</span>
              </Button>
              <Button
                onClick={() => navigate('/admin/enrollments')}
                variant="glass"
                className="h-20 flex-col hover:bg-gold-500/20 transition-all"
              >
                <ClipboardDocumentCheckIcon className="h-6 w-6 mb-2" />
                <span className="text-xs text-center">Enrollments</span>
              </Button>
              <Button
                onClick={() => navigate('/admin/customers')}
                variant="glass"
                className="h-20 flex-col hover:bg-gold-500/20 transition-all"
              >
                <UserGroupIcon className="h-6 w-6 mb-2" />
                <span className="text-xs text-center">Manage Clients</span>
              </Button>
              <Button
                onClick={() => navigate('/admin/payments')}
                variant="glass"
                className="h-20 flex-col hover:bg-gold-500/20 transition-all"
              >
                <CurrencyDollarIcon className="h-6 w-6 mb-2" />
                <span className="text-xs text-center">Payments</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
