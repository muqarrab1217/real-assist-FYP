import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Ledger</h1>
            <p className="text-gray-600">Complete transaction history and balance tracking</p>
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Investment</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(450000)}</p>
                </div>
                <DocumentTextIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                </div>
                <ArrowDownTrayIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remaining Balance</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(balance)}</p>
                </div>
                <DocumentTextIcon className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Ledger Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transaction Ledger</CardTitle>
            <p className="text-sm text-gray-600">Complete record of all payments and transactions</p>
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
                  {payments.map((payment, index) => {
                    const runningBalance = 450000 - payments.slice(0, index + 1).filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
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
        <Card>
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
            <p className="text-sm text-gray-600">Upcoming payment schedule and due dates</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Next Payment</p>
                  <p className="text-lg font-semibold text-gray-900">October 15, 2023</p>
                  <p className="text-sm text-purple-600">{formatCurrency(18750)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Installments</p>
                  <p className="text-lg font-semibold text-gray-900">24</p>
                  <p className="text-sm text-gray-600">8 completed</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completion Date</p>
                  <p className="text-lg font-semibold text-gray-900">January 2025</p>
                  <p className="text-sm text-gray-600">16 months remaining</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
