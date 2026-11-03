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

function mapTournament(row: Record<string, unknown>): Tournament {
  return {
    tournamentId: String(row.id || ''),
    name: String(row.name || 'Unknown'),
    startDate: String(row.startDate || new Date().toISOString()),
    endDate: String(row.endDate || row.startDate || new Date().toISOString()),
    status: String(row.status || 'upcoming'),
    totalMatches: Number(row.totalMatches || 0),
    totalTeams: Number(row.totalTeams || (Array.isArray(row.teams) ? row.teams.length : 0)),
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
      const response = await api.get<
        V2Envelope<{
          id?: string
          name?: string
          startDate?: string
          endDate?: string
          status?: string
          logo?: string | null
          banner?: string | null
          teams?: unknown[]
          stages?: Array<Record<string, unknown>>
        }>
      >(`/admin/tournaments/${tournamentId}`)

      const t = unwrapData(response)
      const stagesRaw = t.stages || []
      const stages: TournamentStage[] = stagesRaw.map((s, idx) => ({
        id: String(s.id || ''),
        tournamentId: String(t.id || tournamentId),
        name: String(s.name || `Stage ${idx + 1}`),
        stageOrder: Number(s.stageOrder || idx + 1),
        format: String(s.format || ''),
        status: String(s.status || ''),
        hasGroups: Boolean(s.hasGroups),
        numberOfGroups: Number(s.numberOfGroups || 0),
        groups: [],
      }))

      return {
        tournamentId: String(t.id || tournamentId),
        tournamentName: String(t.name || 'Unknown'),
        startDate: String(t.startDate || new Date().toISOString()),
        endDate: String(t.endDate || t.startDate || new Date().toISOString()),
        status: String(t.status || 'upcoming'),
        tournamentLogo: t.logo ?? null,
        tournamentBanner: t.banner ?? null,
        totalMatches: 0,
        totalTeams: Array.isArray(t.teams) ? t.teams.length : 0,
        matchesPlayed: [],
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
            format: '',
            status: String(t.status || ''),
          },
          stages: stages.map((s) => ({
            id: s.id,
            name: s.name,
            format: s.format,
            status: s.status,
            hasGroups: s.hasGroups,
            pointsForWin: 2,
            pointsForDraw: 1,
            pointsForLoss: 0,
            groups: [],
            pointsTable: [],
          })),
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
