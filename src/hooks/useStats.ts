import { useQuery } from '@tanstack/react-query'
import { statsApi, type StatsParams } from '../services/statsApi'
import { dashboardApi, type TopRunsAndWicketsParams } from '../services/dashboardApi'

/**
 * Custom hook for stats data
 */
export function useStats(params: StatsParams = {}) {
  const statsQuery = useQuery({
    queryKey: ['stats', params.ballType || 'leather'],
    queryFn: () => statsApi.getStats(params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })

  return {
    statsData: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  }
}

export function useStatsLeaderboards(params: TopRunsAndWicketsParams = {}) {
  const query = useQuery({
    queryKey: [
      'stats',
      'leaderboards',
      params.ballType || 'leather',
      params.runScorers || 10,
      params.wicketTakers || 10,
    ],
    queryFn: () =>
      dashboardApi.getTopRunsAndWickets({
        runScorers: params.runScorers ?? 10,
        wicketTakers: params.wicketTakers ?? 10,
        ballType: params.ballType,
      }),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })

  return {
    leaderboards: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
