import { useQuery } from '@tanstack/react-query'
import { tournamentsApi } from '../services/tournamentsApi'

/**
 * Custom hook for tournament details data
 */
export function useTournament(tournamentId: string | undefined) {
  const tournamentQuery = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => {
      if (!tournamentId) throw new Error('Tournament ID is required')
      return tournamentsApi.getTournamentById(tournamentId)
    },
    enabled: !!tournamentId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    tournamentData: tournamentQuery.data,
    isLoading: tournamentQuery.isLoading,
    isError: tournamentQuery.isError,
    error: tournamentQuery.error,
    refetch: tournamentQuery.refetch,
  }
}

