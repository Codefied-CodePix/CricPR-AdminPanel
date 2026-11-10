import api, { handleApiError, unwrapData, type V2Envelope, type V2Pagination } from './api'

export interface Team {
  teamId: string
  teamName: string
  captainName: string
  captainId: string
  country: string | null
  city: string
  matches: number
  wins: number
  losses: number
  totalRuns: number
  totalWickets: number
  logo?: string | null
}

export interface TeamsResponse {
  results: Team[]
  page: number
  limit: number
  totalResults: number
  totalPages: number
}

export interface TeamsParams {
  page?: number
  limit?: number
  name?: string
  city?: string
  sortBy?: string
}

export interface TeamPlayer {
  playerId: string
  playerName: string
  playerProfilePic: string | null
  playerRole: string
  battingStyle: string
  bowlingStyle: string
  matches: number
  runs: number
  wickets: number
  highestScore: number
  bestBowling: string | null
  economy: number
  average: number
  strikeRate: number
}

export interface TeamMatch {
  title: string
  date: string
  status: string
  result: string | null
}

export interface TeamDetail {
  teamId: string
  teamName: string
  teamLogo: string | null
  teamCaptain: string
  teamCaptainId: string
  teamCountry: string | null
  teamCity: string
  matchesPlayed: number
  wins: number
  losses: number
  winRate: number
  totalRuns: number
  totalPlayers: number
  totalWickets: number
  highestScore: number
  players: TeamPlayer[]
  matches: TeamMatch[]
}

function mapTeam(row: Record<string, unknown>): Team {
  return {
    teamId: String(row.id || ''),
    teamName: String(row.name || 'Unknown'),
    captainName: String(row.captainName || ''),
    captainId: String(row.captainId || row.captainPlayerId || ''),
    country: (row.country as string | null) ?? null,
    city: String(row.city || row.location || ''),
    matches: Number(row.matchesPlayed || row.matches || 0),
    wins: Number(row.wins || 0),
    losses: Number(row.losses || 0),
    totalRuns: Number(row.totalRuns || 0),
    totalWickets: Number(row.totalWickets || 0),
    logo: (row.logo as string | null) ?? null,
  }
}

// Raw shape of GET /admin/teamDetails/:id (only the fields we read)
interface TeamDetailApi {
  id?: string
  name?: string
  logo?: string | null
  logoUrl?: string | null
  city?: string
  location?: string | null
  country?: string | null
  captainId?: string
  captainName?: string | null
  totalMatches?: number
  wins?: number
  losses?: number
  stats?: { totalMatches?: number; wins?: number; losses?: number; winRate?: number }
  players?: Array<Record<string, unknown>>
  playerStats?: Array<{
    playerId?: string
    matchId?: string
    battingRuns?: number
    battingBalls?: number
    isOut?: boolean
    bowlingWickets?: number
    bowlingRuns?: number
    bowlingLegalBalls?: number
    bowlingInnings?: number
  }>
  matchHistory?: Array<{
    title?: string
    date?: string | null
    startDatetime?: string | null
    createdAt?: string
    status?: string
    teamAName?: string
    teamBName?: string
  }>
}

