import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
  XMarkIcon,
  DocumentTextIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminClients, useClientPayments } from '@/hooks/queries/useAdminQueries';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Client } from '@/types';

type SortField = 'totalInvestment' | 'totalPaid' | 'totalOverdue' | 'fullName' | 'planCount';
type SortDir = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'completed' | 'paused';

// Grouped customer type
interface UniqueCustomer {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  plans: Client[];
  totalInvestment: number;
  totalPaid: number;
  totalRemaining: number;
  totalOverdue: number;
  planCount: number;
  isHighValue: boolean;
  earliestDate: string | null;
}

// Ledger sub-component shown inside detail dialog
const ClientLedger: React.FC<{ clientId: string }> = ({ clientId }) => {
  const { data: payments = [], isLoading } = useClientPayments(clientId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#d4af37' }}></div>
      </div>
    );
  }

  if (payments.length === 0) {
    return <p className="text-gray-500 text-sm py-4 text-center">No payment records found.</p>;
  }

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalDue = payments.reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter(p => p.status === 'overdue');

  return (
    <div className="space-y-4">
      {/* Ledger summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg p-3 border border-gold-200/10 bg-gold-900/10">
          <p className="text-xs text-gray-400">Total Due</p>
          <p className="text-lg font-bold text-white">{formatCurrency(totalDue)}</p>
        </div>
        <div className="rounded-lg p-3 border border-green-500/20 bg-green-900/10">
          <p className="text-xs text-gray-400">Total Paid</p>
          <p className="text-lg font-bold text-green-400">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="rounded-lg p-3 border border-red-500/20 bg-red-900/10">
          <p className="text-xs text-gray-400">Overdue</p>
          <p className="text-lg font-bold text-red-400">{overdue.length} payment{overdue.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Payment history table */}
      <div className="rounded-xl border border-gold-200/10 overflow-hidden max-h-[300px] overflow-y-auto">
        <Table>
          <TableHeader className="bg-gold-900/10 sticky top-0">
            <TableRow className="border-gold-200/10 hover:bg-transparent">
              <TableHead className="text-xs">#</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Due Date</TableHead>
              <TableHead className="text-xs">Paid Date</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id} className="border-gold-200/10 hover:bg-gold-900/5 text-white text-sm">
                <TableCell className="py-2">{p.installmentNumber || '-'}</TableCell>
                <TableCell className="py-2 capitalize">{p.type || 'installment'}</TableCell>
                <TableCell className="py-2">{formatCurrency(p.amount)}</TableCell>
                <TableCell className="py-2 text-gray-400">{formatDate(p.dueDate)}</TableCell>
                <TableCell className="py-2 text-gray-400">{p.paidDate ? formatDate(p.paidDate) : '-'}</TableCell>
                <TableCell className="py-2">
                  <Badge variant={p.status === 'paid' ? 'success' : p.status === 'overdue' ? 'destructive' : 'secondary'}>
                    {p.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active': return <Badge variant="success">Active</Badge>;
    case 'completed': return <Badge variant="info">Completed</Badge>;
    case 'paused': return <Badge variant="warning">Paused</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export const CustomerManagementPage: React.FC = () => {
  const { data: clients = [], isLoading: loading } = useAdminClients();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [minInvestment, setMinInvestment] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalInvestment');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<UniqueCustomer | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Group clients by userId into unique customers
  const { uniqueCustomers, highValueThreshold } = useMemo(() => {
    const grouped = new Map<string, Client[]>();
    clients.forEach(c => {
      const key = c.userId;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(c);
    });

    const totalInvAll = clients.reduce((s, c) => s + c.investmentAmount, 0);
    const avgInvestment = clients.length > 0 ? totalInvAll / new Set(clients.map(c => c.userId)).size : 0;
    const threshold = avgInvestment * 1.5;

    const customers: UniqueCustomer[] = Array.from(grouped.entries()).map(([userId, plans]) => {
      const totalInvestment = plans.reduce((s, p) => s + p.investmentAmount, 0);
      const totalPaid = plans.reduce((s, p) => s + (p.totalPaid || 0), 0);
      const totalRemaining = plans.reduce((s, p) => s + (p.remainingBalance || 0), 0);
      const totalOverdue = plans.reduce((s, p) => s + (p.overdueCount || 0), 0);
      const first = plans[0];
      const earliestDate = plans.reduce((earliest, p) => {
        if (!p.createdAt) return earliest;
        return !earliest || p.createdAt < earliest ? p.createdAt : earliest;
      }, null as string | null);

      return {
        userId,
        fullName: first.fullName || 'Unknown',
        email: first.email || '',
        phone: first.phone || '',
        plans,
        totalInvestment,
        totalPaid,
        totalRemaining,
        totalOverdue,
        planCount: plans.length,
        isHighValue: totalInvestment >= threshold,
        earliestDate,
      };
    });

    return { uniqueCustomers: customers, highValueThreshold: threshold };
  }, [clients]);

  // Filter and sort unique customers
  const filteredCustomers = useMemo(() => {
    let result = [...uniqueCustomers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.fullName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.userId.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.plans.some(p => p.status === statusFilter));
    }

    const minAmt = Number(minInvestment);
    if (minAmt > 0) {
      result = result.filter(c => c.totalInvestment >= minAmt);
    }

    // Sort: high-value always first, then by chosen field
    result.sort((a, b) => {
      // High value customers always on top
      if (a.isHighValue && !b.isHighValue) return -1;
      if (!a.isHighValue && b.isHighValue) return 1;

      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (Number(aVal) - Number(bVal)) : (Number(bVal) - Number(aVal));
    });

    return result;
  }, [uniqueCustomers, searchTerm, statusFilter, minInvestment, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // Stats
  const totalInvestment = clients.reduce((s, c) => s + c.investmentAmount, 0);
  const totalPaid = clients.reduce((s, c) => s + (c.totalPaid || 0), 0);
  const totalOverdue = clients.reduce((s, c) => s + (c.overdueCount || 0), 0);
  const highValueCount = uniqueCustomers.filter(c => c.isHighValue).length;
  const uniqueCount = uniqueCustomers.length;

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{
            fontFamily: 'Playfair Display, serif',
            backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>Customer Management</h1>
          <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>High-value customer insights, financial ledger & payment tracking</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Investment', value: formatCurrency(totalInvestment), icon: CurrencyDollarIcon, delay: 0.1 },
          { label: 'Total Collected', value: formatCurrency(totalPaid), icon: ChartBarIcon, delay: 0.2 },
          { label: 'High-Value Clients', value: highValueCount, icon: UserGroupIcon, delay: 0.3 },
          { label: 'Overdue Payments', value: totalOverdue, icon: ExclamationTriangleIcon, delay: 0.4 },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: stat.delay }}>
            <Card className="abs-card-premium">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.9)' }}>{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8" style={{ color: '#d4af37' }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <Card className="abs-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#d4af37' }} />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'border-[#d4af37] text-[#d4af37]' : ''}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-4 pt-2 flex-wrap">
                    {/* Status filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Status:</span>
                      {(['all', 'active', 'completed', 'paused'] as StatusFilter[]).map((s) => (
                        <Button
                          key={s}
                          variant="ghost"
                          size="sm"
                          className={statusFilter === s ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30' : 'text-gray-400'}
                          onClick={() => setStatusFilter(s)}
                        >
                          {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </Button>
                      ))}
                    </div>

                    {/* Min investment */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 whitespace-nowrap">Min Investment:</span>
                      <Input
                        type="number"
                        placeholder="e.g. 5000000"
                        value={minInvestment}
                        onChange={(e) => setMinInvestment(e.target.value)}
                        className="w-40"
                        style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                      />
                    </div>

                    {/* Clear filters */}
                    {(statusFilter !== 'all' || minInvestment) && (
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => { setStatusFilter('all'); setMinInvestment(''); }}>
                        <XMarkIcon className="h-4 w-4 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Unique Customers Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
        <Card className="abs-card">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37' }}>
              Customers ({filteredCustomers.length} unique)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gold-200/10 hover:bg-transparent">
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('fullName')}>
                      <span className="flex items-center gap-1">Customer {sortField === 'fullName' && <ArrowsUpDownIcon className="h-3 w-3" />}</span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('planCount')}>
                      <span className="flex items-center gap-1">Plans {sortField === 'planCount' && <ArrowsUpDownIcon className="h-3 w-3" />}</span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('totalInvestment')}>
                      <span className="flex items-center gap-1">Total Investment {sortField === 'totalInvestment' && <ArrowsUpDownIcon className="h-3 w-3" />}</span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('totalPaid')}>
                      <span className="flex items-center gap-1">Total Paid {sortField === 'totalPaid' && <ArrowsUpDownIcon className="h-3 w-3" />}</span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('totalOverdue')}>
                      <span className="flex items-center gap-1">Overdue {sortField === 'totalOverdue' && <ArrowsUpDownIcon className="h-3 w-3" />}</span>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        No customers match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.userId} className="border-gold-200/10 hover:bg-gold-900/5 text-white">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border border-gold-500/20 bg-gold-900/40 text-gold-400">
                                {customer.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="block">{customer.fullName}</span>
                                {customer.isHighValue && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                    style={{
                                      backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                                      color: '#000',
                                    }}>
                                    <StarIconSolid className="h-3 w-3" />
                                    High Value
                                  </span>
                                )}
                              </div>
                              <span className="block text-xs text-gray-500">{customer.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{customer.planCount} plan{customer.planCount !== 1 ? 's' : ''}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(customer.totalInvestment)}</TableCell>
                        <TableCell className="text-green-400">{formatCurrency(customer.totalPaid)}</TableCell>
                        <TableCell>
                          {customer.totalOverdue > 0
                            ? <span className="text-red-400 font-semibold">{customer.totalOverdue}</span>
                            : <span className="text-gray-500">0</span>
                          }
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => { setSelectedCustomer(customer); setExpandedPlanId(null); }}>
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Plans
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customer Plans Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => { if (!open) { setSelectedCustomer(null); setExpandedPlanId(null); } }}>
        <DialogContent className="max-w-4xl bg-[#1a1a1a] border-gold-200/20 text-white max-h-[85vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-3" style={{ color: '#d4af37' }}>
                  {selectedCustomer.fullName}
                  {selectedCustomer.isHighValue && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
                        color: '#000',
                      }}>
                      <StarIconSolid className="h-3.5 w-3.5" />
                      High Value
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  All enrolled plans and financial details
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {/* Customer summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg p-3 border border-gold-200/10 bg-gold-900/10">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-white truncate">{selectedCustomer.email || '-'}</p>
                  </div>
                  <div className="rounded-lg p-3 border border-gold-200/10 bg-gold-900/10">
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm text-white">{selectedCustomer.phone || '-'}</p>
                  </div>
                  <div className="rounded-lg p-3 border border-green-500/20 bg-green-900/10">
                    <p className="text-xs text-gray-400">Total Paid</p>
                    <p className="text-lg font-bold text-green-400">{formatCurrency(selectedCustomer.totalPaid)}</p>
                  </div>
                  <div className="rounded-lg p-3 border border-gold-200/10 bg-gold-900/10">
                    <p className="text-xs text-gray-400">Total Investment</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(selectedCustomer.totalInvestment)}</p>
                  </div>
                </div>

                {/* Plans list */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-[#d4af37]" />
                    Enrolled Plans ({selectedCustomer.planCount})
                  </h3>
                  <div className="space-y-3">
                    {selectedCustomer.plans.map((plan) => {
                      const progress = plan.totalInstallments > 0
                        ? (plan.currentInstallment / plan.totalInstallments) * 100
                        : 0;
                      const isExpanded = expandedPlanId === plan.id;
                      return (
                        <div key={plan.id} className="rounded-xl border border-gold-200/10 overflow-hidden">
                          {/* Plan header row */}
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gold-900/10 transition-colors"
                            onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-lg bg-gold-900/40 flex items-center justify-center border border-gold-500/20">
                                  <CurrencyDollarIcon className="h-5 w-5 text-gold-400" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white truncate">{plan.propertyName || 'Unnamed Property'}</span>
                                  {getStatusBadge(plan.status)}
                                </div>
                                <span className="text-xs text-gray-500">Investment: {formatCurrency(plan.investmentAmount)}</span>
                              </div>
                              <div className="flex items-center gap-6 flex-shrink-0">
                                <div className="text-right hidden md:block">
                                  <p className="text-xs text-gray-400">Paid</p>
                                  <p className="text-sm font-semibold text-green-400">{formatCurrency(plan.totalPaid || 0)}</p>
                                </div>
                                <div className="hidden md:flex items-center space-x-2">
                                  <div className="w-20 rounded-full h-2" style={{ background: 'rgba(91, 85, 85, 0.5)' }}>
                                    <div className="h-2 rounded-full" style={{
                                      width: `${progress}%`,
                                      backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                                    }}></div>
                                  </div>
                                  <span className="text-xs text-gray-400">{plan.currentInstallment}/{plan.totalInstallments}</span>
                                </div>
                                {isExpanded
                                  ? <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                                  : <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                }
                              </div>
                            </div>
                          </div>

                          {/* Plan details (expanded) */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-4 border-t border-gold-200/10 pt-4">
                                  {/* Plan details grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                      <p className="text-xs text-gray-500">Investment Amount</p>
                                      <p className="text-sm font-bold text-white">{formatCurrency(plan.investmentAmount)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Remaining Balance</p>
                                      <p className="text-sm font-bold" style={{ color: (plan.remainingBalance || 0) > 0 ? '#f87171' : '#4ade80' }}>
                                        {formatCurrency(plan.remainingBalance || 0)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Overdue Payments</p>
                                      <p className="text-sm font-bold text-white">{plan.overdueCount || 0}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Enrolled Since</p>
                                      <p className="text-sm text-white">{plan.createdAt ? formatDate(plan.createdAt) : 'N/A'}</p>
                                    </div>
                                  </div>

                                  {/* Installment progress */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-gray-400">Payment Progress</span>
                                      <span className="text-xs text-gray-400">{plan.currentInstallment} / {plan.totalInstallments}</span>
                                    </div>
                                    <div className="w-full rounded-full h-3" style={{ background: 'rgba(91, 85, 85, 0.5)' }}>
                                      <div className="h-3 rounded-full transition-all" style={{
                                        width: `${progress}%`,
                                        backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                                      }}></div>
                                    </div>
                                  </div>

                                  {/* Ledger */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <DocumentTextIcon className="h-5 w-5 text-[#d4af37]" />
                                      <h4 className="text-sm font-semibold text-white">Payment Ledger</h4>
                                    </div>
                                    <ClientLedger clientId={plan.id} />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Member since */}
                <div className="pt-2 border-t border-gold-200/10">
                  <p className="text-xs text-gray-500">Customer since {selectedCustomer.earliestDate ? formatDate(selectedCustomer.earliestDate) : 'N/A'}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
