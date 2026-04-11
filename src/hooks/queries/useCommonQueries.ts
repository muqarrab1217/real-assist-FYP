import { useQuery, useMutation } from '@tanstack/react-query';
import { commonAPI, leadAPI, inventoryAPI } from '@/services/api';

export const commonKeys = {
  all: ['common'] as const,
  properties: () => [...commonKeys.all, 'properties'] as const,
  property: (id: string) => [...commonKeys.all, 'property', id] as const,
  inventory: (projectId: string) => [...commonKeys.all, 'inventory', projectId] as const,
};

export function useProperties() {
  return useQuery({
    queryKey: commonKeys.properties(),
    queryFn: () => commonAPI.getProperties(),
    staleTime: 10 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: commonKeys.property(id),
    queryFn: () => commonAPI.getProperty(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useProjectInventory(projectId: string | undefined) {
  return useQuery({
    queryKey: commonKeys.inventory(projectId!),
    queryFn: () => inventoryAPI.getProjectInventory(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: any) => prev,
  });
}

export function useCreateLead() {
  return useMutation({
    mutationFn: (data: any) => leadAPI.createLead(data),
  });
}
