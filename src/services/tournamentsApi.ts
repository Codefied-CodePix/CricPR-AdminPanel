import api, { handleApiError, unwrapData, type V2Envelope, type V2Pagination } from './api'

export interface Tournament {
  tournamentId: string
  name: string
  startDate: string
  endDate: string
  status: string
  totalMatches: number
  totalTeams: number
}

export interface TournamentsResponse {
  results: Tournament[]
  page: number
  limit: number
  totalResults: number
  totalPages: number
}

export interface TournamentsParams {
  page?: number
  limit?: number
  sortBy?: string
  name?: string
}

export interface TournamentMatchTeam {
  id: string
  name: string
  logo: string | null
}

export interface TournamentMatchResult {
  winningTeamId: string
  winningTeamName: string
  winningTeamScore: number
  winningTeamWickets: number
  winningTeamOvers: number
  losingTeamScore: number
  losingTeamWickets: number
  losingTeamOvers: number
}

export interface TournamentMatchConfig {
  id?: string
  overs: number
  matchType: string
  ballType: string
  pitchType: string
  createdAt: string
}

export interface TournamentMatchStage {
  id: string
  name: string
  stageOrder: number
}

export interface TournamentMatchGroup {
  id: string
  name: string
}

export interface TournamentMatch {
  matchId: string
  matchNumber: number
  stage: TournamentMatchStage
  group: TournamentMatchGroup | null
  teamA: TournamentMatchTeam
  teamB: TournamentMatchTeam
  matchConfig: TournamentMatchConfig
  location: string
  status: string
  startDateTime: string
  endDateTime: string
  result: TournamentMatchResult | null
}

export interface TournamentStageGroupTeam {
  id?: string
  tournamentId: string
  stageId: string
  groupId: string
  teamId: {
    id?: string
    logo: string | null
    name: string
    location: string
    captain: string
  }
  tournamentTeamId: {
    id?: string
    tournamentId: string
    teamId: string
    registrationStatus: string
  }
  status: string
  assignedDate: string
}

export interface TournamentStageGroup {
  id?: string
  groupName: string
  groupOrder: number
  currentTeamsCount: number
  status: string
  teams: TournamentStageGroupTeam[]
  matches: unknown[]
}

export interface TournamentStage {
  id?: string
  tournamentId: string
  name: string
  stageOrder: number
  format: string
  status: string
  hasGroups: boolean
  numberOfGroups: number
  groups: TournamentStageGroup[]
}

export interface TournamentMatchesFixtures {
  results: TournamentStage[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
}

export interface TournamentPointsTableTeam {
  tournamentId: string
  stageId: string
  groupId: string | null
  teamId: {
    logo: string | null
    name: string
    location: string
    id: string
  }
  tournamentTeamId: string
  position: number
  matchesPlayed: number
  matchesWon: number
  matchesLost: number
  matchesDrawn: number
  matchesNoResult: number
  points: number
  netRunRate: number
  totalRunsScored: number
  totalRunsConceded: number
  totalOversPlayed: number
  totalOversFaced: number
  totalWicketsLost: number
  totalWicketsTaken: number
  highestScore: number
  lowestScore: number
  winStreak: number
  form: string
  qualificationStatus: string
  tieBreakingFactor: number
  superOverWins: number
  superOverLosses: number
  id: string
}

export interface TournamentPointsTableGroup {
  id?: string
  groupName: string
  groupOrder: number
  currentTeamsCount: number
  status: string
  pointsTable: TournamentPointsTableTeam[]
}

export interface TournamentPointsTableStage {
  id?: string
  name: string
  format: string
  status: string
  hasGroups: boolean
  pointsForWin: number
  pointsForDraw: number
  pointsForLoss: number
  groups: TournamentPointsTableGroup[]
  pointsTable?: TournamentPointsTableTeam[]
}

export interface TournamentPointsTable {
  tournament: {
    id?: string
    name: string
    format: string
    status: string
  }
  stages: TournamentPointsTableStage[]
}

export interface TournamentDetail {
  tournamentId: string
  tournamentName: string
  startDate: string
  endDate: string
  status: string
  tournamentLogo: string | null
  tournamentBanner: string | null
  totalMatches: number
  totalTeams: number
  matchesPlayed: TournamentMatch[]
  matchesFixtures: TournamentMatchesFixtures
  pointsTable: TournamentPointsTable
}

// Raw shapes of GET /admin/tournaments/:id (only the fields we read)
interface TournamentPointsRowApi {
  id?: string
  stageId?: string
  groupId?: string | null
  teamId?: string
  teamName?: string
  team?: { id?: string; name?: string; logo?: string | null; logoUrl?: string | null }
  position?: number
  played?: number
  won?: number
  lost?: number
  tied?: number
  noResult?: number
  points?: number
  netRunRate?: number | string
  totalRunsScored?: number
  totalRunsConceded?: number
  totalOversPlayed?: number | string
  totalOversFaced?: number | string
  totalWicketsLost?: number
  totalWicketsTaken?: number
  highestScore?: number
  lowestScore?: number | null
  qualificationStatus?: string
  superOverWins?: number
  superOverLosses?: number
}

interface TournamentFixtureApi {
  matchId?: string | null
  matchNumber?: number
  stageId?: string
  stage?: { id?: string; name?: string } | null
  group?: { id?: string; name?: string } | null
  matchStatus?: string
  venue?: string
  startDatetime?: string | null
  teamAId?: string
  teamBId?: string
  teamAName?: string
  teamBName?: string
  teamA?: { id?: string; name?: string; logo?: string | null; logoUrl?: string | null }
  teamB?: { id?: string; name?: string; logo?: string | null; logoUrl?: string | null }
  liveScore?: {
    status?: string
    location?: string
    startDatetime?: string
    endDateTime?: string
    totalOvers?: number
    winner?: { id?: string; name?: string; score?: string } | null
    teams?: Array<{
      teamInstanceId?: string
      runs?: number
      wickets?: number
      overs?: string
    }>
  } | null
}

interface TournamentDetailApi {
  id?: string
  name?: string
  startDate?: string
  endDate?: string
  status?: string
  logo?: string | null
  coverImage?: string | null
  banner?: string | null
  format?: string
  currentTeamsCount?: number
  totalTeams?: number
  totalMatches?: number
  teams?: unknown[]
  fixtures?: TournamentFixtureApi[]
  matches?: TournamentFixtureApi[]
  pointsTable?: {
    stages?: Array<{
      stageId?: string
      stageName?: string
      format?: string
      groups?: Array<{
        groupId?: string | null
        groupName?: string | null
        pointsTable?: TournamentPointsRowApi[]
      }>
    }>
  }
}

function mapTournament(row: Record<string, unknown>): Tournament {
  return {
    tournamentId: String(row.id || ''),
    name: String(row.name || 'Unknown'),
    startDate: String(row.startDate || new Date().toISOString()),
    endDate: String(row.endDate || row.startDate || new Date().toISOString()),
    status: String(row.status || 'upcoming'),
    totalMatches: Number(row.totalMatches || 0),
    totalTeams: Number(
      row.totalTeams ?? row.currentTeamsCount ?? (Array.isArray(row.teams) ? row.teams.length : 0)
    ),
  }
}

export const tournamentsApi = {
  getTournaments: async (params: TournamentsParams = {}): Promise<TournamentsResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params.name) queryParams.append('name', params.name)

