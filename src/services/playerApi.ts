import api, { handleApiError, unwrapData, type V2Envelope } from './api'

export interface PlayerMatch {
  matchTitle: string
  startDate: string
  runs: number
  wickets: number
}

export interface PlayerDetail {
  playerId: string
  name: string
  email: string
  profileImage: string | null
  phone: string
  city: string
  country: string | null
  playingRole: string
  battingStyle: string
  bowlingStyle: string
  teams: string[]
  matches: number
  runs: number
  wickets: number
  average: number
  economy: number
  strikeRate: number
  highestScore: number
  bestBowling: string
  matchesArray: PlayerMatch[]
  ballType?: string
  statsByBallType?: Record<string, unknown>
}

type CareerSlice = {
  matches?: number
  runs?: number
  wickets?: number
  average?: number
  economy?: number
  strikeRate?: number
  highestScore?: number
  bestBowling?: string
}

export const playerApi = {
  getPlayerById: async (playerId: string): Promise<PlayerDetail> => {
    try {
      const response = await api.get<
        V2Envelope<{
          player?: Record<string, unknown> & {
            id?: string
            playingRole?: string
            battingStyle?: string
            bowlingStyle?: string
            user?: {
              name?: string
              email?: string
              phone?: string
              city?: string
              country?: string | null
              profilePicture?: string | null
            }
          }
          ballType?: string
          batting?: CareerSlice
          bowling?: CareerSlice
          stats?: Array<Record<string, unknown>>
          statsByBallType?: Record<string, unknown>
        }>
      >(`/admin/playerDetails/${playerId}`)

      const data = unwrapData(response)
      const player = data.player || {}
      const user = player.user || {}
      const batting = data.batting || {}
      const bowling = data.bowling || {}

      const matchesArray: PlayerMatch[] = (data.stats || []).slice(0, 50).map((row) => ({
        matchTitle: String(row.matchTitle || row.matchId || 'Match'),
        startDate: String(row.createdAt || row.startDatetime || new Date().toISOString()),
        runs: Number(row.batting_runs || row.battingRuns || 0),
        wickets: Number(row.bowling_wickets || row.bowlingWickets || 0),
      }))

      return {
        playerId: String(player.id || playerId),
        name: String(user.name || 'Unknown'),
        email: String(user.email || ''),
        profileImage: user.profilePicture ?? null,
        phone: String(user.phone || ''),
        city: String(user.city || ''),
        country: user.country ?? null,
        playingRole: String(player.playingRole || ''),
        battingStyle: String(player.battingStyle || ''),
        bowlingStyle: String(player.bowlingStyle || ''),
        teams: [],
        matches: Number(batting.matches || bowling.matches || 0),
        runs: Number(batting.runs || 0),
        wickets: Number(bowling.wickets || 0),
        average: Number(batting.average || 0),
        economy: Number(bowling.economy || 0),
        strikeRate: Number(batting.strikeRate || 0),
        highestScore: Number(batting.highestScore || 0),
        bestBowling: String(bowling.bestBowling || '—'),
        matchesArray,
        ballType: data.ballType,
        statsByBallType: data.statsByBallType,
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