export const teamsApi = {
  getTeams: async (params: TeamsParams = {}): Promise<TeamsResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.name) queryParams.append('name', params.name)
      if (params.city) queryParams.append('city', params.city)
      if (params.sortBy) queryParams.append('sortBy', params.sortBy)

      const response = await api.get<V2Envelope<Record<string, unknown>[]>>(
        `/admin/teams?${queryParams.toString()}`
      )
      const rows = Array.isArray(response.data.data) ? response.data.data : []
      const pagination = response.data.pagination as V2Pagination | undefined
      return {
        results: rows.map(mapTeam),
        page: pagination?.page ?? params.page ?? 1,
        limit: pagination?.limit ?? params.limit ?? 20,
        totalResults: pagination?.total ?? rows.length,
        totalPages: pagination?.totalPages ?? 1,
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getTeamById: async (teamId: string): Promise<TeamDetail> => {
    try {
      const response = await api.get<V2Envelope<TeamDetailApi>>(`/admin/teamDetails/${teamId}`)

      const team = unwrapData(response)

      // playerStats holds one row per player per match; aggregate it per player
      const totals = new Map<
        string,
        {
          matchIds: Set<string>
          runs: number
          balls: number
          dismissals: number
          highest: number
          wickets: number
          runsConceded: number
          legalBalls: number
          best: { wickets: number; runs: number } | null
        }
      >()
      for (const row of team.playerStats || []) {
        const id = String(row.playerId || '')
        if (!id) continue
        const agg = totals.get(id) ?? {
          matchIds: new Set<string>(),
          runs: 0,
          balls: 0,
          dismissals: 0,
          highest: 0,
          wickets: 0,
          runsConceded: 0,
          legalBalls: 0,
          best: null,
        }
        const runs = Number(row.battingRuns || 0)
        const wickets = Number(row.bowlingWickets || 0)
        const runsConceded = Number(row.bowlingRuns || 0)
        agg.matchIds.add(String(row.matchId || ''))
        agg.runs += runs
        agg.balls += Number(row.battingBalls || 0)
        if (row.isOut) agg.dismissals += 1
        agg.highest = Math.max(agg.highest, runs)
        agg.wickets += wickets
        agg.runsConceded += runsConceded
        agg.legalBalls += Number(row.bowlingLegalBalls || 0)
        if (
          Number(row.bowlingInnings || 0) > 0 &&
          (!agg.best || wickets > agg.best.wickets || (wickets === agg.best.wickets && runsConceded < agg.best.runs))
        ) {
          agg.best = { wickets, runs: runsConceded }
        }
        totals.set(id, agg)
      }

      const players = (team.players || []).map((p) => {
        const user = (p.user || {}) as Record<string, unknown>
        const agg = totals.get(String(p.id || ''))
        return {
          playerId: String(p.id || ''),
          playerName: String(user.name || p.displayName || p.shortName || 'Unknown'),
          playerProfilePic: (user.profilePicture as string | null) ?? null,
          playerRole: String(p.playingRole || ''),
          battingStyle: String(p.battingStyle || ''),
          bowlingStyle: String(p.bowlingStyle || ''),
          matches: agg?.matchIds.size ?? 0,
          runs: agg?.runs ?? 0,
          wickets: agg?.wickets ?? 0,
          highestScore: agg?.highest ?? 0,
          bestBowling: agg?.best ? `${agg.best.wickets}/${agg.best.runs}` : null,
          economy: agg && agg.legalBalls > 0 ? (agg.runsConceded / agg.legalBalls) * 6 : 0,
          average: agg && agg.dismissals > 0 ? agg.runs / agg.dismissals : 0,
          strikeRate: agg && agg.balls > 0 ? (agg.runs / agg.balls) * 100 : 0,
        } satisfies TeamPlayer
      })

      const matchesPlayed = Number(team.totalMatches ?? team.stats?.totalMatches ?? 0)
      const wins = Number(team.wins ?? team.stats?.wins ?? 0)
      const losses = Number(team.losses ?? team.stats?.losses ?? 0)

      return {
        teamId: String(team.id || teamId),
        teamName: String(team.name || 'Unknown'),
        teamLogo: team.logoUrl ?? team.logo ?? null,
        teamCaptain: String(team.captainName || ''),
        teamCaptainId: String(team.captainId || ''),
        teamCountry: team.country ?? null,
        teamCity: String(team.city || team.location || ''),
        matchesPlayed,
        wins,
        losses,
        winRate: Number(team.stats?.winRate ?? (matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0)),
        totalRuns: players.reduce((sum, p) => sum + p.runs, 0),
        totalPlayers: players.length,
        totalWickets: players.reduce((sum, p) => sum + p.wickets, 0),
        highestScore: players.reduce((max, p) => Math.max(max, p.highestScore), 0),
        players,
        matches: (team.matchHistory || []).map((m) => ({
          title: String(m.title || `${m.teamAName || ''} vs ${m.teamBName || ''}`),
          date: String(m.date || m.startDatetime || m.createdAt || ''),
          status: String(m.status || ''),
          result: null,
        })),
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  deleteTeam: async (teamId: string): Promise<void> => {
    try {
      await api.delete(`/admin/teams/${teamId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
