import { useQuery } from '@tanstack/react-query'
import { dashboardApi, type TopTalentParams, type RecentMatchesParams, type TopRunsAndWicketsParams } from '../services/dashboardApi'

/**
 * Custom hook for dashboard data
 */
export function useDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'numbers'],
    queryFn: () => dashboardApi.getDashboardNumbers(),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    dashboardData: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  }
}

/**
 * Custom hook for top talent data with filters and pagination
 */
export function useTopTalent(params: TopTalentParams) {
  // Create a stable query key that properly serializes params
  // This ensures React Query refetches when any param changes
  const queryKey = [
    'dashboard',
    'topTalent',
    params.role || '',
    params.city || '',
    params.page || 1,
    params.limit || 10,
  ]

  const topTalentQuery = useQuery({
    queryKey,
    queryFn: () => dashboardApi.getTopTalent(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    topTalentData: topTalentQuery.data,
    isLoading: topTalentQuery.isLoading,
    isError: topTalentQuery.isError,
    error: topTalentQuery.error,
    refetch: topTalentQuery.refetch,
  }
}

/**
 * Custom hook for recent matches data
 */
export function useRecentMatches(params: RecentMatchesParams = {}) {
  // Create a stable query key
  const queryKey = [
    'dashboard',
    'recentMatches',
    params.matches || 5,
    params.page || 1,
  ]

  const recentMatchesQuery = useQuery({
    queryKey,
    queryFn: () => dashboardApi.getRecentMatches(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    recentMatchesData: recentMatchesQuery.data,
    isLoading: recentMatchesQuery.isLoading,
    isError: recentMatchesQuery.isError,
    error: recentMatchesQuery.error,
    refetch: recentMatchesQuery.refetch,
  }
}

/**
 * Custom hook for recent user signups
 */
export function useRecentSignups() {
  const recentSignupsQuery = useQuery({
    queryKey: ['dashboard', 'recentSignups'],
    queryFn: () => dashboardApi.getRecentSignups(),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    recentSignupsData: recentSignupsQuery.data,
    isLoading: recentSignupsQuery.isLoading,
    isError: recentSignupsQuery.isError,
    error: recentSignupsQuery.error,
    refetch: recentSignupsQuery.refetch,
  }
}

/**
 * Custom hook for top runs and wickets data
 */
export function useTopRunsAndWickets(params: TopRunsAndWicketsParams = {}) {
  const queryKey = [
    'dashboard',
    'topRunsAndWickets',
    params.runScorers || 5,
    params.wicketTakers || 5,
  ]

  const topRunsAndWicketsQuery = useQuery({
    queryKey,
    queryFn: () => dashboardApi.getTopRunsAndWickets(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    topRunsAndWicketsData: topRunsAndWicketsQuery.data,
    isLoading: topRunsAndWicketsQuery.isLoading,
    isError: topRunsAndWicketsQuery.isError,
    error: topRunsAndWicketsQuery.error,
    refetch: topRunsAndWicketsQuery.refetch,
  }
}

