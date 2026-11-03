import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Calendar, Users, Activity, Award } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { useTournament } from '../../hooks/useTournament'
import { format } from 'date-fns'

export function TournamentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tournamentData, isLoading, isError } = useTournament(id)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Loading tournament details...</p>
      </div>
    )
  }

  if (isError || !tournamentData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Tournament not found</p>
        <Button onClick={() => navigate('/tournaments')} className="mt-4">
          Back to Tournaments
        </Button>
      </div>
    )
  }

  const tournament = tournamentData
  const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(tournament.tournamentName)}&background=0E795D&color=fff&size=256`
  const tournamentLogo = tournament.tournamentLogo || fallbackLogo

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => navigate('/tournaments')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tournaments
      </Button>

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary-dark p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djI2SDI0VjM0aDEyem0wLTI0djI2SDI0VjEwaDEyem0yNCAwaC0xMnYyNmgxMlYxMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="h-32 w-32 border-4 border-white/30 shadow-xl ring-4 ring-white/20">
              <AvatarImage src={tournamentLogo} alt={tournament.tournamentName} />
              <AvatarFallback className="bg-white/20 text-white text-3xl backdrop-blur-sm">
                {tournament.tournamentName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">
                {tournament.tournamentName}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-white/90">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {format(new Date(tournament.startDate), 'MMM dd, yyyy')} - {format(new Date(tournament.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <Badge
                  variant={
                    tournament.status.toLowerCase() === 'ongoing'
                      ? 'success'
                      : tournament.status.toLowerCase() === 'upcoming'
                      ? 'warning'
                      : 'secondary'
                  }
                  className="bg-white/20 border-white/30 backdrop-blur-sm"
                >
                  {tournament.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-primary">{tournament.totalMatches}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled matches</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Teams</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{tournament.totalTeams}</div>
            <p className="text-xs text-muted-foreground mt-1">Participating teams</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Activity className="h-5 w-5 text-yellow-500" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <Badge
              variant={
                tournament.status.toLowerCase() === 'ongoing'
                  ? 'success'
                  : tournament.status.toLowerCase() === 'upcoming'
                  ? 'warning'
                  : 'secondary'
              }
              className="text-base px-3 py-1"
            >
              {tournament.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">Tournament status</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Trophy className="h-5 w-5 text-blue-500" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Matches Played</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{tournament.matchesPlayed.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed matches</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="matches" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="matches" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="points" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Trophy className="mr-2 h-4 w-4" />
            Points Table
          </TabsTrigger>
        </TabsList>
        <TabsContent value="matches" className="space-y-4">
          <Card className="border-2 border-borderShadcn/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Tournament Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Match</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tournament.matchesPlayed && tournament.matchesPlayed.length > 0 ? (
                      tournament.matchesPlayed.map((match) => (
                        <TableRow 
                          key={match.matchId} 
                          className="hover:bg-primary/5 transition-colors cursor-pointer"
                          onClick={() => navigate(`/matches/${match.matchId}`)}
                        >
                          <TableCell className="font-medium">
                            {match.teamA?.name || 'Team A'} vs {match.teamB?.name || 'Team B'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {match.startDateTime && !isNaN(new Date(match.startDateTime).getTime()) 
                                ? format(new Date(match.startDateTime), 'MMM dd, yyyy')
                                : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                match.status === 'completed'
                                  ? 'success'
                                  : match.status === 'live'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {match.status || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {match.result && match.result.winningTeamName 
                              ? `${match.result.winningTeamName} won by ${match.result.winningTeamScore || 0}/${match.result.winningTeamWickets || 0} vs ${match.result.losingTeamScore || 0}/${match.result.losingTeamWickets || 0}` 
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No matches found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="points" className="space-y-4">
          <Card className="border-2 border-borderShadcn/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Points Table
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Position</TableHead>
                      <TableHead className="font-semibold">Team</TableHead>
                      <TableHead className="font-semibold text-right">Played</TableHead>
                      <TableHead className="font-semibold text-right">Won</TableHead>
                      <TableHead className="font-semibold text-right">Lost</TableHead>
                      <TableHead className="font-semibold text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tournament.pointsTable && tournament.pointsTable.stages && tournament.pointsTable.stages.length > 0 ? (
                      tournament.pointsTable.stages.flatMap((stage) => {
                        if (stage.hasGroups && stage.groups && stage.groups.length > 0) {
                          return stage.groups.flatMap((group) =>
                            group.pointsTable
                              .filter((team) => team.teamId) // Filter out teams with null teamId
                              .sort((a, b) => a.position - b.position)
                              .map((team) => (
                                <TableRow key={`${stage.id}-${group.id}-${team.id}`} className="hover:bg-primary/5 transition-colors">
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {team.position === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                                      {team.position === 2 && <Award className="h-4 w-4 text-gray-400" />}
                                      {team.position === 3 && <Award className="h-4 w-4 text-orange-500" />}
                                      <span className="font-bold text-lg">{team.position}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-semibold">
                                    <div className="flex items-center gap-2">
                                      {team.teamId?.logo && (
                                        <img src={team.teamId.logo} alt={team.teamId?.name || 'Team'} className="h-6 w-6 rounded-full" />
                                      )}
                                      <span>{team.teamId?.name || 'Unknown Team'}</span>
                                      {group.groupName && (
                                        <Badge variant="outline" className="text-xs">
                                          {group.groupName}
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">{team.matchesPlayed || 0}</TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-semibold text-green-600 dark:text-green-400">{team.matchesWon || 0}</span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-semibold text-red-600 dark:text-red-400">{team.matchesLost || 0}</span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="text-lg font-bold text-primary">{team.points || 0}</span>
                                  </TableCell>
                                </TableRow>
                              ))
                          )
                        } else if (stage.pointsTable && stage.pointsTable.length > 0) {
                          return stage.pointsTable
                            .filter((team) => team.teamId) // Filter out teams with null teamId
                            .sort((a, b) => a.position - b.position)
                            .map((team) => (
                              <TableRow key={`${stage.id}-${team.id}`} className="hover:bg-primary/5 transition-colors">
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {team.position === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                                    {team.position === 2 && <Award className="h-4 w-4 text-gray-400" />}
                                    {team.position === 3 && <Award className="h-4 w-4 text-orange-500" />}
                                    <span className="font-bold text-lg">{team.position}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                  <div className="flex items-center gap-2">
                                    {team.teamId?.logo && (
                                      <img src={team.teamId.logo} alt={team.teamId?.name || 'Team'} className="h-6 w-6 rounded-full" />
                                    )}
                                    <span>{team.teamId?.name || 'Unknown Team'}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{team.matchesPlayed || 0}</TableCell>
                                <TableCell className="text-right">
                                  <span className="font-semibold text-green-600 dark:text-green-400">{team.matchesWon || 0}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="font-semibold text-red-600 dark:text-red-400">{team.matchesLost || 0}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="text-lg font-bold text-primary">{team.points || 0}</span>
                                </TableCell>
                              </TableRow>
                            ))
                        }
                        return []
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No points table data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

