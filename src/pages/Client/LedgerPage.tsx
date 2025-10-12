import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { clientAPI } from '@/services/api';
import { Payment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export const LedgerPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await clientAPI.getPayments();
        setPayments(data);
        
        // Calculate balance and total paid
        const paid = data.filter(p => p.status === 'paid');
        const totalPaidAmount = paid.reduce((sum, p) => sum + p.amount, 0);
        setTotalPaid(totalPaidAmount);
        setBalance(450000 - totalPaidAmount); // Assuming total investment is $450,000
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const blob = await clientAPI.exportLedger(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledger.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
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
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.installmentNumber.toString().includes(searchLower) ||
      payment.id.toLowerCase().includes(searchLower) ||
      payment.status.toLowerCase().includes(searchLower) ||
      formatCurrency(payment.amount).toLowerCase().includes(searchLower)
    );
  });

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
            }}>Investment Ledger</h1>
            <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Complete transaction history and balance tracking</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="abs-card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.9)' }}>Total Investment</p>
                  <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{formatCurrency(450000)}</p>
                </div>
                <DocumentTextIcon className="h-8 w-8" style={{ color: '#d4af37' }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="abs-card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.9)' }}>Amount Paid</p>
                  <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{formatCurrency(totalPaid)}</p>
                </div>
                <ArrowDownTrayIcon className="h-8 w-8" style={{ color: '#d4af37' }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="abs-card-premium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.9)' }}>Remaining Balance</p>
                  <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{formatCurrency(balance)}</p>
                </div>
                <DocumentTextIcon className="h-8 w-8" style={{ color: '#d4af37' }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="abs-card">
          <CardContent className="p-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#d4af37' }} />
              <Input
                placeholder="Search by installment number, transaction ID, status, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ledger Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>Transaction Ledger ({filteredPayments.length})</CardTitle>
            <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Complete record of all payments and transactions</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment, index) => {
                    const runningBalance = 450000 - filteredPayments.slice(0, index + 1).filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {payment.paidDate ? formatDate(payment.paidDate) : formatDate(payment.dueDate)}
                        </TableCell>
                        <TableCell>
                          Payment #{payment.installmentNumber} - {payment.status === 'paid' ? 'Installment Payment' : 'Payment Due'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          #{payment.id.slice(-8)}
                        </TableCell>
                        <TableCell>
                          {payment.status === 'paid' ? formatCurrency(payment.amount) : '-'}
                        </TableCell>
                        <TableCell>
                          {payment.status === 'pending' ? formatCurrency(payment.amount) : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(runningBalance)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>Payment Schedule</CardTitle>
            <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Upcoming payment schedule and due dates</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                }}>
                  <p className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>Next Payment</p>
                  <p className="text-lg font-semibold" style={{ color: '#ffffff' }}>October 15, 2023</p>
                  <p className="text-sm" style={{ color: '#d4af37' }}>{formatCurrency(18750)}</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                }}>
                  <p className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>Total Installments</p>
                  <p className="text-lg font-semibold" style={{ color: '#ffffff' }}>24</p>
                  <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>8 completed</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                }}>
                  <p className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>Completion Date</p>
                  <p className="text-lg font-semibold" style={{ color: '#ffffff' }}>January 2025</p>
                  <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>16 months remaining</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
