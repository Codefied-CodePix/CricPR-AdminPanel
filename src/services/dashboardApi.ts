import api, { handleApiError, unwrapData, type V2Envelope, type V2Pagination } from './api'
import { format } from 'date-fns'

export type BallType = 'leather' | 'tennis' | 'other'

export interface DashboardNumbersResponse {
  totalMatches: number
  matchesThisMonth: number
  matchesMonthChangePct: number
  totalTournaments: number
  activeTournaments: number
  totalTeams: number
  totalPlayers: number
  playersLast30Days: number
}

export interface TopTalentPlayer {
  playerId: string
  name: string
  city: string
  playingRole: string
  profilePicture?: string | null
  teams: Array<{ id?: string; name?: string; logo?: string }>
  stats: {
    runs: number
    wickets: number
    average: number
    strikeRate: number
    economy: number
  }
}

export interface TopTalentResponse {
  results: TopTalentPlayer[]
  page: number
  limit: number
  totalResults: number
  totalPages: number
  ballType?: BallType
}

export interface TopTalentParams {
  role?: string
  city?: string
  page?: number
  limit?: number
  ballType?: BallType
}

export interface RecentMatch {
  id: string
  title: string
  teams: string
  matchType: string
  tournamentName: string | null
  startedAt: string
  status: string
  result: string | null
}

export interface MatchesOverTime {
  label: string
  count: number
}

export interface RecentMatchesResponse {
  matches: RecentMatch[]
  pagination?: V2Pagination
  matchesOverTime: MatchesOverTime[]
}

export interface RecentMatchesParams {
  matches?: number
  page?: number
}

export interface RecentSignup {
  id?: string
  name: string
  profileImage: string
  email: string
  city: string
  signupDate: string
}

export interface RecentSignupsResponse {
  results: RecentSignup[]
}

export interface TopRunScorer {
  runs: number
  name: string
  playerId: string
}

export interface TopWicketTaker {
  wickets: number
  name: string
  playerId: string
}

export interface TopRunsAndWicketsResponse {
  runScorers: TopRunScorer[]
  wicketTakers: TopWicketTaker[]
  ballType?: BallType
}

export interface TopRunsAndWicketsParams {
  runScorers?: number
  wicketTakers?: number
  ballType?: BallType
}

function mapMatchStatus(status?: string): string {
  if (status === 'inProgress') return 'live'
  if (status === 'completed') return 'completed'
  if (status === 'notStarted' || status === 'pending' || status === 'postponed') {
    return 'scheduled'
  }
  return status || 'scheduled'
}

function teamNameFromMatchSide(side: unknown): string {
  if (!side || typeof side !== 'object') return 'TBD'
  const s = side as { team?: { name?: string }; name?: string }
  return s.team?.name || s.name || 'TBD'
}

function deriveMatchesOverTime(matches: RecentMatch[]): MatchesOverTime[] {
  const buckets = new Map<string, number>()
  for (const match of matches) {
    if (!match.startedAt) continue
    const d = new Date(match.startedAt)
    if (Number.isNaN(d.getTime())) continue
    const label = format(d, 'MMM yyyy')
    buckets.set(label, (buckets.get(label) || 0) + 1)
  }
  return Array.from(buckets.entries()).map(([label, count]) => ({ label, count }))
}

function mapTopTalentItem(item: {
  player?: {
    id?: string
    playingRole?: string
    user?: { name?: string; city?: string; profilePicture?: string | null }
  }
  runs?: number
  wickets?: number
}): TopTalentPlayer {
  const player = item.player
  const user = player?.user
  return {
    playerId: player?.id || '',
    name: user?.name || 'Unknown',
    city: user?.city || '',
    playingRole: player?.playingRole || '',
    profilePicture: user?.profilePicture ?? null,
    teams: [],
    stats: {
      runs: Number(item.runs || 0),
      wickets: Number(item.wickets || 0),
      average: 0,
      strikeRate: 0,
      economy: 0,
    },
  }
}

