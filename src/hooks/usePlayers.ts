import { useQuery } from '@tanstack/react-query'
import { playersApi, type PlayersParams } from '../services/playersApi'

/**
 * Custom hook for players data with filters and pagination
 */
export function usePlayers(params: PlayersParams = {}) {
  // Create a stable query key that properly serializes params
  // This ensures React Query refetches when any param changes
  const queryKey = [
    'players',
    params.page || 1,
    params.limit || 20,
    params.name || '',
    params.city || '',
    params.battingStyle || '',
    params.bowlingStyle || '',
    params.role || '',
  ]

  const playersQuery = useQuery({
    queryKey,
    queryFn: () => playersApi.getPlayers(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    playersData: playersQuery.data,
    isLoading: playersQuery.isLoading,
    isError: playersQuery.isError,
    error: playersQuery.error,
    refetch: playersQuery.refetch,
  }
}

