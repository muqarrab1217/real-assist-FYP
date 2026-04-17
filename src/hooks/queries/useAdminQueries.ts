import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { adminAPI, enrollmentAPI, inventoryAPI, leadAPI } from '@/services/api';
import { useAuthContext } from '@/contexts/AuthContext';

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  leads: () => [...adminKeys.all, 'leads'] as const,
  clients: () => [...adminKeys.all, 'clients'] as const,
  payments: () => [...adminKeys.all, 'payments'] as const,
  enrollments: () => [...adminKeys.all, 'enrollments'] as const,
  teams: () => [...adminKeys.all, 'teams'] as const,
  teamMembers: (teamId: string) => [...adminKeys.teams(), teamId, 'members'] as const,
  analytics: () => [...adminKeys.all, 'analytics'] as const,
  projectSubscriptions: (projectId: string) => [...adminKeys.all, 'projectSubscriptions', projectId] as const,
};

export function useAdminStats() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminAPI.getDashboardStats(),
    enabled: !!user && user.role === 'admin',
    staleTime: 3 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useAdminLeads() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: adminKeys.leads(),
    queryFn: () => adminAPI.getLeads(),
    enabled: !!user && user.role === 'admin',
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useAdminClients() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: adminKeys.clients(),
    queryFn: () => adminAPI.getClients(),
    enabled: !!user && user.role === 'admin',
    staleTime: 10 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useAdminPayments() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: adminKeys.payments(),
    queryFn: () => adminAPI.getPayments(),
    enabled: !!user && user.role === 'admin',
    staleTime: 3 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useAdminEnrollments() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: adminKeys.enrollments(),
    queryFn: () => enrollmentAPI.getAllEnrollments(),
    enabled: !!user && user.role === 'admin',
    staleTime: 3 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useApproveEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, notes }: { enrollmentId: string; notes?: string }) =>
      enrollmentAPI.approveEnrollment(enrollmentId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.enrollments() });
    },
  });
}

export function useRejectEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, reason }: { enrollmentId: string; reason: string }) =>
      enrollmentAPI.rejectEnrollment(enrollmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.enrollments() });
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: 'hot' | 'warm' | 'cold' | 'dead' }) =>
      adminAPI.updateLeadStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.leads() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

export function useAddLeadNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, note }: { leadId: string; note: string }) =>
      adminAPI.addLeadNote(leadId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.leads() });
    },
  });
}

export function useAddLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof leadAPI.createLead>[0]) => leadAPI.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.leads() });
    },
  });
}

export function useBulkCreateLeads() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leads: Parameters<typeof leadAPI.bulkCreateLeads>[0]) =>
      leadAPI.bulkCreateLeads(leads),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.leads() });
    },
  });
}

export function useAdminTeams() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: adminKeys.teams(),
    queryFn: () => adminAPI.getTeams(),
    enabled: !!user && user.role === 'admin',
    staleTime: 15 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useAdminAnalytics() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: adminKeys.analytics(),
    queryFn: () => adminAPI.getAnalytics(),
    enabled: !!user && user.role === 'admin',
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useAdminTeamMembers(teamId: string | undefined) {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: adminKeys.teamMembers(teamId!),
    queryFn: () => adminAPI.getTeamMembers(teamId!),
    enabled: !!user && user.role === 'admin' && !!teamId,
    staleTime: 10 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description: string }) => adminAPI.createTeam(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teams() });
    },
  });
}

export function useAddMemberToTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, profileId }: { teamId: string; profileId: string }) => adminAPI.addMemberToTeam(teamId, profileId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teamMembers(teamId) });
    },
  });
}

export function useRemoveMemberFromTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, profileId }: { teamId: string; profileId: string }) => adminAPI.removeMemberFromTeam(teamId, profileId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teamMembers(teamId) });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, description }: { id: string; name: string; description: string }) =>
      adminAPI.updateTeam(id, name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teams() });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => adminAPI.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teams() });
    },
  });
}

export function useClientPayments(clientId: string | undefined) {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: [...adminKeys.clients(), clientId, 'payments'] as const,
    queryFn: () => adminAPI.getClientPayments(clientId!),
    enabled: !!user && user.role === 'admin' && !!clientId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

// Project Subscriptions
export function useProjectSubscriptions(projectId: string | undefined) {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: adminKeys.projectSubscriptions(projectId!),
    queryFn: () => enrollmentAPI.getProjectSubscriptions(projectId!),
    enabled: !!user && user.role === 'admin' && !!projectId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useAllProjectSubscriptions(projectIds: string[]) {
  const { user } = useAuthContext();
  return useQueries({
    queries: projectIds.map(id => ({
      queryKey: adminKeys.projectSubscriptions(id),
      queryFn: () => enrollmentAPI.getProjectSubscriptions(id),
      enabled: !!user && user.role === 'admin' && !!id,
      staleTime: 5 * 60 * 1000,
      placeholderData: (prev: any) => prev,
    }))
  });
}

// Admin Project Management
export function useCreateProperty() {
  return useMutation({
    mutationFn: (data: any) => adminAPI.createProperty(data),
    onSuccess: () => {
      // Note: Properties are usually cached in commonKeys, so you'll need to invalidate them where used
      // We don't import commonKeys here to avoid circular dependency if not careful, 
      // but invalidating from the component onSuccess is usually safe.
    },
  });
}

export function useUpdateProperty() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminAPI.updateProperty(id, data),
    onSuccess: () => {
      // Invalidation handled by caller
    },
  });
}

export function useUploadInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, rows, statusKey }: { projectId: string; rows: Record<string, string>[]; statusKey?: string }) =>
      inventoryAPI.uploadProjectInventory(projectId, rows, statusKey),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['common', 'inventory', projectId] });
    },
  });
}

export function useReplaceInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, rows, statusKey }: { projectId: string; rows: Record<string, string>[]; statusKey?: string }) =>
      inventoryAPI.replaceProjectInventory(projectId, rows, statusKey),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['common', 'inventory', projectId] });
    },
  });
}

export function useUpdateInventoryRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, rowData, status, projectId }: { itemId: string; rowData: Record<string, string>; status?: 'available' | 'sold' | 'reserved' | 'booked'; projectId: string }) =>
      inventoryAPI.updateInventoryRow(itemId, rowData, status),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['common', 'inventory', projectId] });
    },
  });
}

export function useUploadBlueprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, file }: { projectId: string; file: File }) =>
      inventoryAPI.uploadBlueprint(projectId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['common', 'properties'] });
    },
  });
}
