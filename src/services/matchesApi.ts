import { format } from 'date-fns'
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
  overs: string
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
  teamAName: string
  teamBName: string
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

// Raw shape of GET /matches/:id/scorecard (only the fields we read)
interface ScorecardApi {
  teams?: Array<{
    teamInstanceId?: string
    name?: string
    runs?: number
    wickets?: number
    overs?: string
    totalOvers?: number
    fallOfWickets?: unknown[]
    battingStats?: Array<{
      playerId: string
      playerName: string
      playerDisplayName?: string
      runs?: number
      balls?: number
      fours?: number
      sixes?: number
      strikeRate?: number
      minutesBatted?: number
      isNotOut?: boolean
      howOut?: string | null
      dismissal?: string | null
    }>
    bowlingStats?: Array<{
      playerName: string
      playerDisplayName?: string
      overs?: string
      maidens?: number
      runs?: number
      wickets?: number
      economy?: number
      wides?: number
      noBalls?: number
      dots?: number
    }>
  }>
  result?: string | null
  winner?: { name: string; score: string } | null
  tournament?: { name?: string } | null
  playerOfTheMatch?: {
    name: string
    playerDisplayName?: string
    teamName?: string
    stats?: {
      runsScored?: number
      ballsFaced?: number
      ballsDelivered?: string
      wicketsTaken?: number
    }
  } | null
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
          date: m.date || '',
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
          startDatetime?: string | null
          endDateTime?: string | null
          resultText?: string | null
          teamA?: { id?: string; team?: { name?: string; logo?: string | null } }
          teamB?: { id?: string; team?: { name?: string; logo?: string | null } }
          config?: { location?: string; overs?: number }
          innings?: Array<Record<string, unknown>>
          scorecard?: ScorecardApi | null
        }>
      >(`/admin/matchDetails/${matchId}`)

      const match = unwrapData(response)

      // matchDetails embeds the scorecard; older deployments only have /matches/:id/scorecard.
      // Scheduled matches have no scorecard yet, so a failure here is not fatal.
      let card: ScorecardApi | null = match.scorecard ?? null
      if (!card) {
        try {
          const cardResponse = await api.get<V2Envelope<ScorecardApi>>(
            `/matches/${matchId}/scorecard`
          )
          card = cardResponse.data?.data ?? null
        } catch {
          card = null
        }
      }

      const teamAName = match.teamA?.team?.name || 'Team A'
      const teamBName = match.teamB?.team?.name || 'Team B'
      const teamALogo = match.teamA?.team?.logo ?? null
      const teamBLogo = match.teamB?.team?.logo ?? null
      const start = match.startDatetime || ''
      const end = match.endDateTime || start
      const status = match.status || 'scheduled'
      const title = match.title || `${teamAName} vs ${teamBName}`
      const location = match.config?.location || ''
      const resultText =
        card?.result ||
        match.resultText ||
        (card?.winner ? `${card.winner.name} won by ${card.winner.score}` : null)

      const scorecardMatch: ScorecardMatch = {
        id: String(match.id || matchId),
        title,
        status,
        startdatetime: start,
        endDateTime: end,
      }

      // The scorecard lists one entry per innings (batting order). Map them back to team A / team B.
      // bowlingStats of an entry are the opposition's bowlers during that team's innings.
      const buildTeam = (
        instanceId: string | undefined,
        name: string,
        logo: string | null
      ): TeamScorecard => {
        const inn = card?.teams?.find(
          (t) => (instanceId && t.teamInstanceId === instanceId) || t.name === name
        )
        return {
          teamName: name,
          teamLogo: logo,
          runs: Number(inn?.runs ?? 0),
          wickets: Number(inn?.wickets ?? 0),
          overs: String(inn?.overs ?? '0.0'),
          penalty: null,
          totalOvers: Number(inn?.totalOvers ?? match.config?.overs ?? 0),
          fallOfWickets: inn?.fallOfWickets ?? [],
          battingStats: (inn?.battingStats ?? []).map((b) => ({
            playerName: b.playerDisplayName || b.playerName,
            dismissal: b.dismissal || b.howOut || '',
            runs: Number(b.runs ?? 0),
            balls: Number(b.balls ?? 0),
            fours: Number(b.fours ?? 0),
            sixes: Number(b.sixes ?? 0),
            strikeRate: Number(b.strikeRate ?? 0),
            isNotOut: Boolean(b.isNotOut),
            hasBat: true,
            minutesBatted: Number(b.minutesBatted ?? 0),
            playerId: b.playerId,
          })),
          bowlingStats: (inn?.bowlingStats ?? []).map((b) => ({
            playerName: b.playerDisplayName || b.playerName,
            overs: String(b.overs ?? '0.0'),
            maidens: Number(b.maidens ?? 0),
            runs: Number(b.runs ?? 0),
            noBalls: Number(b.noBalls ?? 0),
            wides: Number(b.wides ?? 0),
            dots: Number(b.dots ?? 0),
            wickets: Number(b.wickets ?? 0),
            economy: Number(b.economy ?? 0),
            average: 0,
          })),
        }
      }

      const teams: TeamScorecard[] = [
        buildTeam(match.teamA?.id, teamAName, teamALogo),
        buildTeam(match.teamB?.id, teamBName, teamBLogo),
      ]

      const teamScores: TeamScore[] = teams.map((t) => ({
        teamName: t.teamName,
        teamLogo: t.teamLogo,
        score: t.runs,
        wickets: t.wickets,
        overs: t.overs,
      }))

      const potm = card?.playerOfTheMatch
      const playerOfTheMatch: PlayerOfTheMatch = potm
        ? {
            playerName: potm.playerDisplayName || potm.name,
            teamName: potm.teamName ?? '',
            playerImage: null,
            battingStats: {
              runs: Number(potm.stats?.runsScored ?? 0),
              balls: Number(potm.stats?.ballsFaced ?? 0),
              fours: 0,
              sixes: 0,
              isNotOut: false,
            },
            bowlingStats: {
              overs: String(potm.stats?.ballsDelivered ?? '0.0'),
              maidens: 0,
              runs: 0,
              wickets: Number(potm.stats?.wicketsTaken ?? 0),
            },
          }
        : emptyPlayerOfMatch()

      return {
        matchTitle: title,
        teamAName,
        teamBName,
        teamALogo,
        teamBLogo,
        status,
        result: resultText,
        tournamentName: card?.tournament?.name ?? null,
        startDate: start,
        startTime: start ? format(new Date(start), 'hh:mm a') : '',
        location,
        ground: location,
        scorecard: { match: scorecardMatch, teams },
        summary: {
          match: scorecardMatch,
          teamScores,
          result: resultText || '',
          playerOfTheMatch,
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
