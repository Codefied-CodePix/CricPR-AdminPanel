import api, { handleApiError, unwrapData, type V2Envelope } from './api'
import type { BallType } from './dashboardApi'

export interface BallTypeStats {
  totalRuns: number
  totalWickets: number
  totalFours: number
  totalSixes: number
}

export interface StatsResponse {
  ballType: BallType
  completedMatches: number
  statsByBallType: Record<string, BallTypeStats>
  totalRuns: number
  totalWickets: number
  totalFours: number
  totalSixes: number
}

export interface StatsParams {
  ballType?: BallType
}

export const statsApi = {
  getStats: async (params: StatsParams = {}): Promise<StatsResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.ballType) queryParams.append('ballType', params.ballType)
      const qs = queryParams.toString()
      const response = await api.get<V2Envelope<StatsResponse>>(
        `/admin/stats${qs ? `?${qs}` : ''}`
      )
      return unwrapData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
