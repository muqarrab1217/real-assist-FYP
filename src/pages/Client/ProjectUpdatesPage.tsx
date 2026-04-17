import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  CreditCardIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  StarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { PaymentCalendar } from '@/components/Client/PaymentCalendar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useUserEnrollments, usePendingEnrollments, useClientProjectUpdates, useProjectPayments, useMakePayment, useUploadPaymentProof } from '@/hooks/queries/useClientQueries';
import { PaymentMethodModal } from '@/components/Client/PaymentMethodModal';

type TabType = 'journal' | 'timeline' | 'dossier';

export const ProjectUpdatesPage: React.FC = () => {
  const { user } = useAuthContext();
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(
    () => sessionStorage.getItem('projectUpdates_selectedId')
  );
  const [activeTab, setActiveTab] = useState<TabType>('journal');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentForModal, setSelectedPaymentForModal] = useState<{ id: string; amount: number; installmentNumber: number; clientId?: string } | null>(null);
  const [showResubmitWarning, setShowResubmitWarning] = useState(false);
  const [pendingResubmitPaymentId, setPendingResubmitPaymentId] = useState<string | null>(null);

  const { data: enrollments = [], isLoading: enrollmentsLoading, isFetching: enrollmentsFetching } = useUserEnrollments();
  const { data: pendingEnrollments = [] } = usePendingEnrollments();

  // Resolve the selected enrollment object; fall back to first enrollment automatically
  const selectedEnrollment = React.useMemo(() => {
    if (enrollments.length === 0) return null;
    const found = enrollments.find((e: any) => e.id === selectedEnrollmentId);
    return found ?? enrollments[0];
  }, [enrollments, selectedEnrollmentId]);

  const handleSelectEnrollment = (enrollment: any) => {
    setSelectedEnrollmentId(enrollment.id);
    sessionStorage.setItem('projectUpdates_selectedId', enrollment.id);
  };

  // Auto-select first enrollment on first load when no prior selection is stored
  useEffect(() => {
    if (enrollments.length > 0 && !selectedEnrollmentId) {
      handleSelectEnrollment(enrollments[0]);
    }
  }, [enrollments]); // eslint-disable-line react-hooks/exhaustive-deps

  const projectId = selectedEnrollment?.projectId || '';

  const { data: allUpdates = [], isLoading: updatesLoading } = useClientProjectUpdates();
  const { data: payments = [], isLoading: paymentsLoading } = useProjectPayments(projectId);

  const updates = React.useMemo(() => {
    return allUpdates.filter(u => u.propertyId === projectId);
  }, [allUpdates, projectId]);

  const loading = enrollmentsLoading && enrollments.length === 0;
  const makePaymentMutation = useMakePayment();
  const uploadProofMutation = useUploadPaymentProof();

  const project = selectedEnrollment?.project as Property;

  // Derived financial data (must be above early returns to keep hook order stable)
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPrice = selectedEnrollment?.totalPrice || 0;
  const remainingBalance = totalPrice - totalPaid;

  // Separate downpayment vs installment payments
  const downPayments = payments.filter(p => p.type === 'downpayment');
  const installmentPayments = payments.filter(p => p.type !== 'downpayment').sort((a, b) => (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0));
  const allDownPaymentsPaid = downPayments.length > 0 && downPayments.every(p => p.status === 'paid');
  const hasDownPayments = downPayments.length > 0;

  // Sequential enforcement: find the first unpaid installment number
  const firstUnpaidInstallmentNumber = React.useMemo(() => {
    const unpaid = installmentPayments.find(p => p.status !== 'paid');
    return unpaid?.installmentNumber ?? null;
  }, [installmentPayments]);

  // Check if a payment is allowed to be paid (sequential order enforcement)
  const isPaymentPayable = React.useCallback((payment: typeof payments[0]) => {
    // Down payments are always payable (already gated by their own section)
    if (payment.type === 'downpayment') return true;
    // All down payments must be paid first
    if (hasDownPayments && !allDownPaymentsPaid) return false;
    // Only the first unpaid installment can be paid
    if (firstUnpaidInstallmentNumber === null) return false;
    return payment.installmentNumber === firstUnpaidInstallmentNumber;
  }, [hasDownPayments, allDownPaymentsPaid, firstUnpaidInstallmentNumber]);

  // Next actionable payment (downpayment first, then installments)
  const nextPayment = React.useMemo(() => {
    // If downpayments exist and not all paid, find next unpaid downpayment
    if (hasDownPayments && !allDownPaymentsPaid) {
      return downPayments.find(p => ['pending', 'overdue'].includes(p.status) && p.verificationStatus !== 'pending_verification');
    }
    // Otherwise find next unpaid installment
    return installmentPayments.find(p => ['pending', 'overdue'].includes(p.status) && p.verificationStatus !== 'pending_verification');
  }, [payments, hasDownPayments, allDownPaymentsPaid, downPayments, installmentPayments]);

  const getMilestoneBadge = (milestone: string | undefined) => {
    if (!milestone) return null;
    const variants: Record<string, string> = {
      'Foundation': 'gold',
      'Structural Framework': 'secondary',
      'MEP Systems': 'gold',
      'General Progress': 'gold',
    };
    return (
      <Badge variant={variants[milestone] as any || 'secondary'}>
        {milestone}
      </Badge>
    );
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
        <p className="text-gold-400 animate-pulse">Synchronizing Portfolios...</p>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        {/* Show pending enrollments notification if any */}
        {pendingEnrollments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mb-8"
          >
            <Card className="bg-[#0a0a0a] border-yellow-500/30 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <ClockIcon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2">
                      Enrollment{pendingEnrollments.length > 1 ? 's' : ''} Under Verification
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      You have {pendingEnrollments.length} enrollment request{pendingEnrollments.length > 1 ? 's' : ''} being reviewed by our team.
                      Once approved, you'll have full access to project updates and payment schedules.
                    </p>
                    <div className="space-y-3">
                      {pendingEnrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className={`flex items-center justify-between p-3 rounded-xl ${
                            enrollment.status === 'pending'
                              ? 'bg-yellow-500/5 border border-yellow-500/10'
                              : 'bg-red-500/5 border border-red-500/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <BuildingOfficeIcon className={`h-5 w-5 ${
                              enrollment.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                            }`} />
                            <span className="text-white font-medium">{enrollment.projectName}</span>
                          </div>
                          <Badge className={`${
                            enrollment.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {enrollment.status === 'pending' ? 'Under Review' : 'Rejected'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {pendingEnrollments.some(e => e.status === 'rejected') && (
                      <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                        <div className="flex items-start gap-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-red-400 font-medium">Rejected Enrollment</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {pendingEnrollments.find(e => e.status === 'rejected')?.rejectedReason ||
                               'Please contact our team for more information.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="w-24 h-24 mb-6 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
          <BuildingOfficeIcon className="h-12 w-12 text-gold-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {pendingEnrollments.length > 0 ? 'No Approved Projects Yet' : 'No Active Enrollments'}
        </h2>
        <p className="text-gray-400 max-w-md mb-8">
          {pendingEnrollments.length > 0
            ? 'Your enrollment requests are being reviewed. Once approved by our team, your projects will appear here with full access.'
            : "You haven't enrolled in any projects yet. Reach out to our consultants to find your next flagship investment."
          }
        </p>
        <Link to="/client/projects">
          <Button className="bg-gold-500 text-black hover:bg-gold-400 font-bold px-8 py-6 rounded-2xl flex items-center gap-2">
            {pendingEnrollments.length > 0 ? 'Browse More Projects' : 'Explore Projects'}
            <ArrowRightIcon className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    );
  }

  // All enrollments in this view are verified (active or completed)
  // No need to check for pending/rejected anymore

  const handleSettlePayment = async (paymentId: string) => {
    const paymentToPay = payments.find(p => p.id === paymentId);
    if (!paymentToPay) return;

    // Sequential enforcement: block payment if not the next payable installment
    if (!isPaymentPayable(paymentToPay)) return;

    // If proof already submitted and pending review, prompt re-submit warning
    if (paymentToPay.verificationStatus === 'pending_verification') {
      setPendingResubmitPaymentId(paymentId);
      setShowResubmitWarning(true);
      return;
    }
    
    setSelectedPaymentForModal({ id: paymentId, amount: paymentToPay.amount, installmentNumber: paymentToPay.installmentNumber, clientId: paymentToPay.clientId });
    setPaymentModalOpen(true);
  };

  const handleConfirmResubmit = () => {
    if (!pendingResubmitPaymentId) return;
    const paymentToPay = payments.find(p => p.id === pendingResubmitPaymentId);
    if (!paymentToPay) return;
    setShowResubmitWarning(false);
    setSelectedPaymentForModal({ id: pendingResubmitPaymentId, amount: paymentToPay.amount, installmentNumber: paymentToPay.installmentNumber, clientId: paymentToPay.clientId });
    setPaymentModalOpen(true);
    setPendingResubmitPaymentId(null);
  };



  const handleUploadProof = (data: { paymentId: string; proofFile: File; proofType: any; notes?: string }) => {
    setIsProcessingPayment(true);
    makePaymentMutation.mutate(
      { paymentId: data.paymentId, amount: 0, method: 'manual_proof' },
      {
        onSuccess: () => {
          uploadProofMutation.mutate(data, {
            onSettled: () => setIsProcessingPayment(false),
            onError: (error) => console.error('Proof upload failed:', error),
          });
        },
        onError: (error) => {
          console.error('Payment update failed:', error);
          setIsProcessingPayment(false);
        }
      }
    );
  };

  const filteredPayments = payments.filter(p => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();

    // Search by installment number, status, or amount
    return (
      p.installmentNumber.toString().includes(searchLower) ||
      p.status.toLowerCase().includes(searchLower) ||
      p.amount.toString().includes(searchLower) ||
      (p.method && p.method.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Pending Enrollments Notification Banner */}
      {pendingEnrollments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20"
        >
          <div className="flex items-center gap-3">
            <ClockIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm text-yellow-400 font-medium">
                {pendingEnrollments.filter(e => e.status === 'pending').length > 0 && (
                  <>
                    {pendingEnrollments.filter(e => e.status === 'pending').length} enrollment request{pendingEnrollments.filter(e => e.status === 'pending').length > 1 ? 's' : ''} under verification
                  </>
                )}
                {pendingEnrollments.filter(e => e.status === 'pending').length > 0 &&
                 pendingEnrollments.filter(e => e.status === 'rejected').length > 0 && ' • '}
                {pendingEnrollments.filter(e => e.status === 'rejected').length > 0 && (
                  <span className="text-red-400">
                    {pendingEnrollments.filter(e => e.status === 'rejected').length} rejected
                  </span>
                )}
              </span>
            </div>
            <div className="flex gap-2">
              {pendingEnrollments.slice(0, 2).map(e => (
                <Badge
                  key={e.id}
                  className={`text-xs ${
                    e.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  {e.projectName}
                </Badge>
              ))}
              {pendingEnrollments.length > 2 && (
                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                  +{pendingEnrollments.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Header & Project Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <InformationCircleIcon className="h-4 w-4 text-gold-500" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold-500">Investment Insights</span>
          </div>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Flagship <span className="text-gold-400 italic">Portfolios</span>
          </h1>
        </motion.div>

        {/* Project Horizontal Scroll/Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:max-w-md lg:max-w-xl no-scrollbar">
          {enrollments.map((env) => (
            <button
              key={env.id}
              onClick={() => handleSelectEnrollment(env)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl border transition-all whitespace-nowrap font-bold text-sm flex items-center gap-2 ${selectedEnrollment?.id === env.id
                ? 'bg-gold-500 text-black border-transparent shadow-lg shadow-gold-500/20'
                : 'bg-[#1a1a1a] text-gray-400 border-gold-500/10 hover:border-gold-500/30'
                }`}
            >
              <CheckCircleIcon className="h-4 w-4" />
              {env.project?.name || 'Untitled Project'}
            </button>
          ))}
          {enrollmentsFetching && !enrollmentsLoading && (
            <div className="flex-shrink-0 flex items-center px-3">
              <div className="h-4 w-4 rounded-full border-2 border-gold-500/40 border-t-gold-500 animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Detailed Project View */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            key={project?.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="overflow-hidden border-gold-500/20 bg-[#0a0a0a] rounded-[2rem] h-full border shadow-2xl">
              <div className="relative h-56">
                <img
                  src={project?.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&fit=crop'}
                  alt={project?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-8">
                  <Badge className="bg-gold-500 text-black font-extrabold uppercase tracking-widest text-[10px] px-3 py-1">
                    {project?.status || 'In Progress'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {project?.name}
                </h3>

                <div className="space-y-5 mb-8">
                  <div className="flex items-center text-sm group">
                    <div className="p-2 rounded-lg bg-gold-500/5 border border-gold-500/10 mr-4 group-hover:bg-gold-500/10 group-hover:border-gold-500/20 transition-all">
                      <MapPinIcon className="h-5 w-5 text-gold-500/80" />
                    </div>
                    <span className="text-gray-400 group-hover:text-white transition-colors">{project?.location}</span>
                  </div>
                  <div className="flex items-center text-sm group">
                    <div className="p-2 rounded-lg bg-gold-500/5 border border-gold-500/10 mr-4 group-hover:bg-gold-500/10 group-hover:border-gold-500/20 transition-all">
                      <BuildingOfficeIcon className="h-5 w-5 text-gold-500/80" />
                    </div>
                    <span className="text-gray-400 group-hover:text-white transition-colors">{project?.type || 'Premium Development'}</span>
                  </div>
                  <div className="flex items-center text-sm group">
                    <div className="p-2 rounded-lg bg-gold-500/5 border border-gold-500/10 mr-4 group-hover:bg-gold-500/10 group-hover:border-gold-500/20 transition-all">
                      <CalendarIcon className="h-5 w-5 text-gold-500/80" />
                    </div>
                    <span className="text-gray-400 group-hover:text-white transition-colors">
                      Completion: {project?.completionDate ? formatDate(project.completionDate) : 'Dec 2025'}
                    </span>
                  </div>
                </div>

                <div className="pt-8 border-t border-gold-500/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs uppercase tracking-widest text-gold-500 font-extrabold">Portfolio Value</span>
                    <Badge
                      variant="outline"
                      className="py-1 font-bold border-green-500/30 text-green-400 bg-green-500/10"
                    >
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Total Valuation</span>
                      <span className="text-xl font-bold text-white font-serif tracking-tight">PKR {(selectedEnrollment?.totalPrice || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-y border-gold-500/5">
                      <span className="text-gray-500 text-xs">Total Settled</span>
                      <span className="text-green-500 font-bold">PKR {totalPaid.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Outstanding</span>
                      <span className="text-gold-400 font-bold">PKR {remainingBalance.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-[11px] pt-2">
                      <span className="text-gray-500">Duration</span>
                      <span className="text-white font-bold">{selectedEnrollment?.installmentDurationYears} Years</span>
                    </div>
                  </div>

                  {project?.brochureUrl && (
                    <Button
                      variant="outline"
                      className="w-full mt-8 border-gold-500/20 text-gold-400 hover:bg-gold-500/10 hover:border-gold-500/40 rounded-xl flex items-center gap-2 font-bold py-6"
                      onClick={() => window.open(project.brochureUrl, '_blank')}
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                      View Project Brochure
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Area: Tabs & Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex p-1.5 bg-[#0f0f0f] border border-gold-500/10 rounded-[1.25rem] w-fit">
            {[
              { id: 'journal', label: 'Journal', icon: CalendarIcon },
              { id: 'timeline', label: 'Payments', icon: CreditCardIcon },
              { id: 'dossier', label: 'Dossier', icon: InformationCircleIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${activeTab === tab.id
                  ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20'
                  : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'journal' && (
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="bg-[#0a0a0a]/60 border-gold-500/10 rounded-[2rem] backdrop-blur-md border min-h-[500px] overflow-hidden">
                  <CardHeader className="p-10 border-b border-gold-500/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Development Journal
                        </CardTitle>
                        <p className="text-sm text-gray-500 italic">Capturing the evolution of {project?.name}</p>
                      </div>
                      <Badge className="bg-gold-500/10 text-gold-400 border-gold-500/20 py-2 px-6 rounded-full font-bold">
                        {updates.length} Logs
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10">
                    {updatesLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-10 w-10 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
                        <p className="text-xs text-gold-500 font-bold tracking-widest uppercase">Fetching Records...</p>
                      </div>
                    ) : updates.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <CalendarIcon className="h-16 w-16 text-gold-500/20 mb-6" />
                        <h4 className="text-white font-bold text-lg mb-2">No Entries Found</h4>
                        <p className="text-gray-500 text-sm max-w-sm">
                          Our architectural and engineering site reviews are in progress. Check back soon for the latest snapshots.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-16 relative before:absolute before:inset-0 before:left-5 md:before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gold-500/40 before:via-gold-500/10 before:to-transparent">
                        {updates.map((update, idx) => (
                          <div key={update.id} className="relative group">
                            {/* Marker */}
                            <div className="absolute left-5 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0a0a0a] border-2 border-gold-500 z-10 group-hover:scale-125 transition-transform"></div>

                            <div className={`flex flex-col md:flex-row gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                              <div className="w-full md:w-[45%]">
                                <Card className="bg-[#141414] border-gold-500/10 group-hover:border-gold-500/30 transition-all rounded-3xl overflow-hidden shadow-xl">
                                  {update.images && update.images.length > 0 && (
                                    <img src={update.images[0]} alt="" className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                  )}
                                  <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                      <time className="text-[10px] font-extrabold text-gold-500 uppercase tracking-widest">
                                        {formatDate(update.createdAt)}
                                      </time>
                                      {getMilestoneBadge(update.milestone)}
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-3 tracking-tight">{update.title}</h4>
                                    <p className="text-sm text-gray-400 mb-6 leading-relaxed line-clamp-3 font-medium">
                                      {update.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-gold-500/5">
                                      <span className="text-xs font-bold text-gray-500 italic">{update.progress}% Completion</span>
                                      <Button variant="ghost" className="text-gold-500 h-8 p-0 hover:bg-transparent font-bold text-xs uppercase tracking-widest flex items-center gap-1 group/btn">
                                        View Details <ChevronRightIcon className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                              <div className="hidden md:block w-4 mt-8" />
                              <div className="w-full md:w-[45%] hidden md:block" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="bg-[#0a0a0a]/60 border-gold-500/10 rounded-[2rem] backdrop-blur-md border min-h-[500px] overflow-hidden">
                  <CardHeader className="p-10 border-b border-gold-500/10">
                    <CardTitle className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Payment Timeline
                    </CardTitle>
                    <p className="text-sm text-gray-500">Track your investment milestones and transaction history</p>
                  </CardHeader>
                  <CardContent className="p-10">
                    {paymentsLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-10 w-10 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
                        <p className="text-xs text-gold-500 font-bold uppercase tracking-widest">Loading Ledger...</p>
                      </div>
                    ) : (
                      <div className="space-y-10">

                        {/* === DOWN PAYMENT GATE SECTION === */}
                        {hasDownPayments && !allDownPaymentsPaid && (
                          <div className="space-y-6">
                            {/* Down Payment Progress Header */}
                            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-500/10 via-[#0a0a0a] to-transparent border border-amber-500/20 p-8">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheckIcon className="h-4 w-4 text-amber-500" />
                                    <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-[0.2em]">Down Payment Required</span>
                                  </div>
                                  <h4 className="text-2xl font-bold text-white font-serif mb-1">
                                    Complete Your Down Payment
                                  </h4>
                                  <p className="text-sm text-gray-500 font-medium">
                                    {downPayments.some(p => p.status === 'paid') ? 'Down payment completed' : 'Pay your down payment to unlock your installment calendar'}
                                  </p>
                                </div>
                                {/* Progress indicator */}
                                <div className="flex items-center gap-3">
                                  {downPayments.map((dp, i) => (
                                    <div key={dp.id} className={`h-3 w-3 rounded-full transition-all ${dp.status === 'paid' ? 'bg-green-500 shadow-lg shadow-green-500/30' : dp.verificationStatus === 'pending_verification' ? 'bg-amber-500 animate-pulse' : 'bg-gray-600'}`} title={`Payment ${i + 1}: ${dp.status}`} />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Individual Down Payment Cards */}
                            {downPayments.map((dp, idx) => (
                              <div key={dp.id} className="relative flex items-center gap-6 group">
                                {idx !== downPayments.length - 1 && (
                                  <div className="absolute top-10 bottom-0 left-6 w-0.5 bg-amber-500/10 translate-y-2"></div>
                                )}
                                <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                                  dp.status === 'paid' ? 'bg-green-500/10 border-green-500/30' :
                                  dp.verificationStatus === 'pending_verification' ? 'bg-amber-500/10 border-amber-500/30' :
                                  dp.status === 'overdue' ? 'bg-red-500/10 border-red-500/30' :
                                  'bg-[#141414] border-gold-500/10'
                                }`}>
                                  {dp.status === 'paid' ? (
                                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                  ) : dp.verificationStatus === 'pending_verification' ? (
                                    <ShieldCheckIcon className="h-6 w-6 text-amber-500" />
                                  ) : dp.status === 'overdue' ? (
                                    <ClockIcon className="h-6 w-6 text-red-500" />
                                  ) : (
                                    <CreditCardIcon className="h-6 w-6 text-gray-600" />
                                  )}
                                </div>

                                <div className="flex-1 p-6 rounded-2xl bg-[#141414]/40 border border-gold-500/5 hover:border-gold-500/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <span className="text-white font-bold">Down Payment</span>
                                      <Badge className={
                                        dp.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        dp.status === 'overdue' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        'bg-gold-500/10 text-gold-500 border-gold-500/20'
                                      }>
                                        {dp.status}
                                      </Badge>
                                      {dp.verificationStatus === 'pending_verification' && (
                                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
                                          <ClockIcon className="h-3 w-3" />
                                          Evidence Under Review
                                        </Badge>
                                      )}
                                      {dp.verificationStatus === 'rejected' && (
                                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1">
                                          <ExclamationTriangleIcon className="h-3 w-3" />
                                          Proof Rejected
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <CalendarIcon className="h-3 w-3" />
                                      <span>Due: {formatDate(dp.dueDate)}</span>
                                      {dp.paidDate && (
                                        <>
                                          <span className="mx-1">•</span>
                                          <span className="text-green-500/80">Paid on {formatDate(dp.paidDate)}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-white font-serif">PKR {dp.amount.toLocaleString()}</div>
                                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                        {dp.paymentMethod || 'SCHEDULED'}
                                      </div>
                                    </div>
                                    {dp.status !== 'paid' && (
                                      <Button
                                        onClick={() => handleSettlePayment(dp.id)}
                                        disabled={isProcessingPayment}
                                        size="sm"
                                        className="bg-gold-500 text-black hover:bg-gold-400 font-extrabold rounded-xl text-[10px] uppercase tracking-widest"
                                      >
                                        {dp.verificationStatus === 'pending_verification' ? 'Re-submit' : 'Pay Now'}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Locked Installments Notice */}
                            <div className="relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-gold-500/5 p-8 opacity-60">
                              <div className="flex items-center gap-4">
                                <LockClosedIcon className="h-8 w-8 text-gray-600" />
                                <div>
                                  <h4 className="text-lg font-bold text-gray-400">Installments Locked</h4>
                                  <p className="text-sm text-gray-600">Complete all down payments above to unlock your {installmentPayments.length} installment{installmentPayments.length !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* === NEXT PAYMENT CARD (shown only when downpayments done or no downpayments) === */}
                        {(!hasDownPayments || allDownPaymentsPaid) && nextPayment && (
                          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 p-8 mb-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <ClockIcon className="h-4 w-4 text-gold-500" />
                                  <span className="text-[10px] font-extrabold text-gold-500 uppercase tracking-[0.2em]">Next Obligation</span>
                                </div>
                                <h4 className="text-3xl font-bold text-white font-serif">
                                  PKR {nextPayment.amount.toLocaleString()}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1 font-medium italic">
                                  Due Date: {formatDate(nextPayment.dueDate)}
                                </p>
                              </div>
                              <div className="flex gap-4 w-full md:w-auto">
                                <Button
                                  onClick={() => handleSettlePayment(nextPayment.id)}
                                  disabled={isProcessingPayment}
                                  className="flex-1 md:flex-none bg-gold-500 text-black hover:bg-gold-400 font-extrabold px-8 py-6 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-gold-500/20"
                                >
                                  {isProcessingPayment ? 'Processing...' : 'Settle Now'}
                                </Button>
                              </div>
                            </div>
                            {/* Background Decorative Element */}
                            <CreditCardIcon className="absolute -bottom-10 -right-10 h-40 w-40 text-gold-500/5 rotate-12 pointer-events-none" />
                          </div>
                        )}

                        {/* Interactive Payment Calendar — only visible when downpayments complete */}
                        {(!hasDownPayments || allDownPaymentsPaid) && (
                          <div className="mb-4">
                            <PaymentCalendar
                              payments={payments}
                              dueDay={user?.createdAt ? new Date(user.createdAt).getDate() : undefined}
                            />
                          </div>
                        )}

                        {/* Search Bar for Ledger */}
                        <div className="relative w-full md:w-1/2">
                          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-500" />
                          <Input
                            placeholder="Search Installment #, Status, Amount..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#141414] border-gold-500/10 pl-10 h-10 rounded-xl text-sm focus:border-gold-500/30 text-white"
                          />
                        </div>

                        {/* Payment Rows — only show installments when downpayments complete, else show all */}
                        <div className="space-y-6">
                          {(() => {
                            const displayPayments = hasDownPayments && !allDownPaymentsPaid
                              ? [] // hide installment rows while downpayments pending
                              : filteredPayments;
                            if (displayPayments.length === 0 && (!hasDownPayments || allDownPaymentsPaid)) {
                              return (
                                <div className="flex flex-col items-center justify-center py-12 text-center border border-gold-500/5 rounded-3xl bg-[#141414]/20">
                                  <CreditCardIcon className="h-12 w-12 text-gold-500/20 mb-4" />
                                  <h4 className="text-white font-bold text-sm mb-1">No Transactions Reported</h4>
                                  <p className="text-gray-500 text-[10px] max-w-xs">Detailed transaction history will appear here once processed.</p>
                                </div>
                              );
                            }
                            return displayPayments.map((payment, idx) => (
                              <div key={payment.id} className="relative flex items-center gap-6 group">
                                {/* Vertical Line Segment */}
                                {idx !== displayPayments.length - 1 && (
                                  <div className="absolute top-10 bottom-0 left-6 w-0.5 bg-gold-500/10 translate-y-2"></div>
                                )}

                                {/* Status Icon Marker */}
                                <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                                  payment.status === 'paid' ? 'bg-gold-500/10 border-gold-500/30' :
                                  payment.verificationStatus === 'pending_verification' ? 'bg-amber-500/10 border-amber-500/30' :
                                  payment.status === 'overdue' ? 'bg-red-500/10 border-red-500/30' :
                                  'bg-[#141414] border-gold-500/10'
                                }`}>
                                  {payment.status === 'paid' ? (
                                    <CheckCircleIcon className="h-6 w-6 text-gold-500" />
                                  ) : payment.verificationStatus === 'pending_verification' ? (
                                    <ShieldCheckIcon className="h-6 w-6 text-amber-500" />
                                  ) : payment.status === 'overdue' ? (
                                    <ClockIcon className="h-6 w-6 text-red-500" />
                                  ) : (
                                    <CreditCardIcon className="h-6 w-6 text-gray-600" />
                                  )}
                                </div>

                                {/* Payment Row */}
                                <div className="flex-1 p-6 rounded-2xl bg-[#141414]/40 border border-gold-500/5 hover:border-gold-500/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <span className="text-white font-bold">
                                        {payment.type === 'downpayment' ? 'Down Payment' : `Installment #${payment.installmentNumber}`}
                                      </span>
                                      <Badge className={payment.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : payment.status === 'overdue' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-gold-500/10 text-gold-500 border-gold-500/20'}>
                                        {payment.status}
                                      </Badge>
                                      {payment.verificationStatus === 'pending_verification' && (
                                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
                                          <ClockIcon className="h-3 w-3" />
                                          Evidence Under Review
                                        </Badge>
                                      )}
                                      {payment.verificationStatus === 'rejected' && (
                                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1">
                                          <ExclamationTriangleIcon className="h-3 w-3" />
                                          Proof Rejected
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <CalendarIcon className="h-3 w-3" />
                                      <span>Due: {formatDate(payment.dueDate)}</span>
                                      {payment.paidDate && (
                                        <>
                                          <span className="mx-1">•</span>
                                          <span className="text-green-500/80">Paid on {formatDate(payment.paidDate)}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-white font-serif">PKR {payment.amount.toLocaleString()}</div>
                                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                        {payment.paymentMethod || 'SCHEDULED'}
                                      </div>
                                    </div>
                                    {payment.status !== 'paid' && isPaymentPayable(payment) && (
                                      <Button
                                        onClick={() => handleSettlePayment(payment.id)}
                                        disabled={isProcessingPayment}
                                        size="sm"
                                        className="bg-gold-500 text-black hover:bg-gold-400 font-extrabold rounded-xl text-[10px] uppercase tracking-widest"
                                      >
                                        {payment.verificationStatus === 'pending_verification' ? 'Re-submit' : 'Settle'}
                                      </Button>
                                    )}
                                    {payment.status !== 'paid' && !isPaymentPayable(payment) && (
                                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1">
                                        <LockClosedIcon className="h-3.5 w-3.5" />
                                        Pay earlier first
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'dossier' && (
              <motion.div
                key="dossier"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="bg-[#0a0a0a]/60 border-gold-500/10 rounded-[2rem] backdrop-blur-md border min-h-[500px] overflow-hidden">
                  <CardHeader className="p-10 border-b border-gold-500/10">
                    <CardTitle className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Project <span className="text-gold-400">Dossier</span>
                    </CardTitle>
                    <p className="text-sm text-gray-500">Deep insights into the architectural vision and amenities</p>
                  </CardHeader>
                  <CardContent className="p-10 space-y-12">
                    {/* Description */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <InformationCircleIcon className="h-5 w-5 text-gold-500" />
                        <h4 className="text-sm font-extrabold text-gold-500 uppercase tracking-widest">Architectural Vision</h4>
                      </div>
                      <p className="text-gray-400 leading-relaxed font-medium text-lg">
                        {project?.description || "This flagship development represents a paradigm shift in luxury commercial and residential spaces. Situated at a prime focal point of the city, it seamlessly integrates modern architectural aesthetics with sustainable engineering solutions to create a future-ready landmark."}
                      </p>
                    </div>

                    {/* Amenities Grid */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <StarIcon className="h-5 w-5 text-gold-500" />
                        <h4 className="text-sm font-extrabold text-gold-500 uppercase tracking-widest">Signature Amenities</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {(project?.amenities && project.amenities.length > 0 ? project.amenities : ['24/7 Security', 'Fitness Center', 'Rooftop Lounge', 'Concierge Service', 'Smart Automation', 'High-Speed Elevators']).map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-4 bg-[#141414] border border-gold-500/5 rounded-2xl group hover:border-gold-500/20 transition-all">
                            <div className="h-2 w-2 rounded-full bg-gold-500/40 group-hover:scale-150 transition-all"></div>
                            <span className="text-sm text-gray-400 font-bold group-hover:text-white transition-colors">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Specs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gold-500/10">
                      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#141414] to-transparent border border-gold-500/10">
                        <h5 className="text-xs uppercase tracking-widest text-gold-500 font-bold mb-4">Project Scope</h5>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li className="flex justify-between"><span>Development Type</span> <span className="text-white font-bold">{project?.type || 'Commercial'}</span></li>
                          <li className="flex justify-between"><span>Status</span> <span className="text-gold-400 font-bold">{project?.status || 'Active'}</span></li>
                          <li className="flex justify-between"><span>Lead Architect</span> <span className="text-white font-bold">Studio ABS</span></li>
                        </ul>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#141414] to-transparent border border-gold-500/10">
                        <h5 className="text-xs uppercase tracking-widest text-gold-500 font-bold mb-4">Investment Highlights</h5>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li className="flex justify-between"><span>Location Grade</span> <span className="text-white font-bold">A+ Prime</span></li>
                          <li className="flex justify-between"><span>Yield Potential</span> <span className="text-white font-bold">High Growth</span></li>
                          <li className="flex justify-between"><span>Ownership</span> <span className="text-white font-bold">Pre-Launch Early Access</span></li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Re-submit Warning Modal */}
      <AnimatePresence>
        {showResubmitWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowResubmitWarning(false); setPendingResubmitPaymentId(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-amber-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Evidence Already Submitted</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                You have already submitted payment evidence for this installment that is currently <span className="text-amber-400 font-semibold">under review</span>. Submitting new evidence will replace the previous submission.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => { setShowResubmitWarning(false); setPendingResubmitPaymentId(null); }}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmResubmit}
                  className="bg-amber-500 text-black hover:bg-amber-400 font-bold"
                >
                  Replace & Re-submit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Method Modal */}
      {selectedPaymentForModal && (
        <PaymentMethodModal
          isOpen={paymentModalOpen}
          onClose={() => { setPaymentModalOpen(false); setSelectedPaymentForModal(null); }}
          paymentId={selectedPaymentForModal.id}
          amount={selectedPaymentForModal.amount}
          installmentNumber={selectedPaymentForModal.installmentNumber}
          clientId={selectedPaymentForModal.clientId}
          onUploadProof={handleUploadProof}
          isProcessing={isProcessingPayment}
        />
      )}
    </div>
  );
};
