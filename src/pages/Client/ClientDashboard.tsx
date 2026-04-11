import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  EyeIcon,
  EyeSlashIcon,
  BellIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/AuthContext';
import { useClientPayments, useClientProjectUpdates } from '@/hooks/queries/useClientQueries';
import { useProperties } from '@/hooks/queries/useCommonQueries';

export const ClientDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [showFinancials, setShowFinancials] = useState(false);

  // TanStack Queries (Auto-cached & background syncing)
  const { data: payments = [], isLoading: loadingPayments } = useClientPayments();
  const { data: projects = [], isLoading: loadingProjects } = useProperties();
  const { data: updates = [], isLoading: loadingUpdates } = useClientProjectUpdates();

  const loading = (loadingPayments || loadingProjects || loadingUpdates)
    && payments.length === 0 && projects.length === 0 && updates.length === 0;

  // Derived Analytics (no need for useState)
  const totalInvested = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = payments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const monthlyPayment = payments.length > 0 ? totalInvested / payments.length : 0;

  const maskAmount = (amount: number) => {
    if (!showFinancials) {
      return '***,***';
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  const getUpcomingPayments = () => {
    const today = new Date();
    return payments
      .filter(p => p.status === 'pending' && new Date(p.dueDate) > today)
      .slice(0, 3);
  };

  const getOverduePayments = () => {
    const today = new Date();
    return payments.filter(p => p.status === 'overdue' || (p.status === 'pending' && new Date(p.dueDate) < today));
  };

  const getRecentCompleted = () => {
    return payments.filter(p => p.status === 'paid').slice(0, 3);
  };

  const isPaymentCompliant = totalInvested > 0 ? (totalPaid / totalInvested) * 100 : 0;
  const upcomingPayments = getUpcomingPayments();
  const overduePayments = getOverduePayments();
  const recentCompleted = getRecentCompleted();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#d4af37' }}></div>
          <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2" style={{
          fontFamily: 'Playfair Display, serif',
          backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>Welcome back, {user?.firstName}!</h1>
        <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Your investment portfolio at a glance</p>
      </motion.div>

      {/* Key Financial Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="abs-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle style={{ color: '#d4af37', fontFamily: 'Playfair Display, serif' }}>
              Financial Overview
            </CardTitle>
            <button
              onClick={() => setShowFinancials(!showFinancials)}
              className="p-2 rounded-lg hover:bg-gold-500/10 transition-colors"
              style={{ color: '#d4af37' }}
              title={showFinancials ? 'Hide amounts' : 'Show amounts'}
            >
              {showFinancials ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Invested */}
              <div style={{ padding: '16px', backgroundColor: 'rgba(107, 114, 128, 0.15)', borderRadius: '8px', border: '1px solid rgba(156, 163, 175, 0.2)', backdropFilter: 'blur(10px)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(156, 163, 175, 0.9)' }}>Total Invested</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e5e7eb', marginTop: '8px' }}>
                  {maskAmount(totalInvested)}
                </p>
              </div>

              {/* Amount Paid */}
              <div style={{ padding: '16px', backgroundColor: 'rgba(107, 114, 128, 0.15)', borderRadius: '8px', border: '1px solid rgba(156, 163, 175, 0.2)', backdropFilter: 'blur(10px)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(156, 163, 175, 0.9)' }}>Amount Paid</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e5e7eb', marginTop: '8px' }}>
                  {maskAmount(totalPaid)}
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(156, 163, 175, 0.8)', marginTop: '4px' }}>
                  {Math.round(isPaymentCompliant)}% Complete
                </p>
              </div>

              {/* Pending Due */}
              <div style={{ padding: '16px', backgroundColor: 'rgba(107, 114, 128, 0.15)', borderRadius: '8px', border: '1px solid rgba(156, 163, 175, 0.2)', backdropFilter: 'blur(10px)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(156, 163, 175, 0.9)' }}>Pending Due</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e5e7eb', marginTop: '8px' }}>
                  {maskAmount(totalPending)}
                </p>
              </div>

              {/* Monthly Average */}
              <div style={{ padding: '16px', backgroundColor: 'rgba(107, 114, 128, 0.15)', borderRadius: '8px', border: '1px solid rgba(156, 163, 175, 0.2)', backdropFilter: 'blur(10px)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(156, 163, 175, 0.9)' }}>Avg. Payment</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e5e7eb', marginTop: '8px' }}>
                  {maskAmount(monthlyPayment)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts & Notifications */}
      {overduePayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card style={{ borderColor: '#ef4444' }} className="abs-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" style={{ color: '#ef4444' }} />
                <CardTitle style={{ color: '#ef4444', fontSize: '16px' }}>
                  ⚠️ Overdue Payments ({overduePayments.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overduePayments.map((payment, idx) => (
                  <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {payment.project?.name} - Installment #{payment.installmentNumber}
                        </p>
                        <p style={{ fontSize: '12px', color: 'rgba(156, 163, 175, 0.7)', marginTop: '4px' }}>
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>
                        {maskAmount(payment.amount || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upcoming Payments & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="abs-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarIconComponent className="h-5 w-5" style={{ color: '#d4af37' }} />
                <CardTitle style={{ color: '#d4af37', fontSize: '16px' }}>
                  Upcoming Payments ({upcomingPayments.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingPayments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingPayments.map((payment, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-3 border-b border-gold-500/10 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white line-clamp-1">
                          {payment.project?.name}
                        </p>
                        <p style={{ fontSize: '12px', color: 'rgba(156, 163, 175, 0.7)', marginTop: '2px' }}>
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <p style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '14px', marginLeft: '8px' }}>
                        {maskAmount(payment.amount || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'rgba(156, 163, 175, 0.7)', fontSize: '14px' }}>No upcoming payments</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recently Completed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="abs-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" style={{ color: '#10b981' }} />
                <CardTitle style={{ color: '#10b981', fontSize: '16px' }}>
                  Recently Completed ({recentCompleted.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recentCompleted.length > 0 ? (
                <div className="space-y-3">
                  {recentCompleted.map((payment, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-3 border-b border-gold-500/10 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white line-clamp-1">
                          {payment.project?.name}
                        </p>
                        <p style={{ fontSize: '12px', color: 'rgba(156, 163, 175, 0.7)', marginTop: '2px' }}>
                          Paid: {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px', marginLeft: '8px' }}>
                        {maskAmount(payment.amount || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'rgba(156, 163, 175, 0.7)', fontSize: '14px' }}>No completed payments</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Investment Patterns & Project Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment Patterns */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="abs-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5" style={{ color: '#d4af37' }} />
                <CardTitle style={{ color: '#d4af37', fontSize: '16px' }}>
                  Payment Patterns
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* On-Time Rate */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ fontSize: '13px', color: '#d1d5db' }}>On-Time Payments</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#10b981' }}>
                      {payments.filter(p => p.status === 'paid').length}/{payments.length}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '9999px', backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '9999px',
                        width: `${isPaymentCompliant}%`,
                        backgroundColor: '#10b981',
                        transition: 'all 300ms ease'
                      }}
                    />
                  </div>
                </div>

                {/* Payment Status Summary */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Completed</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                      {payments.filter(p => p.status === 'paid').length} payments
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Pending</span>
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                      {payments.filter(p => p.status === 'pending').length} payments
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Projects by Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="abs-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5" style={{ color: '#3b82f6' }} />
                <CardTitle style={{ color: '#3b82f6', fontSize: '16px' }}>
                  My Projects ({projects.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {/* Currently Enrolled Projects */}
                {payments.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#d4af37', marginBottom: '8px' }}>
                      💼 Currently Enrolled ({new Set(payments.map(p => p.projectId)).size})
                    </h3>
                    <div className="space-y-2">
                      {Array.from(new Set(payments.map(p => p.projectId)))
                        .map(projectId => {
                          const payment = payments.find(p => p.projectId === projectId);
                          return payment?.project ? (
                            <div key={projectId} className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)' }}>
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{payment.project.name}</p>
                                  <p style={{ fontSize: '11px', color: 'rgba(156, 163, 175, 0.7)' }}>
                                    {payment.project.location}
                                  </p>
                                </div>
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                    color: '#d4af37',
                                    marginLeft: '8px',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  Enrolled
                                </span>
                              </div>
                            </div>
                          ) : null;
                        })}
                    </div>
                  </div>
                )}

                {/* Pending Review Projects */}
                {projects.filter(p => p.status === 'pending').length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px' }}>
                      📋 Pending Review ({projects.filter(p => p.status === 'pending').length})
                    </h3>
                    <div className="space-y-2">
                      {projects.filter(p => p.status === 'pending').map((project, idx) => (
                        <div key={idx} className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{project.name}</p>
                              <p style={{ fontSize: '11px', color: 'rgba(156, 163, 175, 0.7)' }}>
                                {project.location}
                              </p>
                            </div>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                color: '#f59e0b',
                                marginLeft: '8px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Pending
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Projects */}
                {projects.filter(p => p.status === 'approved').length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>
                      ✅ Active ({projects.filter(p => p.status === 'approved').length})
                    </h3>
                    <div className="space-y-2">
                      {projects.filter(p => p.status === 'approved').map((project, idx) => (
                        <div key={idx} className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{project.name}</p>
                              <p style={{ fontSize: '11px', color: 'rgba(156, 163, 175, 0.7)' }}>
                                {project.location}
                              </p>
                            </div>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                color: '#10b981',
                                marginLeft: '8px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Active
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Projects Message */}
                {projects.length === 0 && payments.length === 0 && (
                  <p style={{ fontSize: '14px', color: 'rgba(156, 163, 175, 0.7)', textAlign: 'center', padding: '16px 0' }}>
                    No projects yet. Start investing today!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Update Status */}
      {updates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="abs-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5" style={{ color: '#d4af37' }} />
                <CardTitle style={{ color: '#d4af37', fontSize: '16px' }}>
                  Latest Project Updates
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {updates.slice(0, 3).map((update, idx) => (
                  <div key={idx} className="pb-3 border-b border-gold-500/10 last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{update.title}</p>
                        <p style={{ fontSize: '12px', color: 'rgba(156, 163, 175, 0.7)', marginTop: '2px' }}>
                          {new Date(update.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(212, 175, 55, 0.2)',
                          color: '#d4af37'
                        }}
                      >
                        {update.progress}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// Helper component for CalendarIcon
const CalendarIconComponent = (props: React.ComponentProps<typeof ChartBarIcon>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
