import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
  HomeIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { enrollmentAPI } from '@/services/api';
import { formatDate } from '@/lib/utils';
import { useAdminEnrollments, useApproveEnrollment, useRejectEnrollment } from '@/hooks/queries/useAdminQueries';

interface Enrollment {
  id: string;
  user_id: string;
  project_id: string;
  total_price: number;
  down_payment: number;
  installment_duration_years: number;
  monthly_installment: number;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  selected_unit_type?: string;
  selected_floor?: number;
  selected_unit_number?: string;
  unit_details?: any;
  admin_notes?: string;
  rejected_reason?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  is_verified?: boolean;
  profile?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  project?: {
    id: string;
    name: string;
    location?: string;
    description?: string;
    price_min?: number;
    price_max?: number;
    type?: string;
    amenities?: any;
    created_at?: string;
    updated_at?: string;
  };
}

export const EnrollmentRequestsPage: React.FC = () => {
  const { data: enrollments = [], isLoading: loading } = useAdminEnrollments();
  const approveMutation = useApproveEnrollment();
  const rejectMutation = useRejectEnrollment();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [relatedEnrollments, setRelatedEnrollments] = useState<Enrollment[]>([]);

  const filteredEnrollments = enrollments.filter(enrollment => {
    let matches = true;
    if (searchTerm) {
      matches = (enrollment.profile?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (enrollment.profile?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (enrollment.profile?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (enrollment.selected_unit_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    }

    if (matches && statusFilter !== 'all') {
      matches = enrollment.status === statusFilter;
    }
    return matches;
  });

  const handleApprove = async () => {
    if (!selectedEnrollment) return;
    try {
      await approveMutation.mutateAsync({ enrollmentId: selectedEnrollment.id, notes: adminNotes });
      setShowApprovalDialog(false);
      setAdminNotes('');
      setSelectedEnrollment(null);
    } catch (error: any) {
      console.error('Approval failed:', error);
      alert(error.message || 'Failed to approve enrollment');
    }
  };

  const handleReject = async () => {
    if (!selectedEnrollment || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ enrollmentId: selectedEnrollment.id, reason: rejectionReason });
      setShowRejectionDialog(false);
      setRejectionReason('');
      setSelectedEnrollment(null);
    } catch (error: any) {
      console.error('Rejection failed:', error);
      alert(error.message || 'Failed to reject enrollment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending Review</Badge>;
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const pendingCount = enrollments.filter(e => e.status === 'pending').length;
  const approvedCount = enrollments.filter(e => e.status === 'active').length;
  const rejectedCount = enrollments.filter(e => e.status === 'rejected').length;

  if (loading && enrollments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          Enrollment <span className="text-gold-400">Requests</span>
        </h1>
        <p className="text-gray-400">Review and manage project enrollment applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-[#0a0a0a] border-gold-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
                </div>
                <ClockIcon className="h-12 w-12 text-yellow-500/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-[#0a0a0a] border-gold-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Approved</p>
                  <p className="text-3xl font-bold text-green-500">{approvedCount}</p>
                </div>
                <CheckCircleIcon className="h-12 w-12 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-[#0a0a0a] border-gold-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Rejected</p>
                  <p className="text-3xl font-bold text-red-500">{rejectedCount}</p>
                </div>
                <XCircleIcon className="h-12 w-12 text-red-500/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-[#0a0a0a] border-gold-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Requests</p>
                  <p className="text-3xl font-bold text-gold-500">{enrollments.length}</p>
                </div>
                <UserGroupIcon className="h-12 w-12 text-gold-500/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by name, email, or unit number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#0a0a0a] border-gold-500/20 text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            className={statusFilter === 'all' ? 'bg-gold-500 text-black' : 'border-gold-500/20 text-gray-400'}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending')}
            className={statusFilter === 'pending' ? 'bg-yellow-500 text-black' : 'border-gold-500/20 text-gray-400'}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('active')}
            className={statusFilter === 'active' ? 'bg-green-500 text-black' : 'border-gold-500/20 text-gray-400'}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('rejected')}
            className={statusFilter === 'rejected' ? 'bg-red-500 text-black' : 'border-gold-500/20 text-gray-400'}
          >
            Rejected
          </Button>
        </div>
      </div>

      {/* Enrollments Table */}
      <Card className="bg-[#0a0a0a] border-gold-500/20">
        <CardHeader>
          <CardTitle className="text-white">All Enrollment Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No enrollment requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gold-500/10">
                    <TableHead className="text-gold-500">User</TableHead>
                    <TableHead className="text-gold-500">Project</TableHead>
                    <TableHead className="text-gold-500">Unit</TableHead>
                    <TableHead className="text-gold-500">Investment</TableHead>
                    <TableHead className="text-gold-500">Plan</TableHead>
                    <TableHead className="text-gold-500">Status</TableHead>
                    <TableHead className="text-gold-500">Date</TableHead>
                    <TableHead className="text-gold-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id} className="border-gold-500/5 hover:bg-gold-500/5 transition-colors">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">
                            {enrollment.profile?.first_name} {enrollment.profile?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{enrollment.profile?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        {enrollment.project?.name || `Project ${enrollment.project_id?.slice(0, 8)}`}
                      </TableCell>
                      <TableCell>
                        {enrollment.selected_unit_number || enrollment.selected_unit_type ? (
                          <div className="text-sm">
                            <p className="text-white font-medium">
                              {enrollment.selected_unit_type || 'Unit'} {enrollment.selected_unit_number}
                            </p>
                            {enrollment.selected_floor && (
                              <p className="text-gray-500 text-xs">Floor {enrollment.selected_floor}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell className="text-white font-bold">
                        {formatCurrency(enrollment.total_price)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-white">{enrollment.installment_duration_years} years</p>
                          <p className="text-gray-500 text-xs">
                            {formatCurrency(enrollment.monthly_installment)}/mo
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {formatDate(new Date(enrollment.created_at))}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gold-500/20 text-gold-400 hover:bg-gold-500/10"
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              // Get related enrollments for the same project
                              const related = enrollments.filter(e => e.project_id === enrollment.project_id);
                              setRelatedEnrollments(related);
                              setShowDetailsDialog(true);
                            }}
                          >
                            View
                          </Button>
                          {enrollment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => {
                                  setSelectedEnrollment(enrollment);
                                  setShowApprovalDialog(true);
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedEnrollment(enrollment);
                                  setShowRejectionDialog(true);
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="bg-[#0a0a0a] border-gold-500/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Approve Enrollment</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will activate the payment schedule and notify the user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-gray-300">
                Approve enrollment for <strong className="text-white">{selectedEnrollment?.profile?.first_name} {selectedEnrollment?.profile?.last_name}</strong>?
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Total Investment: {selectedEnrollment && formatCurrency(selectedEnrollment.total_price)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Admin Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this approval..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="bg-black/50 border-gold-500/20 text-white min-h-[100px]"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalDialog(false);
                  setAdminNotes('');
                }}
                className="border-gold-500/20 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? 'Processing...' : 'Confirm Approval'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="bg-[#0a0a0a] border-gold-500/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Reject Enrollment</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will cancel the payment schedule and notify the user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-gray-300">
                Reject enrollment for <strong className="text-white">{selectedEnrollment?.profile?.first_name} {selectedEnrollment?.profile?.last_name}</strong>?
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Rejection Reason (Required) *</label>
              <Textarea
                placeholder="Explain why this enrollment is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-black/50 border-gold-500/20 text-white min-h-[100px]"
                required
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectionDialog(false);
                  setRejectionReason('');
                }}
                className="border-gold-500/20 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
              >
                {rejectMutation.isPending ? 'Processing...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-[#0a0a0a] border-gold-500/20 text-white max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-white">Enrollment Details</DialogTitle>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="space-y-3 mt-2 flex-1 overflow-y-auto pr-1">
              {/* User Information */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">User Information</h3>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-black/30 border border-gold-500/10">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-white font-medium text-sm">
                      {selectedEnrollment.profile?.first_name} {selectedEnrollment.profile?.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-white text-sm">{selectedEnrollment.profile?.email}</p>
                  </div>
                </div>
              </div>

              {/* Project Information - Enhanced with Verification Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">Project Information</h3>
                  <Badge className={
                    selectedEnrollment.status === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs py-0'
                      : 'bg-green-500/10 text-green-500 border-green-500/20 text-xs py-0'
                  }>
                    {selectedEnrollment.status === 'pending' ? '🔍 Pending' : '✓ Verified'}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-black/30 border border-gold-500/10 space-y-2">
                  <div>
                    <p className="text-white font-bold text-sm">
                      {selectedEnrollment.project?.name || 'Project ' + selectedEnrollment.project_id?.slice(0, 8)}
                    </p>
                    <p className="text-gray-400 text-xs">{selectedEnrollment.project?.location || 'Location not specified'}</p>
                  </div>

                  {/* Project Type & Price Range */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gold-500/10">
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-white text-xs font-medium">{selectedEnrollment.project?.type || 'Residential'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-white text-xs font-medium">
                        {selectedEnrollment.project?.price_min ?
                          `${formatCurrency(selectedEnrollment.project.price_min)} - ${formatCurrency(selectedEnrollment.project.price_max || 0)}`
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Project Description - Reduced */}
                  {selectedEnrollment.project?.description && (
                    <div className="pt-2 border-t border-gold-500/10">
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-gray-300 text-xs line-clamp-2">{selectedEnrollment.project.description}</p>
                    </div>
                  )}

                  {/* Amenities Summary - Compact */}
                  {selectedEnrollment.project?.amenities && Array.isArray(selectedEnrollment.project.amenities) && selectedEnrollment.project.amenities.length > 0 && (
                    <div className="pt-2 border-t border-gold-500/10">
                      <p className="text-xs text-gray-500 mb-1">Amenities</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedEnrollment.project.amenities.slice(0, 4).map((amenity: any, idx: number) => (
                          <Badge key={idx} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs py-0 px-1.5">
                            {typeof amenity === 'string' ? amenity : amenity.name}
                          </Badge>
                        ))}
                        {selectedEnrollment.project.amenities.length > 4 && (
                          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs py-0 px-1.5">
                            +{selectedEnrollment.project.amenities.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Unit Selection */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">Selected Unit</h3>
                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-black/30 border border-gold-500/10">
                  <div>
                    <p className="text-xs text-gray-500">Unit Type</p>
                    <p className="text-white text-sm">{selectedEnrollment.selected_unit_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Floor</p>
                    <p className="text-white text-sm">{selectedEnrollment.selected_floor || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Unit Number</p>
                    <p className="text-white text-sm">{selectedEnrollment.selected_unit_number || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">Financial Details</h3>
                <div className="p-3 rounded-lg bg-black/30 border border-gold-500/10 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Price:</span>
                    <span className="text-white font-bold">{formatCurrency(selectedEnrollment.total_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Down Payment:</span>
                    <span className="text-white font-bold">{formatCurrency(selectedEnrollment.down_payment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white text-xs">{selectedEnrollment.installment_duration_years} y. ({selectedEnrollment.installment_duration_years * 12} m.)</span>
                  </div>
                  <div className="border-t border-gold-500/20 pt-2 flex justify-between">
                    <span className="text-gold-400 font-bold">Monthly Installment:</span>
                    <span className="text-gold-400 font-bold">{formatCurrency(selectedEnrollment.monthly_installment)}</span>
                  </div>
                </div>
              </div>

              {/* Admin Notes (if processed) */}
              {selectedEnrollment.status !== 'pending' && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">Admin Actions</h3>
                  <div className="p-3 rounded-lg bg-black/30 border border-gold-500/10 text-sm">
                    <p className="text-xs text-gray-500 mb-1">Processed At:</p>
                    <p className="text-white mb-2">
                      {selectedEnrollment.processed_at ? formatDate(new Date(selectedEnrollment.processed_at)) : 'N/A'}
                    </p>
                    {selectedEnrollment.admin_notes && (
                      <>
                        <p className="text-xs text-gray-500 mb-1">Admin Notes:</p>
                        <p className="text-white text-xs">{selectedEnrollment.admin_notes}</p>
                      </>
                    )}
                    {selectedEnrollment.rejected_reason && (
                      <>
                        <p className="text-xs text-gray-500 mb-1">Rejection Reason:</p>
                        <p className="text-red-400 text-xs">{selectedEnrollment.rejected_reason}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Related Enrollments for Same Project */}
              {relatedEnrollments.length > 1 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">
                    Other Enrollments for {selectedEnrollment.project?.name} ({relatedEnrollments.length})
                  </h3>
                  <div className="p-4 rounded-lg bg-black/30 border border-gold-500/10 space-y-3 max-h-40 overflow-y-auto">
                    {relatedEnrollments.map((rel) => (
                      <div key={rel.id} className="pb-2 border-b border-gold-500/10 last:pb-0 last:border-0 text-sm">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="text-white font-medium">
                              {rel.profile?.first_name} {rel.profile?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{rel.profile?.email}</p>
                          </div>
                          {getStatusBadge(rel.status)}
                        </div>
                        <p className="text-xs text-gray-400">
                          {rel.selected_unit_type} {rel.selected_unit_number || ''} - {formatCurrency(rel.total_price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
          {/* Action Buttons - Always visible at bottom */}
          {selectedEnrollment?.status === 'pending' && (
            <div className="flex gap-3 pt-3 border-t border-gold-500/10 flex-shrink-0">
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm"
                onClick={() => {
                  setShowDetailsDialog(false);
                  setShowApprovalDialog(true);
                }}
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                className="flex-1 text-sm"
                onClick={() => {
                  setShowDetailsDialog(false);
                  setShowRejectionDialog(true);
                }}
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0
  }).format(amount);
}
