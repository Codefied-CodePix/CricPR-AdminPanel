import { useQuery } from '@tanstack/react-query'
import { teamsApi } from '../services/teamsApi'

/**
 * Custom hook for team details data
 */
export function useTeam(teamId: string | undefined) {
  const teamQuery = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => {
      if (!teamId) throw new Error('Team ID is required')
      return teamsApi.getTeamById(teamId)
    },
    enabled: !!teamId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    teamData: teamQuery.data,
    isLoading: teamQuery.isLoading,
    isError: teamQuery.isError,
    error: teamQuery.error,
    refetch: teamQuery.refetch,
  }
}

