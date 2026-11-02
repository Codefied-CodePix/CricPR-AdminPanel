import api, { handleApiError, unwrapData, type V2Envelope, type V2Pagination } from './api'

export interface ScoringErrorReporter {
  id: string
  name: string | null
  email: string | null
  uniqueId: string | null
  phone: string | null
}

export interface ScoringErrorTeamSide {
  instanceId: string | null
  teamId: string | null
  name: string | null
}

export interface ScoringErrorMatch {
  id: string
  title: string | null
  status: string | null
  venue: string | null
  teamsLabel: string | null
  teamA: ScoringErrorTeamSide | null
  teamB: ScoringErrorTeamSide | null
  scorer: {
    id: string
    name: string | null
    uniqueId: string | null
  } | null
}

export interface ScoringErrorTournament {
  id: string
  name: string | null
  tournamentMatchId: string | null
  organizer: {
    id: string | null
    name: string | null
  } | null
}

/** Exact admin payload from GET /admin/scoring-error-reports[/:reportId] */
export interface ScoringErrorReport {
  id: string
  matchId: string
  reportedByUserId: string | null
  errorData: unknown
  clientIp: string | null
  userAgent: string | null
  emailSent: boolean
  emailSentAt: string | null
  emailError: string | null
  createdAt: string
  updatedAt: string
  reportedBy: ScoringErrorReporter | null
  match: ScoringErrorMatch | null
  tournament: ScoringErrorTournament | null
}

export interface ScoringErrorReportsParams {
  page?: number
  limit?: number
  matchId?: string
}

export interface ScoringErrorReportsResponse {
  results: ScoringErrorReport[]
  page: number
  limit: number
  totalResults: number
  totalPages: number
}

export const scoringErrorReportsApi = {
  /**
   * GET /admin/scoring-error-reports
   * Optional ?matchId= + pagination
   */
  getReports: async (
    params: ScoringErrorReportsParams = {}
  ): Promise<ScoringErrorReportsResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.matchId) queryParams.append('matchId', params.matchId)

      const qs = queryParams.toString()
      const response = await api.get<V2Envelope<ScoringErrorReport[]>>(
        `/admin/scoring-error-reports${qs ? `?${qs}` : ''}`
      )

      const rows = Array.isArray(response.data.data) ? response.data.data : []
      const pagination = response.data.pagination as V2Pagination | undefined

      return {
        results: rows,
        page: pagination?.page ?? params.page ?? 1,
        limit: pagination?.limit ?? params.limit ?? 20,
        totalResults: pagination?.total ?? rows.length,
        totalPages: pagination?.totalPages ?? 1,
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * GET /admin/scoring-error-reports/:reportId
   */
  getReportById: async (reportId: string): Promise<ScoringErrorReport> => {
    try {
      const response = await api.get<V2Envelope<ScoringErrorReport>>(
        `/admin/scoring-error-reports/${reportId}`
      )
      return unwrapData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