export const dashboardApi = {
  getDashboardNumbers: async (): Promise<DashboardNumbersResponse> => {
    try {
      const response = await api.get<V2Envelope<DashboardNumbersResponse>>(
        '/admin/dashboardNumbers'
      )
      return unwrapData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getTopTalent: async (params: TopTalentParams = {}): Promise<TopTalentResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.role) queryParams.append('role', params.role)
      if (params.city) queryParams.append('city', params.city)
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.ballType) queryParams.append('ballType', params.ballType)

      const response = await api.get<
        V2Envelope<
          | Array<{ player?: unknown; runs?: number; wickets?: number }>
          | { data?: Array<{ player?: unknown; runs?: number; wickets?: number }> }
        > & { ballType?: BallType }
      >(`/admin/topTalent?${queryParams.toString()}`)

      const envelope = response.data
      const raw = envelope.data
      const rows = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { data?: unknown[] })?.data)
          ? ((raw as { data: Array<{ player?: unknown; runs?: number; wickets?: number }> }).data)
          : []

      const results = rows.map((row) =>
        mapTopTalentItem(row as Parameters<typeof mapTopTalentItem>[0])
      )
      const pagination = envelope.pagination

      return {
        results,
        page: pagination?.page ?? params.page ?? 1,
        limit: pagination?.limit ?? params.limit ?? 10,
        totalResults: pagination?.total ?? results.length,
        totalPages: pagination?.totalPages ?? 1,
        ballType: envelope.ballType,
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getRecentMatches: async (
    params: RecentMatchesParams = {}
  ): Promise<RecentMatchesResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.matches) queryParams.append('matches', params.matches.toString())
      if (params.page) queryParams.append('page', params.page.toString())

      const response = await api.get<
        V2Envelope<
          Array<{
            id: string
            title?: string
            status?: string
            startDatetime?: string
            teamA?: unknown
            teamB?: unknown
            config?: { matchType?: string }
            result?: string | null
          }>
        >
      >(`/admin/recentMatches?${queryParams.toString()}`)

      const envelope = response.data
      const rows = Array.isArray(envelope.data) ? envelope.data : []
      const matches: RecentMatch[] = rows.map((m) => {
        const teamA = teamNameFromMatchSide(m.teamA)
        const teamB = teamNameFromMatchSide(m.teamB)
        return {
          id: m.id,
          title: m.title || `${teamA} vs ${teamB}`,
          teams: `${teamA} vs ${teamB}`,
          matchType: m.config?.matchType || 'friendly',
          tournamentName: null,
          startedAt: m.startDatetime || '',
          status: mapMatchStatus(m.status),
          result: m.result ?? null,
        }
      })

      return {
        matches,
        pagination: envelope.pagination,
        matchesOverTime: deriveMatchesOverTime(matches),
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getRecentSignups: async (): Promise<RecentSignupsResponse> => {
    try {
      const response = await api.get<
        V2Envelope<
          Array<{
            id?: string
            name?: string
            email?: string
            city?: string
            profilePicture?: string | null
            createdAt?: string
          }>
        >
      >('/admin/recentSignups')

      const rows = Array.isArray(response.data.data) ? response.data.data : []
      return {
        results: rows.map((u) => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email || '',
          city: u.city || '',
          profileImage: u.profilePicture || '',
          signupDate: u.createdAt || new Date().toISOString(),
        })),
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getTopRunsAndWickets: async (
    params: TopRunsAndWicketsParams = {}
  ): Promise<TopRunsAndWicketsResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.runScorers) {
        queryParams.append('runScorers', params.runScorers.toString())
      }
      if (params.wicketTakers) {
        queryParams.append('wicketTakers', params.wicketTakers.toString())
      }
      if (params.ballType) queryParams.append('ballType', params.ballType)

      const response = await api.get<
        V2Envelope<{
          ballType?: BallType
          topRunScorers?: Array<{
            player?: { id?: string; user?: { name?: string } }
            totalRuns?: number
          }>
          topWicketTakers?: Array<{
            player?: { id?: string; user?: { name?: string } }
            totalWickets?: number
          }>
        }>
      >(`/admin/topRunsAndWickets?${queryParams.toString()}`)

      const data = unwrapData(response)
      return {
        ballType: data.ballType,
        runScorers: (data.topRunScorers || []).map((r) => ({
          playerId: r.player?.id || '',
          name: r.player?.user?.name || 'Unknown',
          runs: Number(r.totalRuns || 0),
        })),
        wicketTakers: (data.topWicketTakers || []).map((w) => ({
          playerId: w.player?.id || '',
          name: w.player?.user?.name || 'Unknown',
          wickets: Number(w.totalWickets || 0),
        })),
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
