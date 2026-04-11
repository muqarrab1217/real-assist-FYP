import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useClientPayments, useMakePayment, useUploadPaymentProof } from '@/hooks/queries/useClientQueries';
import { PaymentMethodModal } from '@/components/Client/PaymentMethodModal';

export const PaymentsPage: React.FC = () => {
  const { data: payments = [], isLoading: loading } = useClientPayments();
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const makePaymentMutation = useMakePayment();
  const uploadProofMutation = useUploadPaymentProof();

  // Payment Method Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{ id: string; amount: number; installmentNumber: number } | null>(null);

  // 1. Data Pipeline: Group payments by project for the Matrix view
  const projectMatrix = React.useMemo(() => {
    const matrix = new Map<string, {
      project: any;
      nextDue: any;
      overdueCount: number;
      totalPaid: number;
      totalRemaining: number;
    }>();

    payments.forEach(p => {
      const projectId = p.project?.id || 'default';
      if (!matrix.has(projectId)) {
        matrix.set(projectId, {
          project: p.project || { name: 'Flagship Portfolio', location: 'Miami, FL' },
          nextDue: null,
          overdueCount: 0,
          totalPaid: 0,
          totalRemaining: 0
        });
      }

      const stats = matrix.get(projectId)!;
      if (p.status === 'paid') {
        stats.totalPaid += p.amount;
      } else {
        stats.totalRemaining += p.amount;
        if (p.status === 'overdue') stats.overdueCount++;
        
        // Find earliest due date for "Next Due"
        if (!stats.nextDue || new Date(p.dueDate).getTime() < new Date(stats.nextDue.dueDate).getTime()) {
          stats.nextDue = p;
        }
      }
    });

    return Array.from(matrix.values());
  }, [payments]);

  const handleMakePayment = (paymentId: string, amount: number) => {
    const payment = payments.find(p => p.id === paymentId);
    setSelectedPayment({ id: paymentId, amount, installmentNumber: payment?.installmentNumber || 0 });
    setPaymentModalOpen(true);
  };

  const handlePayViaPortal = (paymentId: string, amount: number) => {
    setIsProcessingPayment(paymentId);
    makePaymentMutation.mutate(
      { paymentId, amount, method: 'Portal' },
      {
        onSettled: () => setIsProcessingPayment(null),
        onError: (error) => console.error('Payment failed:', error),
        onSuccess: () => console.log('Payment successful')
      }
    );
  };

  const handleUploadProof = (data: { paymentId: string; proofFile: File; proofType: any; notes?: string }) => {
    setIsProcessingPayment(data.paymentId);
    // First update payment to pending verification
    makePaymentMutation.mutate(
      { paymentId: data.paymentId, amount: 0, method: 'manual_proof' },
      {
        onSuccess: () => {
          // Then upload the proof
          uploadProofMutation.mutate(data, {
            onSettled: () => setIsProcessingPayment(null),
            onError: (error) => console.error('Proof upload failed:', error),
          });
        },
        onError: (error) => {
          console.error('Payment update failed:', error);
          setIsProcessingPayment(null);
        }
      }
    );
  };

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = payments.filter(p => ['pending', 'overdue'].includes(p.status)).reduce((sum, p) => sum + p.amount, 0);
  
  const criticalOverdue = payments.filter(p => p.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const recentTransactions = payments.filter(p => p.status === 'paid')
    .sort((a, b) => new Date(b.paidDate || b.dueDate).getTime() - new Date(a.paidDate || a.dueDate).getTime())
    .slice(0, 5);

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
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold-500">Secured Payments</span>
          </div>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Payment <span className="text-gold-400 italic">Center</span>
          </h1>
        </motion.div>
      </div>

      {/* Action Center: Overdue Alerts */}
      {criticalOverdue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-red-500/20">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Action Required: {criticalOverdue.length} Overdue Installments</h3>
              <p className="text-gray-400 text-sm">Please settle your outstanding balances to avoid late penalties.</p>
            </div>
          </div>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-8 py-6 h-auto"
            onClick={() => handleMakePayment(criticalOverdue[0].id, criticalOverdue[0].amount)}
          >
            Settle Earliest Due
          </Button>
        </motion.div>
      )}

      {/* Property Payment Matrix */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white font-serif">Portfolio <span className="text-gold-500">Matrix</span></h2>
          <Badge variant="outline" className="border-gold-500/20 text-gold-500">{projectMatrix.length} Projects</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectMatrix.map((item, idx) => (
            <motion.div
              key={item.project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-[#0a0a0a] border-gold-500/10 rounded-[2rem] overflow-hidden hover:border-gold-500/30 transition-all group">
                <CardContent className="p-0">
                  <div className="p-6 border-b border-gold-500/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-gold-500/5 border border-gold-500/10">
                        <BuildingOfficeIcon className="h-6 w-6 text-gold-500" />
                      </div>
                      {item.overdueCount > 0 && (
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                          {item.overdueCount} Overdue
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{item.project.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{item.project.location}</p>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Next Installment</span>
                      <span className="text-white font-bold">{item.nextDue ? `PKR ${item.nextDue.amount.toLocaleString()}` : 'Fully Paid'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Due Date</span>
                      <span className={`font-bold ${item.nextDue?.status === 'overdue' ? 'text-red-500' : 'text-gold-500'}`}>
                        {item.nextDue ? formatDate(item.nextDue.dueDate) : '—'}
                      </span>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        className="w-full bg-gold-500 hover:bg-gold-400 text-black font-extrabold h-12 rounded-xl"
                        disabled={!item.nextDue || isProcessingPayment === item.nextDue.id}
                        onClick={() => item.nextDue && handleMakePayment(item.nextDue.id, item.nextDue.amount)}
                      >
                        {isProcessingPayment === item.nextDue?.id ? 'Processing...' : 'Pay Installment'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gold-500/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                    <span className="text-gray-500">Equity Built</span>
                    <span className="text-gold-500">PKR {item.totalPaid.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Summary Stats */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-[#0a0a0a] border-gold-500/10 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-gold-500/5">
              <CardTitle className="text-xl font-bold font-serif text-white">Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Total Settled</p>
                <h4 className="text-3xl font-bold text-green-500">{formatCurrency(totalPaid)}</h4>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Outstanding</p>
                <h4 className="text-3xl font-bold text-white">{formatCurrency(totalOutstanding)}</h4>
              </div>
              <div className="pt-6 border-t border-gold-500/5">
                <div className="flex items-center gap-2 text-gold-500 mb-4">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase">Payment Guaranteed</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed italic">
                  All transactions are secured via bank-grade encryption and audited daily.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Recent Transactions */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-[#0a0a0a]/60 border-gold-500/10 rounded-[2.5rem] backdrop-blur-md overflow-hidden">
            <CardHeader className="p-10 border-b border-gold-500/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-white font-serif">Recent <span className="text-gold-400">Activity</span></CardTitle>
                <p className="text-sm text-gray-500 italic">Last 5 confirmed transactions</p>
              </div>
              <Link to="/ledger">
                <Button variant="ghost" className="text-gold-500 hover:bg-gold-500/10 rounded-xl">
                  View Full Ledger
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#0f0f0f] border-b border-gold-500/10">
                  <TableRow className="border-transparent">
                    <TableHead className="pl-10 text-[10px] font-bold text-gold-500/70 uppercase">Asset</TableHead>
                    <TableHead className="text-[10px] font-bold text-gold-500/70 uppercase">Date</TableHead>
                    <TableHead className="text-[10px] font-bold text-gold-500/70 uppercase">Amount</TableHead>
                    <TableHead className="text-[10px] font-bold text-gold-500/70 uppercase pr-10 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((payment) => (
                    <TableRow key={payment.id} className="border-b border-gold-500/5 hover:bg-gold-500/[0.01]">
                      <TableCell className="py-6 pl-10">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <div>
                            <p className="text-white font-bold text-sm tracking-tight">{payment.project?.name || 'Investment'}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Installment #{payment.installmentNumber}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-300">
                        {formatDate(payment.paidDate || payment.dueDate)}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-white">
                        PKR {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="pr-10 text-right">
                        {payment.verificationStatus === 'pending_verification' ? (
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/20">
                            <ClockIcon className="mr-1 h-3 w-3" />Awaiting Verification
                          </Badge>
                        ) : payment.verificationStatus === 'rejected' ? (
                          <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/20">Rejected</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-500 border-green-500/20">Success</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-gray-500 italic">No recent transactions found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Method Modal */}
      {selectedPayment && (
        <PaymentMethodModal
          isOpen={paymentModalOpen}
          onClose={() => { setPaymentModalOpen(false); setSelectedPayment(null); }}
          paymentId={selectedPayment.id}
          amount={selectedPayment.amount}
          installmentNumber={selectedPayment.installmentNumber}
          onPayViaPortal={handlePayViaPortal}
          onUploadProof={handleUploadProof}
          isProcessing={isProcessingPayment === selectedPayment.id}
        />
      )}
    </div>
  );
};
