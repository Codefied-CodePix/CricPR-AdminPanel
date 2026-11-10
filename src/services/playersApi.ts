import api, { handleApiError, type V2Envelope, type V2Pagination } from './api'

export interface Player {
  playerId: string
  userId?: string | null
  name: string
  teams: Array<{
    id?: string
    logo?: string
    name?: string
    location?: string
  }>
  city: string
  playingRole: string
  battingStyle: string
  bowlingStyle: string
  isWicketKeeper: boolean
  matches: number
  runs: number
  wickets: number
  strikeRate: number
  average: number
  economy: number
  profilePicture?: string | null
}

export interface PlayersResponse {
  results: Player[]
  page: number
  limit: number
  totalResults: number
  totalPages: number
}

export interface PlayersParams {
  page?: number
  limit?: number
  name?: string
  city?: string
  battingStyle?: string
  bowlingStyle?: string
  role?: string
}

function mapPlayer(row: Record<string, unknown>): Player {
  const user = (row.user || {}) as Record<string, unknown>
  return {
    playerId: String(row.id || ''),
    userId: (row.userId as string | null | undefined) ?? (user.id as string | undefined) ?? null,
    name: String(user.name || 'Unknown'),
    teams: [],
    city: String(user.city || ''),
    playingRole: String(row.playingRole || ''),
    battingStyle: String(row.battingStyle || ''),
    bowlingStyle: String(row.bowlingStyle || ''),
    isWicketKeeper:
      Boolean(row.isWicketKeeper) || /wicket/i.test(String(row.playingRole || '')),
    matches: Number(row.matches ?? 0),
    runs: Number(row.runs ?? 0),
    wickets: Number(row.wickets ?? 0),
    strikeRate: Number(row.strikeRate ?? 0),
    average: Number(row.average ?? 0),
    economy: Number(row.economy ?? 0),
    profilePicture: (user.profilePicture as string | null | undefined) ?? null,
  }
}

function toListResponse(
  rows: Player[],
  pagination: V2Pagination | undefined,
  params: PlayersParams
): PlayersResponse {
  return {
    results: rows,
    page: pagination?.page ?? params.page ?? 1,
    limit: pagination?.limit ?? params.limit ?? 20,
    totalResults: pagination?.total ?? rows.length,
    totalPages: pagination?.totalPages ?? 1,
  }
}

export const playersApi = {
  getPlayers: async (params: PlayersParams = {}): Promise<PlayersResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.name) queryParams.append('name', params.name)
      if (params.city) queryParams.append('city', params.city)
      if (params.battingStyle) queryParams.append('battingStyle', params.battingStyle)
      if (params.bowlingStyle) queryParams.append('bowlingStyle', params.bowlingStyle)
      if (params.role) queryParams.append('role', params.role)

      const response = await api.get<V2Envelope<Record<string, unknown>[]>>(
        `/admin/players?${queryParams.toString()}`
      )
      const rows = Array.isArray(response.data.data) ? response.data.data : []
      return toListResponse(rows.map(mapPlayer), response.data.pagination, params)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  deletePlayer: async (playerId: string): Promise<void> => {
    try {
      await api.delete(`/players/${playerId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
