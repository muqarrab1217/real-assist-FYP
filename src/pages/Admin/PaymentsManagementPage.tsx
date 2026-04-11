import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportService } from '@/services/exportService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAdminPayments } from '@/hooks/queries/useAdminQueries';

export const PaymentsManagementPage: React.FC = () => {
  const { data: payments = [], isLoading: loading } = useAdminPayments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear - 1);

  // Available years for export selector
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    payments.forEach(p => {
      const date = new Date(p.paidDate || p.dueDate);
      years.add(date.getFullYear());
    });
    const sorted = Array.from(years).sort((a, b) => b - a);
    if (sorted.length === 0) sorted.push(currentYear - 1);
    return sorted;
  }, [payments, currentYear]);

  // Financial analytics
  const analytics = useMemo(() => {
    const paidPayments = payments.filter(p => p.status === 'paid');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const overduePayments = payments.filter(p => p.status === 'overdue');

    const totalCollected = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalBilled = payments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingBalance = totalBilled - totalCollected;
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    const uniqueClients = new Set(payments.map(p => p.clientId)).size;

    // Monthly trends (last 12 months)
    const monthlyData: { month: string; collected: number; billed: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      const monthPayments = payments.filter(p => {
        const pd = new Date(p.paidDate || p.dueDate);
        return `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}` === monthKey;
      });

      monthlyData.push({
        month: monthLabel,
        collected: monthPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
        billed: monthPayments.reduce((s, p) => s + p.amount, 0),
      });
    }

    // Year-over-year comparison
    const thisYearCollected = paidPayments
      .filter(p => new Date(p.paidDate || p.dueDate).getFullYear() === currentYear)
      .reduce((s, p) => s + p.amount, 0);
    const lastYearCollected = paidPayments
      .filter(p => new Date(p.paidDate || p.dueDate).getFullYear() === currentYear - 1)
      .reduce((s, p) => s + p.amount, 0);
    const yoyGrowth = lastYearCollected > 0 ? ((thisYearCollected - lastYearCollected) / lastYearCollected) * 100 : 0;

    // Annual collection goal (total billed for current year)
    const thisYearBilled = payments
      .filter(p => new Date(p.paidDate || p.dueDate).getFullYear() === currentYear)
      .reduce((s, p) => s + p.amount, 0);
    const goalProgress = thisYearBilled > 0 ? (thisYearCollected / thisYearBilled) * 100 : 0;

    return {
      totalCollected,
      totalBilled,
      outstandingBalance,
      overdueAmount,
      pendingAmount,
      collectionRate,
      uniqueClients,
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
      overdueCount: overduePayments.length,
      monthlyData,
      thisYearCollected,
      lastYearCollected,
      yoyGrowth,
      goalProgress,
      thisYearBilled,
    };
  }, [payments, currentYear]);

  // Ledger entries with running balance
  const ledgerEntries = useMemo(() => {
    const sorted = [...payments].sort((a, b) =>
      new Date(a.paidDate || a.dueDate).getTime() - new Date(b.paidDate || b.dueDate).getTime()
    );

    let runningBalance = 0;
    return sorted.map(p => {
      const isPaid = p.status === 'paid';
      const debit = isPaid ? p.amount : 0;
      const credit = !isPaid ? p.amount : 0;
      runningBalance += credit - debit;
      return { ...p, debit, credit, runningBalance };
    }).reverse();
  }, [payments]);

  // Filtered ledger entries
  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter(entry => {
      const matchesSearch = searchTerm === '' ||
        (entry.clientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.propertyName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.installmentNumber.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ledgerEntries, searchTerm, statusFilter]);

  const getStatusBadge = (status: string, verificationStatus?: string) => {
    if (verificationStatus === 'pending_verification') {
      return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Awaiting Verification</Badge>;
    }
    if (verificationStatus === 'rejected') {
      return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Proof Rejected</Badge>;
    }
    if (verificationStatus === 'verified') {
      return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Verified</Badge>;
    }
    switch (status) {
      case 'paid':
        return <Badge variant="success">Settled</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExportPDF = async () => {
    try {
      const yearEntries = ledgerEntries.filter(entry => {
        const entryDate = new Date(entry.paidDate || entry.dueDate);
        return entryDate.getFullYear() === selectedYear;
      });
      const yearCollected = yearEntries.reduce((s, e) => s + e.debit, 0);
      const yearBilled = yearEntries.reduce((s, e) => s + e.debit + e.credit, 0);

      await exportService.exportAdminPDF({
        entries: yearEntries,
        year: selectedYear,
        totalCollected: yearCollected,
        totalBilled: yearBilled,
        collectionRate: yearBilled > 0 ? (yearCollected / yearBilled) * 100 : 0,
        outstandingBalance: yearBilled - yearCollected,
      });
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportService.exportAdminExcel({ entries: ledgerEntries });
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  };

  const maxMonthlyCollected = Math.max(...analytics.monthlyData.map(m => m.collected), 1);

  if (loading && payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
        <p style={{ color: '#d4af37' }} className="font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Loading Financial Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BanknotesIcon className="h-4 w-4" style={{ color: '#d4af37' }} />
              <span className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: '#d4af37' }}>Financial Records</span>
            </div>
            <h1 className="text-3xl font-bold mb-1" style={{
              fontFamily: 'Playfair Display, serif',
              backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>Payments & Ledger</h1>
            <p style={{ color: 'rgba(156, 163, 175, 0.9)' }} className="text-sm italic">
              Comprehensive financial overview of all client transactions and collections.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32">
              <CustomDropdown
                value={selectedYear.toString()}
                onChange={(val) => setSelectedYear(parseInt(val))}
                options={availableYears.map(y => ({ label: y.toString(), value: y.toString() }))}
                placeholder="Year"
              />
            </div>
            <Button variant="outline" onClick={handleExportPDF}>
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              PDF Report ({selectedYear})
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Excel (All Time)
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Collected', value: formatCurrency(analytics.totalCollected), icon: CheckCircleIcon, color: '#22c55e' },
          { label: 'Outstanding Balance', value: formatCurrency(analytics.outstandingBalance), icon: ClockIcon, color: '#d4af37' },
          { label: 'Collection Rate', value: `${analytics.collectionRate.toFixed(1)}%`, icon: ArrowTrendingUpIcon, color: '#d4af37' },
          { label: 'Overdue Amount', value: formatCurrency(analytics.overdueAmount), icon: ExclamationTriangleIcon, color: '#ef4444' },
          { label: 'Pending Amount', value: formatCurrency(analytics.pendingAmount), icon: CurrencyDollarIcon, color: 'rgba(212,175,55,0.7)' },
          { label: 'Active Clients', value: analytics.uniqueClients.toString(), icon: UserGroupIcon, color: '#d4af37' },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.05 }}>
            <Card className="abs-card-premium">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(156,163,175,0.7)' }}>{stat.label}</p>
                    <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                  <stat.icon className="h-5 w-5 mt-0.5" style={{ color: stat.color }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Long-term Financials & Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collection Trend */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="abs-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37' }} className="text-lg">
                  Monthly Collection Trend
                </CardTitle>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#d4af37] inline-block"></span> <span style={{ color: 'rgba(156,163,175,0.7)' }}>Collected</span></span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-44">
                {analytics.monthlyData.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end h-32">
                      <div
                        className="w-full rounded-t transition-all duration-500"
                        style={{
                          height: `${Math.max((m.collected / maxMonthlyCollected) * 100, 2)}%`,
                          background: 'linear-gradient(180deg, #d4af37, rgba(212,175,55,0.3))',
                          minHeight: '4px',
                        }}
                      />
                    </div>
                    <span className="text-[8px] font-bold uppercase" style={{ color: 'rgba(156,163,175,0.5)' }}>{m.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Goal Status & YoY */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="abs-card h-full">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37' }} className="text-lg">
                Goal Status & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Annual Collection Goal */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(156,163,175,0.7)' }}>
                    {currentYear} Collection Goal
                  </p>
                  <p className="text-sm font-bold" style={{ color: '#d4af37' }}>{analytics.goalProgress.toFixed(1)}%</p>
                </div>
                <Progress value={Math.min(analytics.goalProgress, 100)} className="h-3 bg-gold-500/5" indicatorClassName="bg-gold-500" />
                <div className="flex justify-between text-[9px] uppercase tracking-widest" style={{ color: 'rgba(156,163,175,0.5)' }}>
                  <span>Collected: {formatCurrency(analytics.thisYearCollected)}</span>
                  <span>Target: {formatCurrency(analytics.thisYearBilled)}</span>
                </div>
              </div>

              {/* Year-over-Year */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(156,163,175,0.7)' }}>
                  Year-over-Year Growth
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{ color: analytics.yoyGrowth >= 0 ? '#22c55e' : '#ef4444' }}>
                    {analytics.yoyGrowth >= 0 ? '+' : ''}{analytics.yoyGrowth.toFixed(1)}%
                  </span>
                  <ArrowTrendingUpIcon className="h-4 w-4" style={{ color: analytics.yoyGrowth >= 0 ? '#22c55e' : '#ef4444' }} />
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[9px]" style={{ color: 'rgba(156,163,175,0.6)' }}>
                    <span>{currentYear}: {formatCurrency(analytics.thisYearCollected)}</span>
                  </div>
                  <div className="flex justify-between text-[9px]" style={{ color: 'rgba(156,163,175,0.6)' }}>
                    <span>{currentYear - 1}: {formatCurrency(analytics.lastYearCollected)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(156,163,175,0.7)' }}>
                  Payment Breakdown
                </p>
                {payments.length > 0 && (
                  <>
                    <div className="flex gap-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {analytics.paidCount > 0 && (
                        <div style={{ width: `${(analytics.paidCount / payments.length) * 100}%`, background: '#22c55e' }} className="rounded-l" />
                      )}
                      {analytics.pendingCount > 0 && (
                        <div style={{ width: `${(analytics.pendingCount / payments.length) * 100}%`, background: '#d4af37' }} />
                      )}
                      {analytics.overdueCount > 0 && (
                        <div style={{ width: `${(analytics.overdueCount / payments.length) * 100}%`, background: '#ef4444' }} className="rounded-r" />
                      )}
                    </div>
                    <div className="flex gap-4 text-[9px]">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> <span style={{ color: 'rgba(156,163,175,0.6)' }}>Paid ({analytics.paidCount})</span></span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#d4af37' }} /> <span style={{ color: 'rgba(156,163,175,0.6)' }}>Pending ({analytics.pendingCount})</span></span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> <span style={{ color: 'rgba(156,163,175,0.6)' }}>Overdue ({analytics.overdueCount})</span></span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <Card className="abs-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#d4af37' }} />
                  <Input
                    placeholder="Search by client name, email, property, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                  />
                </div>
              </div>
              <div className="w-48">
                <CustomDropdown
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  options={[
                    { label: 'All Status', value: 'all' },
                    { label: 'Paid', value: 'paid' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Overdue', value: 'overdue' }
                  ]}
                  placeholder="Filter by status"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Financial Ledger Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
        <Card className="abs-card">
          <CardHeader>
            <div>
              <CardTitle style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37' }}>
                Financial Ledger <span className="text-white/60 text-base font-normal">({filteredEntries.length} transactions)</span>
              </CardTitle>
              <p className="text-xs mt-1 italic" style={{ color: 'rgba(156,163,175,0.6)' }}>
                Complete audit trail of all client payments and obligations.
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                  <TableRow>
                    <TableHead className="pl-6 text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.8)' }}>Date</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.8)' }}>Client</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.8)' }}>Property</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.8)' }}>Installment</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.8)' }}>Debit</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.8)' }}>Credit</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.8)' }}>Running Balance</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.8)' }}>Method</TableHead>
                    <TableHead className="pr-6 text-right text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.8)' }}>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry, idx) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b hover:bg-gold-500/[0.02] transition-colors"
                      style={{ borderColor: 'rgba(212,175,55,0.05)' }}
                    >
                      <TableCell className="py-4 pl-6">
                        <span className="text-white text-xs font-medium">
                          {formatDate(entry.paidDate || entry.dueDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-bold text-white">{entry.clientName || 'Unknown'}</p>
                          <p className="text-[10px]" style={{ color: 'rgba(156,163,175,0.5)' }}>{entry.clientEmail || entry.clientId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <BuildingOfficeIcon className="h-3.5 w-3.5" style={{ color: 'rgba(212,175,55,0.5)' }} />
                          <span className="text-xs text-white/80">{entry.propertyName || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-white/70">#{entry.installmentNumber}</span>
                        {entry.type && (
                          <span className="ml-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37' }}>
                            {entry.type}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-green-500">
                        {entry.debit > 0 ? `+ ${formatCurrency(entry.debit)}` : '—'}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-white/40">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}
                      </TableCell>
                      <TableCell className="text-sm font-bold" style={{ color: 'rgba(212,175,55,0.8)' }}>
                        {formatCurrency(Math.abs(entry.runningBalance))}
                      </TableCell>
                      <TableCell className="text-xs text-white/50 capitalize">
                        {entry.paymentMethod?.replace('_', ' ') || entry.method || '—'}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {getStatusBadge(entry.status, entry.verificationStatus)}
                      </TableCell>
                    </motion.tr>
                  ))}
                  {filteredEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-40 text-center italic" style={{ color: 'rgba(156,163,175,0.5)' }}>
                        No transactions found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <p className="text-[10px] text-center uppercase tracking-widest italic leading-relaxed" style={{ color: 'rgba(156,163,175,0.4)' }}>
        This is a computer-generated financial report and does not require a physical signature.
        <br /> All records are subject to final audit by the treasury department of ABS Developers.
      </p>
    </div>
  );
};
