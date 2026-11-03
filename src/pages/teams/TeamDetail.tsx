import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Target, TrendingUp, Activity, MapPin, Users, Calendar, UsersRound } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { PlayerAvatar } from '../../components/common/PlayerAvatar'
import { useTeam } from '../../hooks/useTeam'
import { useTeams } from '../../hooks/useTeams'
import { format } from 'date-fns'
import { useMemo } from 'react'

export function TeamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { teamData, isLoading, isError } = useTeam(id)
  
  // Fetch teams list to get correct wins/losses data
  const { teamsData } = useTeams({ limit: 1000 }) // Fetch all teams to find the matching one
  
  // Find the matching team from teams list to get correct wins/losses
  const teamFromList = useMemo(() => {
    if (!teamsData?.results || !id) return null
    return teamsData.results.find(team => team.teamId === id)
  }, [teamsData?.results, id])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Loading team details...</p>
      </div>
    )
  }

  if (isError || !teamData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Team not found</p>
        <Button onClick={() => navigate('/teams')} className="mt-4">
          Back to Teams
        </Button>
      </div>
    )
  }

  const team = teamData
  const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.teamName)}&background=0E795D&color=fff&size=256`
  const teamLogo = team.teamLogo || fallbackLogo
  
  // Use wins/losses from teams list API if available, otherwise fallback to team detail API
  const wins = teamFromList?.wins ?? team.wins
  const losses = teamFromList?.losses ?? team.losses
  // Recalculate winRate based on correct wins/losses
  const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => navigate('/teams')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Teams
      </Button>

      {/* Header Section with Team Info */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary-dark p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djI2SDI0VjM0aDEyem0wLTI0djI2SDI0VjEwaDEyem0yNCAwaC0xMnYyNmgxMlYxMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="h-32 w-32 border-4 border-white/30 shadow-xl ring-4 ring-white/20">
              <AvatarImage src={teamLogo} alt={team.teamName} />
              <AvatarFallback className="bg-white/20 text-white text-3xl backdrop-blur-sm">
                {team.teamName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">
                {team.teamName}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-white/90">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">Captain: {team.teamCaptain}</span>
                </div>
                {team.teamCity && (
                  <div className="flex items-center gap-1.5 text-white/90">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">{team.teamCity}</span>
                  </div>
                )}
                {team.teamCountry && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {team.teamCountry}
                  </Badge>
                )}
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Matches Played</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-primary">{team.matchesPlayed}</div>
            <p className="text-xs text-muted-foreground mt-1">Total matches</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Trophy className="h-5 w-5 text-green-500" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Wins</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{wins}</div>
            <p className="text-xs text-muted-foreground mt-1">Victories</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Target className="h-5 w-5 text-red-500" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Losses</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{losses}</div>
            <p className="text-xs text-muted-foreground mt-1">Defeats</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Runs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{team.totalRuns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Team total runs</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Information Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-borderShadcn/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Captain</p>
                    <p className="font-semibold">{team.teamCaptain}</p>
                  </div>
                </div>
                <Badge variant="outline">Captain</Badge>
              </div>
              {team.teamCity && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <MapPin className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">City</p>
                      <p className="font-semibold">{team.teamCity}</p>
                    </div>
                  </div>
                </div>
              )}
              {team.teamCountry && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <MapPin className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Country</p>
                      <p className="font-semibold">{team.teamCountry}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <UsersRound className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Players</p>
                    <p className="font-semibold">{team.totalPlayers}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-borderShadcn/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Team Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {winRate.toFixed(1)}%
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-green-500/30" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Wickets</p>
                  <p className="text-2xl font-bold text-primary">{team.totalWickets}</p>
                </div>
                <Target className="h-8 w-8 text-primary/30" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="matches" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="matches" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="players" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Users className="mr-2 h-4 w-4" />
            Players
          </TabsTrigger>
          <TabsTrigger value="performances" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Trophy className="mr-2 h-4 w-4" />
            Top Performances
          </TabsTrigger>
        </TabsList>
        <TabsContent value="matches" className="space-y-4">
          <Card className="border-2 border-borderShadcn/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Team Matches
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
                    {team.matches && team.matches.length > 0 ? (
                      team.matches.map((match, index) => (
                        <TableRow key={index} className="hover:bg-primary/5 transition-colors">
                          <TableCell className="font-medium">
                            {match.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {match.date && !isNaN(new Date(match.date).getTime()) 
                                ? format(new Date(match.date), 'MMM dd, yyyy')
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
                              {match.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{match.result || 'N/A'}</TableCell>
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
        <TabsContent value="players" className="space-y-4">
          <Card className="border-2 border-borderShadcn/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Players
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-xl border-2 border-borderShadcn/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Player</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold text-right">Matches</TableHead>
                      <TableHead className="font-semibold text-right">Runs</TableHead>
                      <TableHead className="font-semibold text-right">Wickets</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.players && team.players.length > 0 ? (
                      team.players.map((player) => {
                        return (
                          <TableRow 
                            key={player.playerId} 
                            className="hover:bg-primary/5 transition-colors cursor-pointer"
                            onClick={() => navigate(`/players/${player.playerId}`)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <PlayerAvatar
                                  className="h-9 w-9"
                                  src={player.playerProfilePic}
                                  name={player.playerName}
                                />
                                <span className="font-medium">{player.playerName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {player.playerRole}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold">{player.matches}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {player.runs.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                {player.wickets}
                              </span>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No players found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performances" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-borderShadcn/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Best Batting</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">{team.highestScore}*</p>
                <p className="text-sm text-muted-foreground mt-2">Highest Individual Score</p>
                {team.players && team.players.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-borderShadcn/30">
                    <PlayerAvatar
                      className="h-6 w-6"
                      src={team.players[0].playerProfilePic}
                      name={team.players[0].playerName}
                    />
                    <span className="text-sm font-medium">{team.players[0].playerName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-2 border-borderShadcn/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Best Bowling</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {team.players && team.players.length > 0 && team.players.find(p => p.bestBowling) ? (
                  <>
                    <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                      {team.players.find(p => p.bestBowling)?.bestBowling || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">Best Bowling Figures</p>
                    {(() => {
                      const bestBowlingPlayer = team.players.find(p => p.bestBowling)
                      return bestBowlingPlayer ? (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-borderShadcn/30">
                          <PlayerAvatar
                            className="h-6 w-6"
                            src={bestBowlingPlayer.playerProfilePic}
                            name={bestBowlingPlayer.playerName}
                          />
                          <span className="text-sm font-medium">{bestBowlingPlayer.playerName}</span>
                        </div>
                      ) : null
                    })()}
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-red-600 dark:text-red-400">N/A</p>
                    <p className="text-sm text-muted-foreground mt-2">No bowling data available</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

