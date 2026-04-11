import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { useAllVerifications, useApproveProof, useRejectProof } from '@/hooks/queries/useSalesRepQueries';
import { createPortal } from 'react-dom';

export const VerificationsPage: React.FC = () => {
  const { data: verifications = [], isLoading } = useAllVerifications();
  const approveProof = useApproveProof();
  const rejectProof = useRejectProof();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('all');
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [proofToReject, setProofToReject] = useState<string | null>(null);

  const filtered = verifications.filter((proof: any) => {
    const matchesStatus = filterStatus === 'all' || proof.status === filterStatus;
    if (!matchesStatus) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      proof.client?.fullName?.toLowerCase().includes(q) ||
      proof.proofType?.toLowerCase().includes(q) ||
      proof.payment?.amount?.toString().includes(q)
    );
  });

  const handleApprove = (proofId: string) => {
    approveProof.mutate(proofId);
  };

  const handleRejectClick = (proofId: string) => {
    setProofToReject(proofId);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = () => {
    if (proofToReject) {
      rejectProof.mutate({ proofId: proofToReject, reason: rejectReason || 'Rejected by reviewer' });
      setShowRejectDialog(false);
      setProofToReject(null);
      setRejectReason('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProofTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      bank_transfer: 'Bank Transfer',
      jazzcash: 'JazzCash',
      easypaisa: 'Easypaisa',
      cheque: 'Cheque',
      cash_receipt: 'Cash Receipt',
      other: 'Other',
    };
    return <Badge variant="outline" className="border-gold-500/20 text-gold-400">{labels[type] || type}</Badge>;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white font-serif">Payment Verifications</h1>
        <p className="text-sm text-gray-500 mt-1">Review, approve, or reject client payment proofs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-500" />
          <Input
            placeholder="Search by client name, proof type, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#141414] border-gold-500/10 pl-10 h-10 rounded-xl text-sm focus:border-gold-500/30 text-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending_review', 'approved', 'rejected'] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={
                filterStatus === status
                  ? 'bg-gold-500 text-black hover:bg-gold-400'
                  : 'border-gold-500/20 text-gray-400 hover:text-white hover:bg-white/5'
              }
            >
              {status === 'pending_review' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-[#0a0a0a] border-gold-500/10">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
              <p className="text-xs text-gold-500 font-bold uppercase tracking-widest">Loading Verifications...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gold-500/5 hover:bg-transparent">
                  <TableHead className="pl-6 text-[10px] font-extrabold uppercase tracking-widest text-gold-500/60">Client</TableHead>
                  <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-gold-500/60">Proof Type</TableHead>
                  <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-gold-500/60">Amount</TableHead>
                  <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-gold-500/60">Submitted</TableHead>
                  <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-gold-500/60">Status</TableHead>
                  <TableHead className="pr-6 text-right text-[10px] font-extrabold uppercase tracking-widest text-gold-500/60">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((proof: any) => (
                  <TableRow key={proof.id} className="border-gold-500/5 hover:bg-white/[0.02]">
                    <TableCell className="py-4 pl-6">
                      <div>
                        <p className="text-sm font-bold text-white">{proof.client?.fullName || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{proof.client?.email || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getProofTypeBadge(proof.proofType)}</TableCell>
                    <TableCell className="text-sm font-bold text-white">
                      PKR {proof.payment?.amount?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-gray-400">
                      {formatDate(proof.submittedAt)}
                    </TableCell>
                    <TableCell>{getStatusBadge(proof.status)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProof(proof)}
                          className="text-gray-400 hover:text-white"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        {proof.status === 'pending_review' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(proof.id)}
                              disabled={approveProof.isPending}
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectClick(proof.id)}
                              disabled={rejectProof.isPending}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500 italic">
                      No verifications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Proof Detail Modal */}
      {selectedProof && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProof(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0a0a] border border-gold-500/20 rounded-3xl p-8 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-6">Payment Proof Details</h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Client</span>
                  <span className="text-sm font-bold text-white">{selectedProof.client?.fullName || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Proof Type</span>
                  <span>{getProofTypeBadge(selectedProof.proofType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-sm font-bold text-white">PKR {selectedProof.payment?.amount?.toLocaleString() || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Submitted</span>
                  <span className="text-sm text-gray-300">{formatDate(selectedProof.submittedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span>{getStatusBadge(selectedProof.status)}</span>
                </div>
                {selectedProof.notes && (
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Notes</span>
                    <p className="text-sm text-gray-300 bg-white/5 rounded-xl p-3">{selectedProof.notes}</p>
                  </div>
                )}
                {selectedProof.reviewerNotes && (
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Reviewer Notes</span>
                    <p className="text-sm text-gray-300 bg-white/5 rounded-xl p-3">{selectedProof.reviewerNotes}</p>
                  </div>
                )}
                {selectedProof.proofUrl && (
                  <div>
                    <span className="text-sm text-gray-500 block mb-2">Proof Document</span>
                    <a
                      href={selectedProof.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 text-sm font-bold"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      View / Download Proof
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                {selectedProof.status === 'pending_review' && (
                  <>
                    <Button
                      onClick={() => {
                        handleApprove(selectedProof.id);
                        setSelectedProof(null);
                      }}
                      disabled={approveProof.isPending}
                      className="bg-green-600 hover:bg-green-500 text-white"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        handleRejectClick(selectedProof.id);
                        setSelectedProof(null);
                      }}
                      disabled={rejectProof.isPending}
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedProof(null)}
                  className="border-gold-500/20 text-gray-400"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('portal-root') || document.body
      )}

      {/* Reject Reason Dialog */}
      {showRejectDialog && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowRejectDialog(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-red-500/20 rounded-3xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">Reject Payment Proof</h3>
            <p className="text-sm text-gray-500 mb-6">Please provide a reason for rejection. This will be visible to the client.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full bg-[#141414] border border-red-500/20 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:border-red-500/40 focus:outline-none resize-none h-24"
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                className="border-gold-500/20 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectConfirm}
                disabled={rejectProof.isPending}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Confirm Rejection
              </Button>
            </div>
          </motion.div>
        </motion.div>,
        document.getElementById('portal-root') || document.body
      )}
    </div>
  );
};
