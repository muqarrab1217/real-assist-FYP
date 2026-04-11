import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAPI, enrollmentAPI, paymentProofAPI } from '@/services/api';
import { useAuthContext } from '@/contexts/AuthContext';

export const clientKeys = {
  all: ['client'] as const,
  stats: () => [...clientKeys.all, 'stats'] as const,
  payments: () => [...clientKeys.all, 'payments'] as const,
  updates: () => [...clientKeys.all, 'updates'] as const,
  enrollments: () => [...clientKeys.all, 'enrollments'] as const,
  pendingEnrollments: () => [...clientKeys.all, 'pendingEnrollments'] as const,
  financials: (projectId?: string) => [...clientKeys.all, 'financials', projectId] as const,
  projectPayments: (projectId: string) => [...clientKeys.all, 'projectPayments', projectId] as const,
};

export function useClientStats() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: clientKeys.stats(),
    queryFn: () => clientAPI.getDashboardStats(),
    enabled: !!user && user.role === 'client',
    staleTime: 3 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useClientPayments() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: clientKeys.payments(),
    queryFn: () => clientAPI.getPayments(),
    enabled: !!user && user.role === 'client',
    staleTime: 3 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useClientProjectUpdates() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: clientKeys.updates(),
    queryFn: () => clientAPI.getProjectUpdates(),
    enabled: !!user && user.role === 'client',
    staleTime: 10 * 60 * 1000, // 10 minutes — project updates change infrequently
    placeholderData: (prev: any) => prev, // keep previous data visible during background refetch
  });
}

export function useUserEnrollments() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: clientKeys.enrollments(),
    queryFn: () => enrollmentAPI.getUserEnrollments(),
    enabled: !!user && user.role === 'client',
    staleTime: 10 * 60 * 1000, // 10 minutes — enrollments rarely change
    placeholderData: (prev: any) => prev,
  });
}

export function usePendingEnrollments() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: clientKeys.pendingEnrollments(),
    queryFn: () => enrollmentAPI.getPendingEnrollments(),
    enabled: !!user && user.role === 'client',
    staleTime: 3 * 60 * 1000, // 3 minutes — check more often for status changes
    placeholderData: (prev: any) => prev,
  });
}

export function useProjectPayments(projectId: string) {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: clientKeys.projectPayments(projectId),
    queryFn: () => clientAPI.getProjectPayments(projectId),
    enabled: !!user && user.role === 'client' && !!projectId,
    staleTime: 3 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useMakePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, amount, method }: { paymentId: string; amount: number; method: string }) =>
      clientAPI.makePayment(paymentId, amount, method),
    onSuccess: (_, _variables) => {
      // Invalidate both payments and stats since stats include payment totals
      queryClient.invalidateQueries({ queryKey: clientKeys.payments() });
      queryClient.invalidateQueries({ queryKey: clientKeys.stats() });
      queryClient.invalidateQueries({ queryKey: clientKeys.projectPayments('') }); // Invalidate all project specific payments
    },
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => enrollmentAPI.createEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.pendingEnrollments() });
      queryClient.invalidateQueries({ queryKey: clientKeys.enrollments() });
    },
  });
}

export function useUploadPaymentProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { paymentId: string; proofFile: File; proofType: 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'cheque' | 'cash_receipt' | 'other'; notes?: string }) =>
      paymentProofAPI.uploadProof(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.payments() });
      queryClient.invalidateQueries({ queryKey: clientKeys.stats() });
    },
  });
}
