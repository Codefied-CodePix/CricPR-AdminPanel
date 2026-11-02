import api, { handleApiError, unwrapData, type V2Envelope, type V2Pagination } from './api'

export interface Match {
  id: string
  title: string
  matchType: string
  tournamentName: string | null
  date: string
  location: string
  groundName: string
  status: string
  result: string | null
}

export interface MatchesResponse {
  results: Match[]
  page: number
  limit: number
  totalResults: number
  totalPages: number
}

export interface MatchesParams {
  page?: number
  limit?: number
  team_name?: string
  status?: string
}

export interface BattingStat {
  playerName: string
  dismissal: string
  runs: number
  balls: number
  fours: number
  sixes: number
  strikeRate: number
  isNotOut: boolean
  hasBat: boolean
  minutesBatted: number
  playerId: string
}

export interface BowlingStat {
  playerName: string
  overs: number
  maidens: number
  runs: number
  noBalls: number
  wides: number
  dots: number
  wickets: number
  economy: number
  average: number
}

export interface ScorecardMatch {
  id: string
  title: string
  status: string
  startdatetime: string
  endDateTime: string
}

export interface TeamScorecard {
  teamName: string
  teamLogo: string | null
  runs: number
  wickets: number
  overs: string
  penalty: string | null
  totalOvers: number
  fallOfWickets: unknown[]
  battingStats: BattingStat[]
  bowlingStats: BowlingStat[]
}

export interface Scorecard {
  match: ScorecardMatch
  teams: TeamScorecard[]
}

export interface TeamScore {
  teamName: string
  teamLogo: string | null
  score: number
  wickets: number
  overs: string
}

export interface PlayerOfTheMatchBattingStats {
  runs: number
  balls: number
  fours: number
  sixes: number
  isNotOut: boolean
}

export interface PlayerOfTheMatchBowlingStats {
  overs: string
  maidens: number
  runs: number
  wickets: number
}

export interface PlayerOfTheMatch {
  playerName: string
  teamName: string
  playerImage: string | null
  battingStats: PlayerOfTheMatchBattingStats
  bowlingStats: PlayerOfTheMatchBowlingStats
}

export interface Summary {
  match: ScorecardMatch
  teamScores: TeamScore[]
  result: string
  playerOfTheMatch: PlayerOfTheMatch
}

export interface MatchDetail {
  matchTitle: string
  teamALogo: string | null
  teamBLogo: string | null
  status: string
  result: string | null
  tournamentName: string | null
  startDate: string
  startTime: string
  location: string
  ground: string
  scorecard: Scorecard
  summary: Summary
}

function emptyPlayerOfMatch(): PlayerOfTheMatch {
  return {
    playerName: 'N/A',
    teamName: '',
    playerImage: null,
    battingStats: { runs: 0, balls: 0, fours: 0, sixes: 0, isNotOut: false },
    bowlingStats: { overs: '0.0', maidens: 0, runs: 0, wickets: 0 },
  }
}

export const matchesApi = {
  getMatches: async (params: MatchesParams = {}): Promise<MatchesResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.team_name) queryParams.append('team_name', params.team_name)
      if (params.status) queryParams.append('status', params.status)

      const response = await api.get<
        V2Envelope<
          Array<{
            id: string
            title?: string
            matchType?: string
            tournamentName?: string | null
            date?: string
            location?: string | null
            groundName?: string | null
            status?: string
            result?: string | null
            teamAName?: string | null
            teamBName?: string | null
          }>
        >
      >(`/admin/teamMatches?${queryParams.toString()}`)

      const rows = Array.isArray(response.data.data) ? response.data.data : []
      const pagination = response.data.pagination as V2Pagination | undefined

      return {
        results: rows.map((m) => ({
          id: m.id,
          title:
            m.title ||
            `${m.teamAName || 'Team A'} vs ${m.teamBName || 'Team B'}`,
          matchType: m.matchType || 'friendly',
          tournamentName: m.tournamentName ?? null,
          date: m.date || new Date().toISOString(),
          location: m.location || '',
          groundName: m.groundName || m.location || '',
          status: m.status || 'scheduled',
          result: m.result ?? null,
        })),
        page: pagination?.page ?? params.page ?? 1,
        limit: pagination?.limit ?? params.limit ?? 20,
        totalResults: pagination?.total ?? rows.length,
        totalPages: pagination?.totalPages ?? 1,
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getMatchById: async (matchId: string): Promise<MatchDetail> => {
    try {
      const response = await api.get<
        V2Envelope<{
          id?: string
          title?: string
          status?: string
          startDatetime?: string
          endDatetime?: string
          resultText?: string | null
          teamA?: { team?: { name?: string; logo?: string | null } }
          teamB?: { team?: { name?: string; logo?: string | null } }
          config?: { location?: string; overs?: number }
          innings?: Array<Record<string, unknown>>
        }>
      >(`/admin/matchDetails/${matchId}`)

      const match = unwrapData(response)
      const teamAName = match.teamA?.team?.name || 'Team A'
      const teamBName = match.teamB?.team?.name || 'Team B'
      const teamALogo = match.teamA?.team?.logo ?? null
      const teamBLogo = match.teamB?.team?.logo ?? null
      const start = match.startDatetime || new Date().toISOString()
      const end = match.endDatetime || start
      const status = match.status || 'scheduled'
      const title = match.title || `${teamAName} vs ${teamBName}`
      const location = match.config?.location || ''

      const scorecardMatch: ScorecardMatch = {
        id: String(match.id || matchId),
        title,
        status,
        startdatetime: start,
        endDateTime: end,
      }

      const teams: TeamScorecard[] = [
        {
          teamName: teamAName,
          teamLogo: teamALogo,
          runs: 0,
          wickets: 0,
          overs: '0.0',
          penalty: null,
          totalOvers: Number(match.config?.overs || 0),
          fallOfWickets: [],
          battingStats: [],
          bowlingStats: [],
        },
        {
          teamName: teamBName,
          teamLogo: teamBLogo,
          runs: 0,
          wickets: 0,
          overs: '0.0',
          penalty: null,
          totalOvers: Number(match.config?.overs || 0),
          fallOfWickets: [],
          battingStats: [],
          bowlingStats: [],
        },
      ]

      const teamScores: TeamScore[] = teams.map((t) => ({
        teamName: t.teamName,
        teamLogo: t.teamLogo,
        score: t.runs,
        wickets: t.wickets,
        overs: t.overs,
      }))

      return {
        matchTitle: title,
        teamALogo,
        teamBLogo,
        status,
        result: match.resultText ?? null,
        tournamentName: null,
        startDate: start,
        startTime: start,
        location,
        ground: location,
        scorecard: { match: scorecardMatch, teams },
        summary: {
          match: scorecardMatch,
          teamScores,
          result: match.resultText || '',
          playerOfTheMatch: emptyPlayerOfMatch(),
        },
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  deleteMatch: async (matchId: string): Promise<void> => {
    try {
      await api.delete(`/admin/matches/${matchId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
