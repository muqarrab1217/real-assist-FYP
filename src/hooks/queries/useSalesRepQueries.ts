import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesRepAPI } from '@/services/api';
import { useAuthContext } from '@/contexts/AuthContext';

export const salesRepKeys = {
  all: ['salesRep'] as const,
  pendingVerifications: () => [...salesRepKeys.all, 'pendingVerifications'] as const,
  allVerifications: () => [...salesRepKeys.all, 'allVerifications'] as const,
  dashboardStats: () => [...salesRepKeys.all, 'dashboardStats'] as const,
};

export function usePendingVerifications() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: salesRepKeys.pendingVerifications(),
    queryFn: () => salesRepAPI.getPendingVerifications(),
    enabled: !!user && user.role === 'sales_rep',
    staleTime: 1 * 60 * 1000,
  });
}

export function useAllVerifications() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: salesRepKeys.allVerifications(),
    queryFn: () => salesRepAPI.getAllVerifications(),
    enabled: !!user && user.role === 'sales_rep',
    staleTime: 1 * 60 * 1000,
  });
}

export function useSalesRepDashboardStats() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: salesRepKeys.dashboardStats(),
    queryFn: () => salesRepAPI.getDashboardStats(),
    enabled: !!user && user.role === 'sales_rep',
    staleTime: 1 * 60 * 1000,
  });
}

export function useApproveProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proofId: string) => salesRepAPI.approveProof(proofId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesRepKeys.all });
    },
  });
}

export function useRejectProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ proofId, reason }: { proofId: string; reason: string }) =>
      salesRepAPI.rejectProof(proofId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesRepKeys.all });
    },
  });
}
