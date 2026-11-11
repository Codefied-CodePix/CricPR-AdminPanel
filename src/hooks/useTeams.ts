import { useQuery } from '@tanstack/react-query'
import { teamsApi, type TeamsParams } from '../services/teamsApi'

/**
 * Custom hook for teams data with filters and pagination
 */
export function useTeams(params: TeamsParams = {}) {
  // Create a stable query key that properly serializes params
  // This ensures React Query refetches when any param changes
  const queryKey = [
    'teams',
    params.page || 1,
    params.limit || 20,
    params.name || '',
    params.city || '',
    params.sortBy || '',
  ]

  const teamsQuery = useQuery({
    queryKey,
    queryFn: () => teamsApi.getTeams(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    teamsData: teamsQuery.data,
    isLoading: teamsQuery.isLoading,
    isError: teamsQuery.isError,
    error: teamsQuery.error,
    refetch: teamsQuery.refetch,
  }
}

