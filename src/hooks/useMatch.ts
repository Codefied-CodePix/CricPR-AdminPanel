import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '../services/matchesApi'

/**
 * Custom hook for match details data
 */
export function useMatch(matchId: string | undefined) {
  const matchQuery = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => {
      if (!matchId) throw new Error('Match ID is required')
      return matchesApi.getMatchById(matchId)
    },
    enabled: !!matchId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    matchData: matchQuery.data,
    isLoading: matchQuery.isLoading,
    isError: matchQuery.isError,
    error: matchQuery.error,
    refetch: matchQuery.refetch,
  }
}

