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
    city: String(row.city || ''),
    matches: Number(row.matchesPlayed || row.matches || 0),
    wins: Number(row.wins || 0),
    losses: Number(row.losses || 0),
    totalRuns: Number(row.totalRuns || 0),
    totalWickets: Number(row.totalWickets || 0),
    logo: (row.logo as string | null) ?? null,
  }
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
      const response = await api.get<
        V2Envelope<
          Record<string, unknown> & {
            id?: string
            name?: string
            logo?: string | null
            city?: string
            country?: string | null
            captainId?: string
            players?: Array<Record<string, unknown>>
          }
        >
      >(`/admin/teamDetails/${teamId}`)

      const team = unwrapData(response)
      const players = (team.players || []).map((p) => {
        const user = (p.user || {}) as Record<string, unknown>
        return {
          playerId: String(p.id || ''),
          playerName: String(user.name || p.displayName || 'Unknown'),
          playerProfilePic: (user.profilePicture as string | null) ?? null,
          playerRole: String(p.playingRole || ''),
          battingStyle: String(p.battingStyle || ''),
          bowlingStyle: String(p.bowlingStyle || ''),
          matches: 0,
          runs: 0,
          wickets: 0,
          highestScore: 0,
          bestBowling: null,
          economy: 0,
          average: 0,
          strikeRate: 0,
        } satisfies TeamPlayer
      })

      return {
        teamId: String(team.id || teamId),
        teamName: String(team.name || 'Unknown'),
        teamLogo: team.logo ?? null,
        teamCaptain: '',
        teamCaptainId: String(team.captainId || ''),
        teamCountry: team.country ?? null,
        teamCity: String(team.city || ''),
        matchesPlayed: Number(team.matchesPlayed || 0),
        wins: Number(team.wins || 0),
        losses: Number(team.losses || 0),
        winRate: Number(team.winRate || 0),
        totalRuns: Number(team.totalRuns || 0),
        totalPlayers: players.length,
        totalWickets: Number(team.totalWickets || 0),
        highestScore: Number(team.highestScore || 0),
        players,
        matches: [],
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
