import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { clientAPI } from '@/services/api';
import { Payment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await clientAPI.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = async (paymentId: string, amount: number) => {
    try {
      setIsProcessingPayment(paymentId);
      await clientAPI.makePayment(paymentId, amount, 'Portal');

      // Update local state immediately for snappy UI
      setPayments(prev => prev.map(p =>
        p.id === paymentId
          ? { ...p, status: 'paid' as const, paidDate: new Date() }
          : p
      ));
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessingPayment(null);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const blob = await clientAPI.exportLedger(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial_report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 py-1 font-bold">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-gold-500/10 text-gold-500 border-gold-500/20 py-1 font-bold">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 py-1 font-bold">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-gold-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = payments.filter(p => ['pending', 'overdue'].includes(p.status)).reduce((sum, p) => sum + p.amount, 0);
  const upcomingPayments = payments.filter(p => {
    const isUpcoming = p.status === 'pending' || p.status === 'overdue';
    const isSoon = new Date(p.dueDate).getTime() < new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
    return isUpcoming && isSoon;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    const projectName = (payment.project?.name || '').toLowerCase();
    const location = (payment.project?.location || '').toLowerCase();

    return (
      payment.installmentNumber.toString().includes(searchLower) ||
      payment.status.toLowerCase().includes(searchLower) ||
      projectName.includes(searchLower) ||
      location.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
        <p className="text-gold-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Accessing Financial Vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheckIcon className="h-4 w-4 text-gold-500" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold-500">Secured Financials</span>
          </div>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Wealth <span className="text-gold-400 italic">Management</span>
          </h1>
        </motion.div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="border-gold-500/20 text-gold-400 hover:bg-gold-500/10 rounded-xl px-6"
            onClick={() => handleExport('pdf')}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Financial Report
          </Button>
        </div>
      </div>

      {/* Holistic Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Equity Seeded', value: totalPaid, icon: BanknotesIcon, color: '#d4af37' },
          { label: 'Outstanding Balance', value: totalOutstanding, icon: ClockIcon, color: '#ffffff' },
          { label: 'Total Portfolio Valuation', value: totalPaid + totalOutstanding, icon: ChartBarIcon, color: '#d4af37' }
        ].map((stat, idx) => (stat.label &&
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-[#0a0a0a] border-gold-500/20 rounded-[2rem] overflow-hidden group hover:border-gold-500/40 transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className="p-3 rounded-2xl bg-gold-500/5 border border-gold-500/10 w-fit group-hover:bg-gold-500/10 transition-all">
                      <stat.icon className="h-6 w-6 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-white" style={{ color: stat.color }}>{formatCurrency(stat.value)}</h3>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Upcoming Installments */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="bg-[#0a0a0a] border-gold-500/10 rounded-[2.5rem] overflow-hidden border shadow-2xl">
            <CardHeader className="p-8 border-b border-gold-500/5">
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="h-5 w-5 text-gold-500" />
                <CardTitle className="text-xl font-bold text-white font-serif">Critical Deadlines</CardTitle>
              </div>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Payments due in the next 30 days</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {upcomingPayments.length > 0 ? (
                upcomingPayments.map((p) => (
                  <div key={p.id} className="group p-5 rounded-2xl bg-[#141414]/50 border border-gold-500/5 hover:border-gold-500/20 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <h4 className="text-white font-bold text-sm">#{p.installmentNumber} • {p.project?.name || 'Investment'}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gold-500/70 font-bold uppercase tracking-widest">
                          <ClockIcon className="h-3 w-3" />
                          Due {formatDate(p.dueDate)}
                        </div>
                      </div>
                      <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] py-0.5">
                        Action Required
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gold-500/5">
                      <span className="text-lg font-bold text-white font-serif">PKR {p.amount.toLocaleString()}</span>
                      <Button
                        size="sm"
                        className="bg-gold-500 text-black hover:bg-gold-400 font-extrabold rounded-lg text-[10px] uppercase h-8"
                        onClick={() => handleMakePayment(p.id, p.amount)}
                        disabled={isProcessingPayment === p.id}
                      >
                        {isProcessingPayment === p.id ? 'Processing...' : 'Transfer Now'}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-30">
                  <CheckCircleIcon className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm font-bold">All Clean</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Detailed Ledger */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="bg-[#0a0a0a]/60 border-gold-500/10 rounded-[2.5rem] backdrop-blur-md border shadow-2xl overflow-hidden">
            <CardHeader className="p-10 border-b border-gold-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Asset <span className="text-gold-400">Ledger</span>
                </CardTitle>
                <p className="text-sm text-gray-500 italic mt-1 font-medium">Detailed transaction reconciliation across portfolios</p>
              </div>
              <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-500" />
                <Input
                  placeholder="Search Ledger..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/40 border-gold-500/20 pl-10 h-11 rounded-xl text-sm focus:border-gold-500/50"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#0f0f0f] border-b border-gold-500/10">
                    <TableRow className="hover:bg-transparent border-transparent">
                      <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-14 pl-10">Asset Details</TableHead>
                      <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-14">Installment</TableHead>
                      <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-14">Valuation</TableHead>
                      <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-14">Timeline</TableHead>
                      <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-14">Status</TableHead>
                      <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-14 pr-10">Verification</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredPayments.map((payment, idx) => (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group border-b border-gold-500/5 hover:bg-gold-500/[0.02] transition-colors"
                        >
                          <TableCell className="py-6 pl-10">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 rounded-xl bg-gold-500/5 border border-gold-500/10">
                                <BuildingOfficeIcon className="h-5 w-5 text-gold-500/60" />
                              </div>
                              <div>
                                <p className="text-white font-bold text-sm">{payment.project?.name || 'Flagship Portfolio'}</p>
                                <p className="text-[10px] text-gray-500 font-bold tracking-wider">{payment.project?.location || 'Miami, FL'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-white font-serif font-bold italic text-lg">#{payment.installmentNumber}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-white font-bold text-sm">PKR {payment.amount.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-xs text-white font-medium italic">Due: {formatDate(payment.dueDate)}</p>
                              {payment.paidDate && (
                                <p className="text-[10px] text-green-500 font-bold uppercase">Paid: {formatDate(payment.paidDate)}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(payment.status)}
                              {getStatusBadge(payment.status)}
                            </div>
                          </TableCell>
                          <TableCell className="pr-10 text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" className="text-gold-500 h-9 px-4 hover:bg-gold-500/10 rounded-lg group-hover:translate-x-1 transition-transform">
                                  <ArrowRightIcon className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              {/* Detailed Dialog Content matching premium theme */}
                              <DialogContent className="bg-[#0a0a0a] border-gold-500/20 text-white rounded-[2rem] p-10 max-w-xl">
                                <DialogHeader>
                                  <DialogTitle className="text-3xl font-serif text-gold-500">Transaction Reconcilation</DialogTitle>
                                  <DialogDescription className="text-gray-500 text-sm">Reviewing financial records for {payment.project?.name}</DialogDescription>
                                </DialogHeader>
                                <div className="mt-8 space-y-6">
                                  <div className="p-6 rounded-2xl bg-[#141414] border border-gold-500/10">
                                    <div className="flex justify-between items-center mb-6">
                                      <span className="text-xs uppercase font-extrabold tracking-widest text-gold-500/60">Reference #</span>
                                      <span className="font-mono text-xs text-white">{payment.id.toUpperCase()}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                      <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Installment Status</p>
                                        {getStatusBadge(payment.status)}
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Method Used</p>
                                        <p className="text-sm font-bold text-white">{payment.method || 'Automated Clearing'}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Due Amount</p>
                                        <p className="text-xl font-bold text-gold-500">{formatCurrency(payment.amount)}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Settlement Date</p>
                                        <p className="text-sm font-bold text-white">{payment.paidDate ? formatDate(payment.paidDate) : 'Pending Reconcilation'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
