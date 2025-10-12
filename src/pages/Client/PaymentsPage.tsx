import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
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
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await clientAPI.getPayments();
        setPayments(data);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleMakePayment = async () => {
    if (!selectedPayment || !paymentMethod) return;

    try {
      await clientAPI.makePayment(selectedPayment.id, selectedPayment.amount, paymentMethod);
      // Refresh payments
      const updatedPayments = await clientAPI.getPayments();
      setPayments(updatedPayments);
      setSelectedPayment(null);
      setPaymentMethod('');
    } catch (error) {
      console.error('Payment failed:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5" style={{ color: '#d4af37' }} />;
      case 'pending':
        return <ClockIcon className="h-5 w-5" style={{ color: 'rgba(212,175,55,0.7)' }} />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5" style={{ color: '#ef4444' }} />;
      default:
        return <ClockIcon className="h-5 w-5" style={{ color: 'rgba(156, 163, 175, 0.7)' }} />;
    }
  };

  const paidPayments = payments.filter(p => p.status === 'paid');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    const apartmentSearch = payment.apartmentDetails ? 
      `${payment.apartmentDetails.building} ${payment.apartmentDetails.floor} ${payment.apartmentDetails.unitNumber} ${payment.apartmentDetails.bedrooms} ${payment.apartmentDetails.view}`.toLowerCase() : '';
    
    return (
      payment.installmentNumber.toString().includes(searchLower) ||
      payment.method?.toLowerCase().includes(searchLower) ||
      payment.status.toLowerCase().includes(searchLower) ||
      apartmentSearch.includes(searchLower) ||
      'abs poc 2 residential'.includes(searchLower)
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
        <h1 className="text-3xl font-bold mb-2" style={{ 
          fontFamily: 'Playfair Display, serif',
          backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>Payment Management</h1>
        <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Track and manage your investment payments</p>
      </motion.div>

      {/* Payment Summary Cards */}
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
                  <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.9)' }}>Total Paid</p>
                  <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>{formatCurrency(totalPaid)}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8" style={{ color: '#d4af37' }} />
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
                  <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.9)' }}>Pending Payments</p>
                  <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{formatCurrency(totalPending)}</p>
                </div>
                <ClockIcon className="h-8 w-8" style={{ color: 'rgba(212,175,55,0.7)' }} />
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
                  <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.9)' }}>Payments Made</p>
                  <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{paidPayments.length}/24</p>
                </div>
                <BanknotesIcon className="h-8 w-8" style={{ color: '#d4af37' }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Overview - Previous & Upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Payments */}
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
              }}>Previous Payments</CardTitle>
              <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Recently completed payments</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paidPayments.slice(0, 3).map((payment) => (
                  <Dialog key={payment.id}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="glass" 
                        className="w-full justify-between h-auto py-4"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <div className="text-left">
                          <p className="font-medium" style={{ color: '#ffffff' }}>Payment #{payment.installmentNumber}</p>
                          {payment.apartmentDetails && (
                            <p className="text-xs" style={{ color: 'rgba(212,175,55,0.8)' }}>
                              {payment.apartmentDetails.building} - {payment.apartmentDetails.floor} Floor, Unit {payment.apartmentDetails.unitNumber}
                            </p>
                          )}
                          <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                            Paid: {payment.paidDate ? formatDate(payment.paidDate) : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold" style={{ color: '#d4af37' }}>{formatCurrency(payment.amount)}</p>
                          <CheckCircleIcon className="h-4 w-4 inline ml-2" style={{ color: '#d4af37' }} />
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(0, 0, 0, 0.95) 100%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.85)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      boxShadow: 'inset 0 0 200px rgba(212, 175, 55, 0.04)'
                    }}>
                      <DialogHeader>
                        <DialogTitle style={{ 
                          fontFamily: 'Playfair Display, serif',
                          color: '#d4af37'
                        }}>Payment Details</DialogTitle>
                        <DialogDescription style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                          Payment #{payment.installmentNumber} - Completed
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Apartment Details */}
                        {payment.apartmentDetails && (
                          <div className="p-4 rounded-lg" style={{
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.9) 100%)',
                            border: '1px solid rgba(212,175,55,0.25)'
                          }}>
                            <h4 className="text-lg font-semibold mb-3" style={{ color: '#d4af37' }}>Apartment Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Building</p>
                                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.building}</p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Unit</p>
                                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.floor} - {payment.apartmentDetails.unitNumber}</p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Type & Area</p>
                                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.bedrooms} - {payment.apartmentDetails.area} sq ft</p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>View</p>
                                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.view}</p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Total Price</p>
                                <p className="text-sm font-bold" style={{ color: '#d4af37' }}>{formatCurrency(payment.apartmentDetails.totalPrice)}</p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Status</p>
                                <Badge variant="gold">{payment.apartmentDetails.status}</Badge>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg" style={{
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                          }}>
                            <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Amount Paid</p>
                            <p className="text-xl font-bold" style={{ color: '#d4af37' }}>{formatCurrency(payment.amount)}</p>
                          </div>
                          <div className="p-4 rounded-lg" style={{
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                          }}>
                            <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Payment Date</p>
                            <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.paidDate ? formatDate(payment.paidDate) : 'N/A'}</p>
                          </div>
                          <div className="p-4 rounded-lg" style={{
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                          }}>
                            <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Payment Method</p>
                            <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.method || 'N/A'}</p>
                          </div>
                          <div className="p-4 rounded-lg" style={{
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                          }}>
                            <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Transaction ID</p>
                            <p className="text-xs font-mono" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>#{payment.id.slice(-8)}</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
                {paidPayments.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                    No previous payments yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Payments */}
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
              }}>Upcoming Payments</CardTitle>
              <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Next payments due</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingPayments.slice(0, 3).map((payment) => (
                  <Dialog key={payment.id}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="glass" 
                        className="w-full justify-between h-auto py-4"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <div className="text-left">
                          <p className="font-medium" style={{ color: '#ffffff' }}>Payment #{payment.installmentNumber}</p>
                          {payment.apartmentDetails && (
                            <p className="text-xs" style={{ color: 'rgba(212,175,55,0.8)' }}>
                              {payment.apartmentDetails.building} - {payment.apartmentDetails.floor} Floor, Unit {payment.apartmentDetails.unitNumber}
                            </p>
                          )}
                          <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                            Due: {formatDate(payment.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold" style={{ color: '#ffffff' }}>{formatCurrency(payment.amount)}</p>
                          <ClockIcon className="h-4 w-4 inline ml-2" style={{ color: 'rgba(212,175,55,0.7)' }} />
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(0, 0, 0, 0.95) 100%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.85)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      boxShadow: 'inset 0 0 200px rgba(212, 175, 55, 0.04)'
                    }}>
                      <DialogHeader>
                        <DialogTitle style={{ 
                          fontFamily: 'Playfair Display, serif',
                          color: '#d4af37'
                        }}>Upcoming Payment Details</DialogTitle>
                        <DialogDescription style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                          Payment #{payment.installmentNumber} - Due Soon
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Apartment Details */}
                        {payment.apartmentDetails && (
                          <div className="p-4 rounded-lg" style={{
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.9) 100%)',
                            border: '1px solid rgba(212,175,55,0.25)'
                          }}>
                            <h4 className="text-lg font-semibold mb-3" style={{ color: '#d4af37' }}>Apartment Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Building</p>
                                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.building}</p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Unit</p>
                                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.floor} - {payment.apartmentDetails.unitNumber}</p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Type & Area</p>
                                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.bedrooms} - {payment.apartmentDetails.area} sq ft</p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>View</p>
                                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.view}</p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Total Price</p>
                                <p className="text-sm font-bold" style={{ color: '#d4af37' }}>{formatCurrency(payment.apartmentDetails.totalPrice)}</p>
                              </div>
                              <div>
                                <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Status</p>
                                <Badge variant="gold">{payment.apartmentDetails.status}</Badge>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg" style={{
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                          }}>
                            <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Amount Due</p>
                            <p className="text-xl font-bold" style={{ color: '#ffffff' }}>{formatCurrency(payment.amount)}</p>
                          </div>
                          <div className="p-4 rounded-lg" style={{
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                          }}>
                            <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Due Date</p>
                            <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{formatDate(payment.dueDate)}</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg" style={{
                          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.9) 100%)',
                          border: '1px solid rgba(212,175,55,0.25)'
                        }}>
                          <p className="text-sm font-medium mb-2" style={{ color: '#d4af37' }}>Project: Sunset Towers</p>
                          <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Miami, FL • Luxury Condominiums</p>
                        </div>
                        <Button 
                          className="w-full text-black font-semibold"
                          style={{
                            backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                          }}
                        >
                          <CreditCardIcon className="h-4 w-4 mr-2" />
                          Pay Now
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
                {pendingPayments.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                    No upcoming payments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="abs-card">
          <CardContent className="p-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#d4af37' }} />
              <Input
                placeholder="Search by installment, project, location, status, or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card className="abs-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#d4af37'
              }}>Payment History ({filteredPayments.length})</CardTitle>
              <p className="text-sm mt-1" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Complete payment history and status</p>
            </div>
            <Button variant="outline" size="sm">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Installment</TableHead>
                    <TableHead>Apartment Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        #{payment.installmentNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          {payment.apartmentDetails ? (
                            <>
                              <p className="font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.building}</p>
                              <p className="text-xs" style={{ color: 'rgba(212,175,55,0.8)' }}>
                                {payment.apartmentDetails.floor} Floor, Unit {payment.apartmentDetails.unitNumber}
                              </p>
                              <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                                {payment.apartmentDetails.bedrooms} • {payment.apartmentDetails.area} sq ft • {payment.apartmentDetails.view}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium" style={{ color: '#ffffff' }}>ABS - POC 2 RESIDENTIAL</p>
                              <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Apartment Investment</p>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{formatDate(payment.dueDate)}</TableCell>
                      <TableCell>
                        {payment.paidDate ? formatDate(payment.paidDate) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          {getStatusBadge(payment.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.method || '-'}
                      </TableCell>
                      <TableCell>
                        {payment.status === 'pending' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                Pay Now
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{
                              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(0, 0, 0, 0.95) 100%)',
                              backgroundColor: 'rgba(0, 0, 0, 0.85)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(212, 175, 55, 0.25)',
                              boxShadow: 'inset 0 0 200px rgba(212, 175, 55, 0.04)'
                            }}>
                              <DialogHeader>
                                <DialogTitle style={{ 
                                  fontFamily: 'Playfair Display, serif',
                                  color: '#d4af37'
                                }}>Make Payment</DialogTitle>
                                <DialogDescription style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                                  Complete payment for installment #{payment.installmentNumber}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Apartment Information */}
                                {payment.apartmentDetails && (
                                  <div className="p-6 rounded-lg" style={{
                                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.9) 100%)',
                                    border: '1px solid rgba(212,175,55,0.25)'
                                  }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ 
                                      fontFamily: 'Playfair Display, serif',
                                      color: '#d4af37'
                                    }}>Apartment Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Building</p>
                                        <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.building}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Unit</p>
                                        <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.floor} - {payment.apartmentDetails.unitNumber}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Type & Area</p>
                                        <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.bedrooms} - {payment.apartmentDetails.area} sq ft</p>
                                      </div>
                                      <div>
                                        <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>View</p>
                                        <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{payment.apartmentDetails.view}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Total Price</p>
                                        <p className="text-sm font-bold" style={{ color: '#d4af37' }}>{formatCurrency(payment.apartmentDetails.totalPrice)}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>Status</p>
                                        <Badge variant="gold">{payment.apartmentDetails.status}</Badge>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Payment Information */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 rounded-lg" style={{
                                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                                  }}>
                                    <p className="text-sm mb-1" style={{ color: 'rgba(212,175,55,0.9)' }}>Amount Due</p>
                                    <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                                      {formatCurrency(payment.amount)}
                                    </p>
                                  </div>
                                  <div className="p-4 rounded-lg" style={{
                                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                                  }}>
                                    <p className="text-sm mb-1" style={{ color: 'rgba(212,175,55,0.9)' }}>Due Date</p>
                                    <p className="text-lg font-semibold" style={{ color: '#ffffff' }}>
                                      {formatDate(payment.dueDate)}
                                    </p>
                                  </div>
                                </div>

                                {/* Payment Progress */}
                                <div className="p-4 rounded-lg" style={{
                                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                                }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.9)' }}>Payment Progress</p>
                                    <p className="text-sm" style={{ color: '#ffffff' }}>{payment.installmentNumber} of 24</p>
                                  </div>
                                  <div className="w-full rounded-full h-2" style={{ background: 'rgba(0,0,0,0.5)' }}>
                                    <div 
                                      className="h-2 rounded-full" 
                                      style={{ 
                                        width: `${(payment.installmentNumber / 24) * 100}%`,
                                        backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                                      }}
                                    ></div>
                                  </div>
                                  <p className="text-xs mt-2" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                                    {formatCurrency((payment.installmentNumber - 1) * payment.amount)} paid • {formatCurrency((24 - payment.installmentNumber + 1) * payment.amount)} remaining
                                  </p>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
                                    Payment Method
                                  </label>
                                  <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg"
                                    style={{ 
                                      background: '#000000', 
                                      border: '1px solid rgba(212,175,55,0.25)',
                                      color: '#ffffff'
                                    }}
                                  >
                                    <option value="">Select payment method</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Wire Transfer">Wire Transfer</option>
                                  </select>
                                </div>

                                <div className="flex space-x-3">
                                  <Button variant="outline" className="flex-1">
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleMakePayment}
                                    disabled={!paymentMethod}
                                    className="flex-1 text-black font-semibold"
                                    style={{
                                      backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                                    }}
                                  >
                                    <CreditCardIcon className="h-4 w-4 mr-2" />
                                    Pay Now
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
