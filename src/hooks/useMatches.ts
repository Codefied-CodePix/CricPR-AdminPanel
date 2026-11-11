import { useQuery } from '@tanstack/react-query'
import { matchesApi, type MatchesParams } from '../services/matchesApi'

/**
 * Custom hook for matches data with filters and pagination
 */
export function useMatches(params: MatchesParams = {}) {
  // Create a stable query key that properly serializes params
  // This ensures React Query refetches when any param changes
  const queryKey = [
    'matches',
    params.page || 1,
    params.limit || 20,
    params.team_name || '',
    params.status || '',
  ]

  const matchesQuery = useQuery({
    queryKey,
    queryFn: () => matchesApi.getMatches(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    matchesData: matchesQuery.data,
    isLoading: matchesQuery.isLoading,
    isError: matchesQuery.isError,
    error: matchesQuery.error,
    refetch: matchesQuery.refetch,
  }
}

