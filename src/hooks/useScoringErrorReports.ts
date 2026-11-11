import { useQuery } from '@tanstack/react-query'
import {
  scoringErrorReportsApi,
  type ScoringErrorReportsParams,
} from '../services/scoringErrorReportsApi'

export function useScoringErrorReports(params: ScoringErrorReportsParams = {}) {
  const queryKey = [
    'scoring-error-reports',
    params.page || 1,
    params.limit || 20,
    params.matchId || '',
  ]

  const query = useQuery({
    queryKey,
    queryFn: () => scoringErrorReportsApi.getReports(params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })

  return {
    reportsData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useScoringErrorReport(reportId: string | undefined) {
  const query = useQuery({
    queryKey: ['scoring-error-reports', reportId],
    queryFn: () => scoringErrorReportsApi.getReportById(reportId!),
    enabled: Boolean(reportId),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })

  return {
    report: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
