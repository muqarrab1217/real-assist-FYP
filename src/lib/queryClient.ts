import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data becomes "stale" after 5 minutes
      gcTime: 15 * 60 * 1000, // Data stays in memory for 15 minutes before garbage collection
      refetchOnWindowFocus: true, // Automatically refetch when the user comes back to the tab
      retry: 1, // Only retry failed requests once to avoid rate limiting
    },
  },
});