      const response = await api.get<V2Envelope<Record<string, unknown>[]>>(
        `/admin/tournaments?${queryParams.toString()}`
      )
      const rows = Array.isArray(response.data.data) ? response.data.data : []
      const pagination = response.data.pagination as V2Pagination | undefined
      return {
        results: rows.map(mapTournament),
        page: pagination?.page ?? params.page ?? 1,
        limit: pagination?.limit ?? params.limit ?? 20,
        totalResults: pagination?.total ?? rows.length,
        totalPages: pagination?.totalPages ?? 1,
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  getTournamentById: async (tournamentId: string): Promise<TournamentDetail> => {
    try {
      const response = await api.get<V2Envelope<TournamentDetailApi>>(
        `/admin/tournaments/${tournamentId}`
      )

      const t = unwrapData(response)
      const stageRows = t.pointsTable?.stages || []

      const stages: TournamentStage[] = stageRows.map((s, idx) => ({
        id: String(s.stageId || ''),
        tournamentId: String(t.id || tournamentId),
        name: String(s.stageName || `Stage ${idx + 1}`),
        stageOrder: idx + 1,
        format: String(s.format || ''),
        status: '',
        hasGroups: (s.groups || []).some((g) => g.groupId),
        numberOfGroups: (s.groups || []).filter((g) => g.groupId).length,
        groups: [],
      }))

      const toNumber = (value: unknown) => {
        const n = Number(value)
        return Number.isFinite(n) ? n : 0
      }

      const mapRow = (
        r: TournamentPointsRowApi,
        stageId: string
      ): TournamentPointsTableTeam => ({
        id: String(r.id || ''),
        tournamentId: String(t.id || tournamentId),
        stageId: String(r.stageId || stageId),
        groupId: r.groupId ?? null,
        teamId: {
          id: String(r.team?.id || r.teamId || ''),
          logo: r.team?.logoUrl ?? r.team?.logo ?? null,
          name: String(r.team?.name || r.teamName || 'Unknown Team'),
          location: '',
        },
        tournamentTeamId: String(r.teamId || ''),
        position: toNumber(r.position),
        matchesPlayed: toNumber(r.played),
        matchesWon: toNumber(r.won),
        matchesLost: toNumber(r.lost),
        matchesDrawn: toNumber(r.tied),
        matchesNoResult: toNumber(r.noResult),
        points: toNumber(r.points),
        netRunRate: toNumber(r.netRunRate),
        totalRunsScored: toNumber(r.totalRunsScored),
        totalRunsConceded: toNumber(r.totalRunsConceded),
        totalOversPlayed: toNumber(r.totalOversPlayed),
        totalOversFaced: toNumber(r.totalOversFaced),
        totalWicketsLost: toNumber(r.totalWicketsLost),
        totalWicketsTaken: toNumber(r.totalWicketsTaken),
        highestScore: toNumber(r.highestScore),
        lowestScore: toNumber(r.lowestScore),
        winStreak: 0,
        form: '',
        qualificationStatus: String(r.qualificationStatus || ''),
        tieBreakingFactor: 0,
        superOverWins: toNumber(r.superOverWins),
        superOverLosses: toNumber(r.superOverLosses),
      })

      const pointsStages: TournamentPointsTableStage[] = stageRows.map((s) => {
        const stageId = String(s.stageId || '')
        const groups = (s.groups || []).map((g, gi) => ({
          id: g.groupId ?? undefined,
          groupName: String(g.groupName || ''),
          groupOrder: gi + 1,
          currentTeamsCount: (g.pointsTable || []).length,
          status: '',
          pointsTable: (g.pointsTable || []).map((r) => mapRow(r, stageId)),
        }))
        // Knockout stages come back as a single group without a groupId: show them as a flat table
        const hasGroups = groups.some((g) => g.id)
        return {
          id: stageId,
          name: String(s.stageName || ''),
          format: String(s.format || ''),
          status: '',
          hasGroups,
          pointsForWin: 2,
          pointsForDraw: 1,
          pointsForLoss: 0,
          groups: hasGroups ? groups : [],
          pointsTable: hasGroups ? [] : groups.flatMap((g) => g.pointsTable),
        }
      })

      const fixtures = t.fixtures || t.matches || []
      const matchesPlayed: TournamentMatch[] = fixtures
        .filter((f) => f.matchId)
        .map((f) => {
          const live = f.liveScore
          const winner = live?.winner
          const winnerScore = live?.teams?.find((x) => x.teamInstanceId === winner?.id)
          const loserScore = live?.teams?.find((x) => x.teamInstanceId !== winner?.id)
          return {
            matchId: String(f.matchId),
            matchNumber: toNumber(f.matchNumber),
            stage: {
              id: String(f.stage?.id || f.stageId || ''),
              name: String(f.stage?.name || ''),
              stageOrder: 0,
            },
            group: f.group ? { id: String(f.group.id || ''), name: String(f.group.name || '') } : null,
            teamA: {
              id: String(f.teamA?.id || f.teamAId || ''),
              name: String(f.teamA?.name || f.teamAName || ''),
              logo: f.teamA?.logoUrl ?? f.teamA?.logo ?? null,
            },
            teamB: {
              id: String(f.teamB?.id || f.teamBId || ''),
              name: String(f.teamB?.name || f.teamBName || ''),
              logo: f.teamB?.logoUrl ?? f.teamB?.logo ?? null,
            },
            matchConfig: {
              overs: toNumber(live?.totalOvers),
              matchType: '',
              ballType: '',
              pitchType: '',
              createdAt: '',
            },
            location: String(f.venue || live?.location || ''),
            status: String(f.matchStatus || live?.status || ''),
            startDateTime: String(f.startDatetime || live?.startDatetime || ''),
            endDateTime: String(live?.endDateTime || ''),
            result:
              winner && winnerScore
                ? {
                    winningTeamId: String(winner.id || ''),
                    winningTeamName: String(winner.name || ''),
                    winningTeamScore: toNumber(winnerScore.runs),
                    winningTeamWickets: toNumber(winnerScore.wickets),
                    winningTeamOvers: toNumber(winnerScore.overs),
                    losingTeamScore: toNumber(loserScore?.runs),
                    losingTeamWickets: toNumber(loserScore?.wickets),
                    losingTeamOvers: toNumber(loserScore?.overs),
                  }
                : null,
          }
        })

      return {
        tournamentId: String(t.id || tournamentId),
        tournamentName: String(t.name || 'Unknown'),
        startDate: String(t.startDate || new Date().toISOString()),
        endDate: String(t.endDate || t.startDate || new Date().toISOString()),
        status: String(t.status || 'upcoming'),
        tournamentLogo: t.logo ?? t.coverImage ?? null,
        tournamentBanner: t.banner ?? null,
        totalMatches: toNumber(t.totalMatches ?? fixtures.length),
        totalTeams: t.currentTeamsCount ?? t.totalTeams ?? (Array.isArray(t.teams) ? t.teams.length : 0),
        matchesPlayed,
        matchesFixtures: {
          results: stages,
          page: 1,
          limit: stages.length || 1,
          totalPages: 1,
          totalResults: stages.length,
        },
        pointsTable: {
          tournament: {
            id: String(t.id || tournamentId),
            name: String(t.name || 'Unknown'),
            format: String(t.format || ''),
            status: String(t.status || ''),
          },
          stages: pointsStages,
        },
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  deleteTournament: async (tournamentId: string): Promise<void> => {
    try {
      await api.delete(`/admin/tournaments/${tournamentId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
