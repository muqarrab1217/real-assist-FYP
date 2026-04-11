import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { exportService } from '@/services/exportService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useClientPayments } from '@/hooks/queries/useClientQueries';
import { useAuthContext } from '@/contexts/AuthContext';

export const LedgerPage: React.FC = () => {
  const { user } = useAuthContext();
  const { data: payments = [], isLoading: loading } = useClientPayments();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Data Pipeline: Transform payments into a Statement of Account
  const ledgerData = React.useMemo(() => {
    // Sort payments by date (oldest to newest) to calculate running balance correctly
    const sorted = [...payments].sort((a, b) => 
      new Date(a.paidDate || a.dueDate).getTime() - new Date(b.paidDate || b.dueDate).getTime()
    );

    let totalEquity = 0;
    let totalCommitment = payments.reduce((sum, p) => sum + p.amount, 0);

    const entries = sorted.map(p => {
      const isPaid = p.status === 'paid';
      if (isPaid) totalEquity += p.amount;
      
      return {
        ...p,
        debit: isPaid ? p.amount : 0,
        credit: !isPaid ? p.amount : 0,
        runningBalance: totalCommitment - totalEquity
      };
    });

    return {
      entries: entries.reverse(), // Show newest first in the table
      totalEquity,
      totalCommitment,
      progress: totalCommitment > 0 ? (totalEquity / totalCommitment) * 100 : 0
    };
  }, [payments]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      // Filter entries to only include the last 12 months
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const lastYearEntries = ledgerData.entries.filter(entry => {
        const entryDate = new Date(entry.paidDate || entry.dueDate);
        return entryDate >= oneYearAgo;
      });

      if (format === 'pdf') {
        const lastYearEquity = lastYearEntries.reduce((sum, e) => sum + e.debit, 0);
        const lastYearCommitment = lastYearEntries.reduce((sum, e) => sum + e.debit + e.credit, 0);
        await exportService.exportToPDF({
          entries: lastYearEntries,
          totalEquity: lastYearEquity,
          totalCommitment: lastYearCommitment,
          progress: lastYearCommitment > 0 ? (lastYearEquity / lastYearCommitment) * 100 : 0,
          user
        });
      } else {
        await exportService.exportToExcel({
          entries: lastYearEntries
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusBadge = (status: string, verificationStatus?: string) => {
    // Show verification-specific status when applicable
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
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Settled</Badge>;
      case 'pending':
        return <Badge className="bg-gold-500/10 text-gold-500 border-gold-500/20">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredEntries = ledgerData.entries.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.project?.name?.toLowerCase().includes(searchLower) ||
      entry.id.toLowerCase().includes(searchLower) ||
      entry.status.toLowerCase().includes(searchLower) ||
      entry.installmentNumber.toString().includes(searchLower)
    );
  });

  if (loading && payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
        <p className="text-gold-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Generating Statement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ArchiveBoxIcon className="h-4 w-4 text-gold-500" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold-500">Financial Records</span>
          </div>
          <h1 className="text-4xl font-bold text-white font-serif">Statement of <span className="text-gold-400 italic">Account</span></h1>
          <p className="text-gray-500 mt-2 italic text-sm">Comprehensive audit of all property equity and disbursements.</p>
        </motion.div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="border-gold-500/20 text-gold-500 hover:bg-gold-500/10 rounded-xl px-6"
            onClick={() => handleExport('pdf')}
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            PDF Statement
          </Button>
          <Button 
            variant="outline" 
            className="border-gold-500/20 text-gold-500 hover:bg-gold-500/10 rounded-xl px-6"
            onClick={() => handleExport('excel')}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Detailed Export
          </Button>
        </div>
      </div>

      {/* Amortization & Equity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-[#0a0a0a] border-gold-500/10 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Current Equity Progress</p>
                  <h3 className="text-5xl font-bold text-white font-serif">{ledgerData.progress.toFixed(1)}%</h3>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] uppercase text-gold-500 font-bold">Target Value</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(ledgerData.totalCommitment)}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Progress value={ledgerData.progress} className="h-4 bg-gold-500/5" indicatorClassName="bg-gold-500" />
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span>Investment Start</span>
                  <span className="text-gold-500">PKR {ledgerData.totalEquity.toLocaleString()} Contributed</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gold-500/5">
                <div>
                  <p className="text-[9px] uppercase text-gray-500 font-bold mb-1">Total Paid</p>
                  <p className="text-sm font-bold text-green-500">{formatCurrency(ledgerData.totalEquity)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-gray-500 font-bold mb-1">Obligations</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(ledgerData.totalCommitment - ledgerData.totalEquity)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-gray-500 font-bold mb-1">Status</p>
                  <div className="flex items-center gap-1">
                    <CheckBadgeIcon className="h-3 w-3 text-gold-500" />
                    <span className="text-[10px] font-bold uppercase text-white">Verified</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#0a0a0a] border-gold-500/10 rounded-[2.5rem] overflow-hidden flex flex-col justify-center text-center p-10 border shadow-2xl">
          <div className="mx-auto p-4 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
            <ChartBarIcon className="h-8 w-8 text-gold-500" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Portfolio Yield</h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-6 italic">Your property equity is calculated based on realized disbursements and confirmed installments.</p>
          <Button variant="ghost" className="text-gold-500 hover:bg-gold-500/10 font-bold uppercase text-[10px] tracking-widest">
            Detailed Analytics
          </Button>
        </Card>
      </div>

      {/* Audit Table */}
      <Card className="bg-[#0a0a0a]/60 border-gold-500/10 rounded-[2.5rem] backdrop-blur-md overflow-hidden border shadow-2xl">
        <CardHeader className="p-10 border-b border-gold-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <CardTitle className="text-2xl font-bold text-white font-serif">Audit <span className="text-gold-400">Journal</span></CardTitle>
            <p className="text-sm text-gray-500 italic mt-1">Official accounting of every transaction associated with your profile.</p>
          </div>
          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-500" />
            <Input
              placeholder="Search by ID, Status, or Project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border-gold-500/20 pl-10 h-12 rounded-xl text-sm focus:border-gold-500/50"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#0f0f0f] border-b border-gold-500/10">
                <TableRow className="border-transparent">
                  <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-16 pl-10">Entry Date</TableHead>
                  <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-16">Description / Project</TableHead>
                  <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-16">Reference</TableHead>
                  <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-16">Debit</TableHead>
                  <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-16">Credit</TableHead>
                  <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-16">Running Balance</TableHead>
                  <TableHead className="text-gold-500/80 font-bold uppercase tracking-widest text-[9px] h-16 pr-10 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry, idx) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gold-500/5 hover:bg-gold-500/[0.02] transition-colors"
                  >
                    <TableCell className="py-6 pl-10">
                      <span className="text-white font-medium text-xs">
                        {formatDate(entry.paidDate || entry.dueDate)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white font-bold text-sm">Installment #{entry.installmentNumber}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{entry.project?.name || 'Portfolio'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-gray-400">
                      #{entry.id.slice(-10).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-sm font-bold text-green-500">
                      {entry.debit > 0 ? `+ PKR ${entry.debit.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell className="text-sm font-bold text-white/40 font-mono">
                      {entry.credit > 0 ? `PKR ${entry.credit.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell className="text-sm font-bold text-gold-500/80">
                      PKR {entry.runningBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="pr-10 text-right">
                      {getStatusBadge(entry.status, entry.verificationStatus)}
                    </TableCell>
                  </motion.tr>
                ))}
                {filteredEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center text-gray-500 italic">No ledger entries found matching your criteria.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest italic leading-relaxed">
        This is a computer-generated statement and does not require a physical signature. 
        <br /> All records are subject to final audit by the treasury department.
      </p>
    </div>
  );
};
